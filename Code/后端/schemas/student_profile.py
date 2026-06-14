# app/schemas/student_profile.py
from pydantic import BaseModel

class StudentProfileCreate(BaseModel):
    name: str
    major: str | None = None
    grade: str | None = None
    career_goal: str | None = None
    current_step: int | None = 1

class StudentProfileResponse(StudentProfileCreate):
    id: int
    user_id: int
    current_step: int = 1

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    name: str | None = None
    major: str | None = None
    grade: str | None = None
    career_goal: str | None = None
    current_step: int | None = None