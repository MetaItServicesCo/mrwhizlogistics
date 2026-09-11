from typing import Optional, Dict
from pydantic import BaseModel, EmailStr

class SocialLinks(BaseModel):
    linkedin: Optional[str] = "#"
    facebook: Optional[str] = "#"
    x: Optional[str] = "#"
    email: Optional[str] = "mailto:info@company.com"

class TeamMemberResponse(BaseModel):
    id: int
    name: str
    role: str
    image: Optional[str]
    socials: Dict[str, str]

    class Config:
        from_attributes = True