"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const LIME = "#c8ff00";

/**
 * Shown when a page cannot load its content - chiefly when the API is down and
 * the page has no bundled copy to fall back on. Deliberately not a 404: the
 * content exists, it is just temporarily unreachable.
 */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 16,
        bgcolor: "#070807",
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 520 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: LIME, mb: 2 }}>
          TEMPORARILY UNAVAILABLE
        </Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 2 }}
        >
          This page couldn&apos;t load right now
        </Typography>
        <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, mb: 4 }}>
          Our content service didn&apos;t respond. Please try again in a moment.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            onClick={reset}
            disableElevation
            sx={{
              bgcolor: LIME,
              color: "#0a0a0a",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "999px",
              px: 3.5,
              py: 1.2,
              "&:hover": { bgcolor: "#d4ff33" },
            }}
          >
            Try again
          </Button>
          <Button
            component={Link}
            href="/"
            sx={{
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "999px",
              px: 3.5,
              py: 1.2,
              "&:hover": { borderColor: LIME, color: LIME },
            }}
          >
            Back to home
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
