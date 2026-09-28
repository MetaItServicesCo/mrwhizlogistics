import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import ContactSection from "@/components/contact/ContactSection";
import ContactMap from "@/components/contact/ContactMap";
import { pageMetadata } from "@/lib/seo";
import { contactContent } from "@/lib/contactPage";
import { settingsMap } from "@/lib/contentAdapters";
import { getPublicSettings } from "@/lib/serverContent";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: Get a Freight Quote",
  description:
    "Get in touch for hot shot, box truck, semi truck and equipment rental quotes. 24/7 dispatch — we reply the same day. Call or send us your shipment details.",
  path: "/contact",
});

export default async function ContactPage() {
  // Same memoised settings call the layout makes, so no extra request.
  const content = contactContent(settingsMap((await getPublicSettings()) || []));
  return (
    <main>
      <HotShotHero title={content.heroTitle} crumb="Contact" badge={content.heroBadge} />
      <ContactSection content={content} />
      <ContactMap address={content.address} label={content.mapLabel} />
    </main>
  );
}
