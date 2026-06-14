"""
面试模拟智能体

功能：
- 基于用户简历和岗位要求生成个性化面试问题
- 模拟真实面试场景，提供智能问答和反馈
- 分析用户回答质量，提供改进建议
- 支持多种岗位类型的面试模拟

技术架构：
- LangChain框架集成
- 通义千问大模型
- 结构化数据输出
- 实时对话模拟
"""

import os
import json
from typing import Dict, List, Any, Optional
from langchain_classic.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import Tongyi
from langchain_core.output_parsers import BaseOutputParser

# 导入配置文件
from .config import LangChainConfig


class InterviewOutputParser(BaseOutputParser):
    """面试结果解析器"""
    
    def parse(self, text: str) -> Dict[str, Any]:
        """解析LLM输出为结构化数据"""
        try:
            # 尝试直接解析JSON
            if text.strip().startswith('{') and text.strip().endswith('}'):
                return json.loads(text)
            
            # 提取JSON对象
            lines = text.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    return json.loads(line)
            
            # 如果无法解析JSON，返回原始文本
            return {"raw_response": text}
            
        except Exception as e:
            print(f"解析面试结果失败: {e}")
            return {"error": str(e), "raw_response": text}

class InterviewSimulator:
    """面试模拟智能体"""
    
    def __init__(self):
        """初始化面试模拟智能体"""
        # 使用配置文件中的API密钥和模型配置
        self.api_key = LangChainConfig.get_api_key()
        model_config = LangChainConfig.get_model_config()
        
        self.llm = Tongyi(
            dashscope_api_key=self.api_key,
            model_name=model_config["model_name"],
            temperature=model_config["temperature"],
            max_tokens=model_config["max_tokens"]
        )
        
        # 面试问题生成提示词
        self.interview_prompt = PromptTemplate(
            input_variables=["resume_text", "job_title", "job_requirements", "question_count"],
            template="""
你是一个专业的面试官。请基于用户的简历信息和目标岗位要求，生成个性化的面试问题。

用户简历信息：
{resume_text}

目标岗位：{job_title}
岗位要求：{job_requirements}

请生成{question_count}个面试问题，并按照以下JSON格式返回：

{{
  "interview_questions": [
    {{
      "question": "问题内容",
      "type": "问题类型（技术/业务/行为/设计等）",
      "difficulty": "难度级别（简单/中等/困难）",
      "answer_hint": "回答建议",
      "detailed_analysis": "详细解析",
      "evaluation_criteria": "评估标准"
    }}
  ],
  "interview_summary": "面试整体评估和建议"
}}

请确保问题具有针对性，能够考察用户的专业技能、项目经验、解决问题的能力等。
"""
        )
        
        # 回答评估提示词
        self.evaluation_prompt = PromptTemplate(
            input_variables=["question", "user_answer", "expected_answer"],
            template="""
请对用户的面试回答进行评估。

面试问题：{question}

用户回答：{user_answer}

参考答案：{expected_answer}

请按照以下JSON格式进行评估：

{{
  "score": "分数（0-100）",
  "strengths": ["回答的优点"],
  "weaknesses": ["回答的不足"],
  "improvement_suggestions": ["改进建议"],
  "overall_feedback": "总体评价"
}}

请从技术准确性、逻辑清晰度、表达能力、问题解决能力等方面进行评估。
"""
        )
        
        # 面试模拟对话提示词
        self.dialogue_prompt = PromptTemplate(
            input_variables=["resume_text", "job_title", "conversation_history", "current_question"],
            template="""
你是一个专业的面试官，正在进行面试模拟。

用户简历信息：
{resume_text}

目标岗位：{job_title}

对话历史：
{conversation_history}

当前问题：{current_question}

请根据对话历史，自然地继续面试对话，可以提出新的问题或对用户回答进行追问。
请按照以下JSON格式返回：

{{
  "next_question": "下一个问题",
  "follow_up_questions": ["追问问题列表"],
  "interviewer_feedback": "面试官反馈",
  "conversation_summary": "对话总结"
}}
"""
        )
        
        # 创建LLM链
        self.interview_chain = LLMChain(llm=self.llm, prompt=self.interview_prompt)
        self.evaluation_chain = LLMChain(llm=self.llm, prompt=self.evaluation_prompt)
        self.dialogue_chain = LLMChain(llm=self.llm, prompt=self.dialogue_prompt)
        
        # 输出解析器
        self.output_parser = InterviewOutputParser()
    
    def generate_interview_questions(self, resume_text: str, job_title: str, 
                                   job_requirements: str, question_count: int = 5) -> Dict[str, Any]:
        """生成个性化面试问题"""
        try:
            print(f"[面试智能体] 开始生成面试问题，岗位：{job_title}")
            
            # 清理简历文本
            cleaned_resume = self._clean_text(resume_text)
            
            # 调用LLM生成面试问题
            response = self.interview_chain.run(
                resume_text=cleaned_resume,
                job_title=job_title,
                job_requirements=job_requirements,
                question_count=question_count
            )
            
            # 解析响应
            result = self.output_parser.parse(response)
            
            print(f"[面试智能体] 面试问题生成完成，问题数量：{len(result.get('interview_questions', []))}")
            
            return {
                "success": True,
                "interview_data": result
            }
            
        except Exception as e:
            print(f"[面试智能体] 生成面试问题失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "interview_data": self._get_default_interview_questions(job_title)
            }
    
    def evaluate_answer(self, question: str, user_answer: str, expected_answer: str) -> Dict[str, Any]:
        """评估用户回答"""
        try:
            print(f"[面试智能体] 开始评估用户回答")
            
            response = self.evaluation_chain.run(
                question=question,
                user_answer=user_answer,
                expected_answer=expected_answer
            )
            
            # 解析响应
            result = self.output_parser.parse(response)
            
            print(f"[面试智能体] 回答评估完成，分数：{result.get('score', 'N/A')}")
            
            return {
                "success": True,
                "evaluation": result
            }
            
        except Exception as e:
            print(f"[面试智能体] 评估用户回答失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "evaluation": self._get_default_evaluation()
            }
    
    def simulate_interview_dialogue(self, resume_text: str, job_title: str, 
                                  conversation_history: List[Dict], current_question: str) -> Dict[str, Any]:
        """模拟面试对话"""
        try:
            print(f"[面试智能体] 开始模拟面试对话")
            
            # 格式化对话历史
            history_text = self._format_conversation_history(conversation_history)
            
            response = self.dialogue_chain.run(
                resume_text=resume_text,
                job_title=job_title,
                conversation_history=history_text,
                current_question=current_question
            )
            
            # 解析响应
            result = self.output_parser.parse(response)
            
            print(f"[面试智能体] 面试对话模拟完成")
            
            return {
                "success": True,
                "dialogue_result": result
            }
            
        except Exception as e:
            print(f"[面试智能体] 模拟面试对话失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "dialogue_result": self._get_default_dialogue_result()
            }
    
    def _clean_text(self, text: str) -> str:
        """清理文本"""
        if not text:
            return ""
        # 移除多余的空格和换行
        return ' '.join(text.split())
    
    def _format_conversation_history(self, history: List[Dict]) -> str:
        """格式化对话历史"""
        if not history:
            return "无对话历史"
        
        formatted = []
        for i, item in enumerate(history, 1):
            if 'question' in item and 'answer' in item:
                formatted.append(f"{i}. 面试官: {item['question']}")
                formatted.append(f"   用户: {item['answer']}")
        
        return '\n'.join(formatted)
    
    def _get_default_interview_questions(self, job_title: str) -> Dict[str, Any]:
        """获取默认面试问题"""
        return {
            "interview_questions": [
                {
                    "question": f"请介绍一下您对{job_title}这个岗位的理解？",
                    "type": "业务问题",
                    "difficulty": "中等",
                    "answer_hint": "可以从岗位职责、技能要求、发展前景等方面回答",
                    "detailed_analysis": "这个问题考察应聘者对岗位的理解程度和职业规划",
                    "evaluation_criteria": "回答的全面性、准确性、逻辑性"
                },
                {
                    "question": "请描述一个您解决过的技术难题？",
                    "type": "技术问题", 
                    "difficulty": "困难",
                    "answer_hint": "使用STAR法则（情境、任务、行动、结果）来描述",
                    "detailed_analysis": "这个问题考察应聘者的实际问题解决能力和技术深度",
                    "evaluation_criteria": "问题的复杂性、解决方法的有效性、结果的影响"
                }
            ],
            "interview_summary": "基于您的简历信息，这些问题可以帮助评估您的专业技能和岗位匹配度"
        }
    
    def _get_default_evaluation(self) -> Dict[str, Any]:
        """获取默认评估结果"""
        return {
            "score": 70,
            "strengths": ["回答思路清晰", "表达流畅"],
            "weaknesses": ["技术细节不够深入", "缺乏具体案例"],
            "improvement_suggestions": ["补充具体的技术细节", "提供更多的实际案例"],
            "overall_feedback": "回答基本合格，但需要加强技术深度和案例支撑"
        }
    
    def health_check(self) -> Dict[str, Any]:
        """健康检查 - 检查智能体服务状态"""
        import time
        try:
            # 测试LLM连接
            test_prompt = "请回复'OK'"
            response = self.llm.invoke(test_prompt)
            
            # 检查响应是否正常
            if response and len(str(response).strip()) > 0:
                return {
                    "success": True,
                    "status": "healthy",
                    "message": "智能体服务正常运行",
                    "timestamp": time.time(),
                    "llm_available": True
                }
            else:
                return {
                    "success": False,
                    "status": "unhealthy", 
                    "message": "LLM响应异常",
                    "timestamp": time.time(),
                    "llm_available": False
                }
                
        except Exception as e:
            print(f"[面试智能体] 健康检查失败: {e}")
            return {
                "success": False,
                "status": "error",
                "message": "智能体服务异常",
                "error": str(e),
                "timestamp": time.time(),
                "llm_available": False
            }

    def _get_default_dialogue_result(self) -> Dict[str, Any]:
        """获取默认对话结果"""
        return {
            "next_question": "请继续回答下一个问题",
            "follow_up_questions": [],
            "interviewer_feedback": "回答不错，请继续努力",
            "conversation_summary": "对话进行顺利"
        }

# 创建全局实例
interview_simulator = InterviewSimulator()