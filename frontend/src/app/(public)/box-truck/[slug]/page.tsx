import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import {
  BOX_TRUCK_SERVICES,
  getBoxTruckService,
} from "@/data/boxTruckServices";
import { notFound } from "next/navigation";

export default async function BoxTruckServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getBoxTruckService(slug);

  if (!service) notFound();

  return (
    <HotShotServiceDetail
      service={service}
      services={BOX_TRUCK_SERVICES} // <--- Yeh add karna zaroori hai
      basePath="/box-truck"
    />
  );
}
