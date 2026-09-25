import type { Metadata } from "next";

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
 */
export function detailMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  path,
  image,
  imageAlt,
  type = "website",
}: {
  seo: SeoFields;
  fallbackTitle: string;
  fallbackDescription?: string | null;
  /** Default canonical path, e.g. /blog/my-post */
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const title = plain(seo.metaTitle) || fallbackTitle;
  const description = plain(seo.metaDescription) || plain(fallbackDescription) || undefined;
  const canonical = canonicalOrNull(seo.canonicalUrl) || path;
  const keywords = plain(seo.metaKeywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      images: image ? [{ url: image, alt: imageAlt || title }] : undefined,
    },
  };
}
