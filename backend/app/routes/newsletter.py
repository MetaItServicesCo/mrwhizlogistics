from datetime import datetime, timedelta
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.html import sanitize_html
from app.core.newsletter import NewsletterMailer, unsubscribe_token
from app.core.security import get_current_admin
from app.database import get_db
from app.models.newsletter import NewsletterCampaign, NewsletterDelivery
from app.models.subscriber import Subscriber
from app.schemas.newsletter import (
    CampaignCreate,
    CampaignRead,
    CampaignSendResult,
    CampaignTestRequest,
    CampaignUpdate,
)

router = APIRouter(prefix="/newsletter", tags=["Newsletter"], dependencies=[Depends(get_current_admin)])


def _campaign(db: Session, campaign_id: int) -> NewsletterCampaign:
    row = db.query(NewsletterCampaign).filter(NewsletterCampaign.id == campaign_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Newsletter campaign not found.")
    return row


def _content(value: str) -> str:
    cleaned = sanitize_html(value)
    if not cleaned:
        raise HTTPException(status_code=422, detail="Newsletter content cannot be empty.")
    return cleaned


def _unsubscribe_url(subscriber: Subscriber) -> str:
    token = unsubscribe_token(subscriber.id, subscriber.email)
    return f"{settings.public_site_url.rstrip('/')}/newsletter/unsubscribe/{quote(token, safe='')}"


@router.get("/campaigns", response_model=list[CampaignRead])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(NewsletterCampaign).order_by(NewsletterCampaign.created_at.desc()).all()


@router.post("/campaigns", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    row = NewsletterCampaign(
        subject=payload.subject,
        preview_text=(payload.preview_text or "").strip() or None,
        content_html=_content(payload.content_html),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/campaigns/{campaign_id}", response_model=CampaignRead)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    return _campaign(db, campaign_id)


@router.put("/campaigns/{campaign_id}", response_model=CampaignRead)
def update_campaign(campaign_id: int, payload: CampaignUpdate, db: Session = Depends(get_db)):
    row = _campaign(db, campaign_id)
    if row.status != "draft" and not (row.status == "failed" and row.delivered_count == 0):
        raise HTTPException(status_code=409, detail="A campaign delivered to any recipient cannot be edited.")
    changes = payload.model_dump(exclude_unset=True)
    if "subject" in changes:
        row.subject = changes["subject"]
    if "preview_text" in changes:
        row.preview_text = (changes["preview_text"] or "").strip() or None
    if "content_html" in changes:
        row.content_html = _content(changes["content_html"])
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    row = _campaign(db, campaign_id)
    if row.status in {"sending", "sent"} or row.delivered_count > 0:
        raise HTTPException(status_code=409, detail="A campaign with deliveries is retained as delivery history.")
    db.delete(row)
    db.commit()


@router.post("/campaigns/{campaign_id}/test", response_model=CampaignSendResult)
def send_test(campaign_id: int, payload: CampaignTestRequest, db: Session = Depends(get_db)):
    row = _campaign(db, campaign_id)
    target = db.query(Subscriber).filter(Subscriber.email == str(payload.email).lower()).first()
    unsubscribe_url = (
        _unsubscribe_url(target)
        if target
        else f"{settings.public_site_url.rstrip('/')}/newsletter/unsubscribe/test"
    )
    try:
        with NewsletterMailer() as mailer:
            mailer.send(str(payload.email), f"[TEST] {row.subject}", row.content_html, row.preview_text, unsubscribe_url)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Test email could not be sent: {exc}") from exc
    return CampaignSendResult(campaign=row, message=f"Test email sent to {payload.email}.")


@router.post("/campaigns/{campaign_id}/send", response_model=CampaignSendResult)
def send_campaign(campaign_id: int, db: Session = Depends(get_db)):
    row = _campaign(db, campaign_id)
    if row.status == "sent":
        raise HTTPException(status_code=409, detail="This campaign has already been sent.")
    if row.status == "sending" and row.updated_at > datetime.utcnow() - timedelta(minutes=15):
        raise HTTPException(status_code=409, detail="This campaign is already being sent.")

    deliveries = db.query(NewsletterDelivery).filter(NewsletterDelivery.campaign_id == row.id).all()
    if not deliveries:
        subscribers = db.query(Subscriber).filter(Subscriber.is_active.is_(True)).order_by(Subscriber.id).all()
        if not subscribers:
            raise HTTPException(status_code=409, detail="There are no active subscribers.")
        deliveries = [
            NewsletterDelivery(campaign_id=row.id, subscriber_id=s.id, email=s.email)
            for s in subscribers
        ]
        db.add_all(deliveries)
        db.flush()

    # A campaign's audience is snapshotted on its first send. New subscribers
    # never receive an old retry, and addresses unsubscribed meanwhile are skipped.
    active_ids = {
        item.id for item in db.query(Subscriber).filter(Subscriber.is_active.is_(True)).all()
    }
    pending = [d for d in deliveries if d.status != "delivered" and d.subscriber_id in active_ids]
    if not pending and not any(d.status == "delivered" for d in deliveries):
        raise HTTPException(status_code=409, detail="There are no active recipients remaining for this campaign.")

    delivered = sum(1 for d in deliveries if d.status == "delivered")
    row.status = "sending"
    row.recipient_count = delivered + len(pending)
    row.updated_at = datetime.utcnow()
    db.commit()

    failed = 0
    try:
        with NewsletterMailer() as mailer:
            for delivery in pending:
                subscriber = db.get(Subscriber, delivery.subscriber_id)
                if not subscriber or not subscriber.is_active:
                    continue
                try:
                    mailer.send(
                        subscriber.email,
                        row.subject,
                        row.content_html,
                        row.preview_text,
                        _unsubscribe_url(subscriber),
                    )
                    delivery.status = "delivered"
                    delivery.sent_at = datetime.utcnow()
                    delivery.error_message = None
                    delivered += 1
                except Exception as exc:
                    delivery.status = "failed"
                    delivery.error_message = str(exc)[:500]
                    failed += 1
                db.commit()
    except Exception as exc:
        row.status = "failed"
        row.delivered_count = delivered
        row.failed_count = max(failed, row.recipient_count - delivered)
        row.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=503, detail=f"Campaign delivery could not start: {exc}") from exc

    row.delivered_count = delivered
    row.failed_count = failed
    row.status = "sent" if failed == 0 else "failed"
    row.sent_at = datetime.utcnow() if delivered else None
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    message = f"Delivered to {delivered} subscriber{'s' if delivered != 1 else ''}."
    if failed:
        message += f" {failed} delivery{'ies' if failed != 1 else 'y'} failed; use Send again to retry only failures."
    return CampaignSendResult(campaign=row, message=message)
