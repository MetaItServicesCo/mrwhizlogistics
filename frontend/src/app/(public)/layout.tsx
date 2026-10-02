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
import { pagePath } from "@/lib/contentPages";
import { settingsMap } from "@/lib/contentAdapters";
import { CHATBOT_SETTINGS_KEY, parseChatbotSettings } from "@/lib/chatbotSettings";
import {
  getBoxTruckCards,
  getHotshotCards,
  getPublicPages,
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
  const [settingRows, hotshots, boxTrucks, semiTrucks, contentPages] = await Promise.all([
    getPublicSettings(),
    getHotshotCards(),
    getBoxTruckCards(),
    getSemiTruckCards(),
    getPublicPages(),
  ]);
  const settings = settingsMap(settingRows || []);
  // Dashboard -> Chatbot -> Settings (greeting, quick prompts, on/off).
  const chatbot = parseChatbotSettings(settings[CHATBOT_SETTINGS_KEY]);
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
      <MailingListCTA />
      <ChatWidget
        config={{
          enabled: chatbot.enabled,
          greeting: chatbot.greeting,
          quickPrompts: chatbot.quick_prompts,
          phone: settings.phone,
        }}
      />
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
        pageLinks={(contentPages || [])
          .filter((p) => p.show_in_footer)
          .map((p) => ({ title: p.title, href: pagePath(p.slug) }))}
      />
    </CtaProvider>
  );
}
