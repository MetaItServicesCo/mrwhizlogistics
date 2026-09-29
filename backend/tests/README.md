# Site pages regression checks

These checks finish the in-progress **Dashboard → Pages → Site pages** work.
They do not modify `.env`, the deployed website, or an existing database.
The existing legal editor remains available at `/dashboard/pages/legal`.

From `backend`, install test dependencies into your development environment:

```powershell
venv/Scripts/python.exe -m pip install -r requirements-dev.txt
venv/Scripts/python.exe -m unittest tests.test_site_pages -v
```

The API tests use a new in-memory SQLite database per test. They cover publishing,
editing, renaming, unpublishing, deletion, SEO, footer order/visibility, HTML
sanitization, authentication, conflicting/reserved addresses, and standard-page
protection. They also check that startup preserves reviewed legal content and
explicit footer choices.

For rendered HTML and routes, first run `npm.cmd run build` from `frontend`, then
run from `backend`:

```powershell
venv/Scripts/python.exe -m tests.smoke_site_pages
```

This starts the production Next.js build and an isolated API on temporary
loopback ports and stops only those processes afterwards. It checks existing
public routes, both page editors, new direct URLs, rich HTML, metadata, footer,
sitemap and immediate changes without rebuilds. This is an HTTP/server-rendering
check, not a browser interaction or pixel-comparison test.

To verify the additive upgrade on real PostgreSQL, with local Docker running and
`postgres:16-alpine` already installed:

```powershell
venv/Scripts/python.exe -m tests.check_page_migration
```

It creates a uniquely named disposable container with tmpfs storage, checks the
previous schema upgrades without changing existing fields or timestamps, exercises
concurrent/repeated startup, then removes that container. It never pulls an image,
uses an existing database, or modifies existing containers/volumes.

For a final manual UI check, use a local or staging environment: create a draft,
format content, publish it with a footer link, view it, edit it, disable its footer
link, unpublish, and delete it. Verify the existing legal editor and unrelated
buttons still behave as before. Production deployment remains a separate step.
