"use client";

import TruckCardsPage from "@/components/admin/TruckCardsPage";

export default function SemiTruckAdminPage() {
  return (
    <TruckCardsPage
      title="Semi Truck"
      subtitle="Service cards shown on the Semi Truck pages of the website."
      endpoint="/api/semi-trucks"
      withSemiFields
    />
  );
}
