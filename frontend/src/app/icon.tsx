import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The logo is 1600×1600 with wide margins; the "M" mark sits roughly in
// x 385–1265, y 335–980. Scale it so the mark fills the 64px icon.
const LOGO_SIZE = 1600;
const MARK = { cx: 825, cy: 657, width: 880 };
const SCALE = 58 / MARK.width;

/** Browser-tab icon: the logo's navy/orange "M" mark on white. */
export default async function Icon() {
  const logo = await readFile(path.join(process.cwd(), "public", "images", "logo-mr-whiz.jpg"));
  const src = `data:image/jpeg;base64,${logo.toString("base64")}`;
  const px = LOGO_SIZE * SCALE;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        backgroundImage: `url(${src})`,
        backgroundSize: `${px}px ${px}px`,
        backgroundPosition: `${32 - MARK.cx * SCALE}px ${32 - MARK.cy * SCALE}px`,
        backgroundRepeat: "no-repeat",
      }}
    >
    </div>,
    size,
  );
}
