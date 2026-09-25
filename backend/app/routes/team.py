import os
import uuid
import json
import shutil
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_admin
from app.models.team import TeamMember
from app.schemas.team import TeamMemberResponse

router = APIRouter(prefix="/team", tags=["Team Members"])

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
        # Uploads were stored under their original filename, so a second
        # "truck.png" silently overwrote the first one and changed the image
        # on an unrelated record. Prefix a short random token to keep them
        # distinct while leaving the name readable.
        safe_name = os.path.basename(filename)
        stored_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"

        file_path = os.path.join(UPLOAD_DIR, stored_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{UPLOAD_DIR}/{stored_name}"
    except Exception:
        return None

def parse_socials(data: Optional[str]) -> dict:
    if not data or not isinstance(data, str) or not data.strip():
        return {}
    try:
        return json.loads(data)
    except Exception:
        return {}


# 1. READ ALL TEAM MEMBERS
@router.get("/", response_model=List[TeamMemberResponse])
def get_all_team_members(db: Session = Depends(get_db)):
    return db.query(TeamMember).order_by(TeamMember.id.desc()).all()


# 2. CREATE TEAM MEMBER
@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def create_team_member(
    name: str = Form(...),
    role: str = Form(...),
    socials: Optional[str] = Form('{"linkedin":"#","facebook":"#","x":"#","email":"mailto:info@company.com"}'),
    image_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db)
):
    image_path = save_uploaded_file(image_file)

    new_member = TeamMember(
        name=name,
        role=role,
        image=image_path,
        socials=parse_socials(socials)
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


# 3. UPDATE TEAM MEMBER BY ID
@router.put("/{member_id}", response_model=TeamMemberResponse, dependencies=[Depends(get_current_admin)])
async def update_team_member(
    member_id: int,
    name: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    socials: Optional[str] = Form(None),
    image_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    if name is not None: member.name = name
    if role is not None: member.role = role
    if socials is not None: member.socials = parse_socials(socials)

    new_image = save_uploaded_file(image_file)
    if new_image:
        member.image = new_image

    db.commit()
    db.refresh(member)
    return member


# 4. DELETE TEAM MEMBER BY ID
@router.delete("/{member_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(get_current_admin)])
def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    db.delete(member)
    db.commit()
    return {"message": f"Team member '{member.name}' deleted successfully."}