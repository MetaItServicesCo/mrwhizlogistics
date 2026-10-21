"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import { ctaProps, useCta } from "@/components/common/CtaProvider";
import { DEFAULT_ABOUT, type AboutContent } from "@/lib/aboutPage";
import { ACCENT, ACCENT_HOVER } from "@/theme/brand";


export default function AboutCTA({
  content = DEFAULT_ABOUT.cta,
}: {
  /** From Dashboard -> Pages -> About Us. */
  content?: AboutContent["cta"];
}) {
  const quoteCta = useCta("about_cta_quote");
  const callCta = useCta("about_cta_call");
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        bgcolor: "var(--surface)",
        borderTop: "1px solid rgba(var(--fg-rgb), 0.08)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            p: { xs: 4, md: 6 },
            bgcolor: "var(--surface)",
            border: `1px solid ${ACCENT}33`,
            textAlign: "center",
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(var(--accent-rgb), 0.08), transparent 60%)",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: ACCENT,
              mb: 1.5,
              textTransform: "uppercase",
            }}
          >
            {content.eyebrow}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.6rem" },
              color: "var(--fg)",
              mb: 2,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            {content.heading}
          </Typography>
          <Typography
            sx={{
              color: "rgba(var(--fg-rgb), 0.6)",
              fontSize: { xs: 14, md: 15 },
              maxWidth: 550,
              mx: "auto",
              mb: 4,
            }}
          >
            {content.text}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {!quoteCta.hidden && (
            <Button
              {...ctaProps(quoteCta)}
              endIcon={<ArrowForwardRoundedIcon />}
              disableElevation
              sx={{
                bgcolor: ACCENT,
                color: "#081c31",
                fontWeight: 800,
                borderRadius: "12px",
                px: 3.5,
                py: 1.5,
                textTransform: "none",
                fontSize: 14,
                "&:hover": { bgcolor: ACCENT_HOVER },
              }}
            >
              {quoteCta.label}
            </Button>
            )}
            {!callCta.hidden && (
            <Button
              {...ctaProps(callCta)}
              startIcon={<PhoneInTalkRoundedIcon />}
              variant="outlined"
              sx={{
                color: "var(--fg)",
                borderColor: "rgba(var(--fg-rgb), 0.2)",
                fontWeight: 700,
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  borderColor: ACCENT,
                  color: ACCENT,
                  bgcolor: "rgba(var(--accent-rgb), 0.05)",
                },
              }}
            >
              {callCta.label}
            </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
