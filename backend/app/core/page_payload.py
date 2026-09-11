from typing import Any

from app.models.faq import FAQ
from app.models.page import Page
from app.models.page_section import PageSection
from app.models.seo import SEO
from app.models.testimonial import Testimonial


def serialize_seo(seo: SEO | None) -> dict[str, Any] | None:
    if not seo:
        return None
    return {
        "id": seo.id,
        "page_id": seo.page_id,
        "meta_title": seo.meta_title,
        "meta_description": seo.meta_description,
        "seo_slug": seo.seo_slug,
        "keywords": seo.keywords,
        "canonical_url": seo.canonical_url,
        "robots": seo.robots,
        "og_title": seo.og_title,
        "og_description": seo.og_description,
        "og_image": seo.og_image,
        "og_type": seo.og_type,
    }


def serialize_section(section: PageSection) -> dict[str, Any]:
    return {
        "id": section.id,
        "page_id": section.page_id,
        "key": section.key,
        "eyebrow": section.eyebrow,
        "title": section.title,
        "highlight_text": section.highlight_text,
        "subtitle": section.subtitle,
        "description": section.description,
        "image": section.image,
        "video_url": section.video_url,
        "cta_label": section.cta_label,
        "items": section.items or [],
        "extra": section.extra or {},
        "is_active": section.is_active,
        "sort_order": section.sort_order,
        "updated_at": section.updated_at,
    }


def serialize_page_detail(
    page: Page,
    faqs: list[FAQ] | None = None,
    testimonials: list[Testimonial] | None = None,
) -> dict[str, Any]:
    sections = [serialize_section(s) for s in (page.sections or [])]
    payload: dict[str, Any] = {
        "id": page.id,
        "title": page.title,
        "slug": page.slug,
        "page_type": page.page_type,
        "content": page.content,
        "is_active": page.is_active,
        "parent_id": page.parent_id,
        "redirect_url": page.redirect_url,
        "sort_order": page.sort_order,
        "created_at": page.created_at,
        "seo": serialize_seo(page.seo),
        "sections": sections,
        "section_map": {s["key"]: s for s in sections if s.get("is_active")},
    }
    if faqs is not None:
        payload["faqs"] = [
            {
                "id": f.id,
                "page_id": f.page_id,
                "category": f.category,
                "question": f.question,
                "answer": f.answer,
                "is_active": f.is_active,
                "sort_order": f.sort_order,
                "created_at": f.created_at,
            }
            for f in faqs
        ]
    if testimonials is not None:
        payload["testimonials"] = [
            {
                "id": t.id,
                "page_id": t.page_id,
                "quote": t.quote,
                "name": t.name,
                "role": t.role,
                "rating": t.rating,
                "initials": t.initials,
                "accent": t.accent,
                "image": t.image,
                "is_active": t.is_active,
                "sort_order": t.sort_order,
                "created_at": t.created_at,
            }
            for t in testimonials
        ]
    return payload


def apply_seo(page: Page, seo_data: dict[str, Any]) -> SEO:
    seo = page.seo
    if not seo:
        seo = SEO(page_id=page.id)
        page.seo = seo
    for key, value in seo_data.items():
        if value is not None:
            setattr(seo, key, value)
    return seo
