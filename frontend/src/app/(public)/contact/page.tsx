import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import ContactSection from "@/components/contact/ContactSection";
import ContactMap from "@/components/contact/ContactMap";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: Get a Freight Quote",
  description:
    "Get in touch for hot shot, box truck, semi truck and equipment rental quotes. 24/7 dispatch — we reply the same day. Call or send us your shipment details.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main>
      <HotShotHero
        title="Contact Us"
        crumb="Contact"
        badge="24/7 DISPATCH"
      />
      <ContactSection />
      <ContactMap />
    </main>
  );
}
