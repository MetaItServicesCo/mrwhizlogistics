/**
 * Brand colours, taken from the Mr. Whiz Logistics logo (navy + orange).
 *
 * This is the one place to change the site's colour scheme. Use the
 * constants in TS/TSX (they are plain hex, so `${ACCENT}55` and SVG
 * attributes work); plain CSS and long style strings use the matching CSS
 * variables, which the root layout writes from these same values.
 *
 * Accent:   var(--accent)  rgba(var(--accent-rgb), a)  var(--accent-hover)
 *           var(--accent-text)  (orange that is readable as text on the
 *           current background)  var(--accent-2)  var(--sky)
 *
 * Surfaces: the website is light (white). Components use these variables
 * instead of fixed colours, so any area can switch to the dark set (e.g. text
 * over a photo or video) with `sx={{ ...DARK_SCOPE }}` or class="theme-dark":
 *   var(--bg)       page / section background   rgba(var(--bg-rgb), a)
 *   var(--bg-alt)   alternate section background
 *   var(--surface)  cards                        var(--surface-2) inputs, chips
 *   var(--fg)       main text                    rgba(var(--fg-rgb), a) for
 *                   muted text, borders and faint fills
 *   rgba(var(--shadow-rgb), a)  shadows
 */

/** Logo orange: buttons, links, highlights, active states. */
export const ACCENT = "#f87802";
/** Lighter orange for hover states. */
export const ACCENT_HOVER = "#ff9a3d";
/** Warm amber that pairs with the orange in gradients (dark backgrounds). */
export const ACCENT_2 = "#ffb547";
/** Light blue from the logo's navy family (decorative variety only). */
export const SKY = "#6cb4ee";
/** Logo navy. */
export const NAVY = "#0e2f4d";
/** Deep navy: dark backgrounds, and the text colour on orange buttons. */
export const INK = "#081c31";

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

const LIGHT = {
  "--bg": "#ffffff",
  "--bg-rgb": rgb("#ffffff"),
  "--bg-alt": "#f4f7fb",
  "--surface": "#ffffff",
  "--surface-2": "#eef3f8",
  "--fg": NAVY,
  "--fg-rgb": rgb(NAVY),
  "--accent-text": "#c25600",
  "--accent-2": "#d97706",
  "--accent-2-rgb": rgb("#d97706"),
  "--sky": "#2f7fc1",
  "--sky-rgb": rgb("#2f7fc1"),
  "--shadow-rgb": rgb(NAVY),
};

/** Dark surface variables, for areas that sit on photos/video or stay dark. */
export const DARK_SCOPE = {
  "--bg": INK,
  "--bg-rgb": rgb(INK),
  "--bg-alt": "#0b2236",
  "--surface": "#0d2237",
  "--surface-2": "#10283f",
  "--fg": "#ffffff",
  "--fg-rgb": rgb("#ffffff"),
  "--accent-text": ACCENT,
  "--accent-2": ACCENT_2,
  "--accent-2-rgb": rgb(ACCENT_2),
  "--sky": SKY,
  "--sky-rgb": rgb(SKY),
  "--shadow-rgb": "0, 0, 0",
} as const;

const css = (vars: Record<string, string>) =>
  Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");

/** CSS custom properties for the values above (injected in the root layout). */
export const BRAND_CSS_VARIABLES =
  `:root{--accent:${ACCENT};--accent-rgb:${rgb(ACCENT)};--accent-hover:${ACCENT_HOVER};--navy:${NAVY};--ink:${INK};${css(LIGHT)}}` +
  // `color` too: an inherited colour is resolved where it was declared (the
  // light page), so text in a dark area must get its colour from the area.
  `.theme-dark{${css(DARK_SCOPE)};color:var(--fg)}`;

/** Old (lime-era) colours that may still be stored in content, e.g. a testimonial's accent. */
const LEGACY_COLOURS: Record<string, string> = {
  "#c8ff00": ACCENT,
  "#7fb800": "#b85900",
  "#00e5ff": ACCENT_2,
  "#0088aa": "#aa6600",
  "#ff4dd8": SKY,
  "#aa2288": "#226daa",
};

/** Swap old-scheme colours in a stored CSS value for their new equivalents. */
export function withBrandColours(css: string): string {
  return css.replace(/#[0-9a-f]{6}(?![0-9a-f])/gi, (hex) => LEGACY_COLOURS[hex.toLowerCase()] ?? hex);
}
