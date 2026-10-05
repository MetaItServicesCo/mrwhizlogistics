"""Recently deleted: every dashboard delete is restorable for 7 days.

Run from backend: venv/Scripts/python.exe -m unittest tests.test_recycle_bin -v
"""

import unittest
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from tests.site_pages_app import headers, make_app  # isort: skip  (sets the test environment first)
from app.core.recycle_bin import DeletedItem
from app.models.blog import Blog, BlogComment
from app.models.faq import FAQ, FAQCategory
from app.models.site_setting import SiteSetting


def blog(**kw):
    data = dict(card_id="C-1", title="Choosing a trailer", slug="choosing-a-trailer", publish_date="2026-01-01",
                read_time="3 min", category_tag="Freight", card_image="/x.jpg", short_description="About trailers")
    data.update(kw)
    return Blog(**data)


class RecycleBinTests(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        self.client = TestClient(self.app)
        self.auth = headers()
        self.db = self.app.state.test_sessions

    def tearDown(self):
        self.client.close()
        self.app.state.test_engine.dispose()

    def bin(self):
        resp = self.client.get("/api/recycle-bin", headers=self.auth)
        self.assertEqual(resp.status_code, 200, resp.text)
        return resp.json()

    def test_requires_login(self):
        self.assertEqual(self.client.get("/api/recycle-bin").status_code, 401)

    def test_blog_with_comments_and_replies_round_trip(self):
        with self.db() as db:
            post = blog()
            db.add(post)
            db.flush()
            top = BlogComment(blog_id=post.id, name="Ana", email="a@x.com", message="Great", is_approved=True)
            db.add(top)
            db.flush()
            db.add(BlogComment(blog_id=post.id, parent_id=top.id, name="Mr Whiz", email="m@x.com", message="Thanks", is_approved=True))
            db.commit()
            post_id, top_id = post.id, top.id

        resp = self.client.delete("/api/blogs/C-1", headers=self.auth)
        self.assertIn(resp.status_code, (200, 204), resp.text)
        with self.db() as db:
            self.assertIsNone(db.get(Blog, post_id))
            self.assertEqual(db.query(BlogComment).count(), 0)

        items = self.bin()
        self.assertEqual(len(items), 1)
        item = items[0]
        self.assertEqual((item["type_label"], item["title"], item["item_count"]), ("Blog post", "Choosing a trailer", 3))
        self.assertEqual(item["included"], ["2 Blog comments"])
        self.assertEqual(item["deleted_by"], "test-admin")
        deleted_at = datetime.fromisoformat(item["deleted_at"])
        self.assertEqual(datetime.fromisoformat(item["expires_at"]) - deleted_at, timedelta(days=7))

        resp = self.client.post(f"/api/recycle-bin/{item['id']}/restore", headers=self.auth)
        self.assertEqual(resp.status_code, 200, resp.text)
        self.assertEqual(resp.json()["restored"], 3)
        with self.db() as db:
            restored = db.get(Blog, post_id)
            self.assertEqual(restored.slug, "choosing-a-trailer")  # same id and content
            reply = db.query(BlogComment).filter(BlogComment.parent_id == top_id).one()
            self.assertEqual(reply.message, "Thanks")
        self.assertEqual(self.bin(), [])

    def test_child_deleted_alone_is_its_own_item(self):
        with self.db() as db:
            post = blog()
            db.add(post)
            db.flush()
            c = BlogComment(blog_id=post.id, name="Ana", email="a@x.com", message="Spam?", is_approved=False)
            db.add(c)
            db.commit()
            cid = c.id
        self.client.delete(f"/api/blogs/comments/{cid}", headers=self.auth)
        items = self.bin()
        self.assertEqual([(i["type_label"], i["item_count"]) for i in items], [("Blog comment", 1)])
        self.assertEqual(self.client.post(f"/api/recycle-bin/{items[0]['id']}/restore", headers=self.auth).status_code, 200)
        with self.db() as db:
            self.assertIsNotNone(db.get(BlogComment, cid))

    def test_restoring_a_child_whose_parent_is_deleted_explains(self):
        with self.db() as db:
            cat = FAQCategory(name="Hot Shot")
            db.add(cat)
            db.flush()
            faq = FAQ(category_id=cat.id, question="How fast?", answer="Same day")
            db.add(faq)
            db.commit()
            cat_id, faq_id = cat.id, faq.id
        self.client.delete(f"/api/faqs/{faq_id}", headers=self.auth)
        self.client.delete(f"/api/faq-categories/{cat_id}", headers=self.auth)
        items = {i["type_label"]: i for i in self.bin()}
        resp = self.client.post(f"/api/recycle-bin/{items['FAQ']['id']}/restore", headers=self.auth)
        self.assertEqual(resp.status_code, 409)
        self.assertIn('"Hot Shot", which was also deleted. Restore that first', resp.json()["detail"])
        # Parent first, then the FAQ.
        self.assertEqual(self.client.post(f"/api/recycle-bin/{items['FAQ category']['id']}/restore", headers=self.auth).status_code, 200)
        self.assertEqual(self.client.post(f"/api/recycle-bin/{items['FAQ']['id']}/restore", headers=self.auth).status_code, 200)
        with self.db() as db:
            self.assertEqual(db.get(FAQ, faq_id).category_id, cat_id)

    def test_conflict_when_name_reused(self):
        row = self.client.post("/api/settings", json={"key": "promo_banner", "value": "old", "label": "x"}, headers=self.auth).json()
        self.client.delete(f"/api/settings/{row['id']}", headers=self.auth)
        self.client.post("/api/settings", json={"key": "promo_banner", "value": "new", "label": "x"}, headers=self.auth)
        item = self.bin()[0]
        resp = self.client.post(f"/api/recycle-bin/{item['id']}/restore", headers=self.auth)
        self.assertEqual(resp.status_code, 409)
        self.assertIn("uses the same address, name or email", resp.json()["detail"])
        self.assertEqual(len(self.bin()), 1)  # still restorable after resolving the conflict
        with self.db() as db:
            self.assertEqual(db.query(SiteSetting).filter_by(key="promo_banner").one().value, "new")

    def test_delete_forever_and_expiry(self):
        row = self.client.post("/api/settings", json={"key": "temp", "value": "1", "label": "x"}, headers=self.auth).json()
        self.client.delete(f"/api/settings/{row['id']}", headers=self.auth)
        item = self.bin()[0]
        self.assertEqual(self.client.delete(f"/api/recycle-bin/{item['id']}", headers=self.auth).status_code, 204)
        self.assertEqual(self.bin(), [])
        self.assertEqual(self.client.post(f"/api/recycle-bin/{item['id']}/restore", headers=self.auth).status_code, 404)

        row = self.client.post("/api/settings", json={"key": "old", "value": "1", "label": "x"}, headers=self.auth).json()
        self.client.delete(f"/api/settings/{row['id']}", headers=self.auth)
        with self.db() as db:
            db.query(DeletedItem).update({DeletedItem.deleted_at: datetime.utcnow() - timedelta(days=8)})
            db.commit()
        self.assertEqual(self.bin(), [])  # older than 7 days: purged

    def test_failed_delete_leaves_nothing_in_the_bin(self):
        with self.db() as db:
            db.info["user_id"] = 1
            row = SiteSetting(key="keep", value="1")
            db.add(row)
            db.commit()
            db.delete(row)
            db.flush()
            db.rollback()  # the delete is abandoned
        self.assertEqual(self.bin(), [])

    def test_type_filter(self):
        for key in ("a1", "a2"):
            row = self.client.post("/api/settings", json={"key": key, "value": "1", "label": "x"}, headers=self.auth).json()
            self.client.delete(f"/api/settings/{row['id']}", headers=self.auth)
        resp = self.client.get("/api/recycle-bin?type=site_settings", headers=self.auth).json()
        self.assertEqual(len(resp), 2)
        self.assertEqual(self.client.get("/api/recycle-bin?type=blogs", headers=self.auth).json(), [])


if __name__ == "__main__":
    unittest.main()
