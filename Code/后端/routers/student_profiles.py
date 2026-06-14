# app/routers/student_profiles.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.student_profile import StudentProfileCreate, StudentProfileResponse
from crud.student_profile import create_student_profile, get_student_profile, get_all_students

router = APIRouter(
    prefix="/students",
    tags=["student_profiles"],
)

@router.get("/", response_model=list[StudentProfileResponse])
def get_all_students_endpoint(db: Session = Depends(get_db)):
    # 调用CRUD获取所有学生信息
    return get_all_students(db)

@router.get("/{student_id}", response_model=StudentProfileResponse)
def get_student_by_id_endpoint(student_id: int, db: Session = Depends(get_db)):
    # 调用CRUD获取单个学生信息
    db_student = get_student_profile(db, student_id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="学生信息不存在")
    return db_student

@router.post("/", response_model=StudentProfileResponse)
def create_student_profile_endpoint(profile: StudentProfileCreate, user_id: int, db: Session = Depends(get_db)):
    # 调用CRUD创建学生信息，需要关联一个user_id
    return create_student_profile(db=db, profile=profile, user_id=user_id)