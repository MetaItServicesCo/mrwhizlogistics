"use client";

import TruckCardsPage from "@/components/admin/TruckCardsPage";

export default function BoxTruckAdminPage() {
  return (
    <TruckCardsPage
      title="Box Truck"
      subtitle="Service cards shown on the Box Truck pages of the website."
      endpoint="/api/box-trucks"
    />
  );
}
