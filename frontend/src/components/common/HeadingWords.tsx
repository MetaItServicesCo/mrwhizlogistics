import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

const rise = keyframes`
  from { opacity: 0; transform: translateY(var(--rise)); }
  to   { opacity: 1; transform: none; }
`;

/**
 * Heading text revealed word by word (slide up + fade in).
 *
 * Each word keeps a real trailing space, so the heading reads "Hot Shot" to
 * search engines and screen readers rather than "HotShot"; inside an
 * inline-block span that space adds no visible width. The entrance is a CSS
 * animation instead of an inline opacity:0 start state, so the server HTML
 * carries fully visible text and nothing flashes before hydration. Visitors
 * who prefer reduced motion get the text without animation.
 */
export default function HeadingWords({
  text,
  rise: distance = 30,
  duration = 0.55,
  delay = 0.15,
  stagger = 0.1,
}: {
  text: string;
  /** Slide distance in px. */
  rise?: number;
  /** Seconds per word. */
  duration?: number;
  /** Seconds before the first word. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <Box
          key={`${word}-${i}`}
          component="span"
          sx={{
            display: "inline-block",
            "--rise": `${distance}px`,
            "@media (prefers-reduced-motion: no-preference)": {
              animation: `${rise} ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * stagger}s both`,
            },
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </Box>
      ))}
    </>
  );
}
