import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import { HOT_SHOT_SERVICES, getHotShotService } from "@/data/hotShotServices";
import { truckCardToService } from "@/lib/contentAdapters";
import { detailMetadata, serviceTitle, usableCanonical } from "@/lib/seo";
import {
  getHotshotCard,
  getHotshotCards,
  loadDetail,
  loadDetailForMetadata,
} from "@/lib/serverContent";

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

  const card = await loadDetailForMetadata(() => getHotshotCard(slug));
  const fallback = getHotShotService(slug);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    return {
      title: "Hot Shot Service",
    };
  }

  const name = service.name || service.title;
  const siblings = await getHotshotCards();
  return detailMetadata({
    seo: {
      ...service,
      canonicalUrl: usableCanonical(service.canonicalUrl, "hot-shot", siblings?.map((c) => c.slug)),
    },
    name,
    fallbackTitle: serviceTitle(name, "hot-shot"),
    fallbackDescription: service.shortDescription,
    path: `/hot-shot/${service.slug}`,
    image: service.image,
    imageAlt: name,
  });
}

export default async function HotShotServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const fallback = getHotShotService(slug);
  const [card, cards] = await Promise.all([
    loadDetail(() => getHotshotCard(slug), Boolean(fallback)),
    getHotshotCards(),
  ]);
  // Bundled copy only while the API is down; a slug the dashboard doesn't
  // have is a 404, not a duplicate page.
  const service = card.live
    ? truckCardToService(card.live, fallback, true)
    : card.outage
      ? fallback
      : undefined;

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
