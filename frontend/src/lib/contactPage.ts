/**
 * Content of the Contact page, editable under Dashboard -> Settings ->
 * Contact page. Company details live in their own site settings (they are
 * used elsewhere too: header, footer, call buttons); the page's own wording
 * is one JSON setting. Anything unset falls back to the original text.
 */

export const ADDRESS_KEY = "address";
export const WORKING_HOURS_KEY = "working_hours";
export const CONTACT_PAGE_KEY = "contact_page";

/** One line per row; shown joined with ", " except in the footer. */
export const DEFAULT_ADDRESS = "555 N 5th St 109 B\nGarland, TX 75040\nUnited States";
export const DEFAULT_WORKING_HOURS = "24/7 Dispatch — Always available";
export const DEFAULT_PHONE = "(469) 767 8853";
export const DEFAULT_EMAIL = "dispatch@mrwhizlogistics.com";

export interface ContactPageText {
  heroTitle: string;
  heroBadge: string;
  infoHeading: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  hoursLabel: string;
  formHeading: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  mapLabel: string;
  services: string[];
}

export const DEFAULT_CONTACT_TEXT: ContactPageText = {
  heroTitle: "Contact Us",
  heroBadge: "24/7 DISPATCH",
  infoHeading: "Contact Information",
  addressLabel: "Address",
  phoneLabel: "Contact Number",
  emailLabel: "Email Us",
  hoursLabel: "Working Hours",
  formHeading: "Get a Quote",
  submitLabel: "Request Quote",
  successTitle: "Message sent!",
  successMessage: "Thanks {name} — our team will reply the same day.",
  mapLabel: "VISIT US",
  services: ["Hot Shot", "Box Truck", "Semi Truck", "Equipment Rental", "Other"],
};

export const CONTACT_TEXT_FIELDS: { key: Exclude<keyof ContactPageText, "services">; label: string; multiline?: boolean }[] = [
  { key: "heroTitle", label: "Banner title" },
  { key: "heroBadge", label: "Banner badge" },
  { key: "infoHeading", label: "Contact box heading" },
  { key: "addressLabel", label: "Address card label" },
  { key: "phoneLabel", label: "Phone card label" },
  { key: "emailLabel", label: "Email card label" },
  { key: "hoursLabel", label: "Hours card label" },
  { key: "formHeading", label: "Form heading" },
  { key: "submitLabel", label: "Form button text" },
  { key: "successTitle", label: "After sending — title" },
  { key: "successMessage", label: "After sending — message", multiline: true },
  { key: "mapLabel", label: "Map card label" },
];

export function parseContactText(raw: string | null | undefined): Partial<ContactPageText> {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: Partial<ContactPageText> = {};
    for (const f of CONTACT_TEXT_FIELDS) {
      const v = (data as Record<string, unknown>)[f.key];
      if (typeof v === "string" && v.trim()) out[f.key] = v.trim();
    }
    const services = (data as Record<string, unknown>).services;
    if (Array.isArray(services)) {
      const list = services.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim());
      if (list.length) out.services = list;
    }
    return out;
  } catch {
    return {};
  }
}

export interface ContactContent extends ContactPageText {
  /** Address lines, e.g. ["555 N 5th St 109 B", "Garland, TX 75040", "United States"]. */
  addressLines: string[];
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export function addressLines(raw?: string | null): string[] {
  const lines = (raw || "")
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/,$/, ""))
    .filter(Boolean);
  return lines.length ? lines : DEFAULT_ADDRESS.split("\n");
}

export function contactContent(settings: Record<string, string | null | undefined>): ContactContent {
  const lines = addressLines(settings[ADDRESS_KEY]);
  return {
    ...DEFAULT_CONTACT_TEXT,
    ...parseContactText(settings[CONTACT_PAGE_KEY]),
    addressLines: lines,
    address: lines.join(", "),
    phone: (settings.phone || "").trim() || DEFAULT_PHONE,
    email: (settings.email || "").trim() || DEFAULT_EMAIL,
    hours: (settings[WORKING_HOURS_KEY] || "").trim() || DEFAULT_WORKING_HOURS,
  };
}
