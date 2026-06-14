# app/schemas/agent.py
from pydantic import BaseModel
from typing import List, Optional

class AgentStatus(BaseModel):
    status: str
    version: str
    uptime: str

class Message(BaseModel):
    role: str
    content: str
    timestamp: str

class ChatHistory(BaseModel):
    messages: List[Message]

class RecommendationItem(BaseModel):
    type: str
    id: int
    title: str
    score: float

class AgentRecommendation(BaseModel):
    recommendations: List[RecommendationItem]
