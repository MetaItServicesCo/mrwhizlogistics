import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import RichContent from "@/components/common/RichContent";
import { getPublicPage, getPublicSettings, loadDetail, loadDetailForMetadata } from "@/lib/serverContent";
import { settingsMap } from "@/lib/contentAdapters";
import { detailMetadata } from "@/lib/seo";
import { LEGAL_PAGE_TYPE, pagePath, slugProblem } from "@/lib/contentPages";

function plainText(html: string | null | undefined): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Only well-formed, non-reserved slugs are looked up (no API call for /wp-login.php etc.). */
const lookupable = (slug: string) => !slugProblem(slug);

/** generateMetadata for a content page: the dashboard's SEO fields, else title + opening text. */
export async function contentPageMetadata(slug: string): Promise<Metadata> {
  const page = lookupable(slug) ? await loadDetailForMetadata(() => getPublicPage(slug)) : null;
  if (!page) return { title: "Page Not Found" };
  return detailMetadata({
    seo: { metaTitle: page.meta_title, metaDescription: page.meta_description },
    name: page.title,
    fallbackTitle: page.title,
    fallbackDescription: plainText(page.content).slice(0, 155),
    path: pagePath(page.slug),
  });
}

/**
 * A page written in Dashboard -> Pages -> Site pages: title and rich text,
 * plus a "Last updated" date on legal pages. Unpublished pages are a 404.
 */
export default async function ContentPage({ slug }: { slug: string }) {
  if (!lookupable(slug)) notFound();
  // No bundled copy: an outage shows the temporary error page, not a 404.
  const [{ live: page }, settingRows] = await Promise.all([
    loadDetail(() => getPublicPage(slug), false),
    getPublicSettings(),
  ]);
  if (!page) notFound();
  const legal = page.page_type === LEGAL_PAGE_TYPE;
  const updated = legal ? fmtDate(page.updated_at) : null;
  const company = settingsMap(settingRows || []).company_name?.trim() || "Mr. Whiz Logistics";

  return (
    <main>
      <HotShotHero title={page.title} crumb={page.title} badge={legal ? "LEGAL" : company.toUpperCase()} />
      <Box sx={{ bgcolor: "#0a0a0a", px: { xs: 3, sm: 5, md: 8 }, py: { xs: 6, md: 10 } }}>
        <Box component="article" sx={{ maxWidth: 820, mx: "auto" }}>
          {updated && (
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 14, mb: 4 }}>
              Last updated: <Box component="time" dateTime={page.updated_at ?? undefined} sx={{ color: "#fff" }}>{updated}</Box>
            </Typography>
          )}
          {page.content ? (
            <RichContent html={page.content} />
          ) : (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>This page is being updated.</Typography>
          )}
        </Box>
      </Box>
    </main>
  );
}
