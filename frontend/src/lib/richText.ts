/**
 * Helpers for moving between the legacy paragraph arrays (content_paragraphs /
 * detail_paragraphs) and the rich-text HTML the editor produces.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Wrap each legacy paragraph in <p> so old content opens in the editor intact. */
export function paragraphsToHtml(paragraphs: string[] | null | undefined): string {
  return (paragraphs ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

/** True for null, "", and the "<p></p>" TipTap emits for an empty document. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = html
    .replace(/<img\b[^>]*>/gi, "IMG") // an image-only body is still content
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
}
