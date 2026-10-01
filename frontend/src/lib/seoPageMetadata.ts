import "server-only";
import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/serverContent";
import { sharedOpenGraph } from "@/lib/seo";
import { SEO_PAGES, seoPageCopy, seoPageSettingKey, type SeoPageId } from "@/lib/seoPages";

/** Only the fixed page's head changes; its visible content is untouched. */
export async function managedPageMetadata(id: SeoPageId): Promise<Metadata> {
  const page = SEO_PAGES.find((entry) => entry.id === id)!;
  const settings = await getPublicSettings();
  const raw = settings?.find((setting) => setting.key === seoPageSettingKey(id))?.value;
  const { title, description } = seoPageCopy(id, raw);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: page.path },
    openGraph: { ...sharedOpenGraph, title, description, url: page.path },
  };
}
