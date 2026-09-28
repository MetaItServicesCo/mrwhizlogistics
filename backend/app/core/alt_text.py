"""Alternative text for images uploaded from the dashboard."""

from typing import Optional

ALT_TEXT_MAX = 300


def clean_alt(value: Optional[str]) -> Optional[str]:
    """Trimmed, single-spaced alt text (at most ALT_TEXT_MAX characters),
    or None when empty so the site falls back to the item's title."""
    if value is None:
        return None
    text = " ".join(value.split())[:ALT_TEXT_MAX].strip()
    return text or None
