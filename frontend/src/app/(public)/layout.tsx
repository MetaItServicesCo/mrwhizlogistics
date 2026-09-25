import ChatWidget from "@/components/chat/ChatWidget";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import AdvancedFooterCTA from "@/components/footer/AdvancedFooterCTA";
import MailingListCTA from "@/components/footer/MailingListCTA";
import Navbar from "@/components/header/Navbar";
import { footerLogoFromSettings, logoFromSettings } from "@/lib/branding";
import { settingsMap } from "@/lib/contentAdapters";
import {
  getBoxTruckCards,
  getHotshotCards,
  getPublicSettings,
  getSemiTruckCards,
} from "@/lib/serverContent";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // One round of parallel calls. The service lists are memoised per request,
  // so a listing page that also needs them doesn't fetch twice.
  const [settingRows, hotshots, boxTrucks, semiTrucks] = await Promise.all([
    getPublicSettings(),
    getHotshotCards(),
    getBoxTruckCards(),
    getSemiTruckCards(),
  ]);
  const settings = settingsMap(settingRows || []);
  const logo = logoFromSettings(settings);

  return (
    <>
      {/* GA4 on the public site only, so dashboard use doesn't count as visitors. */}
      <GoogleAnalytics />
      <Navbar
        phone={settings.phone}
        logo={logo}
        menu={{
          "Hot Shot": hotshots,
          "Box Truck": boxTrucks,
          "Semi Truck": semiTrucks,
        }}
      />

      {children}
      {/* <MailingListCTA /> */}
      <ChatWidget />
      <AdvancedFooterCTA
        companyName={settings.company_name}
        phone={settings.phone}
        email={settings.email}
        linkedinUrl={settings.linkedin_url}
        xUrl={settings.x_url}
        youtubeUrl={settings.youtube_url}
        logo={logo}
        footerLogo={footerLogoFromSettings(settings)}
      />
    </>
  );
}
