import Image from "next/image";
import Box from "@mui/material/Box";
import { mediaUrl } from "@/lib/api";
import { LOGO_SCALE_DEFAULT } from "@/lib/branding";

/**
 * Logo slot per placement, in px. Header at 100% reproduces the original
 * navbar logo exactly. `mobileCap` keeps the phone header usable however large
 * the desktop logo is set; the footer has the full width on phones.
 */
const SLOTS = {
  header: {
    mobile: { h: 50, w: 110 },
    desktop: { h: 85, w: 170 },
    maxW: { mobile: 170, desktop: 300 },
    mobileCap: 1.3,
    fluid: false,
  },
  footer: {
    mobile: { h: 80, w: 160 },
    desktop: { h: 90, w: 180 },
    maxW: { mobile: 280, desktop: 320 },
    mobileCap: Infinity,
    // The footer column has a definite width, so it can also cap at 100%.
    fluid: true,
  },
} as const;

export type LogoSlot = keyof typeof SLOTS;
type Viewport = "responsive" | "desktop" | "mobile";

/**
 * The company logo for the public site (and the dashboard previews of it).
 *
 * With no custom logo it renders the bundled logo in its slot (the header
 * slot matches the original navbar exactly), resized by `scale`. An uploaded
 * logo is shown whole at the slot height, keeping its own aspect ratio.
 */
export default function SiteLogo({
  url,
  scale = LOGO_SCALE_DEFAULT,
  slot = "header",
  viewport = "responsive",
  priority = false,
  alt = "Company Logo",
}: {
  url?: string;
  scale?: number;
  slot?: LogoSlot;
  /** Force one breakpoint's size, for previews. */
  viewport?: Viewport;
  priority?: boolean;
  alt?: string;
}) {
  const s = SLOTS[slot];
  const k = scale / 100;
  const km = Math.min(k, s.mobileCap);
  const m = { h: Math.round(s.mobile.h * km), w: Math.round(s.mobile.w * km) };
  const d = { h: Math.round(s.desktop.h * k), w: Math.round(s.desktop.w * k) };
  // Pixel caps only in the header: a % max-width inside its shrink-to-fit link
  // would let the browser compress the image.
  const cap = (px: number) => (s.fluid ? `min(100%, ${px}px)` : px);
  const pick = <T,>(mobile: T, desktop: T) =>
    viewport === "mobile" ? mobile : viewport === "desktop" ? desktop : { xs: mobile, md: desktop };

  if (url) {
    return (
      <Box
        component="img"
        src={mediaUrl(url)}
        alt={alt}
        fetchPriority={priority ? "high" : undefined}
        sx={{
          display: "block",
          height: pick(m.h, d.h),
          width: "auto",
          maxWidth: pick(cap(Math.round(s.maxW.mobile * km)), cap(Math.round(s.maxW.desktop * k))),
          objectFit: "contain",
          objectPosition: "left center",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: pick(m.h, d.h),
        width: pick(m.w, d.w),
        maxWidth: s.fluid ? "100%" : undefined,
      }}
    >
      <Image
        src="/images/logo.png"
        alt={alt}
        fill
        sizes="100%"
        style={{ objectFit: "cover", objectPosition: "left center" }}
        priority={priority}
      />
    </Box>
  );
}
