/**
 * JSON-LD for blog posts. Used by the public page (to auto-generate markup when
 * a post has none of its own) and by the dashboard (to pre-fill the editor).
 */

export const SCHEMA_TYPES = ["BlogPosting", "Article", "NewsArticle"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export const DEFAULT_PUBLISHER = "Mr. Whiz Logistics";

/** Absolute site origin for canonical URLs inside the markup. */
export function siteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");
}

/** Search engines require absolute URLs in structured data. */
export function absoluteUrl(path: string | null | undefined, origin = siteUrl()): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export type BlogSchemaInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  author?: string | null;
  datePublished?: string | null;
  keywords?: string | null;
};

export function buildBlogSchema(post: BlogSchemaInput, origin = siteUrl()) {
  const url = absoluteUrl(`/blog/${post.slug}`, origin);
  const image = absoluteUrl(post.image, origin);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: image ? [image] : undefined,
    datePublished: post.datePublished || undefined,
    dateModified: post.datePublished || undefined,
    author: {
      "@type": "Person",
      name: post.author || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_PUBLISHER,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png", origin),
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.keywords || undefined,
  };

  // Drop the undefined keys so the emitted JSON stays clean.
  return JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
}

/**
 * Serialise for embedding in <script type="application/ld+json">.
 * Escaping "<" prevents a stray "</script>" inside any value from closing the
 * tag early and turning the rest into executable markup.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
