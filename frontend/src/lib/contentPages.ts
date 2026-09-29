/**
 * Content pages: the standard legal pages plus any page created in
 * Dashboard -> Pages -> Site pages. All are served at /<slug>.
 */

/** Created by the backend on startup; their addresses are fixed. */
export const LEGAL_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "disclaimer", title: "Services Disclaimer" },
] as const;

export const LEGAL_PAGE_TYPE = "legal";
export const CUSTOM_PAGE_TYPE = "custom";
export const CONTENT_PAGE_TYPES: readonly string[] = [LEGAL_PAGE_TYPE, CUSTOM_PAGE_TYPE];

const LEGAL_SLUGS = new Set<string>(LEGAL_PAGES.map((p) => p.slug));
export const isStandardPage = (slug: string) => LEGAL_SLUGS.has(slug);

/** Public path of a content page, e.g. /privacy-policy. */
export const pagePath = (slug: string) => `/${slug}`;

/** Mirrors the backend rules (app/core/standard_pages.py). */
export const SLUG_MAX = 100;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set([
  "about", "blog", "box-truck", "contact", "hot-shot", "rentals", "semi-truck",
  "dashboard", "login", "register", "logout", "admin", "api", "uploads",
  "images", "og", "video", "static", "_next", "quote", "home", "index",
  "sitemap", "robots", "favicon", "search", "404", "500",
]);

/** A URL-safe address from a title: "Shipping Guide!" -> "shipping-guide". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

export function slugProblem(slug: string): string | null {
  if (!slug) return "Enter a page address.";
  if (slug.length > SLUG_MAX) return `The page address must be ${SLUG_MAX} characters or fewer.`;
  if (!SLUG_RE.test(slug)) return "Use lowercase letters, numbers and single hyphens only, e.g. shipping-guide.";
  if (RESERVED_SLUGS.has(slug)) return `“/${slug}” is already used by the website. Choose another address.`;
  return null;
}
