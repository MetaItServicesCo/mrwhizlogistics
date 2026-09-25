import Image from "next/image";
import Box from "@mui/material/Box";
import { mediaUrl } from "@/lib/api";
import { LOGO_SCALE_DEFAULT } from "@/lib/branding";

/** The original header logo slot, in px. Scale 100% reproduces it exactly. */
const HEADER = {
  mobile: { h: 50, w: 110 },
  desktop: { h: 85, w: 170 },
};
/** Keep the mobile pill usable however large the desktop logo is set. */
const MOBILE_SCALE_CAP = 1.3;

type Viewport = "responsive" | "desktop" | "mobile";

/**
 * The company logo for the public navbar (and the dashboard preview of it).
 *
 * With no custom logo it renders the bundled logo exactly as before (same slot,
 * same crop), just resized by `scale`. An uploaded logo is shown whole at the
 * slot height, keeping its own aspect ratio.
 */
export default function SiteLogo({
  url,
  scale = LOGO_SCALE_DEFAULT,
  viewport = "responsive",
  priority = false,
  alt = "Company Logo",
}: {
  url?: string;
  scale?: number;
  /** Force one breakpoint's size, for previews. */
  viewport?: Viewport;
  priority?: boolean;
  alt?: string;
}) {
  const k = scale / 100;
  const km = Math.min(k, MOBILE_SCALE_CAP);
  const m = { h: Math.round(HEADER.mobile.h * km), w: Math.round(HEADER.mobile.w * km) };
  const d = { h: Math.round(HEADER.desktop.h * k), w: Math.round(HEADER.desktop.w * k) };
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
          maxWidth: pick(Math.round(170 * km), Math.round(300 * k)),
          objectFit: "contain",
          objectPosition: "left center",
        }}
      />
    );
  }

  return (
    <Box sx={{ position: "relative", height: pick(m.h, d.h), width: pick(m.w, d.w) }}>
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
