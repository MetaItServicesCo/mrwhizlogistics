/**
 * Site logo settings, stored as two ordinary site-settings rows so the
 * dashboard can change them without a deploy. Both rows are optional: when a
 * row is missing or empty the site renders exactly as it did before.
 */

export const DEFAULT_LOGO = "/images/logo.png";

export const LOGO_URL_KEY = "logo_url";
export const LOGO_SCALE_KEY = "logo_scale";

export const LOGO_SCALE_MIN = 60;
export const LOGO_SCALE_MAX = 160;
export const LOGO_SCALE_DEFAULT = 100;

export interface LogoSettings {
  /** Custom logo path/URL, or "" for the bundled default logo. */
  url: string;
  /** Header logo size as a percentage of the original design. */
  scale: number;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  url: "",
  scale: LOGO_SCALE_DEFAULT,
};

export function parseLogoScale(value?: string | number | null): number {
  const n = typeof value === "number" ? value : Number.parseFloat(value || "");
  if (!Number.isFinite(n)) return LOGO_SCALE_DEFAULT;
  return Math.round(Math.min(LOGO_SCALE_MAX, Math.max(LOGO_SCALE_MIN, n)));
}

/** Only site-relative paths and http(s) URLs are used as an <img> source. */
export function parseLogoUrl(value?: string | null): string {
  const v = (value || "").trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return /^https?:\/\/\S+$/i.test(v) ? v : "";
}

export function logoFromSettings(map: Record<string, string | null | undefined>): LogoSettings {
  return {
    url: parseLogoUrl(map[LOGO_URL_KEY]),
    scale: parseLogoScale(map[LOGO_SCALE_KEY]),
  };
}

/* ------------------------------------------------------------------ */
/* Footer logo                                                          */
/* ------------------------------------------------------------------ */

export const FOOTER_LOGO_URL_KEY = "footer_logo_url";
export const FOOTER_LOGO_SCALE_KEY = "footer_logo_scale";
export const FOOTER_SHOW_NAME_KEY = "footer_show_name";

export interface FooterLogoSettings {
  /** Footer-only logo, or "" to reuse the header logo. */
  url: string;
  scale: number;
  /** Show the company name as text beside the logo. */
  showName: boolean;
}

export const DEFAULT_FOOTER_LOGO_SETTINGS: FooterLogoSettings = {
  url: "",
  scale: LOGO_SCALE_DEFAULT,
  showName: false,
};

export function footerLogoFromSettings(
  map: Record<string, string | null | undefined>,
): FooterLogoSettings {
  return {
    url: parseLogoUrl(map[FOOTER_LOGO_URL_KEY]),
    scale: parseLogoScale(map[FOOTER_LOGO_SCALE_KEY]),
    showName: (map[FOOTER_SHOW_NAME_KEY] || "").trim().toLowerCase() === "true",
  };
}

/** Every settings key the Branding tab manages. */
export const BRANDING_KEYS = [
  LOGO_URL_KEY,
  LOGO_SCALE_KEY,
  FOOTER_LOGO_URL_KEY,
  FOOTER_LOGO_SCALE_KEY,
  FOOTER_SHOW_NAME_KEY,
];
