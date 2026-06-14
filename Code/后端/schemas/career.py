# app/schemas/career.py
from pydantic import BaseModel
from typing import List, Optional

class MatchResult(BaseModel):
    job_id: int
    match_score: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class CareerStep(BaseModel):
    role: str
    duration: str
    skills: List[str]

class CareerPath(BaseModel):
    job_id: int
    current_role: str
    path: List[CareerStep]

class Task(BaseModel):
    id: int
    title: str
    description: str
    deadline: str
    status: str

class ActionPlan(BaseModel):
    id: int
    title: str
    tasks: List[Task]

class ReportSection(BaseModel):
    title: str
    content: str

class CareerReport(BaseModel):
    id: int
    title: str
    summary: str
    sections: List[ReportSection]

class ExportReport(BaseModel):
    message: str
