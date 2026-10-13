import { settingsMap } from "@/lib/contentAdapters";
import { getPublicSettings } from "@/lib/serverContent";
import { SITE_URL } from "@/lib/site";
import { SEO_TRACKING_KEY, parseSeoTracking, recommendedRobots } from "@/lib/seoTracking";

// Read on every request so a change in Dashboard -> SEO & Tracking is live at once.
export const dynamic = "force-dynamic";

/** /robots.txt: the recommended rules, or custom text from the dashboard. */
export async function GET() {
  const seo = parseSeoTracking(settingsMap((await getPublicSettings()) || [])[SEO_TRACKING_KEY]);
  const body = seo.robots.mode === "custom" && seo.robots.custom.trim() ? `${seo.robots.custom.trim()}\n` : recommendedRobots(SITE_URL);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
