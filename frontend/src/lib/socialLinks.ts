/**
 * Social media profiles (Dashboard -> Settings -> Social media).
 *
 * Each platform is its own site-settings row, so the LinkedIn / X / YouTube
 * values entered before this screen existed keep working unchanged. The
 * footer shows an icon for every filled profile, and the profiles are listed
 * in the business structured data (schema.org `sameAs`) so search engines can
 * connect them to the company.
 */

export type SocialPlatformId = "facebook" | "instagram" | "linkedin" | "x" | "youtube" | "tiktok" | "whatsapp";

export type SocialPlatform = {
  id: SocialPlatformId;
  /** site_settings key */
  key: string;
  label: string;
  placeholder: string;
  /** Accepted hosts (subdomains such as www. or m. are fine). */
  hosts: string[];
  /** Brand colour, used for the icon hover in the footer. */
  color: string;
  /** Builds a profile URL from "@handle", where the platform has one. */
  fromHandle?: (handle: string) => string;
  hint?: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "facebook",
    key: "facebook_url",
    label: "Facebook",
    placeholder: "https://www.facebook.com/yourpage",
    hosts: ["facebook.com", "fb.com", "fb.me"],
    color: "#1877f2",
  },
  {
    id: "instagram",
    key: "instagram_url",
    label: "Instagram",
    placeholder: "https://www.instagram.com/yourname or @yourname",
    hosts: ["instagram.com", "instagr.am"],
    color: "#e1306c",
    fromHandle: (h) => `https://www.instagram.com/${h}`,
  },
  {
    id: "linkedin",
    key: "linkedin_url",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/company/yourcompany",
    hosts: ["linkedin.com", "lnkd.in"],
    color: "#0a66c2",
  },
  {
    id: "x",
    key: "x_url",
    label: "X (Twitter)",
    placeholder: "https://x.com/yourname or @yourname",
    hosts: ["x.com", "twitter.com"],
    color: "#000000",
    fromHandle: (h) => `https://x.com/${h}`,
  },
  {
    id: "youtube",
    key: "youtube_url",
    label: "YouTube",
    placeholder: "https://www.youtube.com/@yourchannel or @yourchannel",
    hosts: ["youtube.com", "youtu.be"],
    color: "#ff0000",
    fromHandle: (h) => `https://www.youtube.com/@${h}`,
  },
  {
    id: "tiktok",
    key: "tiktok_url",
    label: "TikTok",
    placeholder: "https://www.tiktok.com/@yourname or @yourname",
    hosts: ["tiktok.com"],
    color: "#000000",
    fromHandle: (h) => `https://www.tiktok.com/@${h}`,
  },
  {
    id: "whatsapp",
    key: "whatsapp_url",
    label: "WhatsApp",
    placeholder: "+1 469 767 8853 or https://wa.me/14697678853",
    hosts: ["wa.me", "whatsapp.com"],
    color: "#25d366",
    hint: "A phone number with country code is turned into a WhatsApp chat link.",
  },
];

export const SOCIAL_SETTING_KEYS = SOCIAL_PLATFORMS.map((p) => p.key);

const hostMatches = (host: string, hosts: string[]) =>
  hosts.some((h) => host === h || host.endsWith(`.${h}`));

/**
 * Turn what an admin typed into a clean profile URL.
 * Returns { url: "" } for an empty field, { error } when it can't be used.
 */
export function normaliseSocialUrl(platform: SocialPlatform, raw: string): { url: string; error?: string } {
  const v = raw.trim();
  if (!v || v === "#") return { url: "" }; // "#" was the old placeholder

  // WhatsApp: a phone number becomes a wa.me chat link.
  if (platform.id === "whatsapp" && /^\+?[\d\s().-]{7,}$/.test(v)) {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return { url: v, error: "Enter the full number with country code, e.g. +1 469 767 8853." };
    }
    return { url: `https://wa.me/${digits}` };
  }

  // "@handle" for platforms that have handles.
  const handle = v.match(/^@([A-Za-z0-9._-]{1,60})$/);
  if (handle) {
    if (!platform.fromHandle) {
      return { url: v, error: `Paste the full ${platform.label} link (copy it from your browser's address bar).` };
    }
    return { url: platform.fromHandle(handle[1]) };
  }

  // Add https:// when it was left off ("facebook.com/mrwhiz").
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { url: v, error: "This isn't a valid link." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { url: v, error: "Use a web link starting with https://" };
  }
  const host = parsed.hostname.toLowerCase();
  if (!hostMatches(host, platform.hosts)) {
    return { url: v, error: `This doesn't look like a ${platform.label} link (expected ${platform.hosts[0]}).` };
  }
  if (parsed.pathname === "/" && !parsed.search) {
    return { url: v, error: `That's the ${platform.label} home page — paste the link to your own profile or page.` };
  }
  parsed.protocol = "https:";
  return { url: parsed.toString() };
}

export type SocialLink = { id: SocialPlatformId; label: string; url: string; color: string };

/** The filled-in, valid profiles, in display order. */
export function socialLinks(settings: Record<string, string | null | undefined>): SocialLink[] {
  return SOCIAL_PLATFORMS.flatMap((p) => {
    const { url, error } = normaliseSocialUrl(p, settings[p.key] || "");
    return url && !error ? [{ id: p.id, label: p.label, url, color: p.color }] : [];
  });
}
