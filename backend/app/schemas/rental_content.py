import re
from typing import Literal
from urllib.parse import urlsplit
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.core.html import sanitize_html


def image_url(value: str) -> str:
    if value.startswith("/") and not value.startswith("//") and "\\" not in value:
        return value
    url = urlsplit(value)
    if url.scheme in {"https", "http"} and url.netloc and not url.username and not url.password:
        return value
    raise ValueError("Use a site-relative image path or an http(s) image URL.")


class RentalContentItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=255)
    desc: str = Field(default="", max_length=20000)
    images: list[str] = Field(default_factory=list, max_length=30)
    imageAlts: list[str] = Field(default_factory=list, max_length=30)
    specs: list[str] = Field(default_factory=list, max_length=30)
    priceHint: str = ""
    pricingIncludes: str = ""
    size: str = ""
    capacity: str = ""
    hitch: str = ""
    location: str = ""
    equipment: str = ""
    deposit: str = ""
    requirements: str = ""
    minAge: str = ""
    category: str = ""
    availability: Literal["Available", "Limited", "On Request"] = "On Request"
    content_html: str = ""
    hero_image: str = "/images/breadcumb.jpg"
    meta_title: str = Field(default="", max_length=255)
    meta_description: str = Field(default="", max_length=1000)
    is_active: bool = False
    sort_order: int = Field(default=0, ge=-100000, le=100000)

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, value):
        value = value.strip().lower()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
            raise ValueError("Use lowercase letters, numbers and single hyphens for the address.")
        return value

    @field_validator("title")
    @classmethod
    def valid_title(cls, value):
        if not value.strip():
            raise ValueError("Enter an equipment title.")
        return value.strip()

    @field_validator("images")
    @classmethod
    def valid_images(cls, values):
        return [image_url(value) for value in values]

    @field_validator("hero_image")
    @classmethod
    def valid_hero(cls, value):
        return image_url(value) if value else "/images/breadcumb.jpg"

    @field_validator("content_html")
    @classmethod
    def clean_content(cls, value):
        return sanitize_html(value) or ""
