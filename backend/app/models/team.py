from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    image = Column(String, nullable=True)
    
    # Social links store honge structure: {"linkedin": "#", "facebook": "#", "x": "#", "email": "mailto:..."}
    socials = Column(JSON, default={})