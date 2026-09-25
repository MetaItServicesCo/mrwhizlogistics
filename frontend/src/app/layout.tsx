import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import { AuthProvider } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  // Resolves relative canonical / Open Graph URLs to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: "Trucking App",
  description: "Trucking management system",
  // Google Search Console ownership check; renders as a single
  // <meta name="google-site-verification" content="..."> tag in <head>.
  verification: {
    google: "MKqnyAIhuNgEmxJmP3G3PXH7fLMFfL4FvUhIQTOVvwI",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} antialiased`}
      suppressHydrationWarning
    >
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