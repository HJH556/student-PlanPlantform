# app/crud/student_profile.py
from sqlalchemy.orm import Session
from models.student_profile import StudentProfile
from schemas.student_profile import StudentProfileCreate, StudentProfileUpdate

def create_student_profile(db: Session, profile: StudentProfileCreate, user_id: int):
    db_profile = StudentProfile(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_student_profile(db: Session, student_id: int):
    return db.query(StudentProfile).filter(StudentProfile.id == student_id).first()

def get_all_students(db: Session):
    return db.query(StudentProfile).all()

def update_student_profile(db: Session, student_id: int, profile_update: StudentProfileUpdate):
    db_profile = get_student_profile(db, student_id)
    if not db_profile:
        return None
    
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile