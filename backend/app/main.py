import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from app.admin import setup_admin
from app.core.config import settings
from app.core.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import *  # noqa: F401,F403
from app.models.user import User
from app.routes import router as api_router
from app.routes.blog import router as blog_router  # <-- Added Blog Router
from app.seed import seed
from app.models.semi_truck import SemiTruck
from app.routes.semi_truck import router as semi_truck_router
from app.routes.team import router as team_router


app = FastAPI(
    title="Mr. Whiz Logistics Admin API",
    description=(
        "Admin dashboard backend for the Mr. Whiz Logistics website. "
        "Use **Authorize** with admin email + password. "
        "HTML admin UI is also available at `/admin`."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
Base.metadata.create_all(bind=engine)
app.state.engine = engine
app.state.secret_key = settings.secret_key
# --- Uploads Directory Setup (For Hotshot & Dynamic Images) ---
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
# Credentials cannot be combined with a wildcard origin, so only send
# allow_credentials when CORS_ORIGINS names explicit origins.
_cors_origins = settings.cors_origin_list
_allow_credentials = "*" not in _cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.routes.router already aggregates every sub-router (auth, team, blog,
# contact-us, semi-trucks, ...), so including it once mounts the whole API.
# It used to be included four times, plus blog and team a second time each,
# which registered every path 4-5x and made /docs unusable.
app.include_router(api_router, prefix="/api")
setup_admin(app)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if settings.admin_email and settings.admin_password:
            existing = db.query(User).filter(User.email == settings.admin_email).first()
            if not existing:
                db.add(
                    User(
                        username=settings.admin_email.split("@")[0].lower(),
                        email=settings.admin_email,
                        hashed_password=get_password_hash(settings.admin_password),
                        role="admin",
                        is_active=True,
                    )
                )
                db.commit()
        seed(db)
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Mr. Whiz Logistics Admin API is running",
        "docs": "/docs",
        "admin": "/admin",
    }