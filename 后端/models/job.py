# app/models/job.py
from sqlalchemy import Column, Integer, String, Text, Float
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    salary = Column(String(100))
    location = Column(String(200))
    experience = Column(String(100))
    education = Column(String(100))
    description = Column(Text)
    requirements = Column(Text)
    tags = Column(String(500))
    industry = Column(String(200))
    type = Column(String(100))
    publish_date = Column(String(100))