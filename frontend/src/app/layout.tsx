import type { Metadata } from "next";
import "@fontsource-variable/roboto/wght.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import { BRAND_CSS_VARIABLES } from "@/theme/brand";
import { AuthProvider } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, sharedOpenGraph } from "@/lib/seo";
import { getPublicSettings } from "@/lib/serverContent";
import { settingsMap } from "@/lib/contentAdapters";
import { SEO_TRACKING_KEY, parseSeoTracking } from "@/lib/seoTracking";
import "./globals.css";

const baseMetadata: Metadata = {
  // Resolves relative canonical / Open Graph URLs to absolute ones.
  metadataBase: new URL(SITE_URL),
  // Pages set a short title; the template adds the brand. The default is
  // used by any page without its own title.
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  // Pages that set their own openGraph spread sharedOpenGraph (Next.js
  // replaces the whole object rather than merging it).
  openGraph: sharedOpenGraph,
  twitter: { card: "summary_large_image" },
};

/**
 * Search engine ownership checks (Dashboard -> SEO & Tracking): Google
 * Search Console's google-site-verification and Bing's msvalidate.01 tags.
 */
export async function generateMetadata(): Promise<Metadata> {
  const rows = await getPublicSettings();
  const seo = parseSeoTracking(settingsMap(rows || [])[SEO_TRACKING_KEY]);
  const { google, bing } = seo.verification;
  return {
    ...baseMetadata,
    verification: {
      ...(google ? { google } : {}),
      ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Brand colour variables (var(--accent) etc.), from src/theme/brand.ts */}
        <style dangerouslySetInnerHTML={{ __html: BRAND_CSS_VARIABLES }} />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
