# app/models/student_profile.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)  # 关联 User
    name = Column(String(50), nullable=False)
    major = Column(String(100))
    grade = Column(String(20))
    career_goal = Column(Text)
    current_step = Column(Integer, default=1)