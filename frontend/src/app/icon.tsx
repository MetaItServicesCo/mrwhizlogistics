import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Crop only the empty border; keep the original logo pixels unchanged. */
export default async function Icon() {
  const logo = await readFile(path.join(process.cwd(), "public", "images", "logo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* The full-size logo has wide margins; 80px in a 64px frame is a modest crop. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={80} height={80} alt="" style={{ flex: "none" }} />
    </div>,
    size,
  );
}
