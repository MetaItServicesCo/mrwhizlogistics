import Script from "next/script";

/**
 * Microsoft Clarity (heatmaps and session recordings) - the standard snippet,
 * loaded after the page is interactive so it never delays the first render.
 * Public site only: the dashboard shows customers' contact details, which
 * must not end up in session recordings.
 */
export default function MicrosoftClarity({ id }: { id: string }) {
  // Dashboard -> SEO & Tracking; validated before it gets here.
  if (!/^[a-z0-9]{5,20}$/.test(id)) return null;
  const CLARITY_PROJECT_ID = id;
  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
