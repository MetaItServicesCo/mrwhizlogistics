from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.blog import BlogComment
from app.models.contact_us import ContactUs, ContactInquiry
from app.models.faq import FAQ
from app.models.page import Page
from app.models.quote import QuoteRequest
from app.models.rental import RentalQuote
from app.models.service import Service
from app.models.subscriber import Subscriber
from app.models.testimonial import Testimonial
from app.schemas.cms import CountStat, DashboardStats, NotificationFeed, NotificationItem

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


# --------------------------------------------------------------------------
# Notification bell
# --------------------------------------------------------------------------
# Everything a visitor sends in (quote and rental requests, contact messages,
# comments waiting for approval, new subscribers), newest first. "Unread" means
# newer than the moment this admin last opened the bell, so it works for every
# source - including rental requests, which have no status the dashboard edits.

# An admin who has never opened the bell starts with the last week unread,
# rather than the site's entire history.
FIRST_VISIT_WINDOW = timedelta(days=7)


def _utc(dt: datetime) -> datetime:
    """Columns hold naive UTC; send it explicitly marked so browsers don't
    read it as local time."""
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def _clip(text: str | None, limit: int = 90) -> str | None:
    text = " ".join((text or "").split())
    if not text:
        return None
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def _join(*parts: str | None) -> str | None:
    return " · ".join(p for p in parts if p) or None


@router.get("/notifications", response_model=NotificationFeed)
def notifications(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    since = user.notifications_seen_at or (datetime.utcnow() - FIRST_VISIT_WINDOW)

    # (model, timestamp column, extra filters, row -> (title, detail, href))
    sources = [
        (
            "quote",
            QuoteRequest,
            QuoteRequest.created_at,
            [],
            lambda r: ("New quote request", _join(r.name, r.selected_service), "/dashboard/leads/quotes"),
        ),
        (
            "contact",
            ContactInquiry,
            ContactInquiry.created_at,
            [],
            lambda r: ("New contact message", _join(r.full_name, _clip(r.message, 60) or r.service_needed), "/dashboard/leads/contact"),
        ),
        (
            "rental",
            RentalQuote,
            RentalQuote.submitted_at,
            [],
            lambda r: ("New rental request", _join(r.full_name, r.rental_name or r.rental_slug), "/dashboard/rentals"),
        ),
        (
            "comment",
            BlogComment,
            BlogComment.created_at,
            [BlogComment.is_approved.is_(False)],
            lambda r: (
                "Comment awaiting approval",
                _join(r.name, f"on “{r.blog.title}”" if r.blog else None),
                "/dashboard/blog/comments",
            ),
        ),
        (
            "subscriber",
            Subscriber,
            Subscriber.created_at,
            [],
            lambda r: ("New newsletter subscriber", r.email, "/dashboard/leads/newsletter"),
        ),
    ]

    unread = 0
    items: list[NotificationItem] = []
    for kind, model, ts, filters, describe in sources:
        base = db.query(model).filter(ts.isnot(None), *filters)
        unread += base.filter(ts > since).count()
        for row in base.order_by(ts.desc()).limit(limit).all():
            created = getattr(row, ts.key)
            title, detail, href = describe(row)
            items.append(
                NotificationItem(
                    id=f"{kind}-{row.id}",
                    kind=kind,
                    title=title,
                    detail=detail,
                    created_at=_utc(created),
                    href=href,
                    unread=created > since,
                )
            )

    items.sort(key=lambda i: i.created_at, reverse=True)
    return NotificationFeed(unread=unread, items=items[:limit])


@router.post("/notifications/seen", status_code=status.HTTP_204_NO_CONTENT)
def mark_notifications_seen(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    user.notifications_seen_at = datetime.utcnow()
    db.commit()
