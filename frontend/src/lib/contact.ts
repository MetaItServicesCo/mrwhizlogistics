/** Shared helpers for turning site settings into clickable contact links. */

/** "(469) 767 8853" -> "tel:+14697678853" (US numbers without a country code). */
export function telHref(phone?: string | null): string {
  const digits = (phone || "").replace(/[^\d+]/g, "");
  if (!digits) return "tel:+14697678853";
  if (digits.startsWith("+")) return `tel:${digits}`;
  return `tel:+${digits.length === 10 ? "1" : ""}${digits}`;
}

export function mailtoHref(email?: string | null): string {
  return `mailto:${(email || "dispatch@mrwhizlogistics.com").trim()}`;
}

/** An http(s) URL worth linking to, or null (empty, "#", or not a web link). */
export function externalUrl(value?: string | null): string | null {
  const v = (value || "").trim();
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}
