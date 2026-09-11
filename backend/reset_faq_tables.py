"""Purani faqs / faq_categories tables drop karta hai taake sahi structure me dobara banein.
Run: python reset_faq_tables.py
"""
from sqlalchemy import text

from app.database import engine

with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS faqs CASCADE;"))
    conn.execute(text("DROP TABLE IF EXISTS faq_categories CASCADE;"))
    print("✅ Dropped: faqs, faq_categories")