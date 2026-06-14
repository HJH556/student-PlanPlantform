# app/models/application.py
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, approved, rejected
    applied_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", backref="applications")
    job = relationship("Job", backref="applications")
