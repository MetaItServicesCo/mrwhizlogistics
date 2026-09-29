import json
import unittest
from copy import deepcopy
from pathlib import Path

from tests.site_pages_app import make_app, headers
from fastapi.testclient import TestClient
from app.core.rental_content import DEFAULTS, PAGE_KEY, ensure_rental_content
from app.models.rental import RentalItem, RentalQuote
from app.models.site_setting import SiteSetting


class RentalContentTests(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        with self.app.state.test_sessions() as db:
            ensure_rental_content(db)
        self.client = TestClient(self.app)
        self.auth = headers()

    def tearDown(self):
        self.client.close()
        self.app.state.test_engine.dispose()

    def new_item(self, **values):
        return {"title": "Test rental", "slug": "test-rental", "desc": "Test equipment description",
                "images": ["/images/test.jpg"], "is_active": False, **values}

    def test_seed_preserves_all_seven_original_rentals_and_page_content(self):
        response = self.client.get("/api/rental-content/items")
        self.assertEqual(response.status_code, 200)
        for original, live in zip(DEFAULTS["items"], response.json(), strict=True):
            for key, value in original.items():
                self.assertEqual(live[key], value, key)
        self.assertEqual(self.client.get("/api/rental-content/page").json(), DEFAULTS["page"])
        frontend_defaults = Path(__file__).resolve().parents[2] / "frontend/src/data/rentalDefaults.json"
        self.assertEqual(json.loads(frontend_defaults.read_text(encoding="utf-8")), DEFAULTS)

    def test_page_sections_and_faqs_save_without_touching_other_settings(self):
        with self.app.state.test_sessions() as db:
            db.add(SiteSetting(key="phone", value="existing-phone"))
            db.commit()
        content = deepcopy(DEFAULTS["page"])
        content["hero"]["title"] = "Custom Rentals"
        content["sections"]["RentalFaq"]["items"] = [{"question": "New FAQ", "answer": "New answer"}]
        content["sections"]["RentalsIntro"]["enabled"] = False
        content["sections"]["HotShotRentals"]["copy"]["rentalEquipment"] = ""
        saved = self.client.put("/api/rental-content/page", json=content, headers=self.auth)
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual(self.client.get("/api/rental-content/page").json(), content)
        with self.app.state.test_sessions() as db:
            ensure_rental_content(db)
            self.assertEqual(db.query(SiteSetting).filter_by(key="phone").one().value, "existing-phone")
        self.assertEqual(self.client.get("/api/rental-content/page").json(), content)

    def test_equipment_crud_drafts_slug_routing_and_sanitization(self):
        payload = self.new_item(content_html='<h2>Details</h2><script>alert(1)</script>', imageAlts=["Equipment photo"])
        result = self.client.post("/api/rental-content/items", json=payload, headers=self.auth)
        self.assertEqual(result.status_code, 201, result.text)
        item_id = result.json()["id"]
        self.assertEqual(self.client.get("/api/rental-content/items/test-rental").status_code, 404)
        self.assertEqual(self.client.get("/api/rental-quotes/equipment/test-rental").status_code, 404)
        payload.update(is_active=True, size="Edited dimensions", sort_order=-1)
        self.assertEqual(self.client.put(f"/api/rental-content/items/{item_id}", json=payload, headers=self.auth).status_code, 200)
        live = self.client.get("/api/rental-content/items/test-rental").json()
        self.assertEqual(live["content_html"], "<h2>Details</h2>")
        self.assertEqual(live["size"], "Edited dimensions")
        self.assertEqual(live["imageAlts"], ["Equipment photo"])
        self.assertEqual(self.client.get("/api/rental-content/items").json()[0]["slug"], "test-rental")
        self.assertEqual(self.client.get("/api/rental-quotes/equipment/test-rental").status_code, 200)
        payload["slug"] = "new-rental-address"
        self.client.put(f"/api/rental-content/items/{item_id}", json=payload, headers=self.auth)
        self.assertEqual(self.client.get("/api/rental-content/items/test-rental").status_code, 404)
        self.assertEqual(self.client.get("/api/rental-content/items/new-rental-address").status_code, 200)
        payload["is_active"] = False
        self.client.put(f"/api/rental-content/items/{item_id}", json=payload, headers=self.auth)
        self.assertEqual(self.client.get("/api/rental-content/items/new-rental-address").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/rental-content/items/{item_id}", headers=self.auth).status_code, 204)

    def test_deleted_defaults_are_not_resurrected_and_empty_collection_stays_empty(self):
        for item in self.client.get("/api/rental-content/items").json():
            self.client.delete(f"/api/rental-content/items/{item['id']}", headers=self.auth)
        with self.app.state.test_sessions() as db:
            ensure_rental_content(db)
        self.assertEqual(self.client.get("/api/rental-content/items").json(), [])
        self.assertEqual(self.client.get("/api/rental-content/items/16-feet-dump-trailer").status_code, 404)

    def test_invalid_and_conflicting_equipment_is_rejected(self):
        for change in ({"slug": "../wrong"}, {"title": " "}, {"availability": "unknown"},
                       {"images": ["javascript:alert(1)"]}, {"images": ["//external.test/x"]},
                       {"hero_image": "data:text/html,unsafe"}, {"is_active": True, "images": []},
                       {"is_active": True, "desc": " "}, {"unexpected": "field"}):
            with self.subTest(change=change):
                response = self.client.post("/api/rental-content/items", json=self.new_item(**change), headers=self.auth)
                self.assertEqual(response.status_code, 422, response.text)
        self.client.post("/api/rental-content/items", json=self.new_item(), headers=self.auth)
        self.assertEqual(self.client.post("/api/rental-content/items", json=self.new_item(), headers=self.auth).status_code, 409)
        for invalid in ({"unknown": "value"}, {"sections": {"RentalFaq": {"items": "bad"}}},
                        {"hero": {"image": "javascript:alert(1)"}}, {"hero": {"title": None}}):
            self.assertEqual(self.client.put("/api/rental-content/page", json=invalid, headers=self.auth).status_code, 422)

    def test_quote_submission_status_and_history_are_unchanged(self):
        item = self.client.get("/api/rental-content/items").json()[0]
        quote = {"customer": {"fullName": "Test Customer", "email": "customer@example.com", "phone": "555-0100"},
                 "rental": {"slug": item["slug"], "name": item["title"], "duration": "weekly"},
                 "logistics": {}, "load": {}, "requirements": {}}
        response = self.client.post("/api/rental-quotes", json=quote)
        self.assertEqual(response.status_code, 201, response.text)
        saved = response.json()
        self.assertEqual(saved["rental"]["name"], item["title"])
        self.assertEqual(saved["status"], "pending")
        self.client.delete(f"/api/rental-content/items/{item['id']}", headers=self.auth)
        quotes = self.client.get("/api/rental-quotes", headers=self.auth).json()
        self.assertEqual(quotes[0]["rental"], saved["rental"])
        updated = self.client.patch(f"/api/rental-quotes/{saved['id']}", json={"status": "booked"}, headers=self.auth)
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["status"], "booked")
        with self.app.state.test_sessions() as db:
            self.assertEqual(db.query(RentalQuote).count(), 1)

    def test_all_writes_and_draft_list_require_active_admin(self):
        for auth in ({}, headers(2)):
            for method, path, payload in (
                ("GET", "/api/rental-content/items/all", None),
                ("POST", "/api/rental-content/items", self.new_item()),
                ("PUT", "/api/rental-content/items/1", self.new_item()),
                ("DELETE", "/api/rental-content/items/1", None),
                ("PUT", "/api/rental-content/page", DEFAULTS["page"]),
            ):
                self.assertEqual(self.client.request(method, path, json=payload, headers=auth).status_code, 401)


if __name__ == "__main__":
    unittest.main()
