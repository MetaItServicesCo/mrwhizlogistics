import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.security import get_current_admin

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = "uploads"
MAX_BYTES = 10 * 1024 * 1024  # 10 MB

# SVG is deliberately excluded: it can carry <script>, and these files are
# served from the site's own origin.
ALLOWED_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("/image", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...)):
    """Store an image inserted from the rich-text editor and return its URL."""
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
    stored_name = f"{uuid.uuid4().hex}{extension}"
    with open(os.path.join(UPLOAD_DIR, stored_name), "wb") as buffer:
        buffer.write(data)

    return {"url": f"/{UPLOAD_DIR}/{stored_name}"}
