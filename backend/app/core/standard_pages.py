"""
Content pages: the standard legal pages plus any page an admin creates in
Dashboard -> Pages -> Site pages. Each is served at /<slug> by the website.

The legal pages are created on startup if missing - as unpublished drafts, so
nothing legal goes live until someone has reviewed it and switched it on.
Existing pages are never modified here (apart from filling in the footer
switch the first time it exists).
"""

import re

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.html import sanitize_html
from app.models.page import Page

LEGAL_PAGE_TYPE = "legal"
# Pages created in the dashboard.
CUSTOM_PAGE_TYPE = "custom"
# The only page types the public site serves at /<slug>.
CONTENT_PAGE_TYPES = (LEGAL_PAGE_TYPE, CUSTOM_PAGE_TYPE)

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SLUG_MAX = 100

# First path segments the website already uses (routes, redirects, static
# folders, backend proxies). A page with one of these slugs would never be
# reachable, or would hide a real page.
RESERVED_SLUGS = frozenset({
    "about", "blog", "box-truck", "contact", "hot-shot", "rentals", "semi-truck",
    "dashboard", "login", "register", "logout", "admin", "api", "uploads",
    "images", "og", "video", "static", "_next", "quote", "home", "index",
    "sitemap", "robots", "favicon", "search", "404", "500",
})


def slug_problem(slug: str) -> str | None:
    """Why `slug` can't be used for a content page, or None if it can."""
    if not slug:
        return "Enter a page address."
    if len(slug) > SLUG_MAX:
        return f"The page address must be {SLUG_MAX} characters or fewer."
    if not SLUG_RE.match(slug):
        return "Use lowercase letters, numbers and single hyphens only, e.g. shipping-guide."
    if slug in RESERVED_SLUGS:
        return f'"/{slug}" is already used by the website. Choose another address.'
    return None

_CONTACT = (
    "<p>Mr. Whiz Logistics<br>555 N 5th St 109 B, Garland, TX 75040, United States<br>"
    'Email: <a href="mailto:dispatch@mrwhizlogistics.com">dispatch@mrwhizlogistics.com</a><br>'
    'Phone: <a href="tel:+14697678853">(469) 767 8853</a></p>'
)

PRIVACY = f"""
<p>This Privacy Policy explains how Mr. Whiz Logistics ("we", "us") collects, uses and protects
personal information when you visit mrwhizlogistics.com, request a quote, rent equipment or
otherwise contact us.</p>
<h2>Information we collect</h2>
<ul>
<li><p><strong>Information you give us:</strong> your name, company, email address, phone number,
pickup and delivery locations, shipment and rental details, and anything else you send through
our quote, rental or contact forms, by email or by phone.</p></li>
<li><p><strong>Information collected automatically:</strong> device and browser details, pages
visited and how you use the site, collected with cookies and similar technologies, including
Google Analytics and Microsoft Clarity.</p></li>
</ul>
<h2>How we use your information</h2>
<ul>
<li><p>To respond to quote, rental and contact requests and to provide our transportation services.</p></li>
<li><p>To communicate with you about shipments, dispatch updates and your account.</p></li>
<li><p>To improve our website and services, and to keep them secure.</p></li>
<li><p>To comply with legal, tax and regulatory obligations.</p></li>
</ul>
<h2>Sharing your information</h2>
<p>We do not sell your personal information. We share it only with drivers, carriers and
service providers who help us deliver our services (for example hosting, analytics and
communications providers), when required by law, or to protect our rights.</p>
<h2>Cookies and analytics</h2>
<p>We use cookies and analytics tools to understand how the site is used. You can block or
delete cookies in your browser settings; some parts of the site may then not work as intended.</p>
<h2>Data retention and security</h2>
<p>We keep personal information only as long as needed for the purposes above or as required
by law, and we use reasonable technical and organisational measures to protect it.</p>
<h2>Your choices</h2>
<p>You may ask us to access, correct or delete your personal information, or to stop contacting
you, by using the details below.</p>
<h2>Changes to this policy</h2>
<p>We may update this policy from time to time. The date at the top of this page shows when it
was last updated.</p>
<h2>Contact us</h2>
{_CONTACT}
"""

TERMS = f"""
<p>These Terms &amp; Conditions govern your use of mrwhizlogistics.com and the transportation,
dispatch and equipment rental services provided by Mr. Whiz Logistics ("we", "us"). By using the
site or our services you agree to these terms.</p>
<h2>Quotes and bookings</h2>
<p>Quotes are estimates based on the information you provide and are subject to confirmation.
Final pricing may change if shipment details, dimensions, weight, locations or schedules differ
from what was quoted. A booking is confirmed only when we confirm it in writing.</p>
<h2>Your responsibilities</h2>
<ul>
<li><p>Provide accurate and complete shipment information, including weight, dimensions and
any special handling requirements.</p></li>
<li><p>Ensure freight is properly packaged, labelled and ready at the agreed pickup time.</p></li>
<li><p>Do not tender hazardous, illegal or prohibited items unless agreed in writing.</p></li>
</ul>
<h2>Payment</h2>
<p>Payment terms are set out in your quote or invoice. Additional charges such as detention,
layover, extra stops or accessorial services may apply.</p>
<h2>Delays and liability</h2>
<p>Transit times are estimates. We are not liable for delays caused by weather, road conditions,
traffic, mechanical issues, regulatory inspections or other events beyond our reasonable control.
Our liability for loss or damage to freight is limited as set out in the applicable bill of
lading, rate confirmation or carrier agreement.</p>
<h2>Equipment rentals</h2>
<p>Rentals are subject to a separate rental agreement covering eligibility, insurance, deposits,
use of the equipment and its return.</p>
<h2>Use of this website</h2>
<p>Website content is provided for general information and may change without notice. You may
not misuse the site, attempt to disrupt it, or copy its content for commercial use without
permission.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of the State of Texas, United States.</p>
<h2>Contact us</h2>
{_CONTACT}
"""

DISCLAIMER = f"""
<p>The information on mrwhizlogistics.com is provided for general informational purposes only.
Service descriptions, equipment specifications, capacities, coverage areas and transit times are
typical examples and are not guarantees.</p>
<h2>Service availability</h2>
<p>All services are subject to equipment and driver availability, route conditions, permits and
applicable regulations. Same-day, expedited or nationwide services are offered where available and
are confirmed at the time of booking.</p>
<h2>Quotes and pricing</h2>
<p>Prices and estimates shown or discussed are indicative until confirmed in writing and may vary
with fuel costs, distance, weight, dimensions, accessorials and schedule changes.</p>
<h2>No professional advice</h2>
<p>Articles, guides and blog posts are for general information and do not constitute legal,
regulatory, customs or financial advice. Please consult a qualified professional for advice about
your situation.</p>
<h2>Third-party links</h2>
<p>This site may link to third-party websites. We are not responsible for their content, accuracy
or practices.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, Mr. Whiz Logistics is not liable for any loss arising
from reliance on information on this website. Our liability for services is governed by the
applicable agreement, bill of lading or rate confirmation.</p>
<h2>Contact us</h2>
{_CONTACT}
"""

STANDARD_PAGES = [
    {"slug": "privacy-policy", "title": "Privacy Policy", "content": PRIVACY, "sort_order": 10},
    {"slug": "terms", "title": "Terms & Conditions", "content": TERMS, "sort_order": 20},
    {"slug": "disclaimer", "title": "Services Disclaimer", "content": DISCLAIMER, "sort_order": 30},
]

LEGAL_SLUGS = [p["slug"] for p in STANDARD_PAGES]


def ensure_standard_pages(db: Session) -> None:
    """Create any missing standard page as an unpublished draft. Commits."""
    # Serialize the check/insert across Uvicorn workers on fresh deployments.
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        from app.core.schema_upgrade import ADVISORY_LOCK_KEY
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": ADVISORY_LOCK_KEY})
    # The footer switch arrived after the legal pages: they were always
    # linked when published, so keep that. NULL only ever means "not set yet".
    (
        db.query(Page)
        .filter(Page.page_type == LEGAL_PAGE_TYPE, Page.show_in_footer.is_(None))
        .update({Page.show_in_footer: True, Page.updated_at: Page.updated_at}, synchronize_session=False)
    )
    existing = {slug for (slug,) in db.query(Page.slug).filter(Page.slug.in_(LEGAL_SLUGS)).all()}
    for spec in STANDARD_PAGES:
        if spec["slug"] in existing:
            continue
        db.add(
            Page(
                title=spec["title"],
                slug=spec["slug"],
                page_type=LEGAL_PAGE_TYPE,
                content=sanitize_html(" ".join(spec["content"].split())),
                is_active=False,
                show_in_footer=True,
                sort_order=spec["sort_order"],
            )
        )
    # Release the transaction-scoped lock even when nothing changed.
    db.commit()
