from sqlalchemy import text

from app.database import engine


def ensure_postgres_columns() -> None:
    statements = [
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS og_title VARCHAR(255)",
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS og_description TEXT",
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS og_type VARCHAR(50)",
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS keywords VARCHAR(500)",
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS robots VARCHAR(80)",
        "ALTER TABLE seo ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255)",
        "ALTER TABLE faqs ADD COLUMN IF NOT EXISTS page_id INTEGER",
        "ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS page_id INTEGER",
        "ALTER TABLE pages ADD COLUMN IF NOT EXISTS page_type VARCHAR(50)",
    ]
    with engine.begin() as conn:
        for sql in statements:
            conn.execute(text(sql))
