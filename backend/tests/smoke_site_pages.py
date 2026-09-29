"""Real production-frontend + isolated-API publishing regression check.

Build frontend first, then run from backend:
    venv/Scripts/python.exe -m tests.smoke_site_pages

Both servers bind only to loopback on unused ports. The API uses an in-memory
database, not backend/.env. Only the processes started here are stopped.
"""
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time

import httpx

from tests.site_pages_app import headers

BACKEND = Path(__file__).resolve().parents[1]
FRONTEND = BACKEND.parent / "frontend"


def free_port():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def wait_ready(url, process):
    deadline = time.monotonic() + 90
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"Test server exited with {process.returncode}")
        try:
            if httpx.get(url, timeout=3, trust_env=False).status_code == 200:
                return
        except httpx.HTTPError:
            pass
        time.sleep(0.25)
    raise RuntimeError(f"Test server did not become ready: {url}")


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def workflow(api_origin, site_origin):
    with httpx.Client(base_url=api_origin, headers=headers(), timeout=20, trust_env=False) as api, \
         httpx.Client(base_url=site_origin, timeout=45, trust_env=False,
                      headers={"User-Agent": "Googlebot"}) as site:
        # A bot user agent asks Next for the complete HTML, so missing pages
        # return their real 404 instead of the streaming response's initial 200.
        for path in ("/", "/about", "/contact", "/blog", "/hot-shot", "/box-truck",
                     "/semi-truck", "/rentals", "/login", "/register",
                     "/dashboard/pages/legal", "/dashboard/pages/site"):
            response = site.get(path)
            check(response.status_code == 200, f"Existing route failed: {path}: {response.status_code}")
        print("PASS: existing public routes, authentication pages and both page editors render", flush=True)

        created = api.post("/api/pages", json={
            "title": "Smoke Shipping Guide", "slug": "smoke-shipping-guide", "page_type": "custom",
            "is_active": False, "show_in_footer": True,
            "content": "<h2>Smoke Heading</h2><p>Smoke original content.</p>",
            "seo": {"meta_title": "Smoke SEO Title", "meta_description": "Smoke SEO description"},
        })
        check(created.status_code == 201, created.text)
        page_id = created.json()["id"]
        path = "/smoke-shipping-guide"
        check(site.get(path).status_code == 404, "Draft should be a real 404")
        check(path not in site.get("/sitemap.xml").text, "Draft leaked into sitemap")
        check(f'href="{path}"' not in site.get("/about").text, "Draft leaked into footer")
        print("PASS: drafts are hidden from direct URLs, sitemap and footer", flush=True)

        check(api.patch(f"/api/pages/{page_id}", json={"is_active": True}).status_code == 200, "Publish failed")
        live = site.get(path)
        check(live.status_code == 200, "New slug not served immediately")
        for marker in ("<h2>Smoke Heading</h2>", "Smoke original content.", "Smoke SEO Title", "Smoke SEO description"):
            check(marker in live.text, f"Missing page/SEO content: {marker}")
        check(f'href="{path}"' in site.get("/about").text, "Footer missing published link")
        check(path in site.get("/sitemap.xml").text, "Published page missing in sitemap")
        print("PASS: publishing immediately updates direct URL, HTML, metadata, footer and sitemap", flush=True)

        edited = api.patch(f"/api/pages/{page_id}", json={
            "content": "<p>Smoke revised content.</p>", "show_in_footer": False,
        })
        check(edited.status_code == 200, edited.text)
        live = site.get(path)
        check("Smoke revised content." in live.text and "Smoke original content." not in live.text,
              "Rendered content remained stale")
        check(f'href="{path}"' not in site.get("/about").text, "Footer opt-out ignored")
        check(path in site.get("/sitemap.xml").text, "Footer opt-out must not remove sitemap entry")
        check(api.patch(f"/api/pages/{page_id}", json={"slug": "smoke-renamed"}).status_code == 200,
              "Rename failed")
        check(site.get(path).status_code == 404, "Old address still served after rename")
        check(site.get("/smoke-renamed").status_code == 200, "Renamed address unavailable")
        print("PASS: edits are fresh, footer is optional and renamed slugs route correctly", flush=True)

        check(api.patch(f"/api/pages/{page_id}", json={"is_active": False}).status_code == 200,
              "Unpublish failed")
        check(site.get("/smoke-renamed").status_code == 404, "Unpublished page still accessible")
        check("/smoke-renamed" not in site.get("/sitemap.xml").text, "Unpublished page still in sitemap")
        check(api.patch(f"/api/pages/{page_id}", json={"is_active": True}).status_code == 200,
              "Republish failed")
        check(api.delete(f"/api/pages/{page_id}").status_code == 204, "Delete failed")
        check(site.get("/smoke-renamed").status_code == 404, "Deleted page still accessible")
        check(site.get("/never-created").status_code == 404, "Unknown page should be 404")
        for slug in ("privacy-policy", "terms", "disclaimer"):
            check(site.get(f"/{slug}").status_code == 404, f"Draft {slug} exposed")
            pages = api.get("/api/pages").json()
            legal_id = next(p["id"] for p in pages if p["slug"] == slug)
            check(api.patch(f"/api/pages/{legal_id}", json={"is_active": True}).status_code == 200,
                  f"Could not publish {slug}")
            check(site.get(f"/{slug}").status_code == 200, f"Existing legal URL broke: {slug}")
        print("PASS: unpublish/delete/404 behavior and all three existing legal URLs", flush=True)


def main(api_factory="tests.site_pages_app:make_app"):
    if not (FRONTEND / ".next" / "BUILD_ID").exists():
        raise RuntimeError("Run npm run build in frontend before this smoke test.")
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is required")
    api_port, site_port = free_port(), free_port()
    while site_port == api_port:
        site_port = free_port()
    api_origin, site_origin = f"http://127.0.0.1:{api_port}", f"http://127.0.0.1:{site_port}"
    env = {**os.environ, "API_INTERNAL_URL": api_origin, "NEXT_TELEMETRY_DISABLED": "1"}
    processes = []
    # Anonymous temporary logs are deleted automatically, even on failure.
    with tempfile.TemporaryFile() as api_log, tempfile.TemporaryFile() as site_log:
        try:
            api_process = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", api_factory, "--factory",
                 "--host", "127.0.0.1", "--port", str(api_port)],
                cwd=BACKEND, env=env, stdout=api_log, stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
            processes.append(api_process)
            wait_ready(f"{api_origin}/api/public/pages", api_process)
            site_process = subprocess.Popen(
                [node, str(FRONTEND / "node_modules/next/dist/bin/next"), "start",
                 "--hostname", "127.0.0.1", "--port", str(site_port)],
                cwd=FRONTEND, env=env, stdout=site_log, stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
            processes.append(site_process)
            wait_ready(f"{site_origin}/login", site_process)
            workflow(api_origin, site_origin)
        except Exception:
            for label, log in (("API", api_log), ("Frontend", site_log)):
                log.seek(0)
                print(f"{label} test log:\n{log.read().decode(errors='replace')[-10000:]}")
            raise
        finally:
            for process in reversed(processes):
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait()


if __name__ == "__main__":
    main()
