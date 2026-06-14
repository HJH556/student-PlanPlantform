"""
职业规划顾问智能体
基于简历分析结果提供职业规划建议
"""
import os
from typing import Dict, List, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from .config import LangChainConfig

class CareerAdvisor:
    """职业规划顾问智能体"""
    
    def __init__(self):
        """初始化智能体"""
        self.api_key = LangChainConfig.get_api_key()
        self.model_config = LangChainConfig.get_model_config()
        
        # 初始化LangChain模型
        self.llm = ChatOpenAI(
            openai_api_key=self.api_key,
            model_name=self.model_config["model_name"],
            temperature=self.model_config["temperature"],
            max_tokens=self.model_config["max_tokens"]
        )
        
        # 创建职业规划提示模板
        self.career_planning_template = """
你是一个专业的职业规划顾问。请基于以下个人画像和目标岗位，制定详细的职业发展计划。

个人画像：
{profile_data}

目标岗位：{target_job}

请提供以下内容：

## 职业发展路径
- 短期目标（0-1年）：具体的学习和工作计划
- 中期目标（1-3年）：职业发展方向和技能要求
- 长期目标（3-5年）：职业愿景和成长路径

## 技能提升建议
- 当前需要重点提升的核心技能
- 推荐的学习资源和学习路径
- 实践项目和经验积累建议

## 岗位匹配分析
- 当前能力与目标岗位的匹配度
- 需要弥补的能力差距
- 具体的行动建议和时间规划

## 风险评估与应对
- 可能遇到的挑战和风险
- 应对策略和备选方案
- 持续学习和适应建议

请用中文回答，内容要具体、可操作。
"""
        
        self.career_planning_prompt = PromptTemplate(
            input_variables=["profile_data", "target_job"],
            template=self.career_planning_template
        )
        
        # 创建岗位匹配分析提示模板
        self.job_matching_template = """
你是一个专业的职业分析师。请分析以下个人画像与目标岗位的匹配度。

个人画像：
{profile_data}

目标岗位：{target_job}

请提供以下分析：

## 匹配度评分
- 总体匹配度：0-100分
- 技能匹配度：
- 经验匹配度：
- 兴趣匹配度：

## 优势分析
- 与岗位高度匹配的优势
- 独特的竞争力
- 潜在的发展潜力

## 改进建议
- 需要提升的技能领域
- 经验积累建议
- 学习和发展路径

## 推荐岗位
如果当前匹配度不高，请推荐更适合的岗位：
- 推荐岗位1及匹配度
- 推荐岗位2及匹配度
- 推荐岗位3及匹配度

请用中文回答，分析要具体、客观。
"""
        
        self.job_matching_prompt = PromptTemplate(
            input_variables=["profile_data", "target_job"],
            template=self.job_matching_template
        )
        
        # 创建技能提升建议提示模板
        self.skill_improvement_template = """
你是一个专业的技能发展顾问。请基于个人画像和目标岗位，制定技能提升计划。

个人画像：
{profile_data}

目标技能：{target_skills}

请提供以下内容：

## 技能现状分析
- 当前技能水平评估
- 技能优势和短板
- 与目标岗位的差距分析

## 学习路径规划
- 分阶段的学习目标
- 推荐的学习资源（书籍、课程、网站）
- 学习时间安排建议

## 实践项目建议
- 适合的实践项目类型
- 项目难度和复杂度建议
- 项目成果评估标准

## 能力提升时间线
- 短期（1-3个月）：基础技能巩固
- 中期（3-6个月）：核心技能提升
- 长期（6-12个月）：高级技能掌握

请用中文回答，建议要具体、可操作。
"""
        
        self.skill_improvement_prompt = PromptTemplate(
            input_variables=["profile_data", "target_skills"],
            template=self.skill_improvement_template
        )
        
        # 创建LLM链
        self.career_planning_chain = LLMChain(llm=self.llm, prompt=self.career_planning_prompt)
        self.job_matching_chain = LLMChain(llm=self.llm, prompt=self.job_matching_prompt)
        self.skill_improvement_chain = LLMChain(llm=self.llm, prompt=self.skill_improvement_prompt)
    
    def generate_career_plan(self, profile_data: Dict[str, Any], target_job: str) -> Dict[str, Any]:
        """
        生成职业规划
        
        Args:
            profile_data: 个人画像数据
            target_job: 目标岗位
            
        Returns:
            职业规划结果
        """
        try:
            # 格式化个人画像数据
            formatted_profile = self._format_profile_data(profile_data)
            
            # 生成职业规划
            career_plan = self.career_planning_chain.run(
                profile_data=formatted_profile,
                target_job=target_job
            )
            
            # 解析职业规划结果
            parsed_plan = self._parse_career_plan(career_plan)
            
            return {
                "success": True,
                "career_plan": parsed_plan,
                "raw_text": career_plan
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "career_plan": {}
            }
    
    def analyze_job_match(self, profile_data: Dict[str, Any], target_job: str) -> Dict[str, Any]:
        """
        分析岗位匹配度
        
        Args:
            profile_data: 个人画像数据
            target_job: 目标岗位
            
        Returns:
            匹配度分析结果
        """
        try:
            # 格式化个人画像数据
            formatted_profile = self._format_profile_data(profile_data)
            
            # 分析岗位匹配度
            match_analysis = self.job_matching_chain.run(
                profile_data=formatted_profile,
                target_job=target_job
            )
            
            # 解析匹配度分析结果
            parsed_analysis = self._parse_match_analysis(match_analysis)
            
            return {
                "success": True,
                "match_analysis": parsed_analysis,
                "raw_text": match_analysis
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "match_analysis": {}
            }
    
    def suggest_skill_improvement(self, profile_data: Dict[str, Any], target_skills: List[str]) -> Dict[str, Any]:
        """
        提供技能提升建议
        
        Args:
            profile_data: 个人画像数据
            target_skills: 目标技能列表
            
        Returns:
            技能提升建议
        """
        try:
            # 格式化个人画像数据
            formatted_profile = self._format_profile_data(profile_data)
            
            # 格式化目标技能
            formatted_skills = ", ".join(target_skills)
            
            # 生成技能提升建议
            skill_suggestions = self.skill_improvement_chain.run(
                profile_data=formatted_profile,
                target_skills=formatted_skills
            )
            
            # 解析技能提升建议
            parsed_suggestions = self._parse_skill_suggestions(skill_suggestions)
            
            return {
                "success": True,
                "skill_improvement": parsed_suggestions,
                "raw_text": skill_suggestions
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "skill_improvement": {}
            }
    
    def recommend_jobs(self, profile_data: Dict[str, Any], job_categories: List[str]) -> Dict[str, Any]:
        """
        推荐适合的岗位
        
        Args:
            profile_data: 个人画像数据
            job_categories: 岗位类别列表
            
        Returns:
            岗位推荐结果
        """
        try:
            # 为每个岗位类别分析匹配度
            recommendations = []
            
            for job_category in job_categories:
                match_result = self.analyze_job_match(profile_data, job_category)
                if match_result["success"]:
                    recommendations.append({
                        "job_category": job_category,
                        "match_analysis": match_result["match_analysis"]
                    })
            
            # 按匹配度排序
            recommendations.sort(
                key=lambda x: self._extract_match_score(x["match_analysis"]),
                reverse=True
            )
            
            return {
                "success": True,
                "recommendations": recommendations[:5],  # 返回前5个推荐
                "top_recommendation": recommendations[0] if recommendations else None
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "recommendations": []
            }
    
    def _format_profile_data(self, profile_data: Dict[str, Any]) -> str:
        """格式化个人画像数据为文本"""
        formatted_parts = []
        
        for section, data in profile_data.items():
            if isinstance(data, dict):
                formatted_parts.append(f"{section}:")
                for key, value in data.items():
                    formatted_parts.append(f"  - {key}: {value}")
            elif isinstance(data, list):
                formatted_parts.append(f"{section}:")
                for item in data:
                    formatted_parts.append(f"  - {item}")
            else:
                formatted_parts.append(f"{section}: {data}")
        
        return '\n'.join(formatted_parts)
    
    def _parse_career_plan(self, text: str) -> Dict[str, Any]:
        """解析职业规划结果"""
        import re
        
        result = {}
        sections = ["职业发展路径", "技能提升建议", "岗位匹配分析", "风险评估与应对"]
        
        for section in sections:
            pattern = rf'## {section}\s*([^#]+)'
            match = re.search(pattern, text, re.DOTALL)
            if match:
                result[section] = match.group(1).strip()
        
        return result
    
    def _parse_match_analysis(self, text: str) -> Dict[str, Any]:
        """解析匹配度分析结果"""
        import re
        
        result = {}
        sections = ["匹配度评分", "优势分析", "改进建议", "推荐岗位"]
        
        for section in sections:
            pattern = rf'## {section}\s*([^#]+)'
            match = re.search(pattern, text, re.DOTALL)
            if match:
                result[section] = match.group(1).strip()
        
        # 提取总体匹配度分数
        score_match = re.search(r'总体匹配度[：:]\s*(\d+)', text)
        if score_match:
            result["overall_match_score"] = int(score_match.group(1))
        
        return result
    
    def _parse_skill_suggestions(self, text: str) -> Dict[str, Any]:
        """解析技能提升建议"""
        import re
        
        result = {}
        sections = ["技能现状分析", "学习路径规划", "实践项目建议", "能力提升时间线"]
        
        for section in sections:
            pattern = rf'## {section}\s*([^#]+)'
            match = re.search(pattern, text, re.DOTALL)
            if match:
                result[section] = match.group(1).strip()
        
        return result
    
    def _extract_match_score(self, match_analysis: Dict[str, Any]) -> int:
        """从匹配度分析中提取分数"""
        return match_analysis.get("overall_match_score", 0)

# 创建全局实例
career_advisor = CareerAdvisor()