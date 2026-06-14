"""
LangChain智能体API路由
提供简历分析、个人画像和职业规划功能
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from typing import Optional, List, Dict, Any
import os
import uuid
from datetime import datetime

# 导入智能体模块
from agents.resume_analyzer import resume_analyzer
from agents.career_advisor import career_advisor

router = APIRouter(
    prefix="/langchain",
    tags=["langchain_agent"],
)

@router.post("/analyze-resume")
async def analyze_resume(
    resume_text: str = Form(..., description="简历文本内容"),
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    分析简历内容并生成个人画像
    """
    try:
        # 验证简历文本内容
        if not resume_text or len(resume_text.strip()) < 50:
            return {
                "success": False,
                "message": "简历文本内容过短或为空",
                "data": {
                    "analysis": {
                        "basic_info": {"状态": "简历文本内容无效"},
                        "ability_assessment": {"分析状态": "请上传有效的简历文件"}
                    }
                }
            }
        
        # 检查是否是文件URL（旧版本兼容性）
        if resume_text.startswith("http") or resume_text.startswith("/uploads"):
            print(f"警告: 接收到文件URL而非简历文本: {resume_text}")
            # 如果是文件URL，说明前端未正确提取文本，使用备用方案
            return await _fallback_resume_analysis(resume_text, user_id)
        
        # 直接分析简历文本
        print(f"开始分析简历文本，长度: {len(resume_text)} 字符")
        analysis_result = resume_analyzer.analyze_resume(resume_text)
        
        if not analysis_result["success"]:
            # 如果LangChain分析失败，使用备用方案
            print(f"LangChain分析失败: {analysis_result['error']}")
            return await _fallback_resume_analysis(resume_text, user_id)
        
        print("简历分析成功完成")
        return {
            "success": True,
            "message": "简历分析完成",
            "data": {
                "analysis": analysis_result["analysis"],
                "raw_analysis": analysis_result["raw_text"]
            }
        }
        
    except Exception as e:
        print(f"简历分析异常: {str(e)}")
        # 异常时使用备用方案
        return await _fallback_resume_analysis(resume_text, user_id)

async def _fallback_resume_analysis(resume_text: str, user_id: int):
    """备用简历分析方案"""
    try:
        # 使用简单的文本分析逻辑
        analysis_result = _simple_resume_analysis(resume_text)
        
        return {
            "success": True,
            "message": "简历分析完成（备用方案）",
            "data": {
                "analysis": analysis_result,
                "raw_analysis": "使用备用分析方案生成的结果"
            }
        }
    except Exception as e:
        print(f"备用分析方案失败: {str(e)}")
        # 返回基础分析结果
        return {
            "success": True,
            "message": "简历分析完成（基础方案）",
            "data": {
                "analysis": {
                    "basic_info": {
                        "状态": "简历已上传",
                        "文件": resume_text if resume_text.startswith("http") or resume_text.startswith("/uploads") else "文本简历"
                    },
                    "ability_assessment": {
                        "分析状态": "AI分析服务暂时不可用，请稍后重试"
                    }
                },
                "raw_analysis": "基础分析结果"
            }
        }

def _simple_resume_analysis(resume_text: str) -> Dict[str, Any]:
    """简单的简历分析逻辑"""
    result = {}
    
    # 基本信息提取
    result["basic_info"] = {
        "分析状态": "AI分析服务正在维护中",
        "建议": "请稍后重试或联系管理员"
    }
    
    # 能力评估
    result["ability_assessment"] = {
        "技术能力": "待分析",
        "沟通能力": "待分析", 
        "团队协作": "待分析",
        "学习能力": "待分析"
    }
    
    # 职业倾向
    result["career_tendency"] = {
        "兴趣领域": "待分析",
        "职业目标": "待分析",
        "期望岗位": "待分析"
    }
    
    # 匹配度分析
    result["match_analysis"] = {
        "总体匹配度": "待分析",
        "优势分析": "待分析",
        "改进建议": "待分析"
    }
    
    return result

def _format_resume_data_for_analysis(resume_data: Dict[str, Any]) -> str:
    """将简历数据格式化为文本供LangChain分析"""
    text_parts = []
    
    # 基本信息
    if "basic_info" in resume_data:
        text_parts.append("## 基本信息")
        for key, value in resume_data["basic_info"].items():
            text_parts.append(f"- {key}: {value}")
    
    # 教育背景
    if "education" in resume_data:
        text_parts.append("## 教育背景")
        for edu in resume_data["education"]:
            text_parts.append(f"- 学校: {edu.get('school', '')}")
            text_parts.append(f"  学历: {edu.get('degree', '')}")
            text_parts.append(f"  专业: {edu.get('major', '')}")
            text_parts.append(f"  时间: {edu.get('period', '')}")
    
    # 工作经历
    if "work_experience" in resume_data:
        text_parts.append("## 工作经历")
        for work in resume_data["work_experience"]:
            text_parts.append(f"- 公司: {work.get('company', '')}")
            text_parts.append(f"  职位: {work.get('position', '')}")
            text_parts.append(f"  时间: {work.get('period', '')}")
            text_parts.append(f"  描述: {work.get('description', '')}")
    
    # 技能
    if "skills" in resume_data:
        text_parts.append("## 技能")
        for skill in resume_data["skills"]:
            text_parts.append(f"- {skill.get('name', '')}: {skill.get('level', '')}%")
    
    # 项目经验
    if "projects" in resume_data:
        text_parts.append("## 项目经验")
        for project in resume_data["projects"]:
            text_parts.append(f"- 项目: {project.get('name', '')}")
            text_parts.append(f"  角色: {project.get('role', '')}")
            text_parts.append(f"  描述: {project.get('description', '')}")
            text_parts.append(f"  技术: {', '.join(project.get('technologies', []))}")
    
    # 职业目标
    if "career_goals" in resume_data:
        text_parts.append("## 职业目标")
        text_parts.append(f"- 短期目标: {resume_data['career_goals'].get('shortTerm', '')}")
        text_parts.append(f"- 长期目标: {resume_data['career_goals'].get('longTerm', '')}")
    
    return '\n'.join(text_parts)

@router.post("/generate-career-plan")
async def generate_career_plan(
    profile_data: Dict[str, Any],
    target_job: str = Form(..., description="目标岗位"),
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    基于个人画像生成职业规划
    """
    try:
        # 调用职业规划智能体
        career_plan_result = career_advisor.generate_career_plan(profile_data, target_job)
        
        if not career_plan_result["success"]:
            raise HTTPException(status_code=500, detail=f"职业规划生成失败: {career_plan_result['error']}")
        
        return {
            "success": True,
            "message": "职业规划生成完成",
            "data": {
                "career_plan": career_plan_result["career_plan"],
                "raw_plan": career_plan_result["raw_text"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"职业规划生成异常: {str(e)}")

@router.post("/analyze-job-match")
async def analyze_job_match(
    profile_data: Dict[str, Any],
    target_job: str = Form(..., description="目标岗位"),
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    分析个人画像与目标岗位的匹配度
    """
    try:
        # 调用职业规划智能体进行匹配度分析
        match_result = career_advisor.analyze_job_match(profile_data, target_job)
        
        if not match_result["success"]:
            raise HTTPException(status_code=500, detail=f"岗位匹配度分析失败: {match_result['error']}")
        
        return {
            "success": True,
            "message": "岗位匹配度分析完成",
            "data": {
                "match_analysis": match_result["match_analysis"],
                "raw_analysis": match_result["raw_text"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"岗位匹配度分析异常: {str(e)}")

@router.post("/suggest-skill-improvement")
async def suggest_skill_improvement(
    profile_data: Dict[str, Any],
    target_skills: List[str] = Form(..., description="目标技能列表"),
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    提供技能提升建议
    """
    try:
        # 调用职业规划智能体提供技能提升建议
        skill_result = career_advisor.suggest_skill_improvement(profile_data, target_skills)
        
        if not skill_result["success"]:
            raise HTTPException(status_code=500, detail=f"技能提升建议生成失败: {skill_result['error']}")
        
        return {
            "success": True,
            "message": "技能提升建议生成完成",
            "data": {
                "skill_improvement": skill_result["skill_improvement"],
                "raw_suggestions": skill_result["raw_text"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"技能提升建议生成异常: {str(e)}")

@router.post("/recommend-jobs")
async def recommend_jobs(
    profile_data: Dict[str, Any],
    job_categories: List[str] = Form(..., description="岗位类别列表"),
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    基于个人画像推荐适合的岗位
    """
    try:
        # 调用职业规划智能体推荐岗位
        job_recommendations = career_advisor.recommend_jobs(profile_data, job_categories)
        
        if not job_recommendations["success"]:
            raise HTTPException(status_code=500, detail=f"岗位推荐失败: {job_recommendations['error']}")
        
        return {
            "success": True,
            "message": "岗位推荐完成",
            "data": {
                "recommendations": job_recommendations["recommendations"],
                "top_recommendation": job_recommendations["top_recommendation"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"岗位推荐异常: {str(e)}")

@router.post("/create-persona-profile")
async def create_persona_profile(
    input_data: Dict[str, Any],
    user_id: int = Form(..., description="用户ID"),
    db: Session = Depends(get_db)
):
    """
    创建个人画像
    """
    try:
        # 调用简历分析智能体创建个人画像
        persona_result = resume_analyzer.create_persona_profile(input_data)
        
        if not persona_result["success"]:
            raise HTTPException(status_code=500, detail=f"个人画像创建失败: {persona_result['error']}")
        
        return {
            "success": True,
            "message": "个人画像创建完成",
            "data": {
                "persona_profile": persona_result["persona_profile"],
                "raw_profile": persona_result["raw_text"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"个人画像创建异常: {str(e)}")

@router.get("/health")
async def health_check():
    """
    健康检查接口
    """
    try:
        # 测试API密钥配置
        api_key = resume_analyzer.api_key
        
        return {
            "success": True,
            "message": "LangChain智能体服务运行正常",
            "data": {
                "api_key_configured": bool(api_key),
                "service_status": "active",
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"健康检查异常: {str(e)}")

# 请求和响应模型
from pydantic import BaseModel

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    user_id: int

class CareerPlanRequest(BaseModel):
    profile_data: Dict[str, Any]
    target_job: str
    user_id: int

class JobMatchRequest(BaseModel):
    profile_data: Dict[str, Any]
    target_job: str
    user_id: int

class SkillImprovementRequest(BaseModel):
    profile_data: Dict[str, Any]
    target_skills: List[str]
    user_id: int

class JobRecommendationRequest(BaseModel):
    profile_data: Dict[str, Any]
    job_categories: List[str]
    user_id: int

class PersonaProfileRequest(BaseModel):
    input_data: Dict[str, Any]
    user_id: int

class LangChainResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None