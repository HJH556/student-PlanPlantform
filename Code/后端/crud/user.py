# app/crud/user.py
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserUpdate
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 截断密码长度，bcrypt最多支持72字节
    plain_password = plain_password[:72]
    # 检查hashed_password是否为空
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    # 截断密码长度，bcrypt最多支持72字节
    password = password[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def get_user_by_username(db: Session, username: str) -> User:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        email=user.email,
        name=user.name,
        gender=user.gender,
        age=user.age,
        phone=user.phone,
        major=user.major,
        grade=user.grade,
        role=user.role,
        avatar=user.avatar,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "password" and value:
            # 对密码进行哈希处理
            setattr(db_user, "hashed_password", get_password_hash(value))
        else:
            setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> bool:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    if not verify_password(old_password, db_user.hashed_password):
        return False
    
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return True