import html
import re
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from itsdangerous import BadSignature, URLSafeSerializer

from app.core.config import settings

TOKEN_SALT = "newsletter-unsubscribe-v1"


def unsubscribe_token(subscriber_id: int, email: str) -> str:
    return URLSafeSerializer(settings.secret_key, salt=TOKEN_SALT).dumps(
        {"id": subscriber_id, "email": email.lower()}
    )


def read_unsubscribe_token(token: str) -> tuple[int, str]:
    try:
        value = URLSafeSerializer(settings.secret_key, salt=TOKEN_SALT).loads(token)
        return int(value["id"]), str(value["email"]).lower()
    except (BadSignature, KeyError, TypeError, ValueError) as exc:
        raise ValueError("This unsubscribe link is invalid.") from exc


def _plain_text(content_html: str) -> str:
    text = re.sub(r"<(br|/p|/li|/h[1-6])\b[^>]*>", "\n", content_html, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\n{3,}", "\n\n", html.unescape(text)).strip()


def _email_html(content_html: str, preview_text: str | None, unsubscribe_url: str) -> str:
    base = settings.public_site_url.rstrip("/")
    # Dashboard uploads and internal links are stored as site-relative URLs;
    # email clients need absolute URLs.
    content_html = re.sub(r'(?P<attr>\b(?:src|href))="/(?P<path>[^"#]+)"', rf'\g<attr>="{base}/\g<path>"', content_html, flags=re.I)
    preview = html.escape(preview_text or "")
    return f"""<!doctype html>
<html><body style="margin:0;background:#0a0a0a;color:#f5f5f5;font-family:Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{preview}</div>
<main style="max-width:680px;margin:auto;padding:36px 24px">
<div style="border-top:4px solid #c8ff00;background:#151515;padding:32px;border-radius:10px;line-height:1.65">{content_html}</div>
<p style="color:#999;font-size:12px;line-height:1.6;text-align:center;margin-top:24px">
You received this because you subscribed to Mr. Whiz Logistics updates.<br>
<a href="{html.escape(unsubscribe_url, quote=True)}" style="color:#c8ff00">Unsubscribe</a>
</p></main></body></html>"""


class NewsletterMailer:
    def __enter__(self):
        if not settings.smtp_host or not settings.newsletter_from_email:
            raise RuntimeError("Newsletter email is not configured. Set SMTP_HOST and NEWSLETTER_FROM_EMAIL.")
        smtp_type = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP
        self.client = smtp_type(settings.smtp_host, settings.smtp_port, timeout=30)
        if not settings.smtp_use_ssl and settings.smtp_use_tls:
            self.client.starttls()
        if settings.smtp_username:
            self.client.login(settings.smtp_username, settings.smtp_password or "")
        return self

    def __exit__(self, exc_type, exc, traceback):
        try:
            self.client.quit()
        except Exception:
            self.client.close()

    def send(self, recipient: str, subject: str, content_html: str, preview_text: str | None, unsubscribe_url: str) -> None:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr((settings.newsletter_from_name, settings.newsletter_from_email or ""))
        message["To"] = recipient
        message["List-Unsubscribe"] = f"<{unsubscribe_url}>"
        message.set_content(f"{_plain_text(content_html)}\n\nUnsubscribe: {unsubscribe_url}")
        message.add_alternative(_email_html(content_html, preview_text, unsubscribe_url), subtype="html")
        self.client.send_message(message)
