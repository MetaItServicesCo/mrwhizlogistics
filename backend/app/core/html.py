"""
Sanitising for rich-text content written in the dashboard editor.

The public site renders this HTML directly, so anything an editor pastes in
(or anything a stolen admin session sends) is cleaned on the way in: scripts,
event handlers, inline styles and javascript: URLs are all dropped, and only
the tags the editor toolbar can actually produce are kept.
"""

from typing import Optional

import nh3

ALLOWED_TAGS = {
    "p", "br", "hr",
    "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "img",
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title"},
}

# Relative paths (/uploads/..., /images/...) are resolved against the site's
# own origin, so they are allowed alongside absolute http(s) and mailto links.
ALLOWED_URL_SCHEMES = {"http", "https", "mailto", "tel"}


def sanitize_html(value: Optional[str]) -> Optional[str]:
    """Return cleaned HTML, or None when there is no real content left."""
    if value is None:
        return None
    cleaned = nh3.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes=ALLOWED_URL_SCHEMES,
        link_rel="noopener noreferrer",
    ).strip()

    # The editor emits "<p></p>" for an empty document; treat that as empty
    # so the public page falls back to the legacy paragraphs instead of
    # rendering a blank section.
    if cleaned in {"", "<p></p>", "<p><br></p>"}:
        return None
    return cleaned
