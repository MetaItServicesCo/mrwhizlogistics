/**
 * Every call-to-action button on the public site, with the label and link it
 * ships with. Admins override any of them under Dashboard -> Settings ->
 * Buttons; the overrides live in one site setting (CTA_SETTING_KEY) as JSON,
 * so nothing changes on the site until something is edited there.
 *
 * Tokens usable in labels and links:
 *   {phone}  the company phone from Site settings, e.g. "(469) 767 8853"
 *   {tel}    that phone as a dialable link, e.g. "tel:+14697678853"
 *   {slug}   the current item, on pages that have one (rental detail)
 */

import { telHref } from "@/lib/contact";

export const CTA_SETTING_KEY = "cta_buttons";

/**
 * link   - goes to `href`.
 * quote  - opens the page's quote form; a link set by the admin replaces that.
 * auto   - follows the page (e.g. the homepage showcase links to the service
 *          on screen); a link set by the admin replaces that.
 */
export type CtaKind = "link" | "quote" | "auto";

export interface CtaDefinition {
  id: string;
  group: string;
  /** Where the button appears, for the dashboard. */
  location: string;
  label: string;
  href: string;
  kind: CtaKind;
}

export interface CtaOverride {
  label?: string;
  href?: string;
  hidden?: boolean;
}

export type CtaOverrides = Record<string, CtaOverride>;

const g = {
  header: "Header (every page)",
  home: "Homepage",
  services: "Hot Shot, Box Truck & Semi Truck pages",
  serviceDetail: "Individual service pages",
  rentals: "Rentals page",
  rentalDetail: "Individual rental pages",
  about: "About page",
};

export const CTA_DEFINITIONS: CtaDefinition[] = [
  { id: "header_primary", group: g.header, location: "Lime button in the header and mobile menu", label: "Explore Product", href: "/#our-fleet", kind: "link" },
  { id: "header_secondary", group: g.header, location: "Outlined button next to it", label: "Request Demo", href: "/contact", kind: "link" },

  { id: "home_tier_hotshot", group: g.home, location: "“Our fleet” — Hot Shot card", label: "VIEW OPTIONS", href: "/hot-shot", kind: "link" },
  { id: "home_tier_boxtruck", group: g.home, location: "“Our fleet” — Box Truck card", label: "VIEW OPTIONS", href: "/box-truck", kind: "link" },
  { id: "home_tier_semitruck", group: g.home, location: "“Our fleet” — Semi-Truck card", label: "VIEW OPTIONS", href: "/semi-truck", kind: "link" },
  { id: "home_showcase", group: g.home, location: "Freight showcase slider button", label: "Details", href: "", kind: "auto" },

  { id: "services_quote", group: g.services, location: "Bottom call-to-action — quote button", label: "Get a Quote", href: "", kind: "quote" },
  { id: "services_call", group: g.services, location: "Bottom call-to-action — phone button", label: "{phone}", href: "{tel}", kind: "link" },

  { id: "service_detail_quote", group: g.serviceDetail, location: "Quote panel — quote button", label: "Get a Quote", href: "", kind: "quote" },
  { id: "service_detail_call", group: g.serviceDetail, location: "Quote panel — call button", label: "Call", href: "{tel}", kind: "link" },
  { id: "service_detail_help", group: g.serviceDetail, location: "“Need help” phone link", label: "{phone}", href: "{tel}", kind: "link" },

  { id: "rentals_card_quote", group: g.rentals, location: "Each rental card — quote button", label: "Get a Quote", href: "", kind: "quote" },
  { id: "rentals_card_call", group: g.rentals, location: "Each rental card — call button", label: "Call Now", href: "{tel}", kind: "link" },
  { id: "rentals_how_quote", group: g.rentals, location: "“How it works” — quote button", label: "Request a Quote", href: "/contact", kind: "link" },
  { id: "rentals_how_call", group: g.rentals, location: "“How it works” — call button", label: "Call Our Team", href: "{tel}", kind: "link" },
  { id: "rentals_final_quote", group: g.rentals, location: "Bottom call-to-action — quote button", label: "Get a Rental Quote", href: "/contact", kind: "link" },
  { id: "rentals_final_call", group: g.rentals, location: "Bottom call-to-action — call button", label: "Call Now", href: "{tel}", kind: "link" },

  { id: "rental_detail_quote", group: g.rentalDetail, location: "Quote button", label: "Request Rental Quote", href: "/contact?rental={slug}", kind: "link" },
  { id: "rental_detail_call", group: g.rentalDetail, location: "Call button", label: "Call {phone}", href: "{tel}", kind: "link" },

  { id: "about_cta_quote", group: g.about, location: "Bottom call-to-action — quote button", label: "Get a Free Quote", href: "/contact", kind: "link" },
  { id: "about_cta_call", group: g.about, location: "Bottom call-to-action — phone button", label: "{phone}", href: "{tel}", kind: "link" },
  { id: "about_expertise_more", group: g.about, location: "“Expertise” section button", label: "More About Us", href: "/contact", kind: "link" },
  { id: "about_expertise_call", group: g.about, location: "“Expertise” section phone", label: "{phone}", href: "{tel}", kind: "link" },
  { id: "about_why_more", group: g.about, location: "“Why choose us” button", label: "Read More", href: "/rentals", kind: "link" },
];

export type CtaId = (typeof CTA_DEFINITIONS)[number]["id"];

const BY_ID = new Map(CTA_DEFINITIONS.map((d) => [d.id, d]));

export function getCtaDefinition(id: string): CtaDefinition | undefined {
  return BY_ID.get(id);
}

/** Only these link forms are ever rendered (never javascript: or data:). */
export function safeHref(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#") || v.startsWith("?")) return v;
  if (/^(https?:\/\/|mailto:|tel:)\S+$/i.test(v)) return v;
  return null;
}

/** Whether a link as typed in the dashboard (tokens allowed) is safe to use. */
export function isSafeLinkTemplate(value: string): boolean {
  const sample = value
    .trim()
    .replace(/\{phone\}/g, "(469) 767 8853")
    .replace(/\{tel\}/g, "tel:+14697678853")
    .replace(/\{slug\}/g, "example");
  return safeHref(sample) !== null;
}

/** True for a link that must be a plain <a> rather than a Next.js route link. */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

export function parseCtaOverrides(raw: string | null | undefined): CtaOverrides {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: CtaOverrides = {};
    for (const [id, v] of Object.entries(data as Record<string, unknown>)) {
      if (!BY_ID.has(id) || !v || typeof v !== "object") continue;
      const o = v as Record<string, unknown>;
      // An unsafe link (e.g. javascript:) is dropped here, so it never reaches
      // the page and the button keeps its default destination.
      const href = typeof o.href === "string" && isSafeLinkTemplate(o.href) ? o.href : undefined;
      out[id] = {
        label: typeof o.label === "string" ? o.label : undefined,
        href,
        hidden: o.hidden === true,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export interface ResolvedCta {
  label: string;
  /** Safe link to use, or null for the button's own action (quote/auto). */
  href: string | null;
  hidden: boolean;
}

export function resolveCta(
  id: string,
  overrides: CtaOverrides,
  context: { phone?: string; slug?: string } = {},
): ResolvedCta {
  const def = BY_ID.get(id);
  const o = overrides[id] ?? {};
  const phone = (context.phone || "").trim() || "(469) 767 8853";
  const fill = (s: string) =>
    s
      .replace(/\{phone\}/g, phone)
      .replace(/\{tel\}/g, telHref(phone))
      .replace(/\{slug\}/g, encodeURIComponent(context.slug || ""));

  const label = fill((o.label ?? "").trim() || def?.label || "");
  const rawHref = (o.href ?? "").trim() || def?.href || "";
  return {
    label,
    href: rawHref ? safeHref(fill(rawHref)) : null,
    hidden: o.hidden === true,
  };
}
