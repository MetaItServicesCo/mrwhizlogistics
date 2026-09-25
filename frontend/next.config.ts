import path from "node:path";
import type { NextConfig } from "next";

// Where the FastAPI backend is reachable from the Next.js server. Rewrites are
// resolved at build time, so in Docker this comes from a build arg.
const API_ORIGIN = (
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which is what the
  // production Docker image runs.
  output: "standalone",

  // There is a package.json at the repo root as well as in frontend/, so Next
  // has to be told which one is the real project root when tracing files.
  outputFileTracingRoot: path.join(__dirname),

  // Don't advertise the framework in every response.
  poweredByHeader: false,

  async redirects() {
    // permanent: true sends a 308, which search engines treat like a 301.
    return [
      // No /quote page exists; old buttons and any outside links go to Contact.
      { source: "/quote", destination: "/contact", permanent: true },
      // Rentals used to declare these as their canonical URLs (they 404ed).
      { source: "/hot-shot/rentals", destination: "/rentals", permanent: true },
      { source: "/hot-shot/rentals/:slug", destination: "/rentals/:slug", permanent: true },
    ];
  },

  async rewrites() {
    return [
      // Images uploaded from the dashboard are stored as "/uploads/<file>" and
      // served by the backend. Proxying the path through Next means those
      // relative URLs work everywhere: in editor content, in plain <img> tags,
      // and in next/image, whose optimiser fetches local paths from this server
      // and previously got a 400 because Next had no /uploads route.
      {
        source: "/uploads/:path*",
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
