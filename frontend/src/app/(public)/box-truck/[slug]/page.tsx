import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import {
  BOX_TRUCK_SERVICES,
  getBoxTruckService,
} from "@/data/boxTruckServices";
import { notFound } from "next/navigation";
import { truckCardToService } from "@/lib/contentAdapters";
import {
  getBoxTruckCard,
  getBoxTruckCards,
  loadDetail,
} from "@/lib/serverContent";

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
  const service = card ? truckCardToService(card, fallback, true) : fallback;

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
