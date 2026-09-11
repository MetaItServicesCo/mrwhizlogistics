from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.content_block import ContentBlock
from app.models.faq import FAQ, FAQCategory
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.subscriber import Subscriber
from app.models.testimonial import Testimonial
from app.schemas.cms import ContentBlockRead, SiteSettingRead
from app.schemas.faq import PublicFAQCategory, PublicFAQItem
from app.schemas.leads import ContactCreate, ContactRead, SubscriberCreate, SubscriberRead
from app.schemas.service import ServiceRead
from app.schemas.testimonial import TestimonialRead

router = APIRouter(prefix="/public", tags=["Public (website forms)"])


# NOTE: /public/contact aur /public/quotes ab apni-apni files me hain
# (contacts.py aur quote.py). Yahan duplicate na rakhein.


@router.post("/subscribers", response_model=SubscriberRead, status_code=status.HTTP_201_CREATED)
def subscribe(payload: SubscriberCreate, db: Session = Depends(get_db)):
    existing = db.query(Subscriber).filter(Subscriber.email == payload.email).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            db.refresh(existing)
        return existing
    row = Subscriber(email=payload.email, is_active=True)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/services", response_model=list[ServiceRead])
def public_services(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(Service).filter(Service.is_active.is_(True))
    if category:
        q = q.filter(Service.category == category)
    return q.order_by(Service.sort_order, Service.id).all()


@router.get("/services/{slug}", response_model=ServiceRead)
def public_service(slug: str, db: Session = Depends(get_db)):
    row = db.query(Service).filter(Service.slug == slug, Service.is_active.is_(True)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Service not found")
    return row


@router.get("/faqs", response_model=list[PublicFAQCategory])
def public_faqs(db: Session = Depends(get_db)):
    """Active FAQ categories (tabs) with their active questions — grouped for the homepage FAQ section."""
    categories = (
        db.query(FAQCategory)
        .options(selectinload(FAQCategory.faqs))
        .filter(FAQCategory.is_active.is_(True))
        .order_by(FAQCategory.display_order.asc(), FAQCategory.id.asc())
        .all()
    )

    result: list[PublicFAQCategory] = []
    for c in categories:
        active = sorted(
            (f for f in c.faqs if f.is_active),
            key=lambda f: (f.display_order, f.id),
        )
        result.append(
            PublicFAQCategory(
                id=c.id,
                name=c.name,
                icon=c.icon,
                description=c.description,
                faq_count=len(active),
                faqs=[PublicFAQItem(id=f.id, question=f.question, answer=f.answer) for f in active],
            )
        )
    return result


@router.get("/testimonials", response_model=list[TestimonialRead])
def public_testimonials(db: Session = Depends(get_db)):
    return (
        db.query(Testimonial)
        .filter(Testimonial.is_active.is_(True))
        .order_by(Testimonial.sort_order, Testimonial.id)
        .all()
    )


@router.get("/content-blocks", response_model=list[ContentBlockRead])
def public_blocks(db: Session = Depends(get_db)):
    return db.query(ContentBlock).filter(ContentBlock.is_active.is_(True)).all()


@router.get("/settings", response_model=list[SiteSettingRead])
def public_settings(db: Session = Depends(get_db)):
    return db.query(SiteSetting).all()