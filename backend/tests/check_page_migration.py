"""Check upgrade + concurrent startup against disposable PostgreSQL 16.

Run from backend: venv/Scripts/python.exe -m tests.check_page_migration
Requires local Docker and an existing postgres:16-alpine image (never pulls).
The uniquely named test container stores data only in tmpfs and is removed
automatically. No existing containers, volumes or databases are modified.
"""
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess
import time
import uuid

# Importing the fixture first prevents application modules reading production
# database configuration. Its make_app() is NOT called in this test.
from tests import site_pages_app  # noqa: F401
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session

from app.core.schema_upgrade import apply_schema_upgrades
from app.core.standard_pages import ensure_standard_pages
from app.core.rental_content import ensure_rental_content
from app.database import Base
from app.models.page import Page
from app.models.rental import RentalItem


def docker(*args):
    return subprocess.check_output(["docker", *args], text=True).strip()


def main():
    name = f"mrwhizz-page-migration-test-{uuid.uuid4().hex[:12]}"
    container_id = None
    engine = None
    try:
        container_id = docker(
            "run", "--detach", "--rm", "--pull=never", "--name", name,
            "--label", "mrwhizz.disposable-test=page-migration",
            "--tmpfs", "/var/lib/postgresql/data", "--publish", "127.0.0.1::5432",
            "--env", "POSTGRES_DB=page_migration_test", "--env", "POSTGRES_USER=test",
            "--env", "POSTGRES_PASSWORD=disposable-test-only", "postgres:16-alpine",
        )
        info = json.loads(docker("inspect", container_id))[0]
        port = info["NetworkSettings"]["Ports"]["5432/tcp"][0]["HostPort"]
        engine = create_engine(
            f"postgresql+psycopg2://test:disposable-test-only@127.0.0.1:{port}/page_migration_test",
            connect_args={"connect_timeout": 2},
        )
        deadline = time.monotonic() + 40
        while True:
            try:
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                break
            except Exception:
                if time.monotonic() >= deadline:
                    raise
                time.sleep(0.25)

        Base.metadata.create_all(engine)
        with engine.begin() as connection:
            # A reviewed, published legal page and an unrelated existing page.
            connection.execute(text("""
                INSERT INTO pages (title, slug, page_type, content, is_active, sort_order, created_at, updated_at)
                VALUES ('Reviewed terms', 'terms', 'legal', '<p>Existing reviewed copy.</p>', TRUE, 20,
                        '2020-01-01', '2020-02-01'),
                       ('Existing homepage', 'home', 'home', '<p>Keep unchanged.</p>', TRUE, 0,
                        '2020-01-01', '2020-02-01')
            """))
            # Simulate the previous schema on THIS disposable database only.
            connection.execute(text('ALTER TABLE pages DROP COLUMN show_in_footer'))
            before = connection.execute(text("SELECT * FROM pages ORDER BY id")).mappings().all()
            for column in ("details", "is_active", "sort_order", "updated_at"):
                connection.execute(text(f'ALTER TABLE rental_items DROP COLUMN "{column}"'))
            connection.execute(text("""
                INSERT INTO rental_items (slug, title, description, hourly_rate, main_image)
                VALUES ('16-feet-dump-trailer', 'Existing rental title', 'Keep rental description', '$99', '/uploads/existing.jpg')
            """))
            connection.execute(text("""
                INSERT INTO rental_quotes (full_name, email, phone, rental_slug, rental_name, status)
                VALUES ('Existing Customer', 'test@example.com', '555-0100', '16-feet-dump-trailer', 'Original quote name', 'booked')
            """))
            quotes_before = connection.execute(text("SELECT * FROM rental_quotes ORDER BY id")).mappings().all()

        def start_worker(_):
            with Session(engine) as db:
                apply_schema_upgrades(db)
                ensure_standard_pages(db)
                ensure_rental_content(db)

        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(start_worker, range(2)))
        start_worker(0)  # Repeat deployment; must remain idempotent.
        assert "show_in_footer" in {c["name"] for c in inspect(engine).get_columns("pages")}
        with engine.connect() as connection:
            after = connection.execute(text("SELECT * FROM pages ORDER BY id")).mappings().all()
            for old, new in zip(before, after):
                assert dict(old) == {key: new[key] for key in old}, "Existing data changed during upgrade"
        with Session(engine) as db:
            assert db.query(Page).count() == 4, "Concurrent startup duplicated standard pages"
            terms = db.query(Page).filter_by(slug="terms").one()
            assert terms.show_in_footer is True
            for slug in ("privacy-policy", "disclaimer"):
                assert db.query(Page).filter_by(slug=slug).one().is_active is False
            terms.show_in_footer = False
            db.commit()
            ensure_standard_pages(db)
            db.refresh(terms)
            assert terms.show_in_footer is False, "Startup overwrote the saved footer choice"
            rental = db.query(RentalItem).filter_by(slug="16-feet-dump-trailer").one()
            assert (rental.title, rental.description, rental.hourly_rate, rental.main_image) == (
                "Existing rental title", "Keep rental description", "$99", "/uploads/existing.jpg")
            assert db.query(RentalItem).count() == 7
            db.delete(rental)
            db.commit()
            ensure_rental_content(db)
            assert db.query(RentalItem).count() == 6, "Deleted rental was resurrected"
            assert db.execute(text("SELECT * FROM rental_quotes ORDER BY id")).mappings().all() == quotes_before
        print("PASS: PostgreSQL 16 upgrade preserves every existing page field and timestamp")
        print("PASS: concurrent workers + repeated startup are safe; footer choices are preserved")
        print("PASS: rental schema upgrades preserve equipment, quotes and deletions across concurrent startup")
    finally:
        if engine is not None:
            engine.dispose()
        if container_id:
            # Stop only the ID returned by this test's docker run; --rm removes
            # the disposable container and its tmpfs data, not user volumes.
            docker("stop", "--time", "5", container_id)
            print("Removed disposable migration-test container and test-only data.")


if __name__ == "__main__":
    main()
