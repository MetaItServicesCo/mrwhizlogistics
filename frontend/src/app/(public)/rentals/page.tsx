import RentalHero from "@/components/rentals/RentalHero";
import RentalsIntro from "@/components/rentals/RentalsIntro";
import HotShotRentals from "@/components/rentals/HotShotRentals";
import WhyRentWithUs from "@/components/rentals/WhyRentWithUs";
import RentalHowItWorks from "@/components/rentals/RentalHowItWorks";
import RentalFaq from "@/components/rentals/RentalFaq";
import RentalFinalCta from "@/components/rentals/RentalFinalCta";
import { HOT_SHOT_RENTALS } from "@/data/hotShotRentals";
import { RENTAL_DEFAULTS } from "@/lib/rentalContent";
import { getRentalPage, getRentalItems } from "@/lib/serverContent";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getRentalPage() ?? RENTAL_DEFAULTS.page;
  return pageMetadata({title: content.seo.metaTitle, description: content.seo.metaDescription, path: "/rentals"});
}

export default async function HotShotRentalsPage() {
  const [page, rentals] = await Promise.all([getRentalPage(), getRentalItems()]);
  const content = page ?? RENTAL_DEFAULTS.page;
  const sections = content.sections;
  return (
    <main>
      <RentalHero {...content.hero} />
      {sections.RentalsIntro.enabled && <RentalsIntro content={sections.RentalsIntro} />}
      {sections.HotShotRentals.enabled && <HotShotRentals
        content={sections.HotShotRentals} cardContent={sections.RentalCard}
        items={sections.RentalCard.enabled ? rentals ?? HOT_SHOT_RENTALS : []} />}
      {sections.WhyRentWithUs.enabled && <WhyRentWithUs content={sections.WhyRentWithUs} />}
      {sections.RentalHowItWorks.enabled && <RentalHowItWorks content={sections.RentalHowItWorks} />}
      {sections.RentalFaq.enabled && <RentalFaq content={sections.RentalFaq} />}
      {sections.RentalFinalCta.enabled && <RentalFinalCta content={sections.RentalFinalCta} />}
    </main>
  );
}
