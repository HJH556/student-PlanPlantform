"""
简历分析智能体
基于LangChain实现简历内容分析和个人画像生成
"""
import os
import re
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from .config import LangChainConfig

class ResumeAnalyzer:
    """简历分析智能体"""
    
    def __init__(self):
        """初始化智能体"""
        self.api_key = LangChainConfig.get_api_key()
        self.model_config = LangChainConfig.get_model_config()
        
        # 初始化LangChain模型（适配阿里云API）
        self.llm = ChatOpenAI(
            openai_api_key=self.api_key,
            model_name=self.model_config["model_name"],
            temperature=self.model_config["temperature"],
            max_tokens=self.model_config["max_tokens"],
            base_url=self.model_config["base_url"]
        )
        
        # 创建简历分析提示模板
        self.resume_prompt = PromptTemplate(
            input_variables=["resume_text"],
            template=LangChainConfig.RESUME_ANALYSIS_PROMPT
        )
        
        # 创建职业规划提示模板
        self.career_prompt = PromptTemplate(
            input_variables=["profile_text", "target_job"],
            template=LangChainConfig.CAREER_PLANNING_PROMPT
        )
        
        # 创建个人画像提示模板
        self.persona_prompt = PromptTemplate(
            input_variables=["input_data"],
            template=LangChainConfig.PERSONA_PROFILE_PROMPT
        )
        
        # 创建LLM链
        self.resume_chain = LLMChain(llm=self.llm, prompt=self.resume_prompt)
        self.career_chain = LLMChain(llm=self.llm, prompt=self.career_prompt)
        self.persona_chain = LLMChain(llm=self.llm, prompt=self.persona_prompt)
    
    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        分析简历内容
        
        Args:
            resume_text: 简历文本内容
            
        Returns:
            分析结果字典
        """
        try:
            print(f"[智能体] 开始分析简历，文本长度: {len(resume_text)} 字符")
            
            # 清理简历文本
            cleaned_text = self._clean_resume_text(resume_text)
            print(f"[智能体] 简历文本清理完成，长度: {len(cleaned_text)} 字符")
            
            # 使用LLM分析简历
            print("[智能体] 开始调用LLM分析简历...")
            analysis_result = self.resume_chain.run(resume_text=cleaned_text)
            print(f"[智能体] LLM分析完成，结果长度: {len(analysis_result)} 字符")
            
            # 解析分析结果（尝试解析JSON格式）
            print("[智能体] 开始解析分析结果...")
            parsed_result = self._parse_analysis_result(analysis_result)
            print(f"[智能体] 分析结果解析完成，数据结构: {list(parsed_result.keys())}")
            
            # 验证和标准化数据结构
            print("[智能体] 开始验证和标准化数据结构...")
            validated_result = self._validate_and_normalize_data(parsed_result)
            print(f"[智能体] 数据结构验证完成，标准化结构: {list(validated_result.keys())}")
            
            # 生成职业规划数据
            print("[智能体] 开始生成职业规划数据...")
            career_planning_data = self._generate_career_planning(validated_result)
            print(f"[智能体] 职业规划数据生成完成，数据结构: {list(career_planning_data.keys())}")
            
            # 合并分析结果和职业规划数据
            complete_result = {
                **validated_result,
                "career_planning": career_planning_data
            }
            
            print("[智能体] 简历分析成功完成")
            return {
                "success": True,
                "analysis": complete_result,
                "raw_text": analysis_result
            }
            
        except Exception as e:
            print(f"[智能体] 简历分析异常: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "analysis": {}
            }
    
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
            # 将个人画像数据转换为文本
            profile_text = self._format_profile_text(profile_data)
            
            # 使用LLM生成职业规划
            career_plan = self.career_chain.run(
                profile_text=profile_text,
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
    
    def create_persona_profile(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建个人画像
        
        Args:
            input_data: 输入数据（简历分析结果或其他信息）
            
        Returns:
            个人画像结果
        """
        try:
            # 格式化输入数据
            formatted_data = self._format_input_data(input_data)
            
            # 使用LLM生成个人画像
            persona_profile = self.persona_chain.run(input_data=formatted_data)
            
            # 解析个人画像结果
            parsed_profile = self._parse_persona_profile(persona_profile)
            
            return {
                "success": True,
                "persona_profile": parsed_profile,
                "raw_text": persona_profile
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "persona_profile": {}
            }
    
    def _clean_resume_text(self, text: str) -> str:
        """清理简历文本"""
        # 移除多余的空格和换行
        cleaned = re.sub(r'\s+', ' ', text)
        # 移除特殊字符
        cleaned = re.sub(r'[^\w\s\u4e00-\u9fff，。！？：；（）【】《》]', '', cleaned)
        return cleaned.strip()
    
    def _parse_analysis_result(self, text: str) -> Dict[str, Any]:
        """解析简历分析结果"""
        import json
        
        print(f"[智能体] 开始解析分析结果，文本长度: {len(text)} 字符")
        
        try:
            # 首先尝试直接解析整个文本为JSON
            parsed_data = json.loads(text)
            print("[智能体] 成功解析JSON格式的分析结果")
            return parsed_data
        except json.JSONDecodeError as e:
            print(f"[智能体] JSON解析失败: {e}")
            
            # 尝试查找JSON对象
            try:
                # 查找完整的JSON对象（从第一个{到最后一个}）
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    json_text = json_match.group(0)
                    parsed_data = json.loads(json_text)
                    print("[智能体] 成功从文本中提取JSON对象并解析")
                    return parsed_data
            except (json.JSONDecodeError, AttributeError) as e2:
                print(f"[智能体] 提取JSON对象解析失败: {e2}")
        
        # 如果JSON解析失败，回退到原来的文本解析方法
        print(f"[智能体] 使用备用解析方法，原始文本前500字符: {text[:500]}")
        result = {}
        
        # 提取基本信息
        basic_info_match = re.search(r'## 基本信息\s*([^#]+)', text, re.DOTALL)
        if basic_info_match:
            result["basic_info"] = self._parse_key_value_pairs(basic_info_match.group(1))
        
        # 提取能力评估
        ability_match = re.search(r'## 能力评估\s*([^#]+)', text, re.DOTALL)
        if ability_match:
            result["ability_assessment"] = self._parse_key_value_pairs(ability_match.group(1))
        
        # 提取职业倾向
        career_match = re.search(r'## 职业倾向\s*([^#]+)', text, re.DOTALL)
        if career_match:
            result["career_tendency"] = self._parse_key_value_pairs(career_match.group(1))
        
        # 提取匹配度分析
        match_match = re.search(r'## 匹配度分析\s*([^#]+)', text, re.DOTALL)
        if match_match:
            result["match_analysis"] = self._parse_key_value_pairs(match_match.group(1))
        
        print(f"[智能体] 备用解析方法完成，结果结构: {list(result.keys())}")
        return result
    
    def _validate_and_normalize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """验证和标准化数据结构，确保与前端期望一致"""
        print("[智能体] 开始验证和标准化数据结构...")
        
        # 深拷贝数据避免修改原始数据
        normalized_data = data.copy()
        
        # 验证和标准化匹配岗位数据
        if "career_tendency" in normalized_data and "匹配岗位" in normalized_data["career_tendency"]:
            positions = normalized_data["career_tendency"]["匹配岗位"]
            if isinstance(positions, list):
                for position in positions:
                    # 确保每个岗位都有正确的字段
                    if isinstance(position, dict):
                        # 确保有match_score字段
                        if "match_score" not in position:
                            # 尝试从其他字段转换
                            if "匹配度" in position:
                                position["match_score"] = position["匹配度"]
                            else:
                                position["match_score"] = 0
                        # 确保match_score是数字
                        if isinstance(position["match_score"], str):
                            try:
                                position["match_score"] = int(position["match_score"].replace("%", ""))
                            except:
                                position["match_score"] = 0
        
        # 验证和标准化技能匹配数据
        if "match_analysis" in normalized_data and "技能匹配" in normalized_data["match_analysis"]:
            skills = normalized_data["match_analysis"]["技能匹配"]
            if isinstance(skills, list):
                for skill in skills:
                    if isinstance(skill, dict):
                        # 确保有匹配度字段
                        if "匹配度" not in skill:
                            # 尝试从其他字段转换
                            if "match_score" in skill:
                                skill["匹配度"] = skill["match_score"]
                            else:
                                skill["匹配度"] = 0
                        # 确保匹配度是数字
                        if isinstance(skill["匹配度"], str):
                            try:
                                skill["匹配度"] = int(skill["匹配度"].replace("%", ""))
                            except:
                                skill["匹配度"] = 0
                        # 确保重要性字段存在
                        if "重要性" not in skill:
                            skill["重要性"] = "中"
        
        # 验证和标准化总体匹配度
        if "match_analysis" in normalized_data and "总体匹配度" in normalized_data["match_analysis"]:
            overall_match = normalized_data["match_analysis"]["总体匹配度"]
            if isinstance(overall_match, str):
                try:
                    normalized_data["match_analysis"]["总体匹配度"] = int(overall_match.replace("%", ""))
                except:
                    normalized_data["match_analysis"]["总体匹配度"] = 0
        
        print(f"[智能体] 数据结构验证完成，标准化结构: {list(normalized_data.keys())}")
        return normalized_data
    
    def _parse_career_plan(self, text: str) -> Dict[str, Any]:
        """解析职业规划结果"""
        result = {}
        
        # 提取职业发展路径
        path_match = re.search(r'## 职业发展路径\s*([^#]+)', text, re.DOTALL)
        if path_match:
            result["career_path"] = self._parse_key_value_pairs(path_match.group(1))
        
        # 提取技能提升计划
        skill_match = re.search(r'## 技能提升计划\s*([^#]+)', text, re.DOTALL)
        if skill_match:
            result["skill_improvement"] = self._parse_key_value_pairs(skill_match.group(1))
        
        # 提取岗位匹配分析
        job_match = re.search(r'## 岗位匹配分析\s*([^#]+)', text, re.DOTALL)
        if job_match:
            result["job_match_analysis"] = self._parse_key_value_pairs(job_match.group(1))
        
        return result
    
    def _parse_persona_profile(self, text: str) -> Dict[str, Any]:
        """解析个人画像结果"""
        result = {}
        
        # 提取个人概况
        profile_match = re.search(r'## 个人概况\s*([^#]+)', text, re.DOTALL)
        if profile_match:
            result["personal_overview"] = self._parse_key_value_pairs(profile_match.group(1))
        
        # 提取能力雷达图
        ability_match = re.search(r'## 能力雷达图\s*([^#]+)', text, re.DOTALL)
        if ability_match:
            result["ability_radar"] = self._parse_key_value_pairs(ability_match.group(1))
        
        # 提取职业倾向分析
        career_match = re.search(r'## 职业倾向分析\s*([^#]+)', text, re.DOTALL)
        if career_match:
            result["career_analysis"] = self._parse_key_value_pairs(career_match.group(1))
        
        # 提取岗位匹配建议
        job_match = re.search(r'## 岗位匹配建议\s*([^#]+)', text, re.DOTALL)
        if job_match:
            result["job_recommendations"] = self._parse_key_value_pairs(job_match.group(1))
        
        return result
    
    def _parse_key_value_pairs(self, text: str) -> Dict[str, str]:
        """解析键值对文本"""
        result = {}
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('- '):
                # 移除开头的 "- "
                line = line[2:].strip()
                # 分割键值对
                if '：' in line:
                    key, value = line.split('：', 1)
                    result[key.strip()] = value.strip()
                elif ':' in line:
                    key, value = line.split(':', 1)
                    result[key.strip()] = value.strip()
        
        return result
    
    def _format_profile_text(self, profile_data: Dict[str, Any]) -> str:
        """格式化个人画像数据为文本"""
        text_parts = []
        
        for section, data in profile_data.items():
            if isinstance(data, dict):
                text_parts.append(f"{section}:")
                for key, value in data.items():
                    text_parts.append(f"  {key}: {value}")
            else:
                text_parts.append(f"{section}: {data}")
        
        return '\n'.join(text_parts)
    
    def _format_input_data(self, input_data: Dict[str, Any]) -> str:
        """格式化输入数据为文本"""
        return self._format_profile_text(input_data)
    
    def _generate_career_planning(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """基于分析结果生成职业规划数据"""
        try:
            # 提取关键信息用于生成职业规划
            basic_info = analysis_data.get('basic_info', {})
            ability_assessment = analysis_data.get('ability_assessment', {})
            career_tendency = analysis_data.get('career_tendency', {})
            
            # 基于分析结果生成职业规划建议
            career_planning = {
                "短期目标": self._generate_short_term_goal(basic_info, ability_assessment),
                "中期目标": self._generate_medium_term_goal(basic_info, ability_assessment, career_tendency),
                "长期目标": self._generate_long_term_goal(basic_info, ability_assessment, career_tendency),
                "当前需要提升的技能": self._identify_skill_gaps(ability_assessment),
                "学习资源推荐": self._recommend_learning_resources(ability_assessment),
                "实践项目建议": self._suggest_practice_projects(ability_assessment),
                "当前匹配度": self._calculate_match_score(ability_assessment, career_tendency),
                "需要弥补的差距": self._identify_gaps(ability_assessment, career_tendency),
                "具体行动建议": self._generate_action_plan(ability_assessment, career_tendency)
            }
            
            # 生成行动计划数据，用于前端行动计划组件
            action_plans = {
                "short_term": {
                    "title": f"{basic_info.get('姓名', '用户')}的短期职业发展计划",
                    "duration": "0-1年",
                    "tasks": self._generate_short_term_tasks(basic_info, ability_assessment)
                },
                "medium_term": {
                    "title": f"{basic_info.get('姓名', '用户')}的中期职业发展计划", 
                    "duration": "1-3年",
                    "tasks": self._generate_medium_term_tasks(basic_info, ability_assessment, career_tendency)
                },
                "long_term": {
                    "title": f"{basic_info.get('姓名', '用户')}的长期职业发展计划",
                    "duration": "3-5年", 
                    "tasks": self._generate_long_term_tasks(basic_info, ability_assessment, career_tendency)
                }
            }
            
            # 返回包含行动计划数据的完整结果
            return {
                "career_planning": career_planning,
                "action_plans": action_plans
            }
            
        except Exception as e:
            print(f"生成职业规划数据失败: {e}")
            # 返回默认的职业规划数据
            return self._get_default_career_planning()
    
    def _generate_short_term_goal(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any]) -> str:
        """生成短期目标"""
        # 基于能力和基本信息生成短期目标
        experience = basic_info.get("工作经验", "")
        
        if "应届" in str(experience) or "实习" in str(experience):
            return "在0-1年内，专注于技术基础建设和项目实践，建立扎实的开发能力，完成2-3个完整项目"
        elif "1-3年" in str(experience):
            return "在0-1年内，提升技术深度和项目架构能力，参与复杂项目开发，建立技术影响力"
        else:
            return "在0-1年内，专注于技术深度提升和项目实践，建立扎实的技术基础"
    
    def _generate_medium_term_goal(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> str:
        """生成中期目标"""
        # 基于职业倾向和能力评估生成中期目标
        interest = career_tendency.get("兴趣领域", "")
        
        if "前端" in str(interest):
            return "在1-3年内，向高级前端工程师或全栈工程师发展，掌握主流框架原理，具备架构设计能力"
        elif "后端" in str(interest):
            return "在1-3年内，向高级后端工程师或架构师发展，掌握分布式系统设计，具备系统优化能力"
        else:
            return "在1-3年内，向全栈开发或技术专家方向发展，积累项目经验和团队协作能力"
    
    def _generate_long_term_goal(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> str:
        """生成长期目标"""
        # 基于长期发展潜力生成长期目标
        return "在3-5年内，向技术管理或架构师方向发展，培养领导力和技术决策能力，建立个人技术品牌"
    
    def _identify_skill_gaps(self, ability_assessment: Dict[str, Any]) -> str:
        """识别技能差距"""
        # 基于能力评估识别需要提升的技能
        skills = []
        
        if ability_assessment.get("技术能力", {}).get("score", 0) < 80:
            skills.append("核心技术框架深度")
        if ability_assessment.get("沟通能力", {}).get("score", 0) < 75:
            skills.append("团队协作和沟通表达")
        if ability_assessment.get("学习能力", {}).get("score", 0) < 85:
            skills.append("新技术学习能力")
        
        return "、".join(skills) if skills else "技术基础扎实，建议关注前沿技术发展"
    
    def _recommend_learning_resources(self, ability_assessment: Dict[str, Any]) -> str:
        """推荐学习资源"""
        return "官方文档、技术博客、在线课程（慕课网、极客时间）、开源项目、技术社区（掘金、GitHub）"
    
    def _suggest_practice_projects(self, ability_assessment: Dict[str, Any]) -> str:
        """建议实践项目"""
        return "个人博客系统、电商平台、管理系统、微服务架构实践、开源项目贡献"
    
    def _calculate_match_score(self, ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> str:
        """计算匹配度分数"""
        # 基于能力评估和职业倾向计算匹配度
        tech_score = ability_assessment.get("技术能力", {}).get("score", 0)
        comm_score = ability_assessment.get("沟通能力", {}).get("score", 0)
        team_score = ability_assessment.get("团队协作", {}).get("score", 0)
        
        avg_score = (tech_score + comm_score + team_score) / 3
        return f"{int(avg_score)}分（基于能力评估和职业倾向分析）"
    
    def _identify_gaps(self, ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> str:
        """识别需要弥补的差距"""
        gaps = []
        
        if ability_assessment.get("技术能力", {}).get("score", 0) < 80:
            gaps.append("技术深度和项目经验")
        if ability_assessment.get("沟通能力", {}).get("score", 0) < 75:
            gaps.append("团队协作和沟通能力")
        if ability_assessment.get("学习能力", {}).get("score", 0) < 85:
            gaps.append("新技术学习速度")
        
        return "、".join(gaps) if gaps else "能力匹配度较高，建议保持持续学习"
    
    def _generate_action_plan(self, ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> str:
        """生成具体行动建议"""
        return "1. 完成2-3个完整项目实践；2. 深入学习框架原理和最佳实践；3. 参与开源项目和技术社区；4. 建立个人技术博客和作品集；5. 定期进行技术总结和反思"
    
    def _get_default_career_planning(self) -> Dict[str, Any]:
        """获取默认的职业规划数据"""
        return {
            "career_planning": {
                "短期目标": "在0-1年内专注于技术深度提升和项目实践，建立扎实的技术基础",
                "中期目标": "在1-3年内向全栈开发或技术专家方向发展，积累项目经验和团队协作能力",
                "长期目标": "在3-5年内向技术管理或架构师方向发展，培养领导力和技术决策能力",
                "当前需要提升的技能": "Vue.js、React、Node.js、数据库设计、系统架构",
                "学习资源推荐": "慕课网、掘金、极客时间、官方文档、开源项目",
                "实践项目建议": "个人博客系统、电商平台、管理系统、微服务架构实践",
                "当前匹配度": "75分（基于简历初步分析）",
                "需要弥补的差距": "需要加强项目经验积累、技术深度和团队协作能力",
                "具体行动建议": "1. 完成2-3个完整项目；2. 深入学习框架原理；3. 参与开源项目；4. 提升沟通表达能力"
            },
            "action_plans": {
                "short_term": {
                    "title": "短期职业发展计划",
                    "duration": "0-1年",
                    "tasks": [
                        {"text": "学习前端开发技术", "deadline": "2024-12-31"},
                        {"text": "参与项目管理培训", "deadline": "2024-09-30"},
                        {"text": "构建个人作品集", "deadline": "2024-11-30"}
                    ]
                },
                "medium_term": {
                    "title": "中期职业发展计划",
                    "duration": "1-3年",
                    "tasks": [
                        {"text": "获得PMP认证", "deadline": "2025-06-30"},
                        {"text": "参与大型项目开发", "deadline": "2025-03-31"},
                        {"text": "提升团队管理能力", "deadline": "2025-09-30"}
                    ]
                },
                "long_term": {
                    "title": "长期职业发展计划",
                    "duration": "3-5年",
                    "tasks": [
                        {"text": "成为技术专家", "deadline": "2026-12-31"},
                        {"text": "培养领导力", "deadline": "2026-06-30"},
                        {"text": "实现职业目标", "deadline": "2027-12-31"}
                    ]
                }
            }
        }

    def _generate_short_term_tasks(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any]) -> List[Dict[str, str]]:
        """生成短期任务"""
        experience = basic_info.get("工作经验", "")
        skills = basic_info.get("技能特长", "")
        
        tasks = []
        
        if "应届" in str(experience) or "实习" in str(experience):
            tasks = [
                {"text": "掌握HTML、CSS、JavaScript基础", "deadline": "2024-12-31"},
                {"text": "学习至少一个前端框架（Vue/React）", "deadline": "2025-03-31"},
                {"text": "完成2-3个个人项目实践", "deadline": "2025-06-30"}
            ]
        elif "1-3年" in str(experience):
            tasks = [
                {"text": "深入学习框架原理和最佳实践", "deadline": "2024-12-31"},
                {"text": "参与复杂项目架构设计", "deadline": "2025-03-31"},
                {"text": "建立个人技术影响力", "deadline": "2025-06-30"}
            ]
        else:
            tasks = [
                {"text": "技术深度提升和项目实践", "deadline": "2024-12-31"},
                {"text": "建立扎实的技术基础", "deadline": "2025-03-31"},
                {"text": "完成完整项目开发", "deadline": "2025-06-30"}
            ]
        
        return tasks

    def _generate_medium_term_tasks(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> List[Dict[str, str]]:
        """生成中期任务"""
        interest = career_tendency.get("兴趣领域", "")
        
        tasks = []
        
        if "前端" in str(interest):
            tasks = [
                {"text": "掌握主流框架原理", "deadline": "2025-12-31"},
                {"text": "具备架构设计能力", "deadline": "2026-06-30"},
                {"text": "向高级前端工程师发展", "deadline": "2026-12-31"}
            ]
        elif "后端" in str(interest):
            tasks = [
                {"text": "掌握分布式系统设计", "deadline": "2025-12-31"},
                {"text": "具备系统优化能力", "deadline": "2026-06-30"},
                {"text": "向高级后端工程师发展", "deadline": "2026-12-31"}
            ]
        else:
            tasks = [
                {"text": "积累项目经验", "deadline": "2025-12-31"},
                {"text": "建立团队协作能力", "deadline": "2026-06-30"},
                {"text": "向技术专家方向发展", "deadline": "2026-12-31"}
            ]
        
        return tasks

    def _generate_long_term_tasks(self, basic_info: Dict[str, Any], ability_assessment: Dict[str, Any], career_tendency: Dict[str, Any]) -> List[Dict[str, str]]:
        """生成长期任务"""
        career_goal = career_tendency.get("职业目标", "")
        
        tasks = []
        
        if "管理" in str(career_goal) or "架构" in str(career_goal):
            tasks = [
                {"text": "培养技术决策能力", "deadline": "2027-06-30"},
                {"text": "建立技术领导力", "deadline": "2027-12-31"},
                {"text": "实现职业愿景", "deadline": "2028-06-30"}
            ]
        else:
            tasks = [
                {"text": "成为技术专家", "deadline": "2027-06-30"},
                {"text": "培养领导力", "deadline": "2027-12-31"},
                {"text": "实现职业目标", "deadline": "2028-06-30"}
            ]
        
        return tasks

# 创建全局实例
resume_analyzer = ResumeAnalyzer()