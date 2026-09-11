import getpass
import sys

from app.core.security import get_password_hash, verify_password
from app.database import Base, SessionLocal, engine
from app.models import *  # noqa: F401,F403
from app.models.user import User
from app.seed import seed


def create_super_admin() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Mr. Whiz Logistics — create admin")
        email = input("Enter admin email: ").strip()
        if not email:
            print("Email is required.")
            sys.exit(1)

        password = getpass.getpass("Enter admin password: ").strip()
        if not password or len(password) < 6:
            print("Password must be at least 6 characters.")
            sys.exit(1)

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            if verify_password(password, existing.hashed_password):
                print(f"Admin already exists. Login email: {email}")
            else:
                print("A user with this email already exists.")
            seed(db)
            return

        admin = User(
            username=email.split("@")[0].lower(),
            email=email,
            hashed_password=get_password_hash(password),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(" Admin created.")
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    create_super_admin()
