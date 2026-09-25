import HotShotHero from "@/components/hot-shot/HotShotHero";
import HotShotServices from "@/components/hot-shot/HotShotServices";
import HotShotWhy from "@/components/hot-shot/HotShotWhy";
import HotShotHow from "@/components/hot-shot/HotShotHow";
import HotShotCTA from "@/components/hot-shot/HotShotCTA";
import { HOT_SHOT_SERVICES } from "@/data/hotShotServices";
import { truckCardToService } from "@/lib/contentAdapters";
import { getHotshotCards } from "@/lib/serverContent";

export default async function HotShotPage() {
  const cards = await getHotshotCards();
  const services = cards
    ? cards.map((card) =>
        truckCardToService(
          card,
          HOT_SHOT_SERVICES.find((item) => item.slug === card.slug),
        ),
      )
    : HOT_SHOT_SERVICES;
  const heading =
    cards?.[0]?.page_heading || "HotShot freight. Every kind of load.";
  const subheading =
    cards?.[0]?.page_subheading ||
    "Whatever needs to be there today, we have a dedicated transportation solution built to move it fast.";

  return (
    <main>
      <HotShotHero
        title="Hot Shot"
        crumb="Hot Shot"
        badge="SAME-DAY DISPATCH"
      />

      <HotShotServices
        services={services}
        heading={heading}
        subheading={subheading}
      />

      <HotShotWhy />

      <HotShotHow />

      <HotShotCTA />
    </main>
  );
}
