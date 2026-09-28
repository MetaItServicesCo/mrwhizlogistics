"""
Sanitising for rich-text content written in the dashboard editor.

The public site renders this HTML directly, so anything an editor pastes in
(or anything a stolen admin session sends) is cleaned on the way in: scripts,
event handlers, javascript: URLs and all inline styles except plain text and
highlight colours are dropped, and only the tags the editor toolbar can
actually produce are kept.
"""

import re
from typing import Optional

import nh3

ALLOWED_TAGS = {
    "p", "br", "hr",
    "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "img",
    # Text colour (<span style="color: …">) and highlight (<mark …>).
    "span", "mark",
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title"},
    "span": {"style"},
    "mark": {"style", "data-color"},
}

# Relative paths (/uploads/..., /images/...) are resolved against the site's
# own origin, so they are allowed alongside absolute http(s) and mailto links.
ALLOWED_URL_SCHEMES = {"http", "https", "mailto", "tel"}

# The only inline styles kept, per tag, and the only value shapes accepted:
# #rgb / #rrggbb(aa), rgb()/rgba() with plain numbers, or a named colour.
STYLE_PROPERTIES = {"span": {"color"}, "mark": {"background-color"}}
_COLOR_VALUE = re.compile(
    r"^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.]+%?\s*(,\s*[\d.]+%?\s*){2,3}\)|[a-zA-Z]{3,20})$"
)


def _safe_color(value: str) -> Optional[str]:
    v = value.strip()
    return v if _COLOR_VALUE.match(v) else None


def _attribute_filter(tag: str, attr: str, value: str) -> Optional[str]:
    if attr == "style":
        allowed = STYLE_PROPERTIES.get(tag, set())
        kept = []
        for decl in value.split(";"):
            prop, sep, val = decl.partition(":")
            prop = prop.strip().lower()
            color = _safe_color(val) if sep else None
            if prop in allowed and color:
                kept.append(f"{prop}: {color}")
        return "; ".join(kept) or None
    if attr == "data-color":
        return _safe_color(value)
    return value


def sanitize_html(value: Optional[str]) -> Optional[str]:
    """Return cleaned HTML, or None when there is no real content left."""
    if value is None:
        return None
    cleaned = nh3.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        attribute_filter=_attribute_filter,
        url_schemes=ALLOWED_URL_SCHEMES,
        link_rel="noopener noreferrer",
    ).strip()

    # The editor emits "<p></p>" for an empty document; treat that as empty
    # so the public page falls back to the legacy paragraphs instead of
    # rendering a blank section.
    if cleaned in {"", "<p></p>", "<p><br></p>"}:
        return None
    return cleaned
