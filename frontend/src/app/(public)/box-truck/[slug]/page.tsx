import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import {
  BOX_TRUCK_SERVICES,
  getBoxTruckService,
} from "@/data/boxTruckServices";
import { notFound } from "next/navigation";
import { truckCardToService } from "@/lib/contentAdapters";
import { detailMetadata, serviceTitle, usableCanonical } from "@/lib/seo";
import {
  getBoxTruckCard,
  getBoxTruckCards,
  loadDetail,
  loadDetailForMetadata,
} from "@/lib/serverContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const card = await loadDetailForMetadata(() => getBoxTruckCard(slug));
  const fallback = getBoxTruckService(slug);
  const service = card ? truckCardToService(card, fallback, true) : fallback;

  if (!service) {
    return {
      title: "Box Truck Service",
    };
  }

  const name = service.name || service.title;
  const siblings = await getBoxTruckCards();
  return detailMetadata({
    seo: {
      ...service,
      canonicalUrl: usableCanonical(service.canonicalUrl, "box-truck", siblings?.map((c) => c.slug)),
    },
    name,
    fallbackTitle: serviceTitle(name, "box-truck"),
    fallbackDescription: service.shortDescription,
    path: `/box-truck/${service.slug}`,
    image: service.image,
    imageAlt: name,
  });
}

export default async function BoxTruckServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallback = getBoxTruckService(slug);
  const [card, cards] = await Promise.all([
    loadDetail(() => getBoxTruckCard(slug), Boolean(fallback)),
    getBoxTruckCards(),
  ]);
  // Bundled copy only while the API is down; a slug the dashboard doesn't
  // have is a 404, not a duplicate page.
  const service = card.live
    ? truckCardToService(card.live, fallback, true)
    : card.outage
      ? fallback
      : undefined;

  if (!service) notFound();

  const services = cards
    ? cards.map((item) =>
        truckCardToService(
          item,
          BOX_TRUCK_SERVICES.find((fallbackItem) => fallbackItem.slug === item.slug),
        ),
      )
    : BOX_TRUCK_SERVICES;

  return (
    <HotShotServiceDetail
      service={service}
      services={services}
      basePath="/box-truck"
    />
  );
}
