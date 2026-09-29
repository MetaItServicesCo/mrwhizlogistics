import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

// Content: Dashboard -> Pages -> Legal.
export const generateMetadata = () => legalMetadata("privacy-policy");

export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}
