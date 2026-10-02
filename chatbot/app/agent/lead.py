"""
Callback-lead rules, deliberately plain code: the model only extracts what
the visitor said and phrases questions; this module decides what is valid,
what is still missing and when the lead is complete.

Booking = "a dispatcher calls you now". Required: name + a valid phone.
Everything else (route, freight, date, email) is optional context for the
dispatcher and may arrive before or after the lead is submitted.
"""

import re
from typing import Literal

import phonenumbers

from app.agent.llm import LeadExtraction

Stage = Literal["none", "collecting", "confirming", "submitted"]

REQUIRED = ("name", "phone")
OPTIONAL = ("service", "pickup", "delivery", "freight", "pickup_date", "email", "notes")
FIELD_LABELS = {
    "name": "Name",
    "phone": "Phone",
    "email": "Email",
    "service": "Service",
    "pickup": "Pickup",
    "delivery": "Delivery",
    "freight": "Freight",
    "pickup_date": "Pickup date",
    "notes": "Notes",
}
LIMITS = {"name": 80, "phone": 30, "email": 120, "service": 60, "pickup": 160, "delivery": 160, "freight": 300, "pickup_date": 60, "notes": 400}
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
# Clear non-answers only: a doubtful name beats looping on the question.
_NOT_A_NAME = re.compile(r"^(unknown|n/?a|none|no name|anonymous)$", re.I)


def normalize_phone(raw: str | None) -> str | None:
    """A dialable phone (US default region) formatted for people, or None."""
    if not raw:
        return None
    raw = raw.strip()
    try:
        number = phonenumbers.parse(raw, "US")
    except phonenumbers.NumberParseException:
        return None
    if not phonenumbers.is_valid_number(number):
        return None
    if number.country_code == 1:
        return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.NATIONAL)
    return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)


def clean_name(raw: str | None) -> str | None:
    if not raw:
        return None
    name = re.sub(r"[^\w\s'.-]", "", raw, flags=re.UNICODE).strip()
    name = re.sub(r"\s+", " ", name)
    if len(name) < 2 or any(ch.isdigit() for ch in name) or _NOT_A_NAME.search(name):
        return None
    return name[: LIMITS["name"]].title() if name.islower() or name.isupper() else name[: LIMITS["name"]]


def merge(lead: dict, extracted: LeadExtraction) -> tuple[dict, list[str]]:
    """New lead dict with valid extracted values applied, plus problems to tell the visitor."""
    updated = dict(lead)
    problems: list[str] = []
    data = extracted.model_dump(exclude={"confirmation"})
    if data.get("phone"):
        phone = normalize_phone(data["phone"])
        if phone:
            updated["phone"] = phone
        else:
            problems.append("phone")
    if data.get("name"):
        name = clean_name(data["name"])
        if name:
            updated["name"] = name
    if data.get("email"):
        email = data["email"].strip()
        if _EMAIL.match(email):
            updated["email"] = email[: LIMITS["email"]]
        else:
            problems.append("email")
    for key in ("service", "pickup", "delivery", "freight", "pickup_date", "notes"):
        value = (data.get(key) or "").strip()
        if value:
            updated[key] = value[: LIMITS[key]]
    return updated, problems


def missing_required(lead: dict) -> list[str]:
    return [f for f in REQUIRED if not lead.get(f)]


def missing_optional(lead: dict) -> list[str]:
    return [f for f in ("pickup", "delivery", "freight", "pickup_date") if not lead.get(f)]


def summary_lines(lead: dict) -> list[tuple[str, str]]:
    return [(FIELD_LABELS[k], str(lead[k])) for k in (*REQUIRED, *OPTIONAL) if lead.get(k)]


def changed_fields(before: dict, after: dict) -> list[str]:
    return [k for k in (*REQUIRED, *OPTIONAL) if after.get(k) and after.get(k) != before.get(k)]
