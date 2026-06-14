"""
岗位数据清洗脚本
从原始Excel重新导入，然后只保留与计算机相关的岗位数据
基于 0312-neo4j-2.py 的数据清洗逻辑调整
支持 Neo4j 知识图谱建库
"""
import sys
import os
import re
import pandas as pd
from neo4j import GraphDatabase

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from database import engine, Base
from models.job import Job

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

IT_KEYWORDS = ['前端', 'Java', '测试', '实施', 'C/C\+\+', '开发', '运维', '数据', '架构', '产品', '项目', '网络',
               '硬件', '技术支持']

# Neo4j 连接配置
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "zyh2169931078"


class ITKnowledgeGraph:
    """IT 岗位知识图谱类"""
    
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def clear_database(self):
        """清空数据库"""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            print("数据库已清空")

    def build_graph(self, df, vertical_paths=None, transfer_paths=None):
        """构建知识图谱"""
        with self.driver.session() as session:
            # 1. 导入招聘数据，生成公司、地址与岗位基础网络
            print(f"正在导入 {len(df)} 条真实的招聘数据，生成公司、地址与岗位基础网络...")
            for index, row in df.iterrows():
                if index % 100 == 0 and index > 0:
                    print(f"已处理 {index} 条数据...")
                session.execute_write(self._create_real_data_and_relations, row)

            # 2. 构建垂直岗位晋升图谱
            if vertical_paths:
                print("正在构建垂直岗位晋升路径...")
                for path in vertical_paths:
                    session.execute_write(self._create_vertical_path, path)

            # 3. 构建横向换岗血缘图谱
            if transfer_paths:
                print("正在构建横向换岗血缘路径...")
                for path in transfer_paths:
                    session.execute_write(self._create_transfer_path, path)

            print("知识图谱完整构建成功！请在 Neo4j Browser 中查看。")

    @staticmethod
    def _create_real_data_and_relations(tx, row):
        """创建真实数据和关系"""
        query = """
        // 1. 创建/合并 地址节点
        MERGE (loc:Location {name: $address})

        // 2. 创建/合并 公司节点
        MERGE (comp:Company {name: $company_name})
        ON CREATE SET comp.industry = $industry,
                      comp.size = $size,
                      comp.description = $comp_desc

        // 3. 创建/合并 岗位节点
        MERGE (j:Job {name: $job_name})
        ON CREATE SET j.salary = $salary, 
                      j.description = $job_desc, 
                      j.source = 'Excel_Real_Data',
                      j.type = 'Base'

        // 4. 建立实体间的基本关系：公司提供岗位，岗位属于某地区
        MERGE (comp)-[:HAS_JOB]->(j)
        MERGE (comp)-[:LOCATED_IN]->(loc)
        """

        # 处理空值和超长文本
        job_desc = str(row['岗位详情'])[:150].replace('\n', ' ').replace('<br>', ' ') + '...' if pd.notna(
            row['岗位详情']) else '暂无描述'
        comp_desc = str(row['公司详情'])[:150].replace('\n', ' ').replace('<br>', ' ') + '...' if pd.notna(
            row['公司详情']) else '暂无描述'
        company_name = str(row['公司名称']).strip()
        if pd.isna(row['公司名称']) or company_name == 'nan':
            company_name = '未知公司'

        tx.run(query,
               address=str(row['地址']).split('-')[0].strip() if pd.notna(row['地址']) else '未知地点',
               company_name=company_name,
               industry=str(row['所属行业']).strip() if pd.notna(row['所属行业']) else '未知行业',
               size=str(row['公司规模']).strip() if pd.notna(row['公司规模']) else '未知规模',
               comp_desc=comp_desc,
               job_name=str(row['岗位名称']).strip(),
               salary=str(row['薪资范围']).strip() if pd.notna(row['薪资范围']) else '面议',
               job_desc=job_desc)

    @staticmethod
    def _create_vertical_path(tx, path):
        """创建垂直晋升路径"""
        base_name = path['base']
        promotions = path['promotions']

        current_node = base_name
        for promo in promotions:
            query = """
            MATCH (j1:Job {name: $current})
            MERGE (j2:Job {name: $promo})
            ON CREATE SET j2.type = 'Promotion', j2.source = 'Supplemented'
            MERGE (j1)-[:PROMOTES_TO]->(j2)
            """
            tx.run(query, current=current_node, promo=promo)
            current_node = promo

    @staticmethod
    def _create_transfer_path(tx, path):
        """创建横向换岗路径"""
        source_name = path['source']
        transfers = path['targets']

        for transfer in transfers:
            query = """
            MATCH (j1:Job {name: $source})
            MERGE (j2:Job {name: $transfer})
            ON CREATE SET j2.type = 'Transfer', j2.source = 'Supplemented'
            MERGE (j1)-[:TRANSFERS_TO]->(j2)
            MERGE (j2)-[:TRANSFERS_TO]->(j1)
            """
            tx.run(query, source=source_name, transfer=transfer)


def parse_salary(salary_str):
    if not salary_str:
        return "面议"
    return salary_str.strip()


def split_description(text):
    if not text or not isinstance(text, str):
        return "", ""
    
    text = text.strip()
    
    patterns = [
        r'岗位职责[：:]\s*(.*?)(?=任职要求|任职资格|职位要求|$)',
        r'岗位要求[：:]\s*(.*?)(?=任职要求|任职资格|职位要求|$)',
    ]
    
    req_patterns = [
        r'任职要求[：:]\s*(.*)',
        r'任职资格[：:]\s*(.*)',
        r'职位要求[：:]\s*(.*)',
        r'岗位要求[：:]\s*(.*)',
    ]
    
    description = ""
    requirements = ""
    
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match and match.group(1).strip():
            description = match.group(1).strip()
            break
    
    for pattern in req_patterns:
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match and match.group(1).strip():
            requirements = match.group(1).strip()
            break
    
    if not description and not requirements:
        return text, ""
    
    return description, requirements


def clean_data(row):
    location = row.get("地址", "")
    if pd.notna(location) and location:
        location = str(location).split('-')[0].strip()
    else:
        location = "未知地点"
    
    job_detail = row.get("岗位详情", "").strip() if pd.notna(row.get("岗位详情")) else ""
    description, requirements = split_description(job_detail)
    
    title = row.get("岗位名称", "").strip() if pd.notna(row.get("岗位名称")) else ""
    
    tags = []
    if '前端' in title or '前端' in job_detail:
        tags.append('前端')
    if 'Java' in title or 'Java' in job_detail:
        tags.append('Java')
    if 'Python' in title or 'Python' in job_detail:
        tags.append('Python')
    if '测试' in title:
        tags.append('测试')
    if '运维' in title:
        tags.append('运维')
    if '产品' in title:
        tags.append('产品')
    if '算法' in title:
        tags.append('算法')
    if 'C++' in title or 'C/C++' in title:
        tags.append('C++')
    
    return {
        "title": title,
        "company": row.get("公司名称", "").strip() if pd.notna(row.get("公司名称")) else "",
        "salary": parse_salary(row.get("薪资范围")),
        "location": location,
        "experience": row.get("工作经验", "不限").strip() if pd.notna(row.get("工作经验")) else "不限",
        "education": row.get("学历要求", "不限").strip() if pd.notna(row.get("学历要求")) else "不限",
        "description": description,
        "requirements": requirements,
        "tags": ",".join(tags) if tags else "",
        "industry": row.get("所属行业", "其他").strip() if pd.notna(row.get("所属行业")) else "其他",
        "type": "",
        "publish_date": row.get("更新日期", "").strip() if pd.notna(row.get("更新日期")) else ""
    }


def is_computer_related(job_dict: dict) -> bool:
    title = (job_dict.get('title', '') or '')
    
    if not title:
        return False
    
    regex_pattern = '|'.join(IT_KEYWORDS)
    is_it_related = bool(re.search(regex_pattern, title, re.IGNORECASE))
    
    return is_it_related


def get_vertical_paths():
    """获取垂直晋升路径"""
    return [
        {"base": "前端开发", "promotions": ["高级前端开发", "前端架构师", "大前端技术总监"]},
        {"base": "Java", "promotions": ["高级Java开发", "系统架构师", "CTO"]},
        {"base": "C/C++", "promotions": ["高级C/C++工程师", "底层架构师", "技术总监"]},
        {"base": "软件测试", "promotions": ["测试工程师", "质量管理/测试", "测试总监"]},
        {"base": "硬件测试", "promotions": ["硬件测试主管", "硬件质量总监"]},
        {"base": "实施工程师", "promotions": ["高级实施工程师", "项目经理/主管", "大区交付总监"]},
        {"base": "技术支持工程师", "promotions": ["高级技术支持", "客户成功经理", "客户支持总监"]},
        {"base": "产品专员/助理", "promotions": ["产品经理", "高级产品经理", "产品总监"]},
        {"base": "项目专员/助理", "promotions": ["项目经理/主管", "PMO总监"]},
        {"base": "网络客服", "promotions": ["网络客服组长", "客服运营经理", "客户服务总监"]}
    ]


def get_transfer_paths():
    """获取横向换岗路径"""
    return [
        {"source": "前端开发", "targets": ["Java", "产品专员/助理", "UI/UX交互设计师"]},
        {"source": "Java", "targets": ["前端开发", "C/C++", "大数据开发工程师"]},
        {"source": "C/C++", "targets": ["Java", "嵌入式软件工程师", "底层驱动开发"]},
        {"source": "软件测试", "targets": ["实施工程师", "技术支持工程师", "自动化测试工程师"]},
        {"source": "实施工程师", "targets": ["项目专员/助理", "技术支持工程师", "售前咨询顾问"]},
        {"source": "技术支持工程师", "targets": ["实施工程师", "网络客服", "售前工程师"]},
        {"source": "项目专员/助理", "targets": ["产品专员/助理", "实施工程师", "销售运营"]},
        {"source": "产品专员/助理", "targets": ["项目专员/助理", "交互设计师", "数据分析师"]}
    ]


def import_and_clean():
    """导入并清洗数据，同时构建 Neo4j 知识图谱"""
    Base.metadata.create_all(bind=engine)
    
    excel_path = "../shuju/a13基于AI的大学生职业规划智能体-JD采样数据.xls"
    print(f"从 {excel_path} 导入数据...")
    
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"打开Excel文件失败: {e}")
        return
    
    print(f"原始数据: {len(df)} 条")
    
    regex_pattern = '|'.join(IT_KEYWORDS)
    it_df = df[df['岗位名称'].str.contains(regex_pattern, na=False, case=False)]
    print(f"筛选完成，共提取到 {len(it_df)} 条 IT 相关招聘记录数据。")
    
    # 1. 保存到 SQLite 数据库
    db = SessionLocal()
    try:
        db.query(Job).delete()
        db.commit()
        
        computer_count = 0
        skipped_count = 0
        
        for index, row in it_df.iterrows():
            if index % 100 == 0 and index > 0:
                print(f"已处理 {index} 条数据...")
            
            cleaned_data = clean_data(row)
            if not cleaned_data["title"]:
                skipped_count += 1
                continue
            
            job = Job(**cleaned_data)
            db.add(job)
            computer_count += 1
            
            if (index + 1) % 500 == 0:
                db.commit()
        
        db.commit()
        print(f"\nSQLite 数据库清洗完成!")
        print(f"  - 保留计算机相关岗位: {computer_count} 条")
        print(f"  - 跳过非计算机岗位: {skipped_count} 条")
        
        jobs = db.query(Job).limit(30).all()
        print("\n保留的岗位样例:")
        for job in jobs:
            print(f"  - {job.title} @ {job.company}")
        
    except Exception as e:
        print(f"SQLite 处理失败: {e}")
        db.rollback()
    finally:
        db.close()
    
    # 2. 构建 Neo4j 知识图谱
    print("\n" + "="*50)
    print("开始构建 Neo4j 知识图谱...")
    print("="*50)
    
    try:
        kg = ITKnowledgeGraph(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
        
        # 清空旧数据（可选，取消注释以启用）
        # kg.clear_database()
        
        # 构建图谱
        vertical_paths = get_vertical_paths()
        transfer_paths = get_transfer_paths()
        kg.build_graph(it_df, vertical_paths, transfer_paths)
        
        kg.close()
        print("\nNeo4j 知识图谱构建完成！")
        
    except Exception as e:
        print(f"Neo4j 知识图谱构建失败: {e}")
        print("请确保 Neo4j 数据库已启动并可访问")


if __name__ == "__main__":
    import_and_clean()
