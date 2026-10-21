"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import { motion } from "motion/react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { ctaProps, useCta } from "@/components/common/CtaProvider";
import { DEFAULT_ABOUT, type AboutContent } from "@/lib/aboutPage";
import { ACCENT, ACCENT_HOVER } from "@/theme/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function FleetOverview({
  content = DEFAULT_ABOUT.fleet,
}: {
  /** From Dashboard -> Pages -> About Us. */
  content?: AboutContent["fleet"];
}) {
  const fleetCards = content.cards;
  const skills = content.skills;
  const moreCta = useCta("about_why_more");
  return (
    <Box
      component="section"
      sx={{ py: { xs: 8, md: 14 }, bgcolor: "var(--surface)", color: "var(--fg)" }}
    >
      <Container maxWidth="lg">
        {/* Main Side-by-Side Flex Layout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 6,
            alignItems: "flex-start",
          }}
        >
          {/* Left Column: Fleet Overview Cards */}
          <Box sx={{ width: { xs: "100%", lg: "50%" } }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 1.5,
                  letterSpacing: "-0.02em",
                }}
              >
                {content.fleetHeading}
              </Typography>
              <Box
                sx={{ width: 45, height: 3, bgcolor: ACCENT, borderRadius: 2 }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {fleetCards.map((card, index) => (
                <Box
                  key={`${card.title}-${index}`}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.15,
                    ease: EASE,
                  }}
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    bgcolor: "var(--surface)",
                    border: "1px solid rgba(var(--fg-rgb), 0.08)",
                    transition: "border-color .3s ease, transform .3s ease",
                    "&:hover": {
                      borderColor: `${ACCENT}55`,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      color: ACCENT,
                      mb: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {card.tag}
                  </Typography>
                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      mb: 1.5,
                      color: "var(--fg)",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: "rgba(var(--fg-rgb), 0.6)",
                      lineHeight: 1.6,
                      mb: 2.5,
                    }}
                  >
                    {card.desc}
                  </Typography>
                  {!moreCta.hidden && (
                  <Button
                    {...ctaProps(moreCta)}
                    endIcon={
                      <ArrowForwardRoundedIcon
                        sx={{ fontSize: "16px !important" }}
                      />
                    }
                    sx={{
                      p: 0,
                      color: ACCENT,
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: "none",
                      "&:hover": { bgcolor: "transparent", color: ACCENT_HOVER },
                    }}
                  >
                    {moreCta.label}
                  </Button>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Column: Expertise & Skills Bars */}
          <Box sx={{ width: { xs: "100%", lg: "50%" } }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 1.5,
                  letterSpacing: "-0.02em",
                }}
              >
                {content.expertiseHeading}
              </Typography>
              <Box
                sx={{ width: 45, height: 3, bgcolor: ACCENT, borderRadius: 2 }}
              />
            </Box>

            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "24px",
                bgcolor: "var(--surface)",
                border: "1px solid rgba(var(--fg-rgb), 0.08)",
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  mb: 4,
                  lineHeight: 1.3,
                  color: "var(--fg)",
                }}
              >
                <Box component="span" sx={{ color: ACCENT }}>
                  {content.experienceHighlight}
                </Box>{" "}
                {content.experienceText}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                {skills.map((skill, index) => (
                  <Box key={`${skill.name}-${index}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 1.2,
                          color: "rgba(var(--fg-rgb), 0.8)",
                        }}
                      >
                        {skill.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, color: ACCENT }}
                      >
                        {skill.progress}%
                      </Typography>
                    </Box>
                    {/* Progress Bar Track */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 8,
                        bgcolor: "rgba(var(--fg-rgb), 0.06)",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component={motion.div}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.progress}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.1,
                          ease: EASE,
                        }}
                        sx={{
                          height: "100%",
                          bgcolor: ACCENT,
                          borderRadius: 4,
                          backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.15) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15) 75%, transparent 75%, transparent)`,
                          backgroundSize: "16px 16px",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
