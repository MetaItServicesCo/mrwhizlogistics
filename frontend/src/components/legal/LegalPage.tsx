import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import RichContent from "@/components/common/RichContent";
import { getPublicPage, loadDetail, loadDetailForMetadata } from "@/lib/serverContent";
import { detailMetadata } from "@/lib/seo";
import { legalPath } from "@/lib/legalPages";

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

/** generateMetadata for a legal page: the dashboard's SEO fields, else title + opening text. */
export async function legalMetadata(slug: string): Promise<Metadata> {
  const page = await loadDetailForMetadata(() => getPublicPage(slug));
  if (!page) return { title: "Page Not Found" };
  return detailMetadata({
    seo: { metaTitle: page.meta_title, metaDescription: page.meta_description },
    name: page.title,
    fallbackTitle: page.title,
    fallbackDescription: plainText(page.content).slice(0, 155),
    path: legalPath(page.slug),
  });
}

/**
 * Privacy Policy / Terms / Disclaimer: title, last-updated date and the rich
 * text written in Dashboard -> Pages -> Legal. Unpublished pages are a 404.
 */
export default async function LegalPage({ slug }: { slug: string }) {
  // No bundled copy: an outage shows the temporary error page, not a 404.
  const { live: page } = await loadDetail(() => getPublicPage(slug), false);
  if (!page) notFound();
  const updated = fmtDate(page.updated_at);

  return (
    <main>
      <HotShotHero title={page.title} crumb={page.title} badge="LEGAL" />
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
