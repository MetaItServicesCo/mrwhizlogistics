import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOT_SHOT_RENTALS, RentalItem } from "@/data/hotShotRentals";
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
    return {
      title: "Rental Item Not Found | Hot Shot Rentals",
    };
  }

  return {
    title: `${item.title} | Hot Shot Equipment Rentals`,
    description: item.desc.slice(0, 155),
    alternates: { canonical: `/hot-shot/rentals/${item.slug}` },
    openGraph: {
      title: `${item.title} | Hot Shot Equipment Rentals`,
      description: item.desc.slice(0, 155),
      url: `/hot-shot/rentals/${item.slug}`,
      type: "website",
      images: item.images?.[0] ? [{ url: item.images[0] }] : undefined,
    },
  };
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
