"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Eased mouse-wheel scrolling for the public website.
 *
 * A normal mouse wheel moves the page in ~100px jumps, which makes the
 * scroll-driven parts of the site (the hero video, scroll-linked trucks)
 * look steppy. Lenis turns each wheel step into a short, smooth glide.
 *
 * - Off for visitors who ask for reduced motion; touch devices keep native
 *   scrolling (Lenis leaves touch alone by default).
 * - Scrollable boxes (chat, modals, menus, [data-lenis-prevent]) scroll
 *   themselves instead of the page.
 * - Paused while a dialog locks the page (body/html overflow hidden).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      allowNestedScroll: true,
      prevent: (node: HTMLElement) =>
        !!node.closest?.('[role="dialog"], [data-lenis-prevent], .MuiPopover-root, .MuiModal-root'),
    });

    // Hold the page still while a modal is open (MUI or our own dialogs), so
    // the wheel never scrolls the page behind it.
    let locked = false;
    const syncLock = () => {
      const next =
        !!document.querySelector('[aria-modal="true"]') ||
        getComputedStyle(document.body).overflow === "hidden" ||
        getComputedStyle(document.documentElement).overflow === "hidden";
      if (next === locked) return;
      locked = next;
      if (locked) lenis.stop();
      else lenis.start();
    };
    // Dialogs being added/removed anywhere; style locks on <body>/<html> only
    // (not the whole subtree, which animations restyle every frame).
    const added = new MutationObserver(syncLock);
    added.observe(document.body, { childList: true, subtree: true });
    const styled = new MutationObserver(syncLock);
    styled.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    styled.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => {
      added.disconnect();
      styled.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
