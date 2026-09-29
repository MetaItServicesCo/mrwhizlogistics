import unittest
from unittest.mock import patch

from tests.site_pages_app import headers, make_app
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.standard_pages import ensure_standard_pages
from app.models.page import Page
from app.models.seo import SEO


class SitePagesTests(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        self.client = TestClient(self.app)
        self.auth = headers()

    def tearDown(self):
        self.client.close()
        self.app.state.test_engine.dispose()

    def create(self, **fields):
        body = dict(title="Shipping guide", slug="shipping-guide", page_type="custom",
                    content="<h2>Shipping safely</h2><p>Pack your freight.</p>",
                    is_active=False, show_in_footer=True)
        body.update(fields)
        return self.client.post("/api/pages", json=body, headers=self.auth)

    def update(self, page_id, **fields):
        return self.client.patch(f"/api/pages/{page_id}", json=fields, headers=self.auth)

    def public_slugs(self, footer=False):
        return [p["slug"] for p in self.client.get(
            "/api/public/pages", params={"footer": footer}).json()]

    def test_complete_publish_edit_rename_unpublish_delete_workflow(self):
        created = self.create(seo={"meta_title": "Freight guide", "meta_description": "Packing advice"})
        self.assertEqual(created.status_code, 201, created.text)
        page_id = created.json()["id"]
        self.assertEqual(self.client.get("/api/public/pages/shipping-guide").status_code, 404)
        self.assertNotIn("shipping-guide", self.public_slugs())
        self.assertEqual(self.update(page_id, is_active=True).status_code, 200)
        live = self.client.get("/api/public/pages/shipping-guide").json()
        self.assertEqual(live["meta_title"], "Freight guide")
        self.assertIn("<h2>Shipping safely</h2>", live["content"])
        self.assertIn("shipping-guide", self.public_slugs(footer=True))
        self.assertEqual(self.update(page_id, content="<p>Updated immediately.</p>",
                                     slug="freight-guide").status_code, 200)
        self.assertEqual(self.client.get("/api/public/pages/shipping-guide").status_code, 404)
        self.assertEqual(self.client.get("/api/public/pages/freight-guide").json()["content"],
                         "<p>Updated immediately.</p>")
        self.assertEqual(self.update(page_id, is_active=False).status_code, 200)
        self.assertEqual(self.client.get("/api/public/pages/freight-guide").status_code, 404)
        self.assertNotIn("freight-guide", self.public_slugs())
        self.assertEqual(self.client.delete(f"/api/pages/{page_id}", headers=self.auth).status_code, 204)
        with self.app.state.test_sessions() as db:
            self.assertIsNone(db.get(Page, page_id))
            self.assertIsNone(db.query(SEO).filter_by(page_id=page_id).first())

    def test_footer_switch_does_not_unpublish_and_order_is_stable(self):
        self.create(slug="later", is_active=True, sort_order=20)
        first = self.create(slug="first", is_active=True, sort_order=10).json()
        self.create(slug="unlinked", is_active=True, show_in_footer=False)
        self.assertEqual(self.public_slugs(True), ["first", "later"])
        self.assertIn("unlinked", self.public_slugs())
        self.assertEqual(self.client.get("/api/public/pages/unlinked").status_code, 200)
        self.update(first["id"], show_in_footer=False)
        self.assertEqual(self.public_slugs(True), ["later"])
        self.assertEqual(self.client.get("/api/public/pages/first").status_code, 200)

    def test_all_standard_pages_stay_drafts_and_are_protected(self):
        pages = self.client.get("/api/pages", headers=self.auth).json()
        self.assertEqual(len(pages), 3)
        for page in pages:
            self.assertFalse(page["is_active"])
            self.assertEqual(self.update(page["id"], slug="renamed").status_code, 400)
            self.assertEqual(self.update(page["id"], page_type="home").status_code, 400)
            self.assertEqual(self.client.delete(f"/api/pages/{page['id']}", headers=self.auth).status_code, 400)
            self.assertEqual(self.update(page["id"], is_active=True).status_code, 200)
            self.assertEqual(self.client.get(f"/api/public/pages/{page['slug']}").status_code, 200)

    def test_startup_preserves_legal_copy_and_explicit_footer_opt_out(self):
        with self.app.state.test_sessions() as db:
            page = db.query(Page).filter_by(slug="terms").one()
            page.title = "Reviewed terms"
            page.content = "<p>Reviewed business terms.</p>"
            page.is_active = True
            page.show_in_footer = False
            db.commit()
            # Simulate a column added to an existing production database.
            db.execute(text("UPDATE pages SET show_in_footer = NULL WHERE slug = 'privacy-policy'"))
            db.commit()
            old_date = db.query(Page).filter_by(slug="privacy-policy").one().updated_at
            ensure_standard_pages(db)
            ensure_standard_pages(db)
            db.expire_all()
            self.assertEqual(db.query(Page).count(), 3)
            self.assertEqual(page.content, "<p>Reviewed business terms.</p>")
            self.assertEqual(page.title, "Reviewed terms")
            self.assertTrue(page.is_active)
            self.assertFalse(page.show_in_footer)
            self.assertTrue(db.query(Page).filter_by(slug="privacy-policy").one().show_in_footer)
            self.assertEqual(db.query(Page).filter_by(slug="privacy-policy").one().updated_at, old_date)

    def test_reserved_invalid_and_duplicate_addresses(self):
        for slug in ("about", "dashboard", "api", "uploads", "blog", "quote", "two--words",
                     "a/b", "has space", "a" * 101, "../outside", "has?query"):
            with self.subTest(slug=slug):
                self.assertEqual(self.create(slug=slug).status_code, 400)
        self.assertEqual(self.create(slug=" /Shipping-Guide/ ").status_code, 201)
        self.assertEqual(self.create().status_code, 409)
        second = self.create(slug="second").json()
        self.assertEqual(self.update(second["id"], slug="shipping-guide").status_code, 409)

    def test_database_collision_is_reported_even_if_precheck_races(self):
        self.create()
        with patch("app.routes.pages._check_content_page"):
            response = self.create()
        self.assertEqual(response.status_code, 409, response.text)

    def test_blank_or_script_only_content_cannot_publish(self):
        for content in (None, "", "<p></p>", "<p>&nbsp;</p>", "<script>alert(1)</script>"):
            with self.subTest(content=content):
                self.assertEqual(self.create(content=content, is_active=True).status_code, 400)
        draft = self.create(content=None).json()
        self.assertEqual(self.update(draft["id"], is_active=True).status_code, 400)
        self.assertEqual(self.update(draft["id"], content="<p>Ready</p>", is_active=True).status_code, 200)
        self.assertEqual(self.update(draft["id"], content="<p><br></p>").status_code, 400)

    def test_rich_content_is_sanitized_without_losing_supported_formatting(self):
        response = self.create(is_active=True, content=(
            '<h2>Guide</h2><ul><li><strong>Secure freight</strong></li></ul>'
            '<a href="https://example.com">Read more</a>'
            '<img src="/uploads/test.png" alt="Freight" onerror="alert(1)">'
            '<script>alert(1)</script><a href="javascript:alert(1)">Bad link</a>'))
        self.assertEqual(response.status_code, 201, response.text)
        html = self.client.get("/api/public/pages/shipping-guide").json()["content"]
        for unsafe in ("<script", "onerror", "javascript:"):
            self.assertNotIn(unsafe, html)
        for supported in ("<h2>", "<ul>", "<strong>", 'alt="Freight"', 'href="https://example.com"'):
            self.assertIn(supported, html)

    def test_invalid_patch_fields_do_not_damage_saved_page(self):
        page = self.create().json()
        for field in ("title", "slug", "page_type", "is_active", "sort_order", "show_in_footer"):
            with self.subTest(field=field):
                self.assertEqual(self.update(page["id"], **{field: None}).status_code, 422)
        self.assertEqual(self.update(page["id"], title=" " * 5).status_code, 400)
        self.assertEqual(self.update(page["id"], title="x" * 256).status_code, 422)
        saved = self.client.get(f"/api/pages/{page['id']}", headers=self.auth).json()
        self.assertEqual(saved["title"], "Shipping guide")

    def test_existing_non_content_pages_do_not_leak_or_convert_to_reserved_routes(self):
        home = self.create(slug="home", page_type="home", is_active=True).json()
        self.assertNotIn("home", self.public_slugs())
        self.assertEqual(self.client.get("/api/public/pages/home").status_code, 404)
        self.assertEqual(self.update(home["id"], page_type="custom").status_code, 400)
        self.assertEqual(self.update(home["id"], title="Homepage title").status_code, 200)

    def test_authentication_is_still_required_for_every_management_endpoint(self):
        page = self.create().json()
        for auth in ({}, headers(2)):
            for method, path, body in (
                ("GET", "/api/pages", None),
                ("GET", f"/api/pages/{page['id']}", None),
                ("POST", "/api/pages", {"title": "Unauthorised", "slug": "unauthorised"}),
                ("PATCH", f"/api/pages/{page['id']}", {"title": "Unauthorised"}),
                ("DELETE", f"/api/pages/{page['id']}", None),
            ):
                with self.subTest(method=method, auth=bool(auth)):
                    self.assertEqual(self.client.request(method, path, json=body, headers=auth).status_code, 401)

    def test_partial_seo_edit_preserves_other_fields_and_can_clear_title(self):
        page = self.create(is_active=True, seo={"meta_title": "Title", "meta_description": "Description"}).json()
        self.update(page["id"], seo={"meta_title": "Revised"})
        live = self.client.get("/api/public/pages/shipping-guide").json()
        self.assertEqual(live["meta_title"], "Revised")
        self.assertEqual(live["meta_description"], "Description")
        self.update(page["id"], seo={"meta_title": ""})
        self.assertIsNone(self.client.get("/api/public/pages/shipping-guide").json()["meta_title"])


if __name__ == "__main__":
    unittest.main()
