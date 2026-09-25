import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, sharedOpenGraph } from "@/lib/seo";

// The page itself is a client component (scroll-driven hero), so its
// metadata lives in this small server wrapper.
export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { ...sharedOpenGraph, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, url: "/" },
};

export default function Page() {
  return <HomePage />;
}
