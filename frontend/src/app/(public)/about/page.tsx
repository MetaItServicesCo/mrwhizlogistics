import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import AboutExpertise from "@/components/about/AboutExpertise";
import WhyChooseUs from "@/components/about/WhyChooseUs";
import FleetOverview from "@/components/about/FleetOverview";
import TeamSection from "@/components/about/TeamSection";
import AboutCTA from "@/components/about/AboutCTA";
import { getPublicTeam } from "@/lib/serverContent";

export const metadata: Metadata = {
  title: "About Us | Trusted Trucking & Logistics Partner",
  description:
    "Learn about our trucking company — hot shot, box truck and semi truck freight across all 50 states, with 24/7 dispatch and reliable, on-time delivery.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | Trucking & Logistics",
    description: "Reliable freight across all 50 states with 24/7 dispatch.",
    url: "/about",
    type: "website",
  },
};

export default async function AboutPage() {
  const apiMembers = await getPublicTeam();
  const members = apiMembers?.map((member) => ({
    name: member.name,
    role: member.role,
    image: member.image || undefined,
    socials: member.socials,
  }));

  return (
    <main>
      <HotShotHero
        title="About Us"
        crumb="About"
        badge="WHO WE ARE"
      />
      <AboutExpertise />
      <WhyChooseUs />
      {/* <FleetOverview /> */}
      <TeamSection members={members || undefined} />
      <AboutCTA />
    </main>
  );
}
