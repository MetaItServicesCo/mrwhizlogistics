"""Disposable API fixture shared by API tests and the real-frontend smoke test.

Run only on loopback for testing. No production startup hooks, files or database
are used. Authentication still uses the real JWT dependency and test users.
"""
import os

# Set these before importing any app module (which otherwise reads backend/.env).
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "isolated-site-pages-tests-not-a-production-secret"

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.core.standard_pages import ensure_standard_pages
from app.database import Base, get_db
from app.models.user import User
from app.routes import router


def make_app():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine, autoflush=False)
    with sessions() as db:
        db.add(User(id=1, username="test-admin", email="admin@example.test",
                    hashed_password="unused", role="admin", is_active=True))
        db.add(User(id=2, username="inactive", email="inactive@example.test",
                    hashed_password="unused", role="admin", is_active=False))
        db.commit()
        ensure_standard_pages(db)

    def test_db():
        with sessions() as db:
            yield db

    app = FastAPI()
    app.include_router(router, prefix="/api")
    app.dependency_overrides[get_db] = test_db
    app.state.test_sessions = sessions
    app.state.test_engine = engine
    return app


def headers(user_id=1):
    return {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}
