from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class CommentCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    parent_id: Optional[int] = None  # Reply ki soorat mein parent comment ki ID

class CommentResponse(BaseModel):
    id: int
    blog_id: int
    parent_id: Optional[int]
    name: str
    message: str
    is_approved: bool = False
    created_at: datetime
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True

CommentResponse.model_rebuild()

class BlogResponse(BaseModel):
    id: int
    card_id: str
    title: str
    slug: str
    author_name: str
    publish_date: str
    read_time: str
    category_tag: str
    card_image: str
    detail_image: Optional[str]
    short_description: str
    content_paragraphs: List[str]
    content_html: Optional[str] = None
    tags: List[str]
    comments_count: int = 0
    comments: List[CommentResponse] = []
    
    meta_title: Optional[str]
    meta_description: Optional[str]
    meta_keywords: Optional[str]
    canonical_url: Optional[str]
    schema_markup: Optional[str] = None

    class Config:
        from_attributes = True