/**
 * Dashboard -> SEO & Tracking: everything search engines, analytics and AI
 * assistants read from the website, stored as one site setting (JSON).
 *
 * Defaults are the values the site used before this page existed, so a site
 * with nothing saved behaves exactly as before. Every value is validated
 * before it is rendered: IDs are inserted into script tags, so they must
 * match a strict pattern or they are dropped.
 */

import { contactContent } from "@/lib/contactPage";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";
import { brandLogoUrl } from "@/lib/branding";

export const SEO_TRACKING_KEY = "seo_tracking";

export interface SchemaBlock {
  name: string;
  /** JSON-LD (validated JSON object or array). */
  json: string;
}

export interface SeoTracking {
  verification: { google: string; bing: string };
  analytics: { ga4: string; clarity: string };
  sitemap: { exclude: string[] };
  robots: { mode: "recommended" | "custom"; custom: string };
  llms: { mode: "recommended" | "custom"; custom: string };
  schema: { business: boolean; blocks: SchemaBlock[] };
}

export const SEO_TRACKING_DEFAULTS: SeoTracking = {
  verification: { google: "MKqnyAIhuNgEmxJmP3G3PXH7fLMFfL4FvUhIQTOVvwI", bing: "" },
  analytics: { ga4: "G-MCRJ9LNSGB", clarity: "ynwqxtrfx4" },
  sitemap: { exclude: [] },
  robots: { mode: "recommended", custom: "" },
  llms: { mode: "recommended", custom: "" },
  schema: { business: true, blocks: [] },
};

export const LIMITS = { robots: 20_000, llms: 100_000, block: 20_000, blocks: 20, exclude: 200 };

// ---------------------------------------------------------------- validation

const GA4_RE = /^G-[A-Z0-9]{4,20}$/;
const CLARITY_RE = /^[a-z0-9]{5,20}$/;
const TOKEN_RE = /^[A-Za-z0-9_\-+=.]{6,200}$/;

/** Accepts the bare code or the whole <meta ... content="CODE"> tag. */
export function verificationToken(input: string): string {
  const v = input.trim();
  const m = v.match(/content\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : v).trim();
}

export const validGa4 = (v: string) => v === "" || GA4_RE.test(v);
export const validClarity = (v: string) => v === "" || CLARITY_RE.test(v);
export const validToken = (v: string) => v === "" || TOKEN_RE.test(v);

/** Parsed JSON-LD, or an error message. */
export function parseSchemaJson(text: string): { value?: object; error?: string } {
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object") return { error: "Must be a JSON object or array." };
    const items = Array.isArray(value) ? value : [value];
    if (!items.every((i) => i && typeof i === "object" && ("@type" in i || "@graph" in i))) {
      return { error: 'Each item needs an "@type" (or "@graph").' };
    }
    return { value };
  } catch (e) {
    return { error: `Not valid JSON: ${(e as Error).message}` };
  }
}

/** "/blog/x" or "https://site/blog/x" -> "/blog/x"; anything else -> "". */
export function normalizePath(input: string): string {
  let v = input.trim();
  if (!v) return "";
  try {
    if (/^https?:\/\//i.test(v)) v = new URL(v).pathname;
  } catch {
    return "";
  }
  if (!v.startsWith("/")) v = `/${v}`;
  return v.length > 1 ? v.replace(/\/+$/, "") : v;
}

// ---------------------------------------------------------------- parsing

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export function parseSeoTracking(raw: string | null | undefined): SeoTracking {
  let s: Record<string, unknown> = {};
  try {
    s = obj(raw ? JSON.parse(raw) : {});
  } catch {
    /* defaults */
  }
  const d = SEO_TRACKING_DEFAULTS;
  const ver = obj(s.verification);
  const ana = obj(s.analytics);
  const pick = (value: unknown, fallback: string, ok: (v: string) => boolean) => {
    if (typeof value !== "string") return fallback; // never saved: keep the default
    const v = value.trim();
    return ok(v) ? v : ""; // saved but invalid: off (never rendered)
  };
  const robots = obj(s.robots);
  const llms = obj(s.llms);
  const schema = obj(s.schema);
  const blocks = Array.isArray(schema.blocks) ? schema.blocks : [];
  return {
    verification: {
      google: pick(ver.google, d.verification.google, validToken),
      bing: pick(ver.bing, d.verification.bing, validToken),
    },
    analytics: {
      ga4: pick(ana.ga4, d.analytics.ga4, validGa4),
      clarity: pick(ana.clarity, d.analytics.clarity, validClarity),
    },
    sitemap: {
      exclude: (Array.isArray(obj(s.sitemap).exclude) ? (obj(s.sitemap).exclude as unknown[]) : [])
        .map((p) => (typeof p === "string" ? normalizePath(p) : ""))
        .filter(Boolean)
        .slice(0, LIMITS.exclude),
    },
    robots: { mode: robots.mode === "custom" ? "custom" : "recommended", custom: str(robots.custom, LIMITS.robots) },
    llms: { mode: llms.mode === "custom" ? "custom" : "recommended", custom: str(llms.custom, LIMITS.llms) },
    schema: {
      business: typeof schema.business === "boolean" ? schema.business : d.schema.business,
      blocks: blocks
        .map((b) => ({ name: str(obj(b).name, 120), json: str(obj(b).json, LIMITS.block) }))
        .filter((b) => b.json.trim())
        .slice(0, LIMITS.blocks),
    },
  };
}

// ---------------------------------------------------------------- generated content

/** The rules robots.txt has always served. */
export function recommendedRobots(siteUrl: string): string {
  return [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /login",
    "Disallow: /register",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /docs",
    "Disallow: /redoc",
    "Disallow: /openapi.json",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

export interface CompanyInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  logo?: string;
  description?: string;
}

/** Site-wide LocalBusiness JSON-LD from the company details in Settings. */
export function businessSchema(siteUrl: string, c: CompanyInfo): Record<string, unknown> {
  const abs = (p?: string) => (!p ? undefined : /^https?:\/\//i.test(p) ? p : `${siteUrl}${p.startsWith("/") ? "" : "/"}${p}`);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: c.name,
    url: siteUrl,
    logo: abs(c.logo),
    image: abs(c.logo),
    description: c.description || undefined,
    telephone: c.phone || undefined,
    email: c.email || undefined,
    address: c.address ? { "@type": "PostalAddress", streetAddress: c.address.replace(/\s*\n\s*/g, ", ") } : undefined,
    openingHours: c.hours || undefined,
  };
  return JSON.parse(JSON.stringify(schema));
}

/** Company details from the site settings (with the site's usual defaults). */
export function companyInfo(settings: Record<string, string | null | undefined>): CompanyInfo {
  const c = contactContent(settings);
  return {
    name: (settings.company_name || "").trim() || "Mr. Whiz Logistics",
    phone: c.phone,
    email: c.email,
    address: c.address,
    hours: c.hours,
    logo: brandLogoUrl(settings),
    description: DEFAULT_DESCRIPTION,
  };
}
