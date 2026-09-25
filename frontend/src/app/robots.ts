import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Served at /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Admin dashboard and its sign-in pages
        "/dashboard",
        "/login",
        "/register",
        // Backend: JSON API, its docs and the backend admin panel
        "/api/",
        "/admin",
        "/docs",
        "/redoc",
        "/openapi.json",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
