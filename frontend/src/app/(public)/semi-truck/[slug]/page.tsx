import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";

import {
  SEMI_TRUCK_SERVICES,
  getSemiTruckService,
} from "@/data/semiTruckContent";
import { truckCardToService } from "@/lib/contentAdapters";
import { detailMetadata } from "@/lib/seo";
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

  const name = service.name || service.title;
  return detailMetadata({
    seo: service,
    fallbackTitle: `${name} Services | Reliable Semi Truck Freight Transportation`,
    fallbackDescription: service.shortDescription,
    path: `/semi-truck/${service.slug}`,
    image: service.image,
    imageAlt: name,
  });
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
