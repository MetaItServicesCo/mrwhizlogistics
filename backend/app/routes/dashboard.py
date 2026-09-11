from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.contact_us import ContactUs, ContactInquiry
from app.models.faq import FAQ
from app.models.page import Page
from app.models.quote import QuoteRequest
from app.models.service import Service
from app.models.subscriber import Subscriber
from app.models.testimonial import Testimonial
from app.schemas.cms import CountStat, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    def count(model) -> int:
        return db.query(func.count(model.id)).scalar() or 0

    def count_status(model, status: str) -> int:
        return db.query(func.count(model.id)).filter(model.status == status).scalar() or 0

    return DashboardStats(
        quotes=CountStat(total=count(QuoteRequest), new=count_status(QuoteRequest, "new")),
        contacts=CountStat(
            total=count(ContactInquiry),
            new=count_status(ContactInquiry, "new"),
        ),
        subscribers=count(Subscriber),
        services=count(Service),
        faqs=count(FAQ),
        testimonials=count(Testimonial),
        pages=count(Page),
    )
