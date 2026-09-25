import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOT_SHOT_RENTALS, RentalItem } from "@/data/hotShotRentals";
import { detailMetadata } from "@/lib/seo";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import RentalDetailContent from "@/components/rentals/RentalDetailContent";
import RentalFinalCta from "@/components/rentals/RentalFinalCta";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return HOT_SHOT_RENTALS.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = HOT_SHOT_RENTALS.find((r) => r.slug === slug);

  if (!item) {
    return { title: "Rental Not Found" };
  }

  // Canonical used to be /hot-shot/rentals/<slug>, a URL that 404s.
  return detailMetadata({
    seo: {},
    fallbackTitle: /rental/i.test(item.title) ? item.title : `${item.title} Rental`,
    fallbackDescription: item.desc.slice(0, 155),
    path: `/rentals/${item.slug}`,
    image: item.images?.[0],
    imageAlt: item.title,
  });
}

export default async function RentalDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = HOT_SHOT_RENTALS.find((r) => r.slug === slug);

  if (!item) {
    notFound();
  }

  // Find related items (excluding current)
  const relatedItems = HOT_SHOT_RENTALS.filter((r) => r.slug !== slug).slice(
    0,
    3,
  );

  return (
    <main>
      <HotShotHero
        title={item.title}
        crumb="Equipment Details"
        badge={item.category?.toUpperCase() || "RENTAL SPECIFICATION"}
        image={item.images[0] || "/images/hot-shot-hero.jpg"}
      />

      <RentalDetailContent item={item} relatedItems={relatedItems} />

      {/* <RentalFinalCta /> */}
    </main>
  );
}
