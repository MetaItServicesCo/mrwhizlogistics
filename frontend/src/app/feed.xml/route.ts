import { getBlogs } from "@/lib/serverContent";
import { siteUrlFor } from "@/lib/site";
import type { BlogPost } from "@/lib/types";

// Zoho's RSS campaigns must see newly published posts without a rebuild.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function publicationDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function item(post: BlogPost): string {
  const url = siteUrlFor(`/blog/${encodeURIComponent(post.slug)}`)!;
  const date = publicationDate(post.publish_date);
  const content = post.content_html ||
    post.content_paragraphs.map((paragraph) => `<p>${escapeXml(paragraph)}</p>`).join("");

  return [
    "<item>",
    `<title>${escapeXml(post.title)}</title>`,
    `<link>${escapeXml(url)}</link>`,
    `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
    `<description>${escapeXml(post.short_description)}</description>`,
    `<content:encoded>${escapeXml(content)}</content:encoded>`,
    ...(date ? [`<pubDate>${date.toUTCString()}</pubDate>`] : []),
    "</item>",
  ].join("");
}

export async function GET(): Promise<Response> {
  const posts = await getBlogs();
  // A temporary API outage should not make Zoho ingest bundled demo posts.
  if (posts === null) {
    return new Response("Blog feed temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const sorted = [...posts].sort((a, b) => {
    const aTime = publicationDate(a.publish_date)?.getTime() ?? 0;
    const bTime = publicationDate(b.publish_date)?.getTime() ?? 0;
    return bTime - aTime || b.id - a.id;
  });
  const feedUrl = siteUrlFor("/feed.xml")!;
  const blogUrl = siteUrlFor("/blog")!;
  const lastPublished = sorted.map((post) => publicationDate(post.publish_date)).find((date) => date !== null);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    "<channel>",
    "<title>Mr. Whiz Logistics Blog</title>",
    `<link>${escapeXml(blogUrl)}</link>`,
    "<description>Trucking insights and logistics news from Mr. Whiz Logistics.</description>",
    "<language>en-us</language>",
    `<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...(lastPublished ? [`<lastBuildDate>${lastPublished.toUTCString()}</lastBuildDate>`] : []),
    ...sorted.map(item),
    "</channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
