# app/routers/student.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from schemas.student_profile import StudentProfileResponse, StudentProfileUpdate
from crud.student_profile import get_student_profile, update_student_profile
from typing import Optional
import os
import uuid
from datetime import datetime
import httpx
import time

router = APIRouter(
    prefix="/student",
    tags=["student"],
)

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp'
}

def get_file_extension(filename: str) -> str:
    return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

def is_allowed_file(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS

async def parse_resume_with_agent(file_url: str) -> dict:
    """调用LangChain智能体解析简历"""
    try:
        # 直接调用LangChain智能体进行简历分析
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:8000/langchain/analyze-resume",
                data={
                    "resume_text": file_url,
                    "user_id": 1
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"LangChain智能体返回的结果: {result}")
                
                if result.get("success"):
                    # 返回LangChain智能体的分析结果
                    return {
                        "success": True, 
                        "data": result.get("data", {})
                    }
                else:
                    print(f"LangChain智能体分析失败: {result.get('message', '未知错误')}")
                    return {"success": False, "error": result.get("message", "分析失败")}
            else:
                print(f"LangChain智能体调用失败: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
    except Exception as e:
        print(f"LangChain智能体调用异常: {str(e)}")
        return {"success": False, "error": str(e)}


@router.get("/profile", response_model=StudentProfileResponse)
def get_student_info(db: Session = Depends(get_db)):
    """获取学生信息"""
    profile = get_student_profile(db, student_id=1)  # 假设当前用户ID为1
    if not profile:
        raise HTTPException(status_code=404, detail="学生信息不存在")
    return profile

@router.put("/profile", response_model=StudentProfileResponse)
def update_student_info(profile_update: StudentProfileUpdate, db: Session = Depends(get_db)):
    """更新学生信息"""
    updated_profile = update_student_profile(db, student_id=1, profile_update=profile_update)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="学生信息不存在")
    return updated_profile

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上传简历"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件不能为空")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件类型。支持: {', '.join(ALLOWED_EXTENSIONS.keys())}"
        )
    
    ext = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        file_url = f"http://localhost:8000/{file_path}"
        print(f"文件URL: {file_url}")
        
        parsed_result = await parse_resume_with_agent(file_url)
        print(f"parse_resume_with_agent返回的结果: {parsed_result}")
        
        # 提取解析后的简历数据
        parsed_data = parsed_result.get("data", {}) if parsed_result.get("success") else {}
        print(f"提取的parsed_data: {parsed_data}")
        
        return {
            "success": True,
            "message": "简历上传成功",
            "file_id": unique_filename,
            "file_name": file.filename,
            "file_path": f"/{file_path}",
            "file_url": file_url,
            "file_size": len(content),
            "file_type": ext,
            "parsed": parsed_data
        }
    except Exception as e:
        print(f"文件保存失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")

@router.post("/parse-resume")
def parse_resume(fileId: str, db: Session = Depends(get_db)):
    """解析简历"""
    # 这里应该实现简历解析的逻辑
    # 为了演示，我们返回一个模拟的解析结果
    return {
        "message": "简历解析成功",
        "data": {
            "name": "张三",
            "education": "本科",
            "skills": ["Python", "Java", "SQL"],
            "experience": "3年软件开发经验"
        }
    }

@router.get("/ability-evaluation")
def get_ability_evaluation(db: Session = Depends(get_db)):
    """获取学生能力评估"""
    # 这里应该实现能力评估的逻辑
    # 为了演示，我们返回一个模拟的评估结果
    return {
        "overall_score": 85,
        "skills": [
            {"name": "编程能力", "score": 90},
            {"name": "算法能力", "score": 85},
            {"name": "系统设计", "score": 80},
            {"name": "沟通能力", "score": 85}
        ],
        "strengths": [
            "扎实的编程基础",
            "良好的代码规范",
            "积极的学习态度"
        ],
        "weaknesses": [
            "系统设计经验相对欠缺",
            "团队协作经验可以进一步提升"
        ]
    }
