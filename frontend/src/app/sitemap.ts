import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blogPosts";
import { BOX_TRUCK_SERVICES } from "@/data/boxTruckServices";
import { HOT_SHOT_RENTALS } from "@/data/hotShotRentals";
import { HOT_SHOT_SERVICES } from "@/data/hotShotServices";
import { SEMI_TRUCK_SERVICES } from "@/data/semiTruckContent";
import {
  getBlogs,
  getBoxTruckCards,
  getHotshotCards,
  getSemiTruckCards,
} from "@/lib/serverContent";
import { siteUrlFor } from "@/lib/site";

// Built on every request so a post or service published in the dashboard is
// listed straight away (and so the Docker build never needs the API).
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];
type Item = { slug: string; canonical?: string | null; modified?: string | null };

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * One entry per item. A custom Canonical URL from the dashboard wins; items
 * whose canonical points to another site are left out, as the page itself
 * tells search engines it isn't the original.
 */
function entries(
  section: string,
  items: Item[],
  options: Pick<Entry, "changeFrequency" | "priority">,
): Entry[] {
  return items.flatMap((item) => {
    const url = siteUrlFor(item.canonical?.trim() || `/${section}/${item.slug}`);
    return url ? [{ url, lastModified: toDate(item.modified), ...options }] : [];
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Live dashboard content; the bundled copy only if the API is unreachable.
  const [blogs, hotshots, boxTrucks, semiTrucks] = await Promise.all([
    getBlogs(),
    getHotshotCards(),
    getBoxTruckCards(),
    getSemiTruckCards(),
  ]);

  const cards = (live: typeof hotshots, bundled: { slug: string }[]): Item[] =>
    live
      ? live.map((c) => ({ slug: c.slug, canonical: c.canonical_url, modified: c.updated_at }))
      : bundled.map((s) => ({ slug: s.slug }));

  const posts: Item[] = blogs
    ? blogs.map((b) => ({ slug: b.slug, canonical: b.canonical_url, modified: b.publish_date }))
    : BLOG_POSTS.map((p) => ({ slug: p.slug, modified: p.date }));

  const newestPost = posts
    .map((p) => toDate(p.modified))
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const page = (path: string, options: Omit<Entry, "url">): Entry[] => {
    const url = siteUrlFor(path);
    return url ? [{ url, ...options }] : [];
  };

  return [
    ...page("/", { changeFrequency: "weekly", priority: 1 }),
    ...page("/hot-shot", { changeFrequency: "weekly", priority: 0.9 }),
    ...page("/box-truck", { changeFrequency: "weekly", priority: 0.9 }),
    ...page("/semi-truck", { changeFrequency: "weekly", priority: 0.9 }),
    ...page("/rentals", { changeFrequency: "monthly", priority: 0.8 }),
    ...page("/blog", { changeFrequency: "weekly", priority: 0.8, lastModified: newestPost }),
    ...page("/about", { changeFrequency: "yearly", priority: 0.6 }),
    ...page("/contact", { changeFrequency: "yearly", priority: 0.7 }),
    ...entries("hot-shot", cards(hotshots, HOT_SHOT_SERVICES), { changeFrequency: "monthly", priority: 0.8 }),
    ...entries("box-truck", cards(boxTrucks, BOX_TRUCK_SERVICES), { changeFrequency: "monthly", priority: 0.8 }),
    ...entries("semi-truck", cards(semiTrucks, SEMI_TRUCK_SERVICES), { changeFrequency: "monthly", priority: 0.8 }),
    ...entries("rentals", HOT_SHOT_RENTALS.map((r) => ({ slug: r.slug })), { changeFrequency: "monthly", priority: 0.7 }),
    ...entries("blog", posts, { changeFrequency: "monthly", priority: 0.7 }),
  ];
}
