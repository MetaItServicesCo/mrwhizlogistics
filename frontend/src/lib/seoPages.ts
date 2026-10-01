/** SEO copy for the six fixed landing pages. Saved dashboard values override it. */
export const SEO_PAGE_KEY_PREFIX = "seo_page_";

export const SEO_PAGES = [
  {
    id: "home",
    label: "Home",
    path: "/",
    title: "Dallas Trucking & Trailer Rental – 24/7 | Mr. Whiz Logistics",
    description: "Hot shot, box truck & semi freight plus trailer rentals from Garland, TX. Same-day dispatch, fully insured, 24/7. Call (214) 217-6302 for a free quote.",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/contact",
    title: "Free Freight Quote – 24/7 Dispatch | Mr. Whiz Logistics",
    description: "Need a truck today? Call (214) 217-6302 or send your load details for a free quote on hot shot, box truck, semi, or trailer rental. 24/7 dispatch.",
  },
  {
    id: "blog",
    label: "Blog",
    path: "/blog",
    title: "Trucking & Freight Tips Blog | Mr. Whiz Logistics",
    description: "Trucking tips, freight shipping guides and logistics news from the Mr. Whiz Logistics team in Dallas–Fort Worth. Learn how to ship smarter and save time.",
  },
  {
    id: "hot-shot",
    label: "Hot Shot",
    path: "/hot-shot",
    title: "Same-Day Hot Shot Trucking, Dallas TX | Mr. Whiz Logistics",
    description: "Urgent freight? Same-day hot shot dispatch within hours, 24/7, from Garland, TX. Flatbeds, enclosed trailers & sprinter vans, fully insured. Call now.",
  },
  {
    id: "box-truck",
    label: "Box Truck",
    path: "/box-truck",
    title: "Box Truck Delivery Dallas – Same-Day | Mr. Whiz Logistics",
    description: "16 ft & 26 ft box trucks with liftgates for local and regional freight in DFW. Same-day & next-day slots, GPS-tracked, fully insured. Get a fast quote.",
  },
  {
    id: "semi-truck",
    label: "Semi Truck",
    path: "/semi-truck",
    title: "Semi Freight – Dallas to All 50 States | Mr. Whiz Logistics",
    description: "Full truckload semi freight from Dallas: 53 ft dry van, reefer and flatbed to all 50 states. 24/7 dispatch and reliable on-time delivery. Get a quote.",
  },
] as const;

export type SeoPageId = (typeof SEO_PAGES)[number]["id"];
export type SeoPageCopy = { title: string; description: string };

export function seoPageSettingKey(id: SeoPageId): string {
  return `${SEO_PAGE_KEY_PREFIX}${id.replaceAll("-", "_")}`;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

/** A missing or malformed setting never removes the page's usable defaults. */
export function seoPageCopy(id: SeoPageId, raw?: string | null): SeoPageCopy {
  const fallback = SEO_PAGES.find((page) => page.id === id)!;
  if (!raw) return { title: fallback.title, description: fallback.description };
  try {
    const saved = JSON.parse(raw) as Record<string, unknown>;
    return {
      title: cleanText(saved.title) || fallback.title,
      description: cleanText(saved.description) || fallback.description,
    };
  } catch {
    return { title: fallback.title, description: fallback.description };
  }
}
