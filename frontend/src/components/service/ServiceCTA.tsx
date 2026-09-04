"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import QuoteModal from "@/components/hot-shot/QuoteModal";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function ServiceCTA({
  service,
  title = "Ready to move?",
  highlight = "Get started today.",
  subtitle = "Get a fast quote in minutes. Our dispatch team is standing by, 24/7.",
  phoneDisplay = "+1 (469) 767 8853",
  phoneHref = "tel:+14697678853",
}: {
  service: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  phoneDisplay?: string;
  phoneHref?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 12 },
        overflow: "hidden",
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        sx={{
          position: "relative",
          maxWidth: 1120,
          mx: "auto",
          borderRadius: "28px",
          p: "1.5px",
          background: `linear-gradient(140deg, rgba(200,255,0,0.6), rgba(255,255,255,0.05) 45%)`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "27px",
            overflow: "hidden",
            bgcolor: "#0d100c",
            px: { xs: 3.5, sm: 5, md: 8 },
            py: { xs: 6, md: 8 },
            textAlign: "center",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(200,255,0,0.14), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          {!reduce && (
            <Box
              aria-hidden
              component={motion.div}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              sx={{
                position: "absolute",
                top: "-20%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(200,255,0,0.12), transparent 65%)",
                pointerEvents: "none",
              }}
            />
          )}
          {!reduce &&
            [24, 50, 76].map((top, i) => (
              <Box
                key={top}
                aria-hidden
                component={motion.div}
                animate={{ x: ["-15%", "125%"] }}
                transition={{
                  duration: 3 + i * 0.6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.7,
                }}
                sx={{
                  position: "absolute",
                  top: `${top}%`,
                  left: 0,
                  width: { xs: 90, md: 150 },
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${LIME}66, transparent)`,
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />
            ))}

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                mb: 3,
                px: 1.6,
                py: 0.6,
                borderRadius: "999px",
                bgcolor: "rgba(200,255,0,0.12)",
                border: `1px solid ${LIME}55`,
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 16, color: LIME }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: LIME,
                }}
              >
                24/7 DISPATCH
              </Typography>
            </Box>

            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.5px",
                fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.6rem" },
                mb: 2,
              }}
            >
              {title}{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(90deg, ${LIME}, #00e5ff, ${LIME})`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  animation: "sctaShimmer 5s linear infinite",
                  "@keyframes sctaShimmer": {
                    to: { backgroundPosition: "200% center" },
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                }}
              >
                {highlight}
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.65)",
                fontSize: { xs: 15, md: 17.5 },
                lineHeight: 1.7,
                maxWidth: 540,
                mx: "auto",
                mb: 4,
              }}
            >
              {subtitle}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={() => setOpen(true)}
                endIcon={<ArrowForwardRoundedIcon className="sc-a" />}
                disableElevation
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: LIME,
                  color: "#0a0a0a",
                  fontWeight: 800,
                  borderRadius: "999px",
                  px: 4,
                  py: 1.4,
                  textTransform: "none",
                  fontSize: 15.5,
                  "&:hover": { bgcolor: "#d4ff33" },
                  "& .sc-a": { transition: "transform .3s" },
                  "&:hover .sc-a": { transform: "translateX(4px)" },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-70%",
                    width: "55%",
                    height: "100%",
                    background:
                      "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
                    transform: "skewX(-20deg)",
                    transition: "left .6s ease",
                  },
                  "&:hover::after": { left: "130%" },
                }}
              >
                Get a Quote
              </Button>

              <Button
                component="a"
                href={phoneHref}
                startIcon={<PhoneInTalkRoundedIcon />}
                variant="outlined"
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.25)",
                  fontWeight: 700,
                  borderRadius: "999px",
                  px: 4,
                  py: 1.4,
                  textTransform: "none",
                  fontSize: 15.5,
                  "&:hover": {
                    borderColor: LIME,
                    color: LIME,
                    bgcolor: "rgba(200,255,0,0.05)",
                  },
                }}
              >
                {phoneDisplay}
              </Button>
            </Box>

            <Typography
              sx={{ mt: 3, fontSize: 13, color: "rgba(255,255,255,0.45)" }}
            >
              No obligation. Free instant quote.
            </Typography>
          </Box>
        </Box>
      </Box>

      <QuoteModal
        open={open}
        onClose={() => setOpen(false)}
        service={service}
        lockService
      />
    </Box>
  );
}
