"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { DEFAULT_LOGO_SETTINGS, logoFromSettings, type LogoSettings } from "@/lib/branding";
import type { SiteSetting } from "@/lib/types";

/**
 * The dashboard's copy of the logo settings. Loaded once per session and
 * updated in place when the Branding tab saves, so the sidebar changes
 * without a reload.
 */
let current: LogoSettings | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function load() {
  if (current || pending) return;
  pending = api
    .get<SiteSetting[]>("/api/public/settings", { auth: false })
    .then((rows) => {
      current = logoFromSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
    })
    .catch(() => {
      current = DEFAULT_LOGO_SETTINGS;
    })
    .finally(() => {
      pending = null;
      emit();
    });
}

export function publishSiteLogo(logo: LogoSettings) {
  current = logo;
  emit();
}

/** null until the settings have loaded, so callers can avoid a logo flash. */
export function useSiteLogo(): LogoSettings | null {
  useEffect(load, []);
  return useSyncExternalStore(subscribe, () => current, () => null);
}
