import HotShotHero from "@/components/hot-shot/HotShotHero";
import ContactSection from "@/components/contact/ContactSection";
import ContactMap from "@/components/contact/ContactMap";
import { managedPageMetadata } from "@/lib/seoPageMetadata";
import { contactContent } from "@/lib/contactPage";
import { settingsMap } from "@/lib/contentAdapters";
import { getPublicSettings } from "@/lib/serverContent";

export const generateMetadata = () => managedPageMetadata("contact");

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
