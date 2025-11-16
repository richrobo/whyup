from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PostBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    is_published: bool = False

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    is_published: Optional[bool] = None

class PostInDB(PostBase):
    id: int
    author_id: int
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Post(PostInDB):
    author: Optional[dict] = None

class PostWithAuthor(Post):
    author: dict
