# Rental content management

Open **Dashboard → Pages → Rental pages** (`/dashboard/pages/rentals`).

- **Page content** manages the rental banner/image, introduction, listing headings,
  benefits and statistics, process steps, FAQs, final CTA copy, shared sub-page
  labels, section visibility, and listing SEO.
- **Equipment & sub-pages** manages rental titles, addresses, descriptions,
  galleries/alt text, rates, pricing notes, specifications, requirements,
  availability, rich-text detail content, banner images, SEO, display order,
  drafts, publishing and deletion.
- Button labels, links and visibility remain in **Settings → Buttons**. Their
  existing defaults and click actions are unchanged.
- The existing **Rentals** dashboard (`/dashboard/rentals`) still manages quote
  requests. Equipment deletion/renaming does not delete or rewrite quote history.

Published changes appear on the next website request without rebuilding the
frontend. Draft/deleted URLs return 404 and are excluded from rental listings,
related equipment and the sitemap. Renaming a slug does not redirect its old URL;
the editor warns about existing bookmarks.

## Upgrade behavior

Startup adds four columns to `rental_items` and imports the seven current rentals
once, using a seed marker and PostgreSQL advisory lock. Existing equipment core
fields and saved content are preserved. Subsequent restarts do not restore deleted
rentals. The baseline copy is duplicated in backend/frontend JSON files because
they have separate Docker build contexts; a regression test keeps them in sync.

No production deployment or Git push is performed by this implementation.
Back up the database before your normal deployment. No manual SQL is required.

## Regression checks

From `frontend`: `npm.cmd run build`.

From the repository root:

```powershell
node scripts/check-rental-layout.cjs
```

This checks the original rental styles, button props and CTA calls against the
pre-change source baseline; it is not a pixel-level browser comparison.

From `backend`, with `requirements-dev.txt` installed:

```powershell
venv/Scripts/python.exe -m unittest tests.test_rental_content tests.test_site_pages -v
venv/Scripts/python.exe -m tests.smoke_rentals
venv/Scripts/python.exe -m tests.check_page_migration
```

API/rendering tests use in-memory test data and loopback-only servers. The
PostgreSQL check requires local Docker and an existing `postgres:16-alpine` image;
it creates and removes its own disposable container, never an existing database.

Before production, click through the editor, gallery upload/reordering, FAQ
accordion and rental quote modal in a browser. Full-site visual regression testing
is separate from the automated checks above.
