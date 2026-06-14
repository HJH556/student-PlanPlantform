# app/schemas/job.py
from pydantic import BaseModel
from typing import List, Optional

class JobBase(BaseModel):
    title: str
    company: str
    salary: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    tags: Optional[str] = None
    industry: Optional[str] = None
    type: Optional[str] = None
    publish_date: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    
    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int

class JobProfile(BaseModel):
    job_id: int
    title: str
    company: str
    industry: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    skills: List[str]
    responsibilities: List[str]
    requirements: List[str]
    career_path: List[str]

class RelatedJob(BaseModel):
    id: int
    title: str
    similarity: float

class RelatedSkill(BaseModel):
    name: str
    importance: float

class JobGraph(BaseModel):
    job_id: int
    title: str
    related_jobs: List[RelatedJob]
    related_skills: List[RelatedSkill]

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    tags: Optional[str] = None
    industry: Optional[str] = None
    type: Optional[str] = None
    publish_date: Optional[str] = None
