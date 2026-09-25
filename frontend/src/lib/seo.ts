import type { Metadata } from "next";

export const SITE_NAME = "Mr. Whiz Logistics";

/** Site-wide default title (also the homepage title). */
export const DEFAULT_TITLE = "Dallas Hot Shot & Box Truck Trucking | Mr. Whiz Logistics";

export const DEFAULT_DESCRIPTION =
  "Garland, TX trucking company for hot shot, box truck and semi freight, plus trailer rentals. 24/7 dispatch across Dallas–Fort Worth. Get a free quote today.";

/** 1200x630 branded card used when a page has no image of its own. */
export const DEFAULT_OG_IMAGE = {
  url: "/og/default.jpg",
  width: 1200,
  height: 630,
  alt: "Mr. Whiz Logistics",
};

/**
 * Open Graph fields every page shares. A page's `openGraph` replaces the
 * parent's entirely (Next.js does not merge it), so every page spreads this.
 */
export const sharedOpenGraph = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
  images: [DEFAULT_OG_IMAGE],
};

/**
 * Metadata for a fixed page. `title` gets " | Mr. Whiz Logistics" from the
 * root layout's template, so keep it short (about 39 characters or fewer).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...sharedOpenGraph, title: `${title} | ${SITE_NAME}`, description, url: path },
  };
}

/**
 * Fallback title for a service page when the dashboard has no Meta title:
 * the service name plus its category, unless the name already says it
 * (e.g. "26ft Box Truck" -> "26ft Box Truck Delivery").
 */
export function serviceTitle(name: string, category: "hot-shot" | "box-truck" | "semi-truck"): string {
  const n = name.trim();
  const has = (word: string) => n.toLowerCase().includes(word);
  switch (category) {
    case "hot-shot":
      return has("hot shot") || has("hotshot") ? n : `${n} Hot Shot`;
    case "box-truck":
      return has("box truck") ? `${n} Delivery` : `${n} Box Truck Delivery`;
    case "semi-truck":
      return has("semi") ? `${n} Freight` : `${n} Semi Truck Freight`;
  }
}

/** Roughly what Google shows of a title before cutting it off. */
const MAX_TITLE_LENGTH = 60;

/** The dashboard's SEO fields, as stored on blog posts and service cards. */
export type SeoFields = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
};

/** Plain text only: tags and stray whitespace never belong in <head>. */
function plain(value?: string | null): string {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A site path or an absolute http(s) URL; anything else is ignored. */
function canonicalOrNull(value?: string | null): string | null {
  const v = (value || "").trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}

/**
 * Metadata for a detail page. The dashboard's Meta title / Meta description /
 * Meta keywords / Canonical URL always win; only when one is left empty does
 * the page fall back to the item's name and summary. The on-page heading and
 * the rich-text body are never used, so editing them can't change the title
 * search engines see.
 *
 * A Meta title typed in the dashboard is used exactly as written; the
 * fallback title gets the site's " | Mr. Whiz Logistics" template. A Meta
 * title that merely repeats the item's name (the launch content was seeded
 * that way) counts as not customised. The brand is left off a fallback title
 * when adding it would run past what Google shows (~60 characters).
 */
export function detailMetadata({
  seo,
  name,
  fallbackTitle,
  fallbackDescription,
  path,
  image,
  imageAlt,
  type = "website",
}: {
  seo: SeoFields;
  /** The item's own name; a Meta title equal to it is treated as unset. */
  name?: string;
  fallbackTitle: string;
  fallbackDescription?: string | null;
  /** Default canonical path, e.g. /blog/my-post */
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const typed = plain(seo.metaTitle);
  const customTitle = typed && typed.toLowerCase() !== plain(name).toLowerCase() ? typed : "";
  const branded = `${fallbackTitle} | ${SITE_NAME}`;
  const brandFits = branded.length <= MAX_TITLE_LENGTH;
  const fullTitle = customTitle || (brandFits ? branded : fallbackTitle);
  const description = plain(seo.metaDescription) || plain(fallbackDescription) || undefined;
  const canonical = canonicalOrNull(seo.canonicalUrl) || path;
  const keywords = plain(seo.metaKeywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title: customTitle || !brandFits ? { absolute: fullTitle } : fallbackTitle,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      ...sharedOpenGraph,
      title: fullTitle,
      description,
      url: canonical,
      type,
      images: image ? [{ url: image, alt: imageAlt || fullTitle }] : sharedOpenGraph.images,
    },
  };
}
