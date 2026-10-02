"""
Turning live website pages into clean, citable text chunks.

Every page on the site renders its content inside <main>; the navbar, footer,
chat widget and admin bar sit outside it. So the crawler keeps <main> only,
splits it at headings, and prefixes each chunk with "Page > Section" so a
retrieved chunk carries its own context.
"""

import hashlib
import re
from dataclasses import dataclass
from xml.etree import ElementTree

from bs4 import BeautifulSoup, NavigableString, Tag

DROP_TAGS = ("script", "style", "noscript", "svg", "template", "iframe", "form", "button", "nav", "video", "picture")
HEADINGS = ("h1", "h2", "h3", "h4")
BLOCKS = ("p", "li", "td", "th", "dt", "dd", "blockquote", "figcaption", "summary", "h5", "h6")


@dataclass
class Section:
    heading: str
    text: str


@dataclass
class ExtractedPage:
    title: str
    sections: list[Section]

    @property
    def full_text(self) -> str:
        return "\n\n".join(f"{s.heading}\n{s.text}" for s in self.sections)

    @property
    def content_hash(self) -> str:
        return hashlib.sha256(self.full_text.encode()).hexdigest()


@dataclass
class Chunk:
    title: str
    heading: str
    content: str


def parse_sitemap(xml: str) -> list[str]:
    try:
        root = ElementTree.fromstring(xml)
    except ElementTree.ParseError:
        return []
    urls = []
    for el in root.iter():
        if el.tag.endswith("loc") and el.text:
            urls.append(el.text.strip())
    return list(dict.fromkeys(urls))


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _title(soup: BeautifulSoup) -> str:
    h1 = soup.find("h1")
    if h1 and _clean(h1.get_text(" ")):
        return _clean(h1.get_text(" "))
    if soup.title and soup.title.string:
        return _clean(soup.title.string.split("|")[0])
    return ""


def extract_page(html: str) -> ExtractedPage:
    soup = BeautifulSoup(html, "lxml")
    title = _title(soup)
    main = soup.find("main") or soup.body or soup
    for tag in main.find_all(DROP_TAGS):
        tag.decompose()
    for tag in main.select('[aria-hidden="true"], [data-admin-bar], [role="dialog"]'):
        tag.decompose()

    sections: list[Section] = []
    heading = title or "Overview"
    buffer: list[str] = []
    seen: set[str] = set()

    def flush() -> None:
        text = "\n".join(buffer).strip()
        if text:
            sections.append(Section(heading=heading, text=text))
        buffer.clear()

    def add(text: str) -> None:
        text = _clean(text)
        # Repeated card text (e.g. carousels rendered twice) adds noise.
        if len(text) < 2 or text in seen:
            return
        seen.add(text)
        buffer.append(text)

    def walk(node: Tag) -> None:
        nonlocal heading
        for child in node.children:
            if isinstance(child, NavigableString):
                if child.parent is node and node.name not in BLOCKS and _clean(str(child)):
                    add(str(child))
                continue
            if not isinstance(child, Tag):
                continue
            if child.name in HEADINGS:
                title_text = _clean(child.get_text(" "))
                # Icon-only/empty headings don't start a new section.
                if title_text and title_text != heading:
                    flush()
                    heading = title_text
            elif child.name in BLOCKS:
                add(child.get_text(" "))
            else:
                walk(child)

    walk(main)
    flush()
    return ExtractedPage(title=title, sections=sections)


def chunk_page(page: ExtractedPage, max_chars: int = 900, overlap: int = 150) -> list[Chunk]:
    """Pack consecutive sections ("## heading" + text) into chunks of ~max_chars.

    Small sections (cards, bullet groups) share a chunk with their neighbours so
    each chunk carries enough context; oversized sections are split by line
    with a small overlap. Every chunk starts with the page title.
    """
    chunks: list[Chunk] = []
    current: list[str] = []
    heading = ""

    def emit() -> None:
        body = "\n".join(current).strip()
        if body:
            chunks.append(Chunk(page.title, heading or page.title, f"{page.title}\n{body}"))
        current.clear()

    def size() -> int:
        return sum(len(x) + 1 for x in current)

    for section in page.sections:
        lines = [line for line in section.text.split("\n") if line.strip()]
        header = f"## {section.heading}" if section.heading and section.heading != page.title else ""
        block = "\n".join(([header] if header else []) + lines)
        if current and size() + len(block) > max_chars:
            emit()
        if not current:
            heading = section.heading
        if len(block) <= max_chars:
            current.append(block)
            continue

        # Oversized section: split it line by line, repeating its heading.
        def restart(tail: str = "") -> None:
            nonlocal heading
            emit()
            heading = section.heading
            if header:
                current.append(f"{header} (continued)")
            if tail and " " in tail:
                current.append(tail[tail.find(" ") + 1 :])

        if header:
            current.append(header)
        for line in lines:
            while len(line) > max_chars:
                piece, line = line[:max_chars], line[max_chars - overlap :]
                if current and size() + len(piece) > max_chars:
                    restart()
                current.append(piece)
            if current and size() + len(line) > max_chars:
                restart(current[-1][-overlap:])
            current.append(line)
    emit()
    return chunks

