import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import ServiceGrid from "@/components/service/ServiceGrid";
import ServiceWhy from "@/components/service/ServiceWhy";
import ServiceHow from "@/components/service/ServiceHow";
import ServiceCTA from "@/components/service/ServiceCTA";
import {
  BOX_TRUCK_SERVICES,
  BOX_TRUCK_FEATURES,
  BOX_TRUCK_STEPS,
} from "@/data/boxTruckContent";

export const metadata: Metadata = {
  title: "Box Truck Delivery Services | Local, Retail & Last-Mile Freight",
  description:
    "Reliable box truck delivery for local, regional, retail and last-mile freight. Liftgate-equipped, GPS-tracked and fully insured. Get a fast quote today.",
  alternates: { canonical: "/box-truck" },
  openGraph: {
    title: "Box Truck Delivery Services",
    description:
      "Local, regional and last-mile box truck freight, liftgate-equipped and GPS-tracked.",
    url: "/box-truck",
    type: "website",
  },
};

export default function BoxTruckPage() {
  return (
    <main>
      <HotShotHero
        title="Box Truck"
        crumb="Box Truck"
        badge="LOCAL & REGIONAL"
        image="/images/box-truck-hero.jpg"
      />

      <ServiceGrid
        eyebrow="Our Fleet"
        title="Choose the right box truck"
        subtitle="Two sizes, one standard of service — pick the truck that fits your load."
        items={BOX_TRUCK_SERVICES}
        basePath="/box-truck"
        columns={2}
      />

      <ServiceWhy
        eyebrow="Why Box Truck"
        title="Built for reliable local delivery."
        subtitle="Right-sized trucks, liftgate loading and live tracking on every run."
        items={BOX_TRUCK_FEATURES}
      />

      <ServiceHow
        eyebrow="How It Works"
        title="From booking to your door."
        steps={BOX_TRUCK_STEPS}
      />

      <ServiceCTA
        service="Box Truck"
        title="Need a box truck"
        highlight="today?"
        subtitle="Get a fast box truck quote in minutes. Same-day and next-day slots available."
      />
    </main>
  );
}
