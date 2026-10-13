import os
import re
import secrets
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import JSON, String, Text, cast, or_, select
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.database import Base, get_db

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads"
URL_PREFIX = "/uploads"  # where main.py serves UPLOAD_DIR
MAX_BYTES = 10 * 1024 * 1024  # 10 MB

# SVG is deliberately excluded: it can carry <script>, and these files are
# served from the site's own origin.
ALLOWED_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
# Stored names: lowercase letters, digits, dots, dashes, underscores only.
SAFE_NAME = re.compile(r"^[a-z0-9][a-z0-9._-]{0,200}$")


def seo_slug(text: str, limit: int = 60) -> str:
    """'Box Truck – Dallas!.webp' -> 'box-truck-dallas' (URL- and SEO-friendly)."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"\.[a-z0-9]{2,5}$", "", text.strip().lower())
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:limit].rstrip("-")


@router.post("/image", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...), name: Optional[str] = Form(None)):
    """
    Store an image (rich-text editor, Media Library) and return its URL.

    With a name (or a meaningful original file name) the file gets a readable,
    SEO-friendly name such as box-truck-dallas-3f9a1c.webp; the short random
    suffix keeps every link unique and permanent.
    """
    extension = ALLOWED_TYPES.get((file.content_type or "").lower())
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PNG, JPEG, WebP or GIF images can be uploaded.",
        )

    data = await file.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The file is empty.")
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Images must be 10 MB or smaller.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    base = seo_slug(name or "") or seo_slug(file.filename or "")
    # Camera/clipboard names ("image", "IMG_2041", "screenshot") say nothing.
    if base and not re.fullmatch(r"(image|img|photo|screenshot|untitled|download|file)?[-_]?\d*", base):
        stored_name = f"{base}-{secrets.token_hex(3)}{extension}"
    else:
        stored_name = f"{uuid.uuid4().hex}{extension}"
    with open(os.path.join(UPLOAD_DIR, stored_name), "wb") as buffer:
        buffer.write(data)

    return {"url": f"{URL_PREFIX}/{stored_name}", "name": stored_name, "size": len(data)}


def _safe_path(name: str) -> str:
    if not SAFE_NAME.match(name) or os.path.basename(name) != name:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found.")
    path = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(path):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found.")
    return path


@router.get("", dependencies=[Depends(get_current_admin)])
def list_uploads(
    q: Optional[str] = Query(None, max_length=100),
    page: int = Query(1, ge=1),
    size: int = Query(48, ge=1, le=200),
):
    """Media Library: uploaded images, newest first."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    needle = (q or "").strip().lower()
    files = []
    with os.scandir(UPLOAD_DIR) as entries:
        for entry in entries:
            ext = os.path.splitext(entry.name)[1].lower()
            if not entry.is_file() or ext not in IMAGE_EXTENSIONS or (needle and needle not in entry.name.lower()):
                continue
            stat = entry.stat()
            files.append((stat.st_mtime, entry.name, stat.st_size))
    files.sort(reverse=True)
    total = len(files)
    chunk = files[(page - 1) * size : page * size]
    return {
        "items": [
            {
                "name": name,
                "url": f"{URL_PREFIX}/{name}",
                "size": file_size,
                "modified": datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat(),
            }
            for mtime, name, file_size in chunk
        ],
        "total": total,
        "page": page,
        "size": size,
    }


def find_references(db: Session, name: str) -> list[dict]:
    """Where an uploaded file is used: any text/JSON column containing its name."""
    found: list[dict] = []
    for table in Base.metadata.sorted_tables:
        if table.name in {"deleted_items", "seed_runs"}:
            continue
        columns = [c for c in table.columns if isinstance(c.type, (String, Text, JSON))]
        if not columns:
            continue
        conditions = [
            (cast(c, Text) if isinstance(c.type, JSON) else c).contains(name) for c in columns
        ]
        rows = db.execute(select(table).where(or_(*conditions)).limit(20)).mappings().all()
        for row in rows:
            label = next(
                (str(row[k]) for k in ("title", "name", "key", "subject", "question", "slug") if k in row and row[k]),
                f"#{row.get('id', '?')}",
            )
            found.append({"table": table.name, "id": row.get("id"), "label": label[:120]})
    return found


@router.get("/{name}/usage", dependencies=[Depends(get_current_admin)])
def upload_usage(name: str, db: Session = Depends(get_db)):
    _safe_path(name)
    return {"name": name, "used_in": find_references(db, name)}


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_upload(name: str, force: bool = Query(False), db: Session = Depends(get_db)):
    path = _safe_path(name)
    used = find_references(db, name)
    if used and not force:
        where = ", ".join(f"{u['label']}" for u in used[:5])
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"This image is still used ({where}{'…' if len(used) > 5 else ''}). Deleting it would show a broken image there.",
        )
    os.remove(path)
