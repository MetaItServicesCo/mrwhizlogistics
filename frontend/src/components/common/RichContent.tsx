import Box from "@mui/material/Box";
import { richContentSx } from "./richContentSx";

/**
 * Renders rich-text HTML from the dashboard editor.
 *
 * The backend sanitises this HTML on write (app/core/html.py strips scripts,
 * event handlers and javascript: URLs, and every inline style except a plain
 * text colour on <span> and highlight colour on <mark>), which is what makes
 * dangerouslySetInnerHTML safe here. Never pass unsanitised input.
 * Link and highlight styling lives in globals.css (.rich-content).
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
