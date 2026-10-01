import HomePage from "@/components/home/HomePage";
import { managedPageMetadata } from "@/lib/seoPageMetadata";

// The page itself is a client component (scroll-driven hero), so its
// metadata lives in this small server wrapper.
export const generateMetadata = () => managedPageMetadata("home");

export default function Page() {
  return <HomePage />;
}
