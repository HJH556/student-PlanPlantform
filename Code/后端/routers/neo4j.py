from fastapi import APIRouter, HTTPException, Query
from neo4j import GraphDatabase
from typing import List, Dict, Any

router = APIRouter(prefix="/neo4j", tags=["neo4j"])

# Neo4j 连接配置
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "zyh2169931078"

class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    def close(self):
        self.driver.close()
    
    def query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

neo4j_conn = Neo4jConnection()

@router.get("/jobs", response_model=List[Dict[str, Any]])
def get_jobs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    获取所有岗位节点
    """
    query = """
    MATCH (j:Job)
    RETURN j.name as name, j.salary as salary, j.description as description
    SKIP $offset LIMIT $limit
    """
    try:
        result = neo4j_conn.query(query, {"offset": offset, "limit": limit})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/jobs/search", response_model=List[Dict[str, Any]])
def search_jobs(
    keyword: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100)
):
    """
    根据关键词搜索岗位
    """
    query = """
    MATCH (j:Job)
    WHERE j.name CONTAINS $keyword OR j.description CONTAINS $keyword
    RETURN j.name as name, j.salary as salary, j.description as description
    LIMIT $limit
    """
    try:
        result = neo4j_conn.query(query, {"keyword": keyword, "limit": limit})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/jobs/{job_name}/promotions", response_model=List[Dict[str, Any]])
def get_job_promotions(job_name: str):
    """
    获取岗位的晋升路径
    """
    query = """
    MATCH (j1:Job {name: $job_name})-[:PROMOTES_TO*]->(j2:Job)
    RETURN j2.name as name, j2.type as type
    """
    try:
        result = neo4j_conn.query(query, {"job_name": job_name})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/jobs/{job_name}/transfers", response_model=List[Dict[str, Any]])
def get_job_transfers(job_name: str):
    """
    获取岗位的换岗路径
    """
    query = """
    MATCH (j1:Job {name: $job_name})-[:TRANSFERS_TO]->(j2:Job)
    RETURN j2.name as name, j2.type as type
    """
    try:
        result = neo4j_conn.query(query, {"job_name": job_name})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/companies", response_model=List[Dict[str, Any]])
def get_companies(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    获取所有公司节点
    """
    query = """
    MATCH (c:Company)
    RETURN c.name as name, c.industry as industry, c.size as size, c.description as description
    SKIP $offset LIMIT $limit
    """
    try:
        result = neo4j_conn.query(query, {"offset": offset, "limit": limit})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/companies/{company_name}/jobs", response_model=List[Dict[str, Any]])
def get_company_jobs(company_name: str):
    """
    获取公司提供的岗位
    """
    query = """
    MATCH (c:Company {name: $company_name})-[:HAS_JOB]->(j:Job)
    RETURN j.name as name, j.salary as salary, j.description as description
    """
    try:
        result = neo4j_conn.query(query, {"company_name": company_name})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/locations", response_model=List[Dict[str, Any]])
def get_locations(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    获取所有地点节点
    """
    query = """
    MATCH (l:Location)
    RETURN l.name as name
    SKIP $offset LIMIT $limit
    """
    try:
        result = neo4j_conn.query(query, {"offset": offset, "limit": limit})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/locations/{location_name}/companies", response_model=List[Dict[str, Any]])
def get_location_companies(location_name: str):
    """
    获取地点的公司
    """
    query = """
    MATCH (c:Company)-[:LOCATED_IN]->(l:Location {name: $location_name})
    RETURN c.name as name, c.industry as industry, c.size as size
    """
    try:
        result = neo4j_conn.query(query, {"location_name": location_name})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")
