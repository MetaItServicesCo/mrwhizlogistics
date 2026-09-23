import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import RentalsIntro from "@/components/rentals/RentalsIntro";
import HotShotRentals from "@/components/rentals/HotShotRentals";
import WhyRentWithUs from "@/components/rentals/WhyRentWithUs";
import RentalBenefits from "@/components/rentals/RentalBenefits";
import RentalHowItWorks from "@/components/rentals/RentalHowItWorks";
import RentalFaq from "@/components/rentals/RentalFaq";
import RentalFinalCta from "@/components/rentals/RentalFinalCta";
import RentalQuoteModal from "@/components/rentals/RentalQuoteModal";
// import { useState } from "react";
import { RentalItem } from "@/data/hotShotRentals";

export const metadata: Metadata = {
  title: "Hot Shot Equipment Rentals | Flatbed, Gooseneck & Enclosed Trailers",
  description:
    "Rent hot shot trailers — flatbed, gooseneck and enclosed — on flexible daily, weekly and monthly terms for construction, job-site and specialty hauling.",
  alternates: { canonical: "/hot-shot/rentals" },
  openGraph: {
    title: "Hot Shot Equipment Rentals",
    description: "Flexible flatbed, gooseneck and enclosed trailer rentals.",
    url: "/hot-shot/rentals",
    type: "website",
  },
};

export default function HotShotRentalsPage() {
  return (
    <main>
      <HotShotHero
        title="Hot Shot Rentals"
        crumb="Rentals"
        badge="EQUIPMENT RENTALS"
      />
      <RentalsIntro />
      <HotShotRentals />
      <WhyRentWithUs />
      {/* <RentalBenefits /> */}
      <RentalHowItWorks />
      <RentalFaq />
      <RentalFinalCta />
    </main>
  );
}
