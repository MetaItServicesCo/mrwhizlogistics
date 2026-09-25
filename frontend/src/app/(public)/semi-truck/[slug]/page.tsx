import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";

import {
  SEMI_TRUCK_SERVICES,
  getSemiTruckService,
} from "@/data/semiTruckContent";
import { truckCardToService } from "@/lib/contentAdapters";
import {
  getSemiTruckCard,
  getSemiTruckCards,
  loadDetail,
  loadDetailForMetadata,
} from "@/lib/serverContent";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   STATIC PARAMS
   Generates:
   /semi-truck/reefer-truck
   /semi-truck/dry-van
   /semi-truck/flatbed
========================================================= */

export function generateStaticParams() {
  return SEMI_TRUCK_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

/* =========================================================
   DYNAMIC SEO METADATA
========================================================= */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const card = await loadDetailForMetadata(() => getSemiTruckCard(slug));
  const fallback = getSemiTruckService(slug);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    return {};
  }

  return {
    title: `${service.title} Services | Reliable Semi Truck Freight Transportation`,

    description: service.shortDescription,

    alternates: {
      canonical: `/semi-truck/${service.slug}`,
    },

    openGraph: {
      title: `${service.title} Services | Semi Truck Freight`,

      description: service.shortDescription,

      url: `/semi-truck/${service.slug}`,

      type: "website",

      images: service.image
        ? [
            {
              url: service.image,
              width: 1200,
              height: 630,
              alt: service.title,
            },
          ]
        : undefined,
    },
  };
}

/* =========================================================
   DETAIL PAGE
========================================================= */

export default async function SemiTruckServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const fallback = getSemiTruckService(slug);
  const [card, cards] = await Promise.all([
    loadDetail(() => getSemiTruckCard(slug), Boolean(fallback)),
    getSemiTruckCards(),
  ]);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    notFound();
  }

  const services = cards
    ? cards.map((item) =>
        truckCardToService(
          item,
          SEMI_TRUCK_SERVICES.find((fallbackItem) => fallbackItem.slug === item.slug),
        ),
      )
    : SEMI_TRUCK_SERVICES;

  return (
    <HotShotServiceDetail
      service={service}
      services={services}
      basePath="/semi-truck"
    />
  );
}
