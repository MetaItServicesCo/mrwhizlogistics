import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.newsletter import unsubscribe_token
from app.models.newsletter import NewsletterDelivery
from app.models.subscriber import Subscriber
from tests.site_pages_app import headers, make_app


class FakeMailer:
    sent = []
    fail_for = set()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return None

    def send(self, recipient, subject, content_html, preview_text, unsubscribe_url):
        if recipient in self.fail_for:
            raise RuntimeError("provider rejected recipient")
        self.sent.append((recipient, subject, content_html, unsubscribe_url))


class NewsletterTests(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        self.client = TestClient(self.app)
        self.auth = headers()
        FakeMailer.sent = []
        FakeMailer.fail_for = set()

    def tearDown(self):
        self.client.close()
        self.app.state.test_engine.dispose()

    def subscribe(self, email):
        return self.client.post("/api/public/subscribers", json={"email": email})

    def campaign(self, **values):
        body = {"subject": "Dispatch update", "preview_text": "Latest news", "content_html": "<h2>Update</h2><p>Safe hauling.</p>"}
        body.update(values)
        return self.client.post("/api/newsletter/campaigns", json=body, headers=self.auth)

    def test_subscribe_normalises_reactivates_and_signed_unsubscribe_works(self):
        first = self.subscribe("Driver@Example.com")
        self.assertEqual(first.status_code, 201, first.text)
        self.assertEqual(first.json()["email"], "driver@example.com")
        subscriber_id = first.json()["id"]
        token = unsubscribe_token(subscriber_id, "driver@example.com")
        removed = self.client.post("/api/public/subscribers/unsubscribe", json={"token": token})
        self.assertEqual(removed.status_code, 200, removed.text)
        with self.app.state.test_sessions() as db:
            self.assertFalse(db.get(Subscriber, subscriber_id).is_active)
        again = self.subscribe("driver@example.com")
        self.assertEqual(again.json()["id"], subscriber_id)
        self.assertTrue(again.json()["is_active"])
        self.assertIsNone(again.json()["unsubscribed_at"])

    def test_invalid_unsubscribe_token_changes_nothing(self):
        subscriber_id = self.subscribe("driver@example.com").json()["id"]
        response = self.client.post("/api/public/subscribers/unsubscribe", json={"token": "tampered"})
        self.assertEqual(response.status_code, 400)
        with self.app.state.test_sessions() as db:
            self.assertTrue(db.get(Subscriber, subscriber_id).is_active)

    def test_campaign_crud_sanitises_html_and_requires_admin(self):
        self.assertEqual(self.client.get("/api/newsletter/campaigns").status_code, 401)
        created = self.campaign(content_html='<p onclick="bad()">Hello</p><script>bad()</script>')
        self.assertEqual(created.status_code, 201, created.text)
        self.assertNotIn("script", created.json()["content_html"])
        campaign_id = created.json()["id"]
        edited = self.client.put(f"/api/newsletter/campaigns/{campaign_id}", json={"subject": "Revised"}, headers=self.auth)
        self.assertEqual(edited.json()["subject"], "Revised")
        self.assertEqual(self.client.delete(f"/api/newsletter/campaigns/{campaign_id}", headers=self.auth).status_code, 204)

    @patch("app.routes.newsletter.NewsletterMailer", FakeMailer)
    def test_test_send_does_not_mark_campaign_sent(self):
        campaign_id = self.campaign().json()["id"]
        response = self.client.post(f"/api/newsletter/campaigns/{campaign_id}/test", json={"email": "owner@example.com"}, headers=self.auth)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(len(FakeMailer.sent), 1)
        saved = self.client.get(f"/api/newsletter/campaigns/{campaign_id}", headers=self.auth).json()
        self.assertEqual(saved["status"], "draft")

    @patch("app.routes.newsletter.NewsletterMailer", FakeMailer)
    def test_live_send_records_delivery_blocks_duplicate_and_sent_edits(self):
        self.subscribe("one@example.com")
        self.subscribe("two@example.com")
        campaign_id = self.campaign().json()["id"]
        response = self.client.post(f"/api/newsletter/campaigns/{campaign_id}/send", headers=self.auth)
        self.assertEqual(response.status_code, 200, response.text)
        campaign = response.json()["campaign"]
        self.assertEqual((campaign["status"], campaign["delivered_count"]), ("sent", 2))
        self.assertEqual(len(FakeMailer.sent), 2)
        self.assertEqual(self.client.post(f"/api/newsletter/campaigns/{campaign_id}/send", headers=self.auth).status_code, 409)
        self.assertEqual(self.client.put(f"/api/newsletter/campaigns/{campaign_id}", json={"subject": "Changed"}, headers=self.auth).status_code, 409)

    @patch("app.routes.newsletter.NewsletterMailer", FakeMailer)
    def test_retry_only_resends_failed_recipients(self):
        self.subscribe("ok@example.com")
        self.subscribe("retry@example.com")
        campaign_id = self.campaign().json()["id"]
        FakeMailer.fail_for = {"retry@example.com"}
        first = self.client.post(f"/api/newsletter/campaigns/{campaign_id}/send", headers=self.auth).json()["campaign"]
        self.assertEqual((first["status"], first["delivered_count"], first["failed_count"]), ("failed", 1, 1))
        FakeMailer.fail_for = set()
        second = self.client.post(f"/api/newsletter/campaigns/{campaign_id}/send", headers=self.auth).json()["campaign"]
        self.assertEqual((second["status"], second["delivered_count"], second["failed_count"]), ("sent", 2, 0))
        self.assertEqual([item[0] for item in FakeMailer.sent], ["ok@example.com", "retry@example.com"])
        with self.app.state.test_sessions() as db:
            self.assertEqual(db.query(NewsletterDelivery).count(), 2)


if __name__ == "__main__":
    unittest.main()
