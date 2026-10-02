"""
"Call this visitor now" email to dispatch when the AI chat assistant
captures a callback request. Sent in the background: a slow or broken SMTP
server must never delay or fail the chat reply.
"""

import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from html import escape

from app.core.config import settings

log = logging.getLogger(__name__)


def alert_recipient() -> str | None:
    return (settings.dispatch_alert_email or settings.admin_email or "").strip() or None


def _rows(lead: dict) -> list[tuple[str, str]]:
    labels = [
        ("Name", "name"),
        ("Phone", "phone"),
        ("Email", "email"),
        ("Service", "selected_service"),
        ("Pickup", "pickup"),
        ("Delivery", "drop"),
        ("Details", "details"),
    ]
    return [(label, str(lead[key])) for label, key in labels if lead.get(key)]


def send_dispatch_alert(lead: dict, dashboard_url: str) -> None:
    """Email dispatch about a chat callback request. Never raises."""
    recipient = alert_recipient()
    if not settings.smtp_host or not settings.newsletter_from_email or not recipient:
        log.info("Dispatch alert not sent (SMTP or recipient not configured); lead %s", lead.get("id"))
        return
    phone = lead.get("phone") or "no phone"
    message = EmailMessage()
    message["Subject"] = f"Call now: {lead.get('name') or 'Chat visitor'} {phone} (AI chat)"
    message["From"] = formataddr((settings.newsletter_from_name, settings.newsletter_from_email))
    message["To"] = recipient
    rows = _rows(lead)
    text_body = "A visitor asked the AI assistant for a call back right away.\n\n"
    text_body += "\n".join(f"{label}: {value}" for label, value in rows)
    text_body += f"\n\nOpen in the dashboard: {dashboard_url}\n"
    message.set_content(text_body)
    html_rows = "".join(
        f'<tr><td style="padding:4px 12px 4px 0;color:#666">{escape(label)}</td>'
        f'<td style="padding:4px 0"><strong>{escape(value)}</strong></td></tr>'
        for label, value in rows
    )
    tel = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    message.add_alternative(
        f"""<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
<p>A visitor asked the AI assistant for a <strong>call back right away</strong>.</p>
<table>{html_rows}</table>
<p><a href="tel:{escape(tel)}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Call {escape(phone)}</a></p>
<p><a href="{escape(dashboard_url)}">Open the lead and the conversation in the dashboard</a></p>
</div>""",
        subtype="html",
    )
    try:
        smtp_type = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP
        with smtp_type(settings.smtp_host, settings.smtp_port, timeout=20) as client:
            if not settings.smtp_use_ssl and settings.smtp_use_tls:
                client.starttls()
            if settings.smtp_username:
                client.login(settings.smtp_username, settings.smtp_password or "")
            client.send_message(message)
        log.info("Dispatch alert sent for lead %s", lead.get("id"))
    except Exception:  # noqa: BLE001 - alerting must never break lead capture
        log.exception("Dispatch alert failed for lead %s", lead.get("id"))
