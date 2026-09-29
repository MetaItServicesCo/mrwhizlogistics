import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import AboutExpertise from "@/components/about/AboutExpertise";
import WhyChooseUs from "@/components/about/WhyChooseUs";
import TeamSection from "@/components/about/TeamSection";
import AboutCTA from "@/components/about/AboutCTA";
import { getPublicSettings, getPublicTeam } from "@/lib/serverContent";
import { settingsMap } from "@/lib/contentAdapters";
import { ABOUT_PAGE_KEY, parseAboutContent } from "@/lib/aboutPage";
import { pageMetadata, sharedOpenGraph } from "@/lib/seo";

/** Content from Dashboard -> Pages -> About Us (defaults to the original text). */
async function aboutContent() {
  return parseAboutContent(settingsMap((await getPublicSettings()) || [])[ABOUT_PAGE_KEY]);
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await aboutContent();
  const base = pageMetadata({
    title: "About Us: Trusted Trucking Partner",
    description: seo.metaDescription,
    path: "/about",
  });
  // A Meta title typed in the dashboard is used exactly as written.
  return seo.metaTitle
    ? {
        ...base,
        title: { absolute: seo.metaTitle },
        openGraph: { ...sharedOpenGraph, ...base.openGraph, title: seo.metaTitle },
      }
    : base;
}

export default async function AboutPage() {
  const [content, apiMembers] = await Promise.all([aboutContent(), getPublicTeam()]);
  const members = apiMembers?.map((member) => ({
    name: member.name,
    role: member.role,
    image: member.image || undefined,
    imageAlt: member.image_alt || undefined,
    socials: member.socials,
  }));

  return (
    <main>
      <HotShotHero title={content.hero.title} crumb="About" badge={content.hero.badge} />
      {content.intro.visible && <AboutExpertise content={content.intro} />}
      {content.fleet.visible && <WhyChooseUs content={content.fleet} />}
      {content.team.visible && <TeamSection members={members || undefined} content={content.team} />}
      {content.cta.visible && <AboutCTA content={content.cta} />}
    </main>
  );
}
