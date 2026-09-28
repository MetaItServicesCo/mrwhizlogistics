/**
 * Author bios, shown in the "Published by" box under each blog post.
 * Stored as one site setting (JSON: { "<author name>": "<bio>" }) and edited
 * from the blog editor, so every post by the same author shares one bio.
 */

export const AUTHOR_BIOS_KEY = "author_bios";

export type AuthorBios = Record<string, string>;

/** Names match regardless of case and surrounding spaces. */
export function authorKey(name: string | null | undefined): string {
  return (name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseAuthorBios(raw: string | null | undefined): AuthorBios {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: AuthorBios = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim() && authorKey(k)) out[authorKey(k)] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

export function authorBio(bios: AuthorBios, name: string | null | undefined): string {
  return bios[authorKey(name)] || "";
}

/** Longest bio accepted, so the box stays a short byline. */
export const AUTHOR_BIO_MAX = 300;
