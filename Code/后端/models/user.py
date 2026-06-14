# app/models/user.py
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100))
    gender = Column(String(10))
    age = Column(Integer)
    phone = Column(String(20))
    major = Column(String(100))
    grade = Column(String(20))
    role = Column(String(20), default="user")
    avatar = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    profile_step = Column(Integer, default=1)