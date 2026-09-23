/**
 * Public (unauthenticated) endpoints used by the marketing site.
 *
 * Every call passes `{ auth: false }` so the shared client never attaches a
 * Bearer token and never bounces a visitor to /login on a 401 — that redirect
 * only makes sense inside the admin dashboard.
 */

import { api } from "./api";
import type { BlogComment, BlogPost } from "./types";
import type { RentalQuotePayload } from "@/types/rentalQuote";

const PUBLIC = { auth: false } as const;

/** Drop empty strings so optional columns stay NULL instead of "". */
function compact<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

// ---------------------------------------------------------------------------
// Contact form — POST /api/contact-us
// ---------------------------------------------------------------------------

export type ContactSubmission = {
  full_name: string;
  email: string;
  phone_number?: string;
  service_needed?: string;
  company_name?: string;
  message?: string;
};

export function submitContact(payload: ContactSubmission) {
  return api.post<{ id: number }>("/api/contact-us", compact(payload), PUBLIC);
}

// ---------------------------------------------------------------------------
// Quote form — POST /api/public/quotes
// ---------------------------------------------------------------------------

export type QuoteSubmission = {
  name: string;
  email: string;
  phone?: string;
  pickup?: string;
  drop?: string;
  /** Backend defaults this to "Hot Shot" when omitted. */
  selected_service?: string;
  details?: string;
};

export function submitQuote(payload: QuoteSubmission) {
  return api.post<{ id: number }>("/api/public/quotes", compact(payload), PUBLIC);
}

// ---------------------------------------------------------------------------
// Newsletter — POST /api/public/subscribers
// ---------------------------------------------------------------------------

/** Re-subscribing an existing address is a no-op on the backend, not an error. */
export function subscribe(email: string) {
  return api.post<{ id: number; email: string }>(
    "/api/public/subscribers",
    { email },
    PUBLIC,
  );
}

// ---------------------------------------------------------------------------
// Rental quote — POST /api/rental-quotes
// ---------------------------------------------------------------------------

export function submitRentalQuote(payload: RentalQuotePayload) {
  return api.post<{ id: number }>("/api/rental-quotes", payload, PUBLIC);
}

// ---------------------------------------------------------------------------
// Blog comments
// ---------------------------------------------------------------------------

/**
 * GET /api/blogs/{slug} — the backend resolves either a card_id or a slug.
 * Throws ApiError(404) for a post that only exists in the bundled static content.
 */
export function getBlogBySlug(slug: string) {
  return api.get<BlogPost>(`/api/blogs/${encodeURIComponent(slug)}`, PUBLIC);
}

export type CommentSubmission = {
  name: string;
  email: string;
  message: string;
  parent_id?: number | null;
};

/** POST /api/blogs/{card_id}/comments — note: card_id, not slug. */
export function postBlogComment(cardId: string, payload: CommentSubmission) {
  return api.post<BlogComment>(
    `/api/blogs/${encodeURIComponent(cardId)}/comments`,
    compact(payload),
    PUBLIC,
  );
}
