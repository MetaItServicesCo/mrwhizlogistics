import Script from "next/script";

/**
 * Google tag (gtag.js) for GA4 - the standard snippet, loaded after the page
 * is interactive so it never delays the first render. Page views on
 * client-side navigation are picked up by GA4's enhanced measurement
 * (browser history events), which is on by default.
 */
export default function GoogleAnalytics({ id }: { id: string }) {
  // Dashboard -> SEO & Tracking; validated (G-XXXX) before it gets here.
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) return null;
  const GA_MEASUREMENT_ID = id;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
