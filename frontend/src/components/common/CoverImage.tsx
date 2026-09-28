import Box from "@mui/material/Box";

/**
 * An image that fills its (positioned) parent like `background-size: cover`,
 * but as a real <img> with alt text, so screen readers can describe it and
 * search engines index it. Replaces CSS background images on content cards.
 */
export default function CoverImage({
  src,
  alt,
  position = "center",
  eager = false,
}: {
  src: string;
  /** Describe the image; "" only for purely decorative images. */
  alt: string;
  /** object-position, e.g. "center top" for portraits. */
  position?: string;
  /** Load immediately (above the fold); otherwise lazy. */
  eager?: boolean;
}) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: position,
        display: "block",
      }}
    />
  );
}
