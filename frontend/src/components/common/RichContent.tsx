import Box from "@mui/material/Box";
import { richContentSx } from "./richContentSx";

/**
 * Renders rich-text HTML from the dashboard editor.
 *
 * The backend sanitises this HTML on write (app/core/html.py strips scripts,
 * event handlers, inline styles and javascript: URLs), which is what makes
 * dangerouslySetInnerHTML safe here. Never pass unsanitised input.
 */
export default function RichContent({
  html,
  tone = "blog",
}: {
  html: string;
  tone?: "blog" | "service";
}) {
  return (
    <Box
      className="rich-content"
      sx={richContentSx(tone)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
