import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

// Content: Dashboard -> Pages -> Legal.
export const generateMetadata = () => legalMetadata("terms");

export default function Page() {
  return <LegalPage slug="terms" />;
}
