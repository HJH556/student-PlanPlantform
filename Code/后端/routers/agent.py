# app/routers/agent.py
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from database import get_db
from schemas.agent import AgentStatus, ChatHistory, AgentRecommendation, Message
from typing import List, Optional, Dict, Any
from datetime import datetime
from threading import Lock
import os
import warnings
import httpx
import re

warnings.filterwarnings("ignore", message="Valid config keys have changed in V2")
warnings.filterwarnings("ignore", message="'orm_mode' has been renamed to 'from_attributes'")

router = APIRouter(
    prefix="/agent",
    tags=["agent"],
)

chat_histories: Dict[str, List[Dict[str, Any]]] = {}
chat_history_lock = Lock()

# Neo4j 配置
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "zyh2169931078")

# DashScope API 配置 - 从环境变量读取，如果没有则使用默认
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "sk-7424127d979a414398f14afaea2ffa92")
DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

# 全局变量
driver = None


def init_neo4j():
    """初始化 Neo4j 连接"""
    global driver
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
        # 测试连接
        with driver.session() as session:
            session.run("RETURN 1")
        print("Neo4j 连接成功！")
    except Exception as e:
        print(f"Neo4j 连接失败: {e}")
        driver = None


init_neo4j()


async def call_dashscope_api(messages: List[Dict[str, str]]) -> str:
    """调用 DashScope API (通义千问)"""
    if not DASHSCOPE_API_KEY:
        return "错误：未配置 DashScope API 密钥"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{DASHSCOPE_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen-turbo",  # 使用更稳定的模型
                    "messages": messages,
                    "temperature": 0
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            return "错误：API 密钥无效或已过期，请检查 DASHSCOPE_API_KEY 配置"
        elif e.response.status_code == 429:
            return "错误：API 调用频率超限，请稍后再试"
        else:
            return f"错误：API 调用失败 (HTTP {e.response.status_code})"
    except Exception as e:
        print(f"调用 DashScope API 失败: {e}")
        return f"调用 AI 服务失败: {str(e)}"


def get_schema() -> str:
    """获取 Neo4j 图谱 Schema"""
    if not driver:
        return "Neo4j 未连接"
    
    try:
        with driver.session() as session:
            # 获取节点标签
            node_result = session.run("CALL db.labels() YIELD label RETURN collect(label) as labels")
            labels = node_result.single()["labels"]
            
            # 获取关系类型
            rel_result = session.run("CALL db.relationshipTypes() YIELD relationshipType RETURN collect(relationshipType) as types")
            rel_types = rel_result.single()["types"]
            
            return f"节点标签: {', '.join(labels)}\n关系类型: {', '.join(rel_types)}"
    except Exception as e:
        return f"获取 Schema 失败: {str(e)}"


def execute_cypher(query: str) -> List[Dict]:
    """执行 Cypher 查询"""
    if not driver:
        return []
    
    try:
        with driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]
    except Exception as e:
        print(f"执行 Cypher 失败: {e}")
        return []


def is_valid_cypher(query: str) -> bool:
    """检查是否为有效的 Cypher 查询语句"""
    # 检查是否包含基本的 Cypher 关键字
    cypher_keywords = ['MATCH', 'RETURN', 'WHERE', 'CREATE', 'MERGE', 'DELETE', 
                       'SET', 'REMOVE', 'OPTIONAL', 'CALL', 'UNWIND', 'WITH']
    query_upper = query.upper().strip()
    return any(keyword in query_upper for keyword in cypher_keywords)


def generate_cypher_from_question(question: str) -> tuple[str, bool]:
    """根据问题生成 Cypher 查询（备用方案）
    返回: (cypher_query, is_valid) - is_valid 表示是否找到了岗位名称
    """
    question_lower = question.lower()
    
    # 提取岗位名称（简单匹配）
    job_titles = ['前端开发', '后端开发', 'Java', 'Python', '软件测试', 
                  '数据分析师', 'C/C++', '产品经理', 'UI设计', '运维工程师']
    
    job_name = None
    for title in job_titles:
        if title in question:
            job_name = title
            break
    
    if not job_name:
        # 尝试提取引号中的内容
        match = re.search(r'["\']([^"\']+)["\']', question)
        if match:
            job_name = match.group(1)
    
    # 如果没有找到岗位名称，返回空查询
    if not job_name:
        return ("", False)
    
    # 根据问题类型生成查询
    if '晋升' in question_lower or '升到' in question_lower or '发展' in question_lower:
        return (f"MATCH (j:Job {{name: '{job_name}'}})-[:PROMOTES_TO*1..5]->(target) RETURN DISTINCT target.name as name", True)
    elif '转岗' in question_lower or '转到' in question_lower or '转换' in question_lower:
        return (f"MATCH (j:Job {{name: '{job_name}'}})-[:TRANSFERS_TO]->(target) RETURN target.name as name", True)
    elif '相关' in question_lower or '相似' in question_lower:
        return (f"MATCH (j:Job {{name: '{job_name}'}})-[:RELATED_TO]->(target) RETURN target.name as name", True)
    else:
        # 默认查询晋升路径
        return (f"MATCH (j:Job {{name: '{job_name}'}})-[:PROMOTES_TO*1..5]->(target) RETURN DISTINCT target.name as name", True)


async def ask_it_career_question(question: str) -> str:
    """IT 职业发展问答主函数 - 支持知识图谱查询和普通对话"""
    if not driver:
        return "❌ Neo4j 未连接，请检查数据库配置。"
    
    question = question.strip()
    if not question:
        return "请输入您的问题，例如：'前端开发能晋升到哪些岗位？'"
    
    # 判断是否为知识图谱相关问题
    job_titles = ['前端开发', '后端开发', 'Java', 'Python', '软件测试', 
                  '数据分析师', 'C/C++', '产品经理', 'UI设计', '运维工程师',
                  '开发', '测试', '工程师', '架构师', '经理', '总监']
    career_keywords = ['晋升', '升到', '发展', '转岗', '转到', '转换', '相关', '相似',
                       '职业', '岗位', '路径', '方向', '前景', '规划']
    
    has_job_title = any(title in question for title in job_titles)
    has_career_keyword = any(keyword in question for keyword in career_keywords)
    
    # 如果有API密钥且不是知识图谱问题，使用大模型进行普通对话
    if DASHSCOPE_API_KEY and not (has_job_title and has_career_keyword):
        # 使用大模型进行普通对话
        chat_messages = [
            {"role": "system", "content": """你是一个专业的IT职业发展顾问。你的主要职责是：
1. 帮助用户进行职业规划和发展建议
2. 解答关于IT行业的问题
3. 提供面试、简历、技能提升等方面的建议
4. 当用户询问岗位晋升、转岗、相关岗位时，引导他们使用知识图谱功能

请用中文友好、专业地回答用户的问题。回答要简洁明了，不要过长。"""},
            {"role": "user", "content": question}
        ]
        
        response = await call_dashscope_api(chat_messages)
        
        # 如果API调用失败，返回错误信息
        if response.startswith("错误：") or response.startswith("调用 AI 服务失败"):
            # 如果是知识图谱相关问题，尝试查询
            if has_job_title and has_career_keyword:
                return await query_knowledge_graph(question)
            return f"抱歉，AI服务暂时不可用。{response}"
        
        return response
    
    # 如果是知识图谱相关问题，查询知识图谱
    if has_job_title and has_career_keyword:
        return await query_knowledge_graph(question)
    
    # 没有API密钥且不是知识图谱问题
    if not DASHSCOPE_API_KEY:
        return "抱歉，我目前只能回答关于IT职业发展的问题（如岗位晋升、转岗方向等）。请问我关于职业发展的问题，例如：'前端开发能晋升到哪些岗位？'"
    
    return await query_knowledge_graph(question)


async def query_knowledge_graph(question: str) -> str:
    """查询知识图谱"""
    try:
        schema = get_schema()
        
        # Step 1: 生成 Cypher 查询
        cypher_query = ""
        has_job_name = False
        
        if DASHSCOPE_API_KEY:
            # 使用 AI 生成 Cypher
            cypher_messages = [
                {"role": "system", "content": f"""你是一个 Neo4j 图数据库专家，专门处理 IT 职业发展知识图谱。
图谱 Schema：
{schema}

请严格遵守：
- 当用户询问某岗位的晋升路径、能升到哪些职位、全部列出来等，必须使用可变长度路径 `[:PROMOTES_TO*1..5]` 查询所有后代岗位。
- 当用户询问某岗位的换岗方向、可以转到哪些岗位等，使用 `[:TRANSFERS_TO]` 关系查询。
- 当用户询问某岗位的相关岗位、相似岗位等，使用 `[:RELATED_TO]` 关系查询。
- 只返回纯 Cypher 语句，不要任何额外文字、解释或代码块标记。
- 岗位名称必须与图谱中完全一致。"""},
                {"role": "user", "content": f"问题: {question}"}
            ]
            
            cypher_query = await call_dashscope_api(cypher_messages)
            
            # 检查 AI 调用是否失败
            if cypher_query.startswith("错误：") or cypher_query.startswith("调用 AI 服务失败"):
                print(f"AI 生成失败，使用备用方案: {cypher_query}")
                cypher_query, has_job_name = generate_cypher_from_question(question)
            else:
                # 清理 markdown
                cypher_query = cypher_query.strip()
                if cypher_query.startswith("```"):
                    lines = cypher_query.split('\n')
                    cypher_query = '\n'.join(lines[1:-1]).strip()
                
                # 验证是否为有效 Cypher
                if not is_valid_cypher(cypher_query):
                    print(f"生成的查询无效，使用备用方案: {cypher_query}")
                    cypher_query, has_job_name = generate_cypher_from_question(question)
                else:
                    has_job_name = True
        else:
            # 没有 API 密钥，使用备用方案
            print("未配置 API 密钥，使用备用方案")
            cypher_query, has_job_name = generate_cypher_from_question(question)
        
        # 如果没有找到岗位名称，返回提示
        if not has_job_name or not cypher_query:
            return "抱歉，我没有在知识图谱中找到相关岗位信息。\n\n你可以问我：\n• 某岗位的晋升路径（如：前端开发能晋升到哪些岗位？）\n• 转岗方向（如：Java可以转岗到哪些方向？）\n• 相关岗位（如：软件测试有哪些相关岗位？）"
        
        print(f"🔍 生成的 Cypher:\n{cypher_query}\n")
        
        # Step 2: 执行查询
        result = execute_cypher(cypher_query)
        
        if not result:
            return "未找到相关信息。请检查岗位名称是否正确，或尝试其他问题。"
        
        # Step 3: 格式化结果
        context = str(result)
        print(f"📊 查询结果: {context}\n")
        
        # 直接根据结果生成回答（不依赖 AI）
        job_names = []
        for item in result:
            # 尝试所有可能的字段名
            if 'name' in item:
                job_names.append(item['name'])
            elif 'target.name' in item:
                job_names.append(item['target.name'])
            elif 't.name' in item:
                job_names.append(item['t.name'])
            elif 'p.name' in item:
                job_names.append(item['p.name'])
            elif 'j.name' in item:
                job_names.append(item['j.name'])
            elif 'related.name' in item:
                job_names.append(item['related.name'])
            else:
                # 如果没有匹配的字段名，取第一个值
                if item:
                    job_names.append(str(list(item.values())[0]))
        
        if job_names:
            if '晋升' in question.lower() or '升到' in question.lower():
                return f"根据知识图谱，该岗位可以晋升到以下职位：\n\n" + "\n".join([f"• {name}" for name in job_names])
            elif '转岗' in question.lower() or '转到' in question.lower():
                return f"根据知识图谱，该岗位可以转岗到以下方向：\n\n" + "\n".join([f"• {name}" for name in job_names])
            else:
                return f"查询结果：\n\n" + "\n".join([f"• {name}" for name in job_names])
        else:
            return "查询成功，但未找到相关岗位信息。"
        
    except Exception as e:
        return f"❌ 执行出错: {repr(e)}"


@router.post("/send-message")
async def send_message(
        user_id: Optional[str] = Query(None, description="用户唯一标识"),
        message: Optional[str] = Query(None, description="用户发送的消息内容"),
        request_body: Optional[Dict[str, Any]] = Body(None),
        db: Session = Depends(get_db)
):
    """发送消息（同时支持Query参数和Body参数）"""
    if request_body:
        user_id = request_body.get("user_id", user_id or f"user_{datetime.now().timestamp()}")
        message = request_body.get("message", message or "")
    else:
        user_id = user_id or f"user_{datetime.now().timestamp()}"
        message = message or ""
    
    clean_message = message.strip()
    if not clean_message:
        raise HTTPException(status_code=400, detail="消息内容不能为空")
    
    ai_response = await ask_it_career_question(clean_message)

    with chat_history_lock:
        if user_id not in chat_histories:
            chat_histories[user_id] = []
        chat_histories[user_id].extend([
            {"role": "user", "content": clean_message, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")},
            {"role": "assistant", "content": ai_response, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        ])

    return {
        "user_id": user_id,
        "message": clean_message,
        "response": ai_response,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.post("/connect")
def connect_agent(db: Session = Depends(get_db)):
    """连接智能体"""
    return {
        "message": "IT职业顾问已就绪" if driver else "Neo4j 未连接",
        "neo4j_connected": driver is not None,
        "ai_available": bool(DASHSCOPE_API_KEY),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.post("/disconnect")
def disconnect_agent(db: Session = Depends(get_db)):
    """断开智能体"""
    global driver
    with chat_history_lock:
        chat_histories.clear()
    if driver:
        driver.close()
        driver = None
    return {"message": "智能体断开连接成功", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}


@router.get("/chat-history/{user_id}", response_model=ChatHistory)
def get_chat_history(user_id: str, db: Session = Depends(get_db)):
    """获取对话历史"""
    with chat_history_lock:
        user_history = chat_histories.get(user_id, [])
    return {"messages": user_history}


@router.post("/clear-history/{user_id}")
def clear_chat_history(user_id: str, db: Session = Depends(get_db)):
    """清空对话历史"""
    with chat_history_lock:
        if user_id in chat_histories:
            chat_histories[user_id] = []
        else:
            raise HTTPException(status_code=404, detail=f"用户 [{user_id}] 不存在或无对话历史")
    return {
        "message": f"用户 [{user_id}] 的对话历史已清空",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.get("/status", response_model=AgentStatus)
def get_agent_status(db: Session = Depends(get_db)):
    """获取智能体状态"""
    with chat_history_lock:
        online_user_count = len(chat_histories)
        total_msg_count = sum(len(msgs) for msgs in chat_histories.values())
    return {
        "status": "online",
        "version": "2.0",
        "uptime": "24h",
        "online_user_count": online_user_count,
        "total_message_count": total_msg_count,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.post("/configure")
def configure_agent(
        config: Dict[str, Any] = Body(..., description="智能体配置参数"),
        db: Session = Depends(get_db)
):
    """配置智能体"""
    global NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, DASHSCOPE_API_KEY
    
    if not isinstance(config, dict) or not config:
        raise HTTPException(status_code=400, detail="配置参数必须为非空字典")
    
    if "neo4j_uri" in config:
        NEO4J_URI = config["neo4j_uri"]
    if "neo4j_username" in config:
        NEO4J_USERNAME = config["neo4j_username"]
    if "neo4j_password" in config:
        NEO4J_PASSWORD = config["neo4j_password"]
    if "dashscope_api_key" in config:
        DASHSCOPE_API_KEY = config["dashscope_api_key"]
    
    # 重新初始化
    init_neo4j()
    
    safe_config = {k: v for k, v in config.items() if k not in ["neo4j_password", "dashscope_api_key"]}
    return {
        "message": "智能体配置成功",
        "config": safe_config,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.post("/recommendations", response_model=AgentRecommendation)
async def get_agent_recommendations(
        context: Optional[Dict[str, Any]] = Body(None, description="推荐上下文（技能/学历/经验）"),
        db: Session = Depends(get_db)
):
    """获取职业推荐"""
    context_clean = context or {}
    if not isinstance(context_clean, dict):
        raise HTTPException(status_code=400, detail="上下文必须为字典类型")
    
    context_str = "\n".join([f"{k}: {v}" for k, v in context_clean.items()]) or "无用户上下文"
    prompt = f"""请基于以下用户上下文提供精准的 IT 职业推荐：
用户上下文：
{context_str}

请推荐适合的职业方向，并说明推荐理由。"""

    ai_response = await ask_it_career_question(prompt)
    
    return {
        "recommendations": [
            {"type": "job", "id": 1, "title": "软件工程师", "score": 0.90},
            {"type": "course", "id": 1, "title": "Python 高级编程", "score": 0.80},
            {"type": "job", "id": 2, "title": "数据分析师", "score": 0.85}
        ],
        "context_used": context_clean,
        "raw_response": ai_response,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
