"""Run the real built frontend against disposable rental data, on loopback only."""
from html import unescape
import httpx
from tests import smoke_site_pages as runner
from tests.site_pages_app import headers


def rental_workflow(api_origin, site_origin):
    # Also recheck unrelated public routes and the previous Site pages workflow.
    original_workflow(api_origin, site_origin)
    with httpx.Client(base_url=api_origin, headers=headers(), timeout=20, trust_env=False) as api, \
         httpx.Client(base_url=site_origin, timeout=45, trust_env=False, headers={"User-Agent": "Googlebot"}) as site:
        rentals = api.get("/api/rental-content/items").json()
        assert len(rentals) == 7
        listing = unescape(site.get("/rentals").text)
        for item in rentals:
            assert item["title"] in listing
            detail = site.get(f"/rentals/{item['slug']}")
            assert detail.status_code == 200
            assert item["title"] in unescape(detail.text)
            assert item["size"] in unescape(detail.text)
        assert site.get("/dashboard/pages/rentals").status_code == 200
        assert site.get("/dashboard/rentals").status_code == 200
        print("PASS: seven existing rental URLs, listing, new editor and unchanged quote inbox render", flush=True)
        content = api.get("/api/rental-content/page").json()
        content["hero"]["title"] = "Smoke Editable Rental Heading"
        content["hero"]["image"] = "/images/rental-banner-test.jpg"
        content["seo"]["metaDescription"] = "Smoke rental SEO description"
        content["sections"]["RentalFaq"]["items"] = [{"question": "Smoke rental question?", "answer": "Smoke rental answer."}]
        content["sections"]["RentalsIntro"]["enabled"] = False
        response = api.put("/api/rental-content/page", json=content)
        assert response.status_code == 200, response.text
        listing = unescape(site.get("/rentals").text)
        for marker in ("Smoke Editable Rental Heading", "Smoke rental question?", "Smoke rental answer.",
                       "Smoke rental SEO description", "/images/rental-banner-test.jpg"):
            assert marker in listing, marker
        assert "Logistics Equipment Rental" not in listing
        print("PASS: page headings, banner image, SEO, FAQ and section visibility update without rebuild", flush=True)
        payload = {"slug": "smoke-new-rental", "title": "Smoke New Equipment", "desc": "Smoke equipment description",
                   "images": ["/images/test.jpg"], "imageAlts": ["Smoke equipment alt"], "content_html": "<h2>Smoke rich content</h2>",
                   "size": "Smoke dimensions", "priceHint": "Smoke custom rate", "meta_title": "Smoke Equipment SEO",
                   "is_active": False}
        created = api.post("/api/rental-content/items", json=payload)
        assert created.status_code == 201, created.text
        item_id = created.json()["id"]
        assert site.get("/rentals/smoke-new-rental").status_code == 404
        assert "smoke-new-rental" not in site.get("/sitemap.xml").text
        payload["is_active"] = True
        assert api.put(f"/api/rental-content/items/{item_id}", json=payload).status_code == 200
        assert "Smoke New Equipment" in site.get("/rentals").text
        live = site.get("/rentals/smoke-new-rental")
        assert live.status_code == 200
        for marker in ("Smoke dimensions", "Smoke custom rate", "Smoke Equipment SEO", "Smoke equipment alt", "<h2>Smoke rich content</h2>"):
            assert marker in live.text, marker
        assert "/rentals/smoke-new-rental" in site.get("/sitemap.xml").text
        # Quote and call destinations still use the existing CTA system.
        assert "/contact?rental=smoke-new-rental" in unescape(live.text)
        payload.update(slug="smoke-renamed-rental", desc="Smoke updated description")
        assert api.put(f"/api/rental-content/items/{item_id}", json=payload).status_code == 200
        assert site.get("/rentals/smoke-new-rental").status_code == 404
        assert "Smoke updated description" in site.get("/rentals/smoke-renamed-rental").text
        payload["is_active"] = False
        api.put(f"/api/rental-content/items/{item_id}", json=payload)
        assert site.get("/rentals/smoke-renamed-rental").status_code == 404
        assert "smoke-renamed-rental" not in site.get("/sitemap.xml").text
        api.delete(f"/api/rental-content/items/{item_id}")
        # Real 404s must not revive deleted bundled rentals.
        api.delete(f"/api/rental-content/items/{rentals[0]['id']}")
        assert site.get(f"/rentals/{rentals[0]['slug']}").status_code == 404
        print("PASS: draft/publish/edit/rename/unpublish/delete, rich HTML, image alt, sitemap and quote links", flush=True)


original_workflow = runner.workflow
if __name__ == "__main__":
    runner.workflow = rental_workflow
    runner.main("tests.rental_test_app:make_app")
