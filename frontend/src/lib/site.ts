/**
 * The public origin of the website, used wherever an absolute URL is required
 * (sitemap, robots.txt, canonical and Open Graph URLs). Override with
 * SITE_URL / NEXT_PUBLIC_SITE_URL if the site ever moves domain.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://mrwhizlogistics.com"
).replace(/\/+$/, "");

/**
 * Absolute URL for a page on this site, or null for anything that points to
 * another host (a sitemap may only list its own site's URLs).
 */
export function siteUrlFor(pathOrUrl: string): string | null {
  const v = pathOrUrl.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return `${SITE_URL}${v}`;
  try {
    const u = new URL(v);
    return u.host === new URL(SITE_URL).host ? u.toString() : null;
  } catch {
    return null;
  }
}
