import ChatWidget from "@/components/chat/ChatWidget";
import AdvancedFooterCTA from "@/components/footer/AdvancedFooterCTA";
import MailingListCTA from "@/components/footer/MailingListCTA";
import Navbar from "@/components/header/Navbar";
import { settingsMap } from "@/lib/contentAdapters";
import { getPublicSettings } from "@/lib/serverContent";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = settingsMap((await getPublicSettings()) || []);

  return (
    <>
      <Navbar />

      {children}
      {/* <MailingListCTA /> */}
      <ChatWidget />
      <AdvancedFooterCTA
        companyName={settings.company_name}
        phone={settings.phone}
        email={settings.email}
      />
    </>
  );
}
