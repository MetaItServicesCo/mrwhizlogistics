"""Internal chat-lead API used by the AI chat assistant service.

Run from backend: venv/Scripts/python.exe -m unittest tests.test_chat_leads -v
"""

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

# First: sets the isolated test environment before app settings load.
from tests.site_pages_app import headers, make_app  # isort: skip
from app.core.config import settings
from app.models.quote import QuoteRequest

TOKEN = "test-service-token"
SERVICE = {"X-Service-Token": TOKEN}
SESSION = "0123456789abcdef0123456789abcdef"


class ChatLeadTests(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        self.client = TestClient(self.app)
        self.token_patch = patch.object(settings, "chatbot_service_token", TOKEN)
        self.token_patch.start()
        self.alerts = []
        self.alert_patch = patch("app.routes.internal.send_dispatch_alert", lambda lead, url: self.alerts.append((lead, url)))
        self.alert_patch.start()

    def tearDown(self):
        self.alert_patch.stop()
        self.token_patch.stop()
        self.client.close()
        self.app.state.test_engine.dispose()

    def create(self, **overrides):
        body = {"name": "Dana White", "phone": "(469) 767-2211", "chat_session_id": SESSION, "selected_service": "Hot Shot"} | overrides
        return self.client.post("/api/internal/chat-leads", json=body, headers=SERVICE)

    def test_requires_service_token(self):
        self.assertEqual(self.client.post("/api/internal/chat-leads", json={}).status_code, 401)
        self.assertEqual(self.client.post("/api/internal/chat-leads", json={}, headers={"X-Service-Token": "wrong"}).status_code, 401)
        # A dashboard login is not a service token.
        self.assertEqual(self.client.post("/api/internal/chat-leads", json={}, headers=headers()).status_code, 401)

    def test_disabled_without_configured_token(self):
        with patch.object(settings, "chatbot_service_token", None):
            self.assertEqual(self.create().status_code, 503)

    def test_creates_phone_only_lead_and_alerts_dispatch(self):
        resp = self.create(details="Freight: 2 pallets")
        self.assertEqual(resp.status_code, 201, resp.text)
        lead = resp.json()
        self.assertIsNone(lead["email"])
        self.assertEqual(lead["source"], "chatbot")
        self.assertTrue(lead["callback_requested"])
        self.assertEqual(lead["chat_session_id"], SESSION)
        self.assertEqual(lead["status"], "new")
        self.assertEqual(len(self.alerts), 1)
        self.assertEqual(self.alerts[0][0]["phone"], "(469) 767-2211")
        self.assertTrue(self.alerts[0][1].endswith("/dashboard/leads/quotes"))

        # Shows up in the dashboard's quote list like any other lead.
        listing = self.client.get("/api/quotes", headers=headers()).json()
        self.assertEqual([q["source"] for q in listing], ["chatbot"])

    def test_retry_is_idempotent_per_session(self):
        first = self.create().json()
        second = self.create().json()
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(len(self.alerts), 1)
        with self.app.state.test_sessions() as db:
            self.assertEqual(db.query(QuoteRequest).count(), 1)

    def test_default_service_label(self):
        lead = self.create(selected_service=None).json()
        self.assertEqual(lead["selected_service"], "Call back request")

    def test_validation(self):
        self.assertEqual(self.create(name="  ").status_code, 422)
        self.assertEqual(self.create(phone="12").status_code, 422)
        self.assertEqual(self.create(chat_session_id="short").status_code, 422)

    def test_update_adds_details_without_erasing(self):
        lead = self.create().json()
        resp = self.client.patch(
            f"/api/internal/chat-leads/{lead['id']}",
            json={"pickup": "Dallas, TX", "drop": "Houston, TX", "name": ""},
            headers=SERVICE,
        )
        self.assertEqual(resp.status_code, 200, resp.text)
        body = resp.json()
        self.assertEqual((body["pickup"], body["drop"], body["name"]), ("Dallas, TX", "Houston, TX", "Dana White"))

    def test_update_cannot_touch_website_leads(self):
        resp = self.client.post(
            "/api/public/quotes",
            json={"name": "Web Visitor", "email": "web@example.com", "selected_service": "Box Truck"},
        )
        self.assertEqual(resp.status_code, 201, resp.text)
        self.assertEqual(resp.json()["source"], "website")
        patch_resp = self.client.patch(f"/api/internal/chat-leads/{resp.json()['id']}", json={"pickup": "X"}, headers=SERVICE)
        self.assertEqual(patch_resp.status_code, 404)


class DispatchAlertTests(unittest.TestCase):
    def test_skips_quietly_without_smtp(self):
        from app.core.dispatch_alert import send_dispatch_alert

        with patch.object(settings, "smtp_host", None):
            send_dispatch_alert({"id": 1, "name": "A", "phone": "1"}, "http://x")  # must not raise

    def test_sends_call_now_email(self):
        from app.core import dispatch_alert

        sent = []

        class FakeSMTP:
            def __init__(self, *a, **k):
                pass

            def __enter__(self):
                return self

            def __exit__(self, *a):
                return None

            def starttls(self):
                pass

            def login(self, *a):
                pass

            def send_message(self, message):
                sent.append(message)

        with patch.multiple(
            settings, smtp_host="smtp.test", newsletter_from_email="noreply@test", dispatch_alert_email="dispatch@test", smtp_username=None
        ), patch.object(dispatch_alert.smtplib, "SMTP", FakeSMTP):
            dispatch_alert.send_dispatch_alert({"id": 7, "name": "Dana", "phone": "(469) 767-2211", "pickup": "Dallas"}, "http://site/dashboard")
        self.assertEqual(len(sent), 1)
        self.assertEqual(sent[0]["To"], "dispatch@test")
        self.assertIn("Call now: Dana (469) 767-2211", sent[0]["Subject"])
        self.assertIn('href="tel:4697672211"', sent[0].get_body(("html",)).get_content())

    def test_smtp_failure_never_raises(self):
        from app.core import dispatch_alert

        class BrokenSMTP:
            def __init__(self, *a, **k):
                raise OSError("connection refused")

        with patch.multiple(settings, smtp_host="smtp.test", newsletter_from_email="noreply@test", dispatch_alert_email="d@test"), patch.object(
            dispatch_alert.smtplib, "SMTP", BrokenSMTP
        ):
            dispatch_alert.send_dispatch_alert({"id": 8, "name": "A", "phone": "1"}, "http://x")


if __name__ == "__main__":
    unittest.main()
