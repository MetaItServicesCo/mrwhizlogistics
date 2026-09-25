import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import { HOT_SHOT_SERVICES, getHotShotService } from "@/data/hotShotServices";
import { truckCardToService } from "@/lib/contentAdapters";
import { getHotshotCard, getHotshotCards } from "@/lib/serverContent";

export function generateStaticParams() {
  return HOT_SHOT_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const card = await getHotshotCard(slug);
  const fallback = getHotShotService(slug);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    return {
      title: "Hot Shot Service",
    };
  }

  return {
    title: `${service.title} | Hot Shot Transportation`,
    description: service.shortDescription,
  };
}

export default async function HotShotServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [card, cards] = await Promise.all([
    getHotshotCard(slug),
    getHotshotCards(),
  ]);
  const fallback = getHotShotService(slug);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    notFound();
  }

  const services = cards
    ? cards.map((item) =>
        truckCardToService(
          item,
          HOT_SHOT_SERVICES.find((fallbackItem) => fallbackItem.slug === item.slug),
        ),
      )
    : HOT_SHOT_SERVICES;

  return (
    <HotShotServiceDetail
      service={service}
      services={services}
      basePath="/hot-shot" // <--- Yeh add karein (aapka route URL prefix)
    />
  );
}
