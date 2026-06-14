# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    role: Optional[str] = "user"
    avatar: Optional[str] = None
    profile_step: Optional[int] = 1

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None
    profile_step: Optional[int] = None

class PasswordChange(BaseModel):
    oldPassword: str
    newPassword: str
    confirmPassword: str

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    username: str
    password: str
    captcha: str
    captchaId: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse