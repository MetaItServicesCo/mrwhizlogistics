import os
import json
import shutil
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.blog import Blog, BlogComment
from app.schemas.blog import BlogResponse, CommentCreate, CommentResponse

router = APIRouter(prefix="/blogs", tags=["Blog Services"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file: Union[UploadFile, str, None]) -> Optional[str]:
    if not file or isinstance(file, str):
        return None
    filename = getattr(file, "filename", None)
    if not filename or not isinstance(filename, str) or not filename.strip():
        return None
    try:
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size == 0:
            return None
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{UPLOAD_DIR}/{filename}"
    except Exception:
        return None

def parse_to_list(data: Optional[str]) -> list:
    if not data or not isinstance(data, str) or not data.strip():
        return []
    try:
        parsed = json.loads(data)
        return parsed if isinstance(parsed, list) else [str(parsed)]
    except Exception:
        return [item.strip() for item in data.split(",") if item.strip()]


# 1. READ ALL BLOGS (Grid / Card View)
@router.get("/", response_model=List[BlogResponse])
def get_all_blogs(db: Session = Depends(get_db)):
    blogs = db.query(Blog).order_by(Blog.id.desc()).all()
    for blog in blogs:
        blog.comments_count = db.query(BlogComment).filter(BlogComment.blog_id == blog.id).count()
        blog.comments = []
    return blogs


# 2. READ SINGLE BLOG BY CARD_ID OR SLUG (Sirf Is Specific Blog Ke Comments Mileinge)
@router.get("/{card_id_or_slug}", response_model=BlogResponse)
def get_blog(card_id_or_slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(
        (Blog.card_id == card_id_or_slug) | (Blog.slug == card_id_or_slug)
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    top_comments = db.query(BlogComment).options(
        joinedload(BlogComment.replies)
    ).filter(
        BlogComment.blog_id == blog.id, 
        BlogComment.parent_id == None
    ).order_by(BlogComment.id.desc()).all()
    
    blog.comments_count = db.query(BlogComment).filter(BlogComment.blog_id == blog.id).count()
    blog.comments = top_comments
    return blog


# 3. CREATE BLOG POST
@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(
    card_id: str = Form(...),
    title: str = Form(...),
    slug: str = Form(...),
    publish_date: str = Form(...),
    read_time: str = Form(...),
    category_tag: str = Form(...),
    short_description: str = Form(...),
    author_name: Optional[str] = Form("Admin"),
    content_paragraphs: Optional[str] = Form("[]"),
    tags: Optional[str] = Form("[]"),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    card_image_file: UploadFile = File(...),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db)
):
    if db.query(Blog).filter(Blog.card_id == card_id).first():
        raise HTTPException(status_code=400, detail="Card ID already exists.")
    if db.query(Blog).filter(Blog.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists.")

    card_image_path = save_uploaded_file(card_image_file)
    detail_image_path = save_uploaded_file(detail_image_file)

    new_blog = Blog(
        card_id=card_id,
        title=title,
        slug=slug,
        publish_date=publish_date,
        read_time=read_time,
        category_tag=category_tag,
        short_description=short_description,
        author_name=author_name,
        card_image=card_image_path,
        detail_image=detail_image_path,
        content_paragraphs=parse_to_list(content_paragraphs),
        tags=parse_to_list(tags),
        meta_title=meta_title,
        meta_description=meta_description,
        meta_keywords=meta_keywords,
        canonical_url=canonical_url
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog


# 4. UPDATE BLOG BY CARD_ID
@router.put("/{card_id}", response_model=BlogResponse)
async def update_blog_by_card_id(
    card_id: str,
    title: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    publish_date: Optional[str] = Form(None),
    read_time: Optional[str] = Form(None),
    category_tag: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    content_paragraphs: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),
    canonical_url: Optional[str] = Form(None),
    card_image_file: Union[UploadFile, str, None] = File(default=None),
    detail_image_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.card_id == card_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail=f"Blog with card_id '{card_id}' not found.")

    if title is not None: blog.title = title
    if slug is not None: blog.slug = slug
    if publish_date is not None: blog.publish_date = publish_date
    if read_time is not None: blog.read_time = read_time
    if category_tag is not None: blog.category_tag = category_tag
    if short_description is not None: blog.short_description = short_description
    if author_name is not None: blog.author_name = author_name
    if content_paragraphs is not None: blog.content_paragraphs = parse_to_list(content_paragraphs)
    if tags is not None: blog.tags = parse_to_list(tags)
    if meta_title is not None: blog.meta_title = meta_title
    if meta_description is not None: blog.meta_description = meta_description
    if meta_keywords is not None: blog.meta_keywords = meta_keywords
    if canonical_url is not None: blog.canonical_url = canonical_url

    new_card_image = save_uploaded_file(card_image_file)
    if new_card_image:
        blog.card_image = new_card_image

    new_detail_image = save_uploaded_file(detail_image_file)
    if new_detail_image:
        blog.detail_image = new_detail_image

    db.commit()
    db.refresh(blog)
    return blog


# 5. DELETE BLOG BY CARD_ID
@router.delete("/{card_id}", status_code=status.HTTP_200_OK)
def delete_blog_by_card_id(card_id: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.card_id == card_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail=f"Blog with card_id '{card_id}' not found.")
    
    db.delete(blog)
    db.commit()
    return {"message": f"Blog with card_id '{card_id}' and all associated comments deleted successfully."}


# 6. POST COMMENT BY CARD_ID
@router.post("/{card_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def post_blog_comment(card_id: str, payload: CommentCreate, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.card_id == card_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail=f"Blog with card_id '{card_id}' not found.")

    if payload.parent_id:
        parent_comment = db.query(BlogComment).filter(
            BlogComment.id == payload.parent_id, 
            BlogComment.blog_id == blog.id
        ).first()
        if not parent_comment:
            raise HTTPException(status_code=400, detail="Parent comment not found for this blog post")

    new_comment = BlogComment(
        blog_id=blog.id,
        parent_id=payload.parent_id,
        name=payload.name,
        email=payload.email,
        message=payload.message
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment