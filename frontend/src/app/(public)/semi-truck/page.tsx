import type { Metadata } from "next";

import HotShotHero from "@/components/hot-shot/HotShotHero";
import ServiceGrid from "@/components/service/ServiceGrid";
import ServiceWhy from "@/components/service/ServiceWhy";
import ServiceHow from "@/components/service/ServiceHow";
import ServiceCTA from "@/components/service/ServiceCTA";

import {
  SEMI_TRUCK_GRID_SERVICES,
  SEMI_TRUCK_FEATURES,
  SEMI_TRUCK_STEPS,
} from "@/data/semiTruckContent";
import { truckCardToGridItem } from "@/lib/contentAdapters";
import { getSemiTruckCards } from "@/lib/serverContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Semi Truck Freight Services",
  description:
    "Reliable semi truck freight services including reefer, dry van and flatbed transportation for regional and long-distance commercial freight.",
  path: "/semi-truck",
});

export default async function SemiTruckPage() {
  const cards = await getSemiTruckCards();
  const services = cards
    ? cards.map(truckCardToGridItem)
    : SEMI_TRUCK_GRID_SERVICES;
  const heading = cards?.[0]?.page_heading || "Choose the right semi truck";
  const subtitle =
    cards?.[0]?.page_subheading ||
    "Three specialized trailer options, one standard of reliable freight service — choose the equipment that fits your load.";

  return (
    <main>
      <HotShotHero
        title="Semi Truck"
        crumb="Semi Truck"
        badge="REGIONAL & LONG HAUL"
      />

      <ServiceGrid
        eyebrow="Our Fleet"
        title={heading}
        subtitle={subtitle}
        items={services}
        basePath="/semi-truck"
        columns={3}
      />

      <ServiceWhy
        eyebrow="Why Semi Truck"
        title="Built for serious freight."
        subtitle="From temperature-controlled products to general freight and oversized loads, we have the right equipment to move your shipment."
        items={SEMI_TRUCK_FEATURES}
      />

      <ServiceHow
        eyebrow="How It Works"
        title="From booking to delivery."
        steps={SEMI_TRUCK_STEPS}
      />

      <ServiceCTA
        service="Semi Truck"
        title="Need a semi truck"
        highlight="today?"
        subtitle="Get a fast semi truck freight quote. Choose from reefer, dry van or flatbed transportation for your next shipment."
      />
    </main>
  );
}
