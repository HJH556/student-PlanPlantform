# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.job import Job
from schemas.user import UserCreate, UserResponse, UserUpdate
from schemas.job import JobCreate, JobResponse, JobUpdate
from schemas.page import PageCreate, PageResponse, PageUpdate
from crud.user import get_user_by_id, create_user, update_user
from crud.page import get_page_by_id, get_pages, create_page, update_page, delete_page
from routers.auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)

# 管理员权限验证
def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足，需要管理员权限")
    return current_user

# 公开的页面状态接口（无需管理员权限）
@router.get("/pages/status", response_model=list[PageResponse])
def get_page_status(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pages = get_pages(db, skip=skip, limit=limit)
    return pages

# 用户管理
@router.get("/users", response_model=list[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@router.post("/users", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    # 检查邮箱是否已存在
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="邮箱已存在")
    # 创建用户
    new_user = create_user(db, user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_admin(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    # 检查用户是否存在
    existing_user = get_user_by_id(db, user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查用户名是否已存在（如果要修改用户名）
    if user_update.username and user_update.username != existing_user.username:
        existing_username = db.query(User).filter(User.username == user_update.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否已存在（如果要修改邮箱）
    if user_update.email and user_update.email != existing_user.email:
        existing_email = db.query(User).filter(User.email == user_update.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="邮箱已存在")
    
    updated_user = update_user(db, user_id, user_update)
    return updated_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 删除用户相关的应用程序记录
    from models.application import Application
    from models.favorite import Favorite
    from models.student_profile import StudentProfile
    
    # 删除应用程序记录
    applications = db.query(Application).filter(Application.user_id == user_id).all()
    for app in applications:
        db.delete(app)
    
    # 删除收藏记录
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    for fav in favorites:
        db.delete(fav)
    
    # 删除学生画像记录
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if student_profile:
        db.delete(student_profile)
    
    # 删除用户
    db.delete(user)
    db.commit()
    return {"message": "用户删除成功"}

# 岗位管理
@router.get("/jobs", response_model=list[JobResponse])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    return job

@router.post("/jobs", response_model=JobResponse)
def create_new_job(job: JobCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    new_job = Job(
        title=job.title,
        company=job.company,
        salary=job.salary,
        location=job.location,
        description=job.description,
        requirements=job.requirements,
        industry=job.industry,
        experience=job.experience,
        education=job.education,
        type=job.type,
        tags=job.tags
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_job_admin(job_id: int, job_update: JobUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    update_data = job_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="岗位不存在")
    db.delete(job)
    db.commit()
    return {"message": "岗位删除成功"}

# 页面管理
@router.get("/pages", response_model=list[PageResponse])
def get_pages_admin(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    pages = get_pages(db, skip=skip, limit=limit)
    return pages

@router.get("/pages/{page_id}", response_model=PageResponse)
def get_page(page_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    page = get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="页面不存在")
    return page

@router.post("/pages", response_model=PageResponse)
def create_new_page(page: PageCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    new_page = create_page(db, page)
    return new_page

@router.put("/pages/{page_id}", response_model=PageResponse)
def update_page_admin(page_id: int, page_update: PageUpdate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    updated_page = update_page(db, page_id, page_update)
    if not updated_page:
        raise HTTPException(status_code=404, detail="页面不存在")
    return updated_page

@router.delete("/pages/{page_id}")
def delete_page_admin(page_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    deleted_page = delete_page(db, page_id)
    if not deleted_page:
        raise HTTPException(status_code=404, detail="页面不存在")
    return {"message": "页面删除成功"}
