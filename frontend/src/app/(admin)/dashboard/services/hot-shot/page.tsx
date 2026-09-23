"use client";

import TruckCardsPage from "@/components/admin/TruckCardsPage";

export default function HotShotAdminPage() {
  return (
    <TruckCardsPage
      title="Hot Shot"
      subtitle="Service cards shown on the Hot Shot pages of the website."
      endpoint="/api/hotshots"
    />
  );
}
