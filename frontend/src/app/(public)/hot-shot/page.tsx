"use client";

import HotShotHero from "@/components/hot-shot/HotShotHero";
import HotShotServices from "@/components/hot-shot/HotShotServices";
import HotShotWhy from "@/components/hot-shot/HotShotWhy";
import HotShotHow from "@/components/hot-shot/HotShotHow";
import HotShotCTA from "@/components/hot-shot/HotShotCTA";

export default function HotShotPage() {
  return (
    <main>
      <HotShotHero
        title="Hot Shot"
        crumb="Hot Shot"
        badge="SAME-DAY DISPATCH"
      />

      <HotShotServices />

      <HotShotWhy />

      <HotShotHow />

      <HotShotCTA />
    </main>
  );
}
