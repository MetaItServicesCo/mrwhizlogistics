import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";

import {
  SEMI_TRUCK_SERVICES,
  getSemiTruckService,
} from "@/data/semiTruckContent";

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

  const service = getSemiTruckService(slug);

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

  const service = getSemiTruckService(slug);

  if (!service) {
    notFound();
  }

  return (
    <HotShotServiceDetail
      service={service}
      services={SEMI_TRUCK_SERVICES}
      basePath="/semi-truck"
    />
  );
}
