from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(String, unique=True, index=True, nullable=False) # e.g. "01", "CARD-101"
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    author_name = Column(String, default="Admin")
    publish_date = Column(String, nullable=False)
    read_time = Column(String, nullable=False)
    category_tag = Column(String, nullable=False)
    
    card_image = Column(String, nullable=False)
    detail_image = Column(String, nullable=True)
    short_description = Column(Text, nullable=False)
    content_paragraphs = Column(JSON, default=[])
    tags = Column(JSON, default=[])
    
    meta_title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String, nullable=True)
    canonical_url = Column(String, nullable=True)

    # Jab blog delete hoga, to uske saare comments auto delete honge
    comments = relationship("BlogComment", back_populates="blog", cascade="all, delete-orphan")


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("blog_comments.id", ondelete="CASCADE"), nullable=True)
    
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    blog = relationship("Blog", back_populates="comments")
    
    # single_parent=True add kiya hai taake SQLAdmin error na de
    replies = relationship(
        "BlogComment", 
        backref="parent", 
        remote_side=[id], 
        cascade="all, delete-orphan",
        single_parent=True
    )