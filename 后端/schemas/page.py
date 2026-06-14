from pydantic import BaseModel
from typing import Optional

class PageBase(BaseModel):
    name: str
    title: str
    description: Optional[str] = None
    is_enabled: bool = True
    route: str

class PageCreate(PageBase):
    pass

class PageUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    route: Optional[str] = None

class PageResponse(PageBase):
    id: int
    
    class Config:
        from_attributes = True
