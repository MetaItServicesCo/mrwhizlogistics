import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOT_SHOT_RENTALS } from "@/data/hotShotRentals";
import { detailMetadata } from "@/lib/seo";
import RentalHero from "@/components/rentals/RentalHero";
import RentalDetailContent from "@/components/rentals/RentalDetailContent";
import { RENTAL_DEFAULTS, type RentalContentItem } from "@/lib/rentalContent";
import { getRentalItem, getRentalItems, getRentalPage, loadDetail, loadDetailForMetadata } from "@/lib/serverContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadDetailForMetadata(() => getRentalItem(slug));
  if (!item) return {title: "Rental Not Found"};
  return detailMetadata({
    seo: {metaTitle: item.meta_title, metaDescription: item.meta_description},
    name: item.title,
    fallbackTitle: /rental/i.test(item.title) ? item.title : `${item.title} Rental`,
    fallbackDescription: item.desc.slice(0, 155),
    path: `/rentals/${item.slug}`,
    image: item.images?.[0], imageAlt: item.imageAlts?.[0] || item.title,
  });
}

export default async function RentalDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundled = HOT_SHOT_RENTALS.find(r => r.slug === slug);
  const [{live, outage}, rentals, page] = await Promise.all([
    loadDetail(() => getRentalItem(slug), Boolean(bundled)), getRentalItems(), getRentalPage(),
  ]);
  const item: RentalContentItem | undefined = live ?? (outage && bundled
    ? {...bundled, is_active: true, sort_order: 0} : undefined);
  if (!item) notFound();
  const content = page ?? RENTAL_DEFAULTS.page;
  const relatedItems = (rentals ?? HOT_SHOT_RENTALS).filter(r => r.slug !== slug).slice(0, 3);
  return (
    <main>
      <RentalHero title={item.title} crumb={content.detailHero.crumb}
        badge={item.category?.toUpperCase() || content.detailHero.badgeFallback}
        image={item.hero_image || "/images/breadcumb.jpg"} />
      {content.sections.RentalDetailContent.enabled &&
        <RentalDetailContent key={item.slug} item={item} relatedItems={relatedItems}
          content={content.sections.RentalDetailContent} />}
    </main>
  );
}
