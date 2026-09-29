/** The legal pages linked from the footer; content is edited in Dashboard -> Pages -> Legal. */
export const LEGAL_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "disclaimer", title: "Services Disclaimer" },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]["slug"];

/** Public path of a legal page, e.g. /privacy-policy. */
export const legalPath = (slug: string) => `/${slug}`;
