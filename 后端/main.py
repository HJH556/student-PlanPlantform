from fastapi import FastAPI,Request
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from models import User, StudentProfile, Job, Application, Favorite
from routers import auth, student_profiles, student, job, career, agent, langchain_agent, interview
from routers.admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="职业规划智能体 API",
    version="1.0",
    description="基于AI的大学生职业规划平台，提供用户认证、学生档案管理、岗位搜索、职业规划、智能问答等功能。",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

os.makedirs("uploads/resumes", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Captcha-Id"],
)
app.include_router(auth)
app.include_router(student_profiles)
app.include_router(student)
app.include_router(job)
app.include_router(career)
app.include_router(agent)
app.include_router(langchain_agent.router)
app.include_router(interview.router)
app.include_router(admin_router)


@app.get("/")
@app.post("/")
def root():
    return {"message": "app 运行成功"}

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
