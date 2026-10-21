/**
 * Brand colours, taken from the Mr. Whiz Logistics logo (navy + orange).
 *
 * This is the one place to change the site's colour scheme. Use the
 * constants in TS/TSX (they are plain hex, so `${ACCENT}55` and SVG
 * attributes work); plain CSS and long style strings use the matching CSS
 * variables, which the root layout writes from these same values:
 *
 *   var(--accent)            rgba(var(--accent-rgb), 0.12)
 *   var(--accent-hover)      var(--accent-2)   rgba(var(--accent-2-rgb), a)
 *   var(--sky)               rgba(var(--sky-rgb), a)
 */

/** Logo orange: buttons, links, highlights, active states. */
export const ACCENT = "#f87802";
/** Lighter orange for hover states. */
export const ACCENT_HOVER = "#ff9a3d";
/** Warm amber that pairs with the orange in gradients. */
export const ACCENT_2 = "#ffb547";
/** Light blue from the logo's navy family (decorative variety only). */
export const SKY = "#6cb4ee";
/** Logo navy. */
export const NAVY = "#0e2f4d";
/** Deep navy page background; also the text colour on orange buttons. */
export const INK = "#081c31";

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

/** CSS custom properties for the values above (injected in the root layout). */
export const BRAND_CSS_VARIABLES = `:root{--accent:${ACCENT};--accent-rgb:${rgb(ACCENT)};--accent-hover:${ACCENT_HOVER};--accent-2:${ACCENT_2};--accent-2-rgb:${rgb(ACCENT_2)};--sky:${SKY};--sky-rgb:${rgb(SKY)};--navy:${NAVY};--ink:${INK}}`;

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
