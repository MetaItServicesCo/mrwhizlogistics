import { ACCENT, ACCENT_HOVER } from "@/theme/brand";
/**
 * Typography for rich-text HTML, shared by the public detail pages and the
 * dashboard editor so what editors see while writing matches what visitors get.
 *
 * "blog" and "service" mirror the paragraph styles those pages already used
 * for their legacy plain-text content.
 */


const TONES = {
  blog: { color: "rgba(var(--fg-rgb), 0.7)", size: { xs: 15, md: 16 } },
  service: { color: "rgba(var(--fg-rgb), .5)", size: { xs: 14, md: 15 } },
} as const;

export function richContentSx(tone: keyof typeof TONES = "blog") {
  const { color, size } = TONES[tone];
  return {
    color,
    fontSize: size,
    lineHeight: 1.9,
    wordBreak: "break-word" as const,

    "& p": { m: 0, mb: 2.5 },
    "& h2, & h3, & h4": {
      color: "var(--fg)",
      fontWeight: 800,
      lineHeight: 1.3,
      mt: 4,
      mb: 1.5,
    },
    "& h2": { fontSize: { xs: 22, md: 26 } },
    "& h3": { fontSize: { xs: 19, md: 21 } },
    "& h4": { fontSize: { xs: 16, md: 18 } },
    "& > :first-of-type": { mt: 0 },

    "& strong, & b": { color: "var(--fg)", fontWeight: 700 },
    "& a": {
      color: ACCENT,
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      "&:hover": { color: ACCENT_HOVER },
    },

    // The global CSS reset sets list-style: none on every list, which hid
    // the bullets and numbers; restore them for authored content.
    "& ul, & ol": { pl: 3, m: 0, mb: 2.5 },
    "& ul": { listStyleType: "disc" },
    "& ol": { listStyleType: "decimal" },
    "& ul ul": { listStyleType: "circle" },
    "& li": { mb: 0.75 },
    "& li > p": { mb: 0 },
    "& ul li::marker": { color: ACCENT },
    "& ol li::marker": { color: ACCENT, fontWeight: 700 },

    "& blockquote": {
      m: 0,
      mb: 2.5,
      pl: 2.5,
      py: 0.5,
      borderLeft: `3px solid ${ACCENT}`,
      color: "rgba(var(--fg-rgb), 0.85)",
      fontStyle: "italic",
      "& p": { mb: 0 },
    },

    "& img": {
      display: "block",
      maxWidth: "100%",
      height: "auto",
      borderRadius: "14px",
      my: 3,
    },

    "& hr": {
      border: "none",
      borderTop: "1px solid rgba(var(--fg-rgb), 0.12)",
      my: 4,
    },

    "& code": {
      fontFamily: "monospace",
      fontSize: "0.9em",
      px: 0.6,
      py: 0.2,
      borderRadius: "5px",
      bgcolor: "rgba(var(--fg-rgb), 0.08)",
      color: "var(--fg)",
    },
    "& pre": {
      p: 2,
      mb: 2.5,
      borderRadius: "10px",
      bgcolor: "rgba(0,0,0,0.4)",
      overflowX: "auto",
      "& code": { p: 0, bgcolor: "transparent" },
    },
  };
}
