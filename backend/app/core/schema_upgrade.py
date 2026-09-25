"""
Additive, idempotent column upgrades applied on startup.

The project has no migration tool, and Base.metadata.create_all() only creates
missing *tables* - it never adds columns to a table that already exists. A
database created by an earlier release would therefore be missing any column
added since, and every query touching that model would fail.

Each entry here is ADD COLUMN IF NOT EXISTS, so it is safe to run on every boot,
on a fresh database (where create_all already made the column) and on an old
one. Only ever append to this list; never drop or rename through it.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session

COLUMN_UPGRADES: list[tuple[str, str, str]] = [
    # Rich-text editor bodies
    ("blogs", "content_html", "TEXT"),
    ("hotshot_cards", "content_html", "TEXT"),
    ("box_trucks", "content_html", "TEXT"),
    ("semi_truck_cards", "content_html", "TEXT"),
    # Per-post JSON-LD
    ("blogs", "schema_markup", "TEXT"),
    # Listing-page headings the routes always wrote but older tables lacked
    ("hotshot_cards", "page_heading", "VARCHAR(200)"),
    ("hotshot_cards", "page_subheading", "VARCHAR(300)"),
    ("box_trucks", "page_heading", "VARCHAR(200)"),
    ("box_trucks", "page_subheading", "VARCHAR(300)"),
    ("box_trucks", "category_tag", "VARCHAR(100)"),
    # Comment approval
    ("blog_comments", "is_approved", "BOOLEAN DEFAULT FALSE"),
]


def upgrade_schema(db: Session) -> None:
    """Add any missing columns. Runs inside the caller's transaction."""
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return
    for table, column, ddl_type in COLUMN_UPGRADES:
        # Identifiers come from the constant list above, never from input.
        db.execute(text(f'ALTER TABLE "{table}" ADD COLUMN IF NOT EXISTS "{column}" {ddl_type}'))
