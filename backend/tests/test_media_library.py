"""Media Library: SEO-friendly upload names, listing, usage check, safe delete.

Run from backend: venv/Scripts/python.exe -m unittest tests.test_media_library -v
"""

import os
import shutil
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from tests.site_pages_app import headers, make_app  # isort: skip  (sets the test environment first)
from app.models.site_setting import SiteSetting
from app.routes import uploads as uploads_module

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64


class MediaLibraryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.dir_patch = patch.object(uploads_module, "UPLOAD_DIR", self.tmp)
        self.dir_patch.start()
        self.app = make_app()
        self.client = TestClient(self.app)
        self.auth = headers()

    def tearDown(self):
        self.client.close()
        self.app.state.test_engine.dispose()
        self.dir_patch.stop()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def upload(self, filename="photo.png", name=None, content_type="image/png", data=PNG):
        form = {"name": name} if name is not None else {}
        return self.client.post("/api/uploads/image", files={"file": (filename, data, content_type)}, data=form, headers=self.auth)

    def test_seo_friendly_names(self):
        r = self.upload(name="Box Truck – Dallas!")
        self.assertEqual(r.status_code, 200, r.text)
        body = r.json()
        self.assertRegex(body["name"], r"^box-truck-dallas-[0-9a-f]{6}\.png$")
        self.assertEqual(body["url"], f"/uploads/{body['name']}")
        self.assertTrue(os.path.isfile(os.path.join(self.tmp, body["name"])))
        # Original file name is used when no name is given...
        self.assertRegex(self.upload(filename="Hot Shot Trailer.png").json()["name"], r"^hot-shot-trailer-[0-9a-f]{6}\.png$")
        # ...but meaningless camera/clipboard names fall back to a random name.
        for generic in ("IMG_2041.png", "image.png", "screenshot 2026.png"):
            self.assertRegex(self.upload(filename=generic).json()["name"], r"^[0-9a-f]{32}\.png$", generic)

    def test_rejects_bad_files_and_requires_login(self):
        self.assertEqual(self.upload(content_type="image/svg+xml").status_code, 415)
        self.assertEqual(self.upload(data=b"").status_code, 400)
        self.assertEqual(self.client.get("/api/uploads").status_code, 401)

    def test_list_newest_first_with_search(self):
        a = self.upload(name="first trailer").json()["name"]
        b = self.upload(name="second truck").json()["name"]
        os.utime(os.path.join(self.tmp, a), (1_000_000, 1_000_000))
        listing = self.client.get("/api/uploads", headers=self.auth).json()
        self.assertEqual([i["name"] for i in listing["items"]], [b, a])
        self.assertEqual(listing["total"], 2)
        self.assertEqual([i["name"] for i in self.client.get("/api/uploads?q=truck", headers=self.auth).json()["items"]], [b])

    def test_usage_check_blocks_deleting_images_in_use(self):
        name = self.upload(name="logo").json()["name"]
        with self.app.state.test_sessions() as db:
            db.add(SiteSetting(key="footer_logo_url", value=f"/uploads/{name}"))
            db.commit()
        usage = self.client.get(f"/api/uploads/{name}/usage", headers=self.auth).json()
        self.assertEqual([(u["table"], u["label"]) for u in usage["used_in"]], [("site_settings", "footer_logo_url")])
        r = self.client.delete(f"/api/uploads/{name}", headers=self.auth)
        self.assertEqual(r.status_code, 409)
        self.assertIn("still used", r.json()["detail"])
        self.assertTrue(os.path.isfile(os.path.join(self.tmp, name)))
        self.assertEqual(self.client.delete(f"/api/uploads/{name}?force=true", headers=self.auth).status_code, 204)
        self.assertFalse(os.path.isfile(os.path.join(self.tmp, name)))

    def test_unused_image_deletes_and_paths_are_safe(self):
        name = self.upload(name="spare").json()["name"]
        self.assertEqual(self.client.delete(f"/api/uploads/{name}", headers=self.auth).status_code, 204)
        for bad in ("..%2Fapp%2Fmain.py", "missing.png", "UPPER.png"):
            self.assertEqual(self.client.delete(f"/api/uploads/{bad}", headers=self.auth).status_code, 404, bad)


if __name__ == "__main__":
    unittest.main()
