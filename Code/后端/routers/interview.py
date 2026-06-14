"""
面试模拟API接口

功能：
- 提供面试问题生成接口
- 支持面试回答评估
- 实现面试对话模拟
- 集成面试智能体

接口设计：
- POST /interview/generate-questions: 生成面试问题
- POST /interview/evaluate-answer: 评估用户回答
- POST /interview/simulate-dialogue: 模拟面试对话
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import json

from agents.interview_simulator import interview_simulator

router = APIRouter(prefix="/interview", tags=["interview"])

from pydantic import BaseModel

class InterviewQuestionRequest(BaseModel):
    """面试问题生成请求"""
    resume_text: str
    job_title: str
    job_requirements: str
    question_count: int = 5

class AnswerEvaluationRequest(BaseModel):
    """回答评估请求"""
    question: str
    user_answer: str
    expected_answer: str

class DialogueSimulationRequest(BaseModel):
    """对话模拟请求"""
    resume_text: str
    job_title: str
    conversation_history: List[Dict[str, str]]
    current_question: str

@router.post("/generate-questions")
async def generate_interview_questions(request: InterviewQuestionRequest):
    """生成个性化面试问题"""
    try:
        print(f"[API] 收到面试问题生成请求，岗位：{request.job_title}")
        
        result = interview_simulator.generate_interview_questions(
            resume_text=request.resume_text,
            job_title=request.job_title,
            job_requirements=request.job_requirements,
            question_count=request.question_count
        )
        
        if result["success"]:
            return {
                "success": True,
                "data": result["interview_data"],
                "message": "面试问题生成成功"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "data": result["interview_data"],
                "message": "面试问题生成失败，已返回默认问题"
            }
            
    except Exception as e:
        print(f"[API] 面试问题生成异常: {e}")
        raise HTTPException(status_code=500, detail=f"面试问题生成失败: {str(e)}")

@router.post("/evaluate-answer")
async def evaluate_answer(request: AnswerEvaluationRequest):
    """评估用户回答"""
    try:
        print(f"[API] 收到回答评估请求")
        
        result = interview_simulator.evaluate_answer(
            question=request.question,
            user_answer=request.user_answer,
            expected_answer=request.expected_answer
        )
        
        if result["success"]:
            return {
                "success": True,
                "data": result["evaluation"],
                "message": "回答评估成功"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "data": result["evaluation"],
                "message": "回答评估失败，已返回默认评估"
            }
            
    except Exception as e:
        print(f"[API] 回答评估异常: {e}")
        raise HTTPException(status_code=500, detail=f"回答评估失败: {str(e)}")

@router.post("/simulate-dialogue")
async def simulate_interview_dialogue(request: DialogueSimulationRequest):
    """模拟面试对话"""
    try:
        print(f"[API] 收到面试对话模拟请求")
        
        result = interview_simulator.simulate_interview_dialogue(
            resume_text=request.resume_text,
            job_title=request.job_title,
            conversation_history=request.conversation_history,
            current_question=request.current_question
        )
        
        if result["success"]:
            return {
                "success": True,
                "data": result["dialogue_result"],
                "message": "面试对话模拟成功"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "data": result["dialogue_result"],
                "message": "面试对话模拟失败，已返回默认结果"
            }
            
    except Exception as e:
        print(f"[API] 面试对话模拟异常: {e}")
        raise HTTPException(status_code=500, detail=f"面试对话模拟失败: {str(e)}")

@router.get("/health")
async def health_check():
    """健康检查接口 - 检查智能体服务状态"""
    try:
        # 检查智能体是否可用
        from agents.interview_simulator import interview_simulator
        
        # 简单的健康检查 - 尝试调用智能体的一个简单方法
        test_result = interview_simulator.health_check()
        
        if test_result["success"]:
            return {
                "success": True,
                "status": "healthy",
                "message": "智能体服务正常运行",
                "timestamp": test_result["timestamp"]
            }
        else:
            return {
                "success": False,
                "status": "unhealthy",
                "message": "智能体服务异常",
                "error": test_result.get("error", "未知错误")
            }
            
    except Exception as e:
        print(f"[API] 健康检查异常: {e}")
        return {
            "success": False,
            "status": "error",
            "message": "健康检查失败",
            "error": str(e)
        }

@router.get("/test")
async def test_interview_api():
    """测试面试API接口"""
    return {
        "success": True,
        "message": "面试API接口正常运行",
        "endpoints": [
            "GET /interview/health - 健康检查",
            "POST /interview/generate-questions - 生成面试问题",
            "POST /interview/evaluate-answer - 评估用户回答", 
            "POST /interview/simulate-dialogue - 模拟面试对话"
        ]
    }