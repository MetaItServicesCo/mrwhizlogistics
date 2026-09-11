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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app.routes import router as api_router
app.include_router(api_router, prefix="/api")
# Bus yeh ek router include karein aur saare endpoints (/api/team, /api/contact-us, etc.) active ho jayenge
app.include_router(api_router, prefix="/api")
# app.include_router(semi_truck_router)
app.include_router(api_router, prefix="/api")
app.include_router(blog_router, prefix="/api")  # <-- Included Blog Router under /api
# 2. Team Router ko include karein (app.include_router wale block ke sath)
app.include_router(team_router, prefix="/api")
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