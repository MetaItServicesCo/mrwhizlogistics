import { settingsMap } from "@/lib/contentAdapters";
import { BOX_TRUCK_SERVICES } from "@/data/boxTruckServices";
import { HOT_SHOT_RENTALS } from "@/data/hotShotRentals";
import { HOT_SHOT_SERVICES } from "@/data/hotShotServices";
import { SEMI_TRUCK_SERVICES } from "@/data/semiTruckContent";
import { pagePath } from "@/lib/contentPages";
import {
  getBlogs,
  getBoxTruckCards,
  getHotshotCards,
  getPublicPages,
  getPublicSettings,
  getRentalItems,
  getSemiTruckCards,
} from "@/lib/serverContent";
import { SITE_URL } from "@/lib/site";
import { SEO_TRACKING_KEY, companyInfo, parseSeoTracking } from "@/lib/seoTracking";

// Built on every request: always reflects what's published in the dashboard.
export const dynamic = "force-dynamic";

const oneLine = (text?: string | null) => (text || "").replace(/\s+/g, " ").trim();
const link = (title: string, path: string, desc?: string | null) =>
  `- [${oneLine(title)}](${SITE_URL}${path})${oneLine(desc) ? `: ${oneLine(desc)}` : ""}`;

type Card = { title: string; slug: string; short_description?: string | null };
type Bundled = { slug: string; name?: string; title: string; shortDescription?: string };
const fromBundled = (list: Bundled[]): Card[] =>
  list.map((s) => ({ title: s.name || s.title, slug: s.slug, short_description: s.shortDescription }));

/**
 * /llms.txt (llmstxt.org): a plain-text guide to the site for AI assistants.
 * The recommended version is generated from the company details, services,
 * rentals, pages and latest posts; the dashboard can replace it with custom text.
 */
export async function GET() {
  const [rows, hotshots, boxTrucks, semiTrucks, rentals, pages, blogs] = await Promise.all([
    getPublicSettings(),
    getHotshotCards(),
    getBoxTruckCards(),
    getSemiTruckCards(),
    getRentalItems(),
    getPublicPages(),
    getBlogs(),
  ]);
  const settings = settingsMap(rows || []);
  const seo = parseSeoTracking(settings[SEO_TRACKING_KEY]);
  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" };
  if (seo.llms.mode === "custom" && seo.llms.custom.trim()) {
    return new Response(`${seo.llms.custom.trim()}\n`, { headers });
  }

  const c = companyInfo(settings);
  const section = (title: string, lines: string[]) => (lines.length ? [`## ${title}`, "", ...lines, ""] : []);
  const services = (path: string, live: Card[] | null, bundled: Bundled[]) =>
    (live ?? fromBundled(bundled)).map((s) => link(s.title, `${path}/${s.slug}`, s.short_description));

  const body = [
    `# ${c.name}`,
    "",
    `> ${oneLine(c.description)}`,
    "",
    `${c.name} is a trucking and logistics company based in ${oneLine(c.address)}, offering hot shot, box truck and semi truck freight, trailer and equipment rentals, and 24/7 dispatch. Quotes are given by a dispatcher by phone or through the website.`,
    "",
    ...section("Contact", [
      `- Phone: ${c.phone}`,
      `- Email: ${c.email}`,
      `- Address: ${oneLine(c.address)}`,
      `- Hours: ${oneLine(c.hours)}`,
      link("Contact and quote form", "/contact"),
    ]),
    ...section("Main pages", [
      link("Home", "/"),
      link("Hot Shot trucking", "/hot-shot"),
      link("Box Truck freight", "/box-truck"),
      link("Semi Truck freight", "/semi-truck"),
      link("Trailer and equipment rentals", "/rentals"),
      link("About us", "/about"),
      link("Blog", "/blog"),
    ]),
    ...section("Hot Shot services", services("/hot-shot", hotshots, HOT_SHOT_SERVICES as Bundled[])),
    ...section("Box Truck services", services("/box-truck", boxTrucks, BOX_TRUCK_SERVICES as Bundled[])),
    ...section("Semi Truck services", services("/semi-truck", semiTrucks, SEMI_TRUCK_SERVICES as Bundled[])),
    ...section(
      "Rentals",
      (rentals ?? HOT_SHOT_RENTALS).map((r) => link(r.title, `/rentals/${r.slug}`, r.desc)),
    ),
    ...section(
      "Latest articles",
      (blogs || []).slice(0, 10).map((b) => link(b.title, `/blog/${b.slug}`, b.short_description)),
    ),
    ...section("Policies", (pages || []).map((p) => link(p.title, pagePath(p.slug)))),
  ].join("\n");

  return new Response(body, { headers });
}
