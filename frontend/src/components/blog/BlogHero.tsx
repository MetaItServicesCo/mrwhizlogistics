"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

// const HERO_IMAGE: string | undefined = "/images/breadcumb.jpg";
const HERO_IMAGE: string | undefined = "/images/blog/b7.png";

type Props = {
  title?: string;
  crumb?: string;
  badge?: string;
};

export default function BlogHero({
  title = "Our Blog",
  crumb = "Blog",
  badge = "TRUCKING INSIGHTS",
}: Props) {
  const reduce = useReducedMotion() ?? false;
  const words = title.split(" ");

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: {
          xs: 360,
          sm: 440,
          md: 560,
        },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        bgcolor: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* =====================================================
          BACKGROUND IMAGE — KEN BURNS
      ===================================================== */}

      <Box
        component={motion.div}
        aria-hidden
        initial={reduce ? {} : { scale: 1.12 }}
        animate={reduce ? {} : { scale: 1 }}
        transition={{
          duration: 8,
          ease: "easeOut",
        }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,

          ...(HERO_IMAGE
            ? {
                backgroundImage: `url(${HERO_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: "linear-gradient(135deg, #1c2a15, #05070a)",
              }),
        }}
      />

      {/* =====================================================
          DARK OVERLAY
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.5) 0%, transparent 30%, rgba(10,10,10,0.55) 100%)",
        }}
      />

      {/* =====================================================
          TOP LIME LINE
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 2,
          background: `linear-gradient(90deg, ${LIME}, transparent 60%)`,
        }}
      />

      {/* =====================================================
          LIME GLOW
      ===================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "18%",
          right: "-4%",
          width: 360,
          height: 360,
          zIndex: 1,
          background:
            "radial-gradient(circle, rgba(200,255,0,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          SPEED LINES
      ===================================================== */}

      {!reduce &&
        [26, 54, 78].map((top, i) => (
          <Box
            key={top}
            aria-hidden
            component={motion.div}
            animate={{
              x: ["-20%", "130%"],
            }}
            transition={{
              duration: 3 + i * 0.6,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8,
            }}
            sx={{
              position: "absolute",
              top: `${top}%`,
              left: 0,
              zIndex: 2,
              width: {
                xs: 90,
                md: 160,
              },
              height: 2,
              background: `linear-gradient(90deg, transparent, ${LIME}77, transparent)`,
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
        ))}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1300,
          mx: "auto",
          px: {
            xs: 3,
            sm: 5,
            md: 8,
            lg: 10,
          },
        }}
      >
        {/* ===================================================
            BADGE
        =================================================== */}

        <Box
          component={motion.div}
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: EASE,
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            mb: 2.5,
            px: 1.6,
            py: 0.6,
            borderRadius: "999px",
            bgcolor: "rgba(200,255,0,0.12)",
            border: `1px solid ${LIME}55`,
            backdropFilter: "blur(4px)",
          }}
        >
          <ArticleRoundedIcon
            sx={{
              fontSize: 16,
              color: LIME,
            }}
          />

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: LIME,
            }}
          >
            {badge}
          </Typography>
        </Box>

        {/* ===================================================
            TITLE
        =================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            gap: {
              xs: 2,
              md: 3,
            },
          }}
        >
          {/* LIME / CYAN ACCENT BAR */}

          <Box
            component={motion.div}
            initial={{
              scaleY: 0,
            }}
            animate={{
              scaleY: 1,
            }}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: 0.1,
            }}
            sx={{
              width: {
                xs: 4,
                md: 6,
              },
              borderRadius: 3,
              background: `linear-gradient(180deg, ${LIME}, #00e5ff)`,
              transformOrigin: "top",
              flexShrink: 0,
            }}
          />

          <Box>
            {/* TITLE */}

            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-1.5px",
                fontSize: {
                  xs: "2.8rem",
                  sm: "4rem",
                  md: "5.5rem",
                },
                display: "flex",
                flexWrap: "wrap",
                columnGap: "0.25em",
              }}
            >
              {words.map((word, i) => (
                <Box
                  key={`${word}-${i}`}
                  component={motion.span}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: EASE,
                    delay: 0.15 + i * 0.1,
                  }}
                  sx={{
                    display: "inline-block",
                  }}
                >
                  {word}
                </Box>
              ))}
            </Typography>

            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <Box
              component={motion.div}
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                ease: EASE,
                delay: 0.4,
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: {
                  xs: 2,
                  md: 3,
                },
                flexWrap: "wrap",
              }}
            >
              {/* HOME */}

              <Box
                component={Link}
                href="/"
                sx={{
                  color: LIME,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: {
                    xs: 14,
                    md: 16,
                  },

                  "&:hover": {
                    color: "#fff",
                  },
                }}
              >
                Home
              </Box>

              {/* DOT */}

              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              />

              {/* BLOG */}

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                  fontSize: {
                    xs: 14,
                    md: 16,
                  },
                }}
              >
                {crumb}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
