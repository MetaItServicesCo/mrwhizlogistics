"use client";

import { createContext, useContext, useMemo } from "react";
import Link from "next/link";
import {
  isExternalHref,
  resolveCta,
  type CtaOverrides,
  type ResolvedCta,
} from "@/lib/cta";

type CtaContextValue = { overrides: CtaOverrides; phone?: string };

const CtaContext = createContext<CtaContextValue>({ overrides: {} });

/** Supplies the dashboard's CTA overrides to every button on the public site. */
export function CtaProvider({
  overrides,
  phone,
  children,
}: CtaContextValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ overrides, phone }), [overrides, phone]);
  return <CtaContext.Provider value={value}>{children}</CtaContext.Provider>;
}

/**
 * Label, link and visibility for one CTA (ids are listed in lib/cta.ts).
 * Outside the provider it returns the built-in defaults.
 */
export function useCta(id: string, slug?: string): ResolvedCta {
  const { overrides, phone } = useContext(CtaContext);
  return useMemo(() => resolveCta(id, overrides, { phone, slug }), [id, overrides, phone, slug]);
}

/**
 * Props that make a button go where the CTA says: a Next.js link for site
 * pages, a plain <a> for phone/email/other sites, or - when the CTA has no
 * link (quote and auto buttons) - the button's own `onAction`.
 */
export function ctaProps(
  cta: ResolvedCta,
  onAction?: (e: React.MouseEvent) => void,
): { component?: React.ElementType; href?: string; onClick?: (e: React.MouseEvent) => void } {
  if (cta.href) {
    return isExternalHref(cta.href)
      ? { component: "a", href: cta.href }
      : { component: Link, href: cta.href };
  }
  return onAction ? { onClick: onAction } : {};
}
