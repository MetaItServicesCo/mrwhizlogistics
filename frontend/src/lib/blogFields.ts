/** Normalisation and checks for the blog editor's plain-text fields. */

/** "Nobis distinctio Re!" -> "nobis-distinctio-re" (what the post's URL uses). */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Best effort YYYY-MM-DD for a stored date ("14-Feb-1978", "Feb 14, 1978",
 * "2026-09-23T10:00:00"); "" when it can't be read.
 */
export function toIsoDate(value: string | null | undefined): string {
  const v = (value || "").trim();
  if (!v) return "";
  if (isIsoDate(v.slice(0, 10))) return v.slice(0, 10);
  const d = new Date(v.replace(/-/g, " "));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Empty, a site path ("/blog/x") or a full http(s) URL. */
export function isValidCanonical(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.startsWith("/") && !v.startsWith("//") && !/\s/.test(v)) return true;
  return /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(v);
}
