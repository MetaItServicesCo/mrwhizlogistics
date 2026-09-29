import ChatWidget from "@/components/chat/ChatWidget";
import AdminBar from "@/components/common/AdminBar";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { CtaProvider } from "@/components/common/CtaProvider";
import { CTA_SETTING_KEY, parseCtaOverrides } from "@/lib/cta";
import MicrosoftClarity from "@/components/common/MicrosoftClarity";
import AdvancedFooterCTA from "@/components/footer/AdvancedFooterCTA";
import MailingListCTA from "@/components/footer/MailingListCTA";
import Navbar from "@/components/header/Navbar";
import { footerLogoFromSettings, logoFromSettings } from "@/lib/branding";
import { legalPath } from "@/lib/legalPages";
import { settingsMap } from "@/lib/contentAdapters";
import {
  getBoxTruckCards,
  getHotshotCards,
  getLegalPages,
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
  const [settingRows, hotshots, boxTrucks, semiTrucks, legalPages] = await Promise.all([
    getPublicSettings(),
    getHotshotCards(),
    getBoxTruckCards(),
    getSemiTruckCards(),
    getLegalPages(),
  ]);
  const settings = settingsMap(settingRows || []);
  const logo = logoFromSettings(settings);
  const ctaOverrides = parseCtaOverrides(settings[CTA_SETTING_KEY]);

  return (
    <CtaProvider overrides={ctaOverrides} phone={settings.phone}>
      {/* Analytics on the public site only, so dashboard use isn't counted as
          visitors and customer details shown there are never recorded. */}
      <GoogleAnalytics />
      <MicrosoftClarity />
      <Navbar
        phone={settings.phone}
        logo={logo}
        companyName={settings.company_name}
        menu={{
          "Hot Shot": hotshots,
          "Box Truck": boxTrucks,
          "Semi Truck": semiTrucks,
        }}
      />

      {children}
      {/* <MailingListCTA /> */}
      <ChatWidget />
      <AdminBar />
      <AdvancedFooterCTA
        companyName={settings.company_name}
        phone={settings.phone}
        email={settings.email}
        linkedinUrl={settings.linkedin_url}
        xUrl={settings.x_url}
        youtubeUrl={settings.youtube_url}
        logo={logo}
        footerLogo={footerLogoFromSettings(settings)}
        address={settings.address}
        legalLinks={(legalPages || []).map((p) => ({ title: p.title, href: legalPath(p.slug) }))}
      />
    </CtaProvider>
  );
}
