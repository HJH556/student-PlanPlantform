# app/routers/job.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.job import Job
from models.favorite import Favorite
from models.application import Application
from models.user import User
from schemas.job import JobResponse, JobListResponse, JobProfile, JobGraph
from typing import List, Optional
from routers.auth import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"],
)

@router.get("/", response_model=List[JobResponse])
def get_job_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    keyword: Optional[str] = None,
    industry: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取岗位列表"""
    query = db.query(Job)
    
    if keyword:
        query = query.filter(Job.title.contains(keyword))
    if industry:
        query = query.filter(Job.industry == industry)
    if location:
        query = query.filter(Job.location == location)
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@router.get("/search", response_model=List[JobResponse])
def search_jobs(
    keyword: str = Query(..., description="搜索关键词"),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """搜索岗位（仅搜索岗位名称）"""
    jobs = db.query(Job).filter(
        Job.title.contains(keyword)
    ).offset(skip).limit(limit).all()
    return jobs

@router.get("/favorites", response_model=List[JobResponse])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户收藏列表"""
    # 获取用户收藏的岗位
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    job_ids = [fav.job_id for fav in favorites]
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
    
    return jobs

@router.get("/applications")
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户申请列表"""
    # 获取用户的申请记录
    applications = db.query(Application).filter(Application.user_id == current_user.id).all()
    
    # 构建响应
    result = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            result.append({
                "id": app.id,
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company,
                "salary": job.salary,
                "location": job.location,
                "status": app.status,
                "applied_at": app.applied_at
            })
    
    return result

@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(job_id: int, db: Session = Depends(get_db)):
    """获取岗位详情"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    return job

@router.get("/{job_id}/profile", response_model=JobProfile)
def get_job_profile(job_id: int, db: Session = Depends(get_db)):
    """获取岗位画像"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    # 这里应该实现岗位画像的生成逻辑
    # 为了演示，我们返回一个模拟的岗位画像
    return {
        "job_id": job.id,
        "title": job.title,
        "company": job.company,
        "industry": job.industry,
        "location": job.location,
        "salary": job.salary,
        "experience": job.experience,
        "education": job.education,
        "skills": ["Python", "Java", "SQL", "Communication"],
        "responsibilities": job.description.split('\n')[:5],
        "requirements": job.requirements.split('\n')[:5],
        "career_path": ["初级工程师", "中级工程师", "高级工程师", "技术总监"]
    }

@router.get("/{job_id}/graph", response_model=JobGraph)
def get_job_graph(job_id: int, db: Session = Depends(get_db)):
    """获取岗位关联图谱"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    # 这里应该实现岗位关联图谱的生成逻辑
    # 为了演示，我们返回一个模拟的关联图谱
    return {
        "job_id": job.id,
        "title": job.title,
        "related_jobs": [
            {"id": 1, "title": "软件工程师", "similarity": 0.9},
            {"id": 2, "title": "数据分析师", "similarity": 0.7},
            {"id": 3, "title": "产品经理", "similarity": 0.5}
        ],
        "related_skills": [
            {"name": "Python", "importance": 0.9},
            {"name": "SQL", "importance": 0.8},
            {"name": "Java", "importance": 0.7},
            {"name": "Communication", "importance": 0.6}
        ]
    }

@router.post("/{job_id}/favorite")
def add_favorite(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """添加收藏"""
    # 检查岗位是否存在
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    # 检查是否已经收藏
    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.job_id == job_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="已经收藏过该岗位")
    
    # 添加收藏
    favorite = Favorite(
        user_id=current_user.id,
        job_id=job_id
    )
    db.add(favorite)
    db.commit()
    
    return {"message": "收藏成功"}

@router.delete("/{job_id}/favorite")
def remove_favorite(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消收藏"""
    # 检查岗位是否存在
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    # 检查是否已经收藏
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.job_id == job_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=400, detail="未收藏该岗位")
    
    # 取消收藏
    db.delete(favorite)
    db.commit()
    
    return {"message": "取消收藏成功"}

@router.post("/{job_id}/apply")
def apply_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """申请岗位"""
    # 检查岗位是否存在
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    
    # 检查是否已经申请过
    existing_application = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == job_id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="已经申请过该岗位")
    
    # 添加申请
    application = Application(
        user_id=current_user.id,
        job_id=job_id,
        status="pending"
    )
    db.add(application)
    db.commit()
    
    return {"message": "申请成功"}

@router.delete("/applications/{application_id}")
def cancel_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消申请"""
    # 检查申请记录是否存在
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="申请记录不存在")
    
    # 取消申请
    db.delete(application)
    db.commit()
    
    return {"message": "取消申请成功"}
