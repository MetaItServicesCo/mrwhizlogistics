import { notFound } from "next/navigation";

import HotShotServiceDetail from "@/components/hot-shot/HotShotServiceDetail";
import { HOT_SHOT_SERVICES, getHotShotService } from "@/data/hotShotServices";

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

  const service = getHotShotService(slug);

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

  const service = getHotShotService(slug);

  if (!service) {
    notFound();
  }

  return (
    <HotShotServiceDetail
      service={service}
      services={HOT_SHOT_SERVICES} // <--- Yeh add karein
      basePath="/hot-shot" // <--- Yeh add karein (aapka route URL prefix)
    />
  );
}
