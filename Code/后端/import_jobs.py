import os
import xlrd
from sqlalchemy.orm import sessionmaker
from database import engine, Base
from models.job import Job

# 创建会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def parse_salary(salary_str):
    """解析薪资字符串"""
    if not salary_str:
        return "面议"
    # 处理各种薪资格式
    salary_str = salary_str.strip()
    return salary_str

def clean_data(row):
    """清洗数据"""
    return {
        "title": row.get("岗位名称", "").strip() if row.get("岗位名称") else "",
        "company": row.get("公司名称", "").strip() if row.get("公司名称") else "",
        "salary": parse_salary(row.get("薪资范围")),
        "location": row.get("地址", "").strip() if row.get("地址") else "",
        "experience": row.get("工作经验", "不限").strip() if row.get("工作经验") else "不限",
        "education": row.get("学历要求", "不限").strip() if row.get("学历要求") else "不限",
        "description": row.get("岗位详情", "").strip() if row.get("岗位详情") else "",
        "requirements": row.get("岗位详情", "").strip() if row.get("岗位详情") else "",
        "tags": "",
        "industry": row.get("所属行业", "其他").strip() if row.get("所属行业") else "其他",
        "type": "",
        "publish_date": row.get("更新日期", "").strip() if row.get("更新日期") else ""
    }

def import_jobs_from_excel(excel_path):
    """从Excel导入岗位数据"""
    # 确保表结构存在
    Base.metadata.create_all(bind=engine)
    
    # 打开Excel文件
    try:
        workbook = xlrd.open_workbook(excel_path)
        sheet = workbook.sheet_by_index(0)
    except Exception as e:
        print(f"打开Excel文件失败: {e}")
        return
    
    # 获取列名
    headers = [sheet.cell_value(0, col).strip() for col in range(sheet.ncols)]
    
    # 数据行
    rows = []
    for row_idx in range(1, sheet.nrows):
        row_data = {}
        for col_idx, header in enumerate(headers):
            cell_value = sheet.cell_value(row_idx, col_idx)
            # 处理不同类型的单元格值
            if isinstance(cell_value, float):
                # 尝试转换为整数
                if cell_value.is_integer():
                    cell_value = int(cell_value)
                cell_value = str(cell_value)
            row_data[header] = cell_value
        rows.append(row_data)
    
    # 清洗数据并导入数据库
    db = SessionLocal()
    try:
        # 先清空现有数据
        db.query(Job).delete()
        db.commit()
        
        # 导入新数据
        for i, row in enumerate(rows):
            cleaned_data = clean_data(row)
            # 跳过空岗位名称
            if not cleaned_data["title"]:
                continue
            
            job = Job(**cleaned_data)
            db.add(job)
            
            # 每100条提交一次
            if (i + 1) % 100 == 0:
                db.commit()
        
        # 最后提交剩余数据
        db.commit()
        print(f"成功导入 {len(rows)} 条岗位数据")
    except Exception as e:
        print(f"导入数据失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Excel 文件路径
    excel_path = "../shuju/a13基于AI的大学生职业规划智能体-JD采样数据.xls"
    print(f"开始从 {excel_path} 导入岗位数据...")
    import_jobs_from_excel(excel_path)
    print("导入完成！")
