import sqlite3
import os

db_path = "career_planner.db"

def add_profile_step_column():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'profile_step' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_step INTEGER DEFAULT 1")
            print("✅ 已添加 users.profile_step 列")
        else:
            print("ℹ️ users.profile_step 列已存在")
        
        cursor.execute("PRAGMA table_info(student_profiles)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'current_step' not in columns:
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN current_step INTEGER DEFAULT 1")
            print("✅ 已添加 student_profiles.current_step 列")
        else:
            print("ℹ️ student_profiles.current_step 列已存在")
        
        conn.commit()
        print("\n✅ 数据库迁移完成！")
        
    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    if os.path.exists(db_path):
        add_profile_step_column()
    else:
        print(f"❌ 数据库文件 {db_path} 不存在")
