"use client";

import { useEffect, useRef } from "react";

/**
 * Moving between the public site and the dashboard while signed in:
 * the site remembers the last page an admin viewed (so "View site" returns
 * there), and knows which dashboard editor manages the page on screen.
 */

const LAST_SITE_PATH_KEY = "mrwhiz_last_site_path";

export function rememberSitePath(path: string) {
  try {
    window.sessionStorage.setItem(LAST_SITE_PATH_KEY, path);
  } catch {
    /* private mode etc. - "View site" falls back to the homepage */
  }
}

export function lastSitePath(): string {
  try {
    const p = window.sessionStorage.getItem(LAST_SITE_PATH_KEY) || "";
    return p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/dashboard") ? p : "/";
  } catch {
    return "/";
  }
}

export interface EditTarget {
  href: string;
  /** What the editor manages, e.g. "this post". */
  label: string;
}

/** The dashboard page that edits the public page at `pathname`, if any. */
export function editTargetFor(pathname: string): EditTarget | null {
  const [, section, slug] = pathname.split("/");
  const services: Record<string, string> = {
    "hot-shot": "/dashboard/services/hot-shot",
    "box-truck": "/dashboard/services/box-truck",
    "semi-truck": "/dashboard/services/semi-truck",
  };
  if (section in services) {
    return slug
      ? { href: `${services[section]}?edit=${encodeURIComponent(slug)}`, label: "Edit this service" }
      : { href: services[section], label: "Edit services" };
  }
  if (section === "blog") {
    return slug
      ? { href: `/dashboard/blog/posts?edit=${encodeURIComponent(slug)}`, label: "Edit this post" }
      : { href: "/dashboard/blog/posts", label: "Edit posts" };
  }
  if (section === "contact") return { href: "/dashboard/settings?tab=contact", label: "Edit this page" };
  if (section === "about") return { href: "/dashboard/pages/about", label: "Edit this page" };
  if (["privacy-policy", "terms", "disclaimer"].includes(section))
    return { href: `/dashboard/pages/legal?edit=${section}`, label: "Edit this page" };
  if (section === "rentals") return { href: "/dashboard/rentals", label: "Rental requests" };
  return null;
}

/**
 * Opens the editor for `?edit=<slug>` once the list has loaded (links from
 * the site's admin bar), then drops the parameter so a reload doesn't reopen it.
 */
export function useDeepLinkEdit<T>(
  items: T[],
  loading: boolean,
  matches: (item: T, slug: string) => boolean,
  open: (item: T) => void,
) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || loading) return;
    const url = new URL(window.location.href);
    const slug = url.searchParams.get("edit");
    if (!slug) {
      done.current = true;
      return;
    }
    if (!items.length) return;
    done.current = true;
    const item = items.find((i) => matches(i, slug));
    url.searchParams.delete("edit");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    if (item) open(item);
  }, [items, loading, matches, open]);
}
