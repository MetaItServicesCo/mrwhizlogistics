import ChatWidget from "@/components/chat/ChatWidget";
import AdvancedFooterCTA from "@/components/footer/AdvancedFooterCTA";
import MailingListCTA from "@/components/footer/MailingListCTA";
import Navbar from "@/components/header/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      {children}
      {/* <MailingListCTA /> */}
      <ChatWidget />
      <AdvancedFooterCTA />
    </>
  );
}
