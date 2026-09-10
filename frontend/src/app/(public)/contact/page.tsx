import type { Metadata } from "next";
import HotShotHero from "@/components/hot-shot/HotShotHero";
import ContactSection from "@/components/contact/ContactSection";
import ContactMap from "@/components/contact/ContactMap";

export const metadata: Metadata = {
  title: "Contact Us | Get a Freight & Trucking Quote",
  description:
    "Get in touch for hot shot, box truck, semi truck and equipment rental quotes. 24/7 dispatch — we reply the same day. Call or send us your shipment details.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Get a Quote",
    description:
      "Hot shot, box truck, semi truck and rental quotes. 24/7 dispatch.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main>
      <HotShotHero
        title="Contact Us"
        crumb="Contact"
        badge="24/7 DISPATCH"
        image="/images/contact-hero.jpg"
      />
      <ContactSection />
      <ContactMap />
    </main>
  );
}
