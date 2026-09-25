import "server-only";

import { cache } from "react";
import { unstable_rethrow } from "next/navigation";

import type { BlogPost, TruckCard } from "@/lib/types";
import type {
  PublicFaqCategory,
  PublicSiteSetting,
  PublicTeamMember,
  PublicTestimonial,
} from "@/lib/contentAdapters";

const API_BASE = (
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

/**
 * Upper bound for one API call. Without any limit, a stuck API made every
 * public page wait ~5 minutes (Node's default) - the shared layout fetches
 * settings on every request, so the whole site appeared not to load and
 * clicking between pages did nothing. The limit stays well under nginx's 60 s
 * proxy timeout but high enough that a briefly busy server is not mistaken for
 * a dead one (a 5 s limit produced false outages under normal load).
 */
const API_TIMEOUT_MS = 15000;

/** The API could not be reached or failed - distinct from "this does not exist". */
export class ContentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentUnavailableError";
  }
}

/**
 * Fetch public content. Resolves to the data, or null for a genuine 404.
 * Throws ContentUnavailableError on a network failure, timeout or 5xx.
 */
async function request<T>(path: string): Promise<T | null> {
  const url = `${API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (error) {
    // Let Next's own control-flow errors (dynamic bail-out, notFound,
    // redirect) through; swallowing them breaks rendering in subtle ways.
    unstable_rethrow(error);
    const timedOut = (error as Error)?.name === "TimeoutError";
    throw new ContentUnavailableError(
      timedOut
        ? `API did not answer within ${API_TIMEOUT_MS}ms at ${url}`
        : `Cannot reach the API at ${url}: ${(error as Error)?.message ?? error}`,
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new ContentUnavailableError(`HTTP ${response.status} from ${url}`);
  }
  return (await response.json()) as T;
}

function logUnavailable(error: ContentUnavailableError, consequence: string) {
  // Shows up in `docker compose logs frontend`. If published content "never
  // appears", this line is the first thing to look for.
  console.error(
    `[public-content] ${error.message} - ${consequence}. ` +
      "Check API_INTERNAL_URL and that the backend is running.",
  );
}

/**
 * Collections and site-wide content: on an outage, log and return null so the
 * page renders its bundled copy instead of an error.
 */
async function getList<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path);
  } catch (error) {
    if (!(error instanceof ContentUnavailableError)) throw error;
    logUnavailable(error, "serving bundled fallback content");
    return null;
  }
}

/**
 * Resolve a single item for a detail page without ever turning an outage
 * into a false "page not found".
 *
 * - API answers        -> the item
 * - API says 404       -> null (the page falls back to bundled content, then notFound)
 * - API unavailable and a bundled copy exists -> null (render the bundled copy)
 * - API unavailable and no bundled copy       -> throw (temporary error page, HTTP 500)
 *
 * Previously every failure became null, so a post that exists only in the
 * database returned 404 whenever the API hiccupped - telling visitors and
 * search engines the page did not exist.
 */
export async function loadDetail<T>(
  load: () => Promise<T | null>,
  hasBundledCopy: boolean,
): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    if (!(error instanceof ContentUnavailableError)) throw error;
    if (hasBundledCopy) {
      logUnavailable(error, "serving the bundled copy of this page");
      return null;
    }
    logUnavailable(error, "showing the temporary error page instead of a 404");
    throw error;
  }
}

/**
 * For generateMetadata: an outage just means default or bundled metadata. The
 * page render reports the outage; failing here too would only duplicate it.
 */
export async function loadDetailForMetadata<T>(
  load: () => Promise<T | null>,
): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ContentUnavailableError) return null;
    throw error;
  }
}

// ---- collections (fall back to bundled content on outage) ------------------
// Memoised per request too: if a page errors, Next re-renders the layout for
// the error boundary, and the settings call must not wait out a second timeout.

export const getHotshotCards = cache(() =>
  getList<TruckCard[]>("/api/hotshots/"),
);

export const getBoxTruckCards = cache(() =>
  getList<TruckCard[]>("/api/box-trucks/"),
);

export const getSemiTruckCards = cache(() =>
  getList<TruckCard[]>("/api/semi-trucks/"),
);

export const getBlogs = cache(() =>
  getList<BlogPost[]>("/api/blogs/"),
);

export const getPublicFaqs = cache(() =>
  getList<PublicFaqCategory[]>("/api/public/faqs"),
);

export const getPublicTestimonials = cache(() =>
  getList<PublicTestimonial[]>("/api/public/testimonials"),
);

export const getPublicTeam = cache(() =>
  getList<PublicTeamMember[]>("/api/team/"),
);

export const getPublicSettings = cache(() =>
  getList<PublicSiteSetting[]>("/api/public/settings"),
);

// ---- single items (use through loadDetail) ---------------------------------
// cache() shares one call between generateMetadata and the page within a single
// request. Without it each detail page hit the API twice, and during an outage
// the visitor waited for two timeouts back to back.

export const getHotshotCard = cache((slug: string) =>
  request<TruckCard>(`/api/hotshots/${encodeURIComponent(slug)}`),
);

export const getBoxTruckCard = cache((slug: string) =>
  request<TruckCard>(`/api/box-trucks/${encodeURIComponent(slug)}`),
);

export const getSemiTruckCard = cache((slug: string) =>
  request<TruckCard>(`/api/semi-trucks/${encodeURIComponent(slug)}`),
);

export const getBlog = cache((slug: string) =>
  request<BlogPost>(`/api/blogs/${encodeURIComponent(slug)}`),
);
