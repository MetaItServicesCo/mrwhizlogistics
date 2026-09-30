from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _safe_subject(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if "\n" in value or "\r" in value:
        raise ValueError("Subject cannot contain line breaks.")
    return value


class CampaignCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    preview_text: str | None = Field(default=None, max_length=300)
    content_html: str = Field(min_length=1)

    _validate_subject = field_validator("subject")(_safe_subject)


class CampaignUpdate(BaseModel):
    subject: str | None = Field(default=None, min_length=1, max_length=200)
    preview_text: str | None = Field(default=None, max_length=300)
    content_html: str | None = Field(default=None, min_length=1)

    _validate_subject = field_validator("subject")(_safe_subject)


class CampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: str
    preview_text: str | None
    content_html: str
    status: str
    recipient_count: int
    delivered_count: int
    failed_count: int
    created_at: datetime
    updated_at: datetime
    sent_at: datetime | None


class CampaignTestRequest(BaseModel):
    email: EmailStr


class CampaignSendResult(BaseModel):
    campaign: CampaignRead
    message: str


class UnsubscribeRequest(BaseModel):
    token: str = Field(min_length=1, max_length=2048)


class SubscriptionResult(BaseModel):
    message: str
