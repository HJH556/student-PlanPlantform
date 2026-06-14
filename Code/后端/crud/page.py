from sqlalchemy.orm import Session
from models.page import Page
from schemas.page import PageCreate, PageUpdate

def get_page_by_name(db: Session, name: str):
    return db.query(Page).filter(Page.name == name).first()

def get_page_by_id(db: Session, page_id: int):
    return db.query(Page).filter(Page.id == page_id).first()

def get_pages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Page).offset(skip).limit(limit).all()

def create_page(db: Session, page: PageCreate):
    db_page = Page(**page.model_dump())
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

def update_page(db: Session, page_id: int, page_update: PageUpdate):
    db_page = get_page_by_id(db, page_id)
    if not db_page:
        return None
    
    update_data = page_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_page, field, value)
    
    db.commit()
    db.refresh(db_page)
    return db_page

def delete_page(db: Session, page_id: int):
    db_page = get_page_by_id(db, page_id)
    if not db_page:
        return None
    
    db.delete(db_page)
    db.commit()
    return db_page
