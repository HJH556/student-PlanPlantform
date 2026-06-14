# 初始化管理员账户
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models.user import User
from crud.user import get_password_hash, get_user_by_username

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建管理员账户
def create_admin():
    db = next(get_db())
    try:
        # 检查管理员账户是否已存在
        admin = get_user_by_username(db, username="admin")
        if not admin:
            # 创建管理员账户
            admin_user = User(
                username="admin",
                email="admin@example.com",
                name="管理员",
                gender="男",
                age=30,
                phone="13800138000",
                major="计算机科学与技术",
                grade="2020级",
                role="admin",
                avatar="",
                hashed_password=get_password_hash("123456")
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("管理员账户创建成功！")
            print(f"用户名: {admin_user.username}")
            print(f"密码: 123456")
        else:
            print("管理员账户已存在！")
    except Exception as e:
        print(f"创建管理员账户失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
