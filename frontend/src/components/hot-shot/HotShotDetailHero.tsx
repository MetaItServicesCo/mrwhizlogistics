"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import type { HotShotService } from "@/types/hotShot";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function HotShotDetailHero({
  service,
}: {
  service: HotShotService;
}) {
  const reduce = useReducedMotion() ?? false;

  const titleWords = service.title.split(" ");

  return (
    <Box
      component="section"
      aria-labelledby="service-hero-title"
      sx={{
        position: "relative",
        minHeight: {
          xs: 480,
          sm: 500,
          md: 520,
          lg: 540,
        },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        bgcolor: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* =========================================================
          BACKGROUND IMAGE — KEN BURNS
      ========================================================= */}

      <Box
        component={motion.div}
        aria-hidden
        initial={reduce ? {} : { scale: 1.34 }}
        animate={reduce ? {} : { scale: 1 }}
        transition={{
          duration: 8,
          ease: "easeOut",
        }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${service.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformOrigin: "center center",
        }}
      />

      {/* =========================================================
          DARK OVERLAY
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `
            linear-gradient(
              90deg,
              rgba(5,5,5,0.94) 0%,
              rgba(5,5,5,0.78) 35%,
              rgba(5,5,5,0.42) 68%,
              rgba(5,5,5,0.58) 100%
            ),
            linear-gradient(
              180deg,
              rgba(5,5,5,0.48) 0%,
              transparent 35%,
              rgba(5,5,5,0.72) 100%
            )
          `,
        }}
      />

      {/* =========================================================
          SUBTLE GRID
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.055,
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.25) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.25) 1px,
              transparent 1px
            )
          `,
          backgroundSize: {
            xs: "55px 55px",
            md: "80px 80px",
          },
          pointerEvents: "none",
        }}
      />

      {/* =========================================================
          TOP LIME LINE
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 4,
          background: `
            linear-gradient(
              90deg,
              ${LIME} 0%,
              rgba(200,255,0,0.65) 25%,
              transparent 65%
            )
          `,
        }}
      />

      {/* =========================================================
          LIME RADIAL GLOW
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "8%",
          right: "-5%",
          width: {
            xs: 260,
            md: 440,
          },
          height: {
            xs: 260,
            md: 440,
          },
          zIndex: 1,
          background:
            "radial-gradient(circle, rgba(200,255,0,0.14), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* =========================================================
          SPEED LINES
      ========================================================= */}

      {!reduce &&
        [25, 52, 78].map((top, i) => (
          <Box
            key={top}
            aria-hidden
            component={motion.div}
            animate={{
              x: ["-25%", "130%"],
            }}
            transition={{
              duration: 3.5 + i * 0.7,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.9,
            }}
            sx={{
              position: "absolute",
              top: `${top}%`,
              left: 0,
              zIndex: 2,
              width: {
                xs: 100,
                sm: 140,
                md: 190,
              },
              height: 2,
              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  ${LIME}77,
                  transparent
                )
              `,
              opacity: 0.35,
              pointerEvents: "none",
            }}
          />
        ))}

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1380,
          mx: "auto",
          px: {
            xs: 3,
            sm: 5,
            md: 7,
            lg: 9,
          },
          py: {
            xs: 8,
            sm: 10,
            md: 12,
          },
        }}
      >
        {/* =======================================================
            BACK LINK
        ======================================================= */}

        <motion.div
          initial={
            reduce
              ? {}
              : {
                  opacity: 0,
                  x: -25,
                }
          }
          animate={
            reduce
              ? {}
              : {
                  opacity: 1,
                  x: 0,
                }
          }
          transition={{
            duration: 0.6,
            ease: EASE,
          }}
        >
          <Box
            component={Link}
            href="/hot-shot"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.9,
              color: "rgba(255,255,255,0.72)",
              textDecoration: "none",
              fontSize: {
                xs: 10,
                md: 11,
              },
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              mb: {
                xs: 4,
                md: 5,
              },
              transition: "color .25s ease",

              "&:hover": {
                color: LIME,
              },
            }}
          >
            <ArrowBackRoundedIcon
              sx={{
                fontSize: {
                  xs: 16,
                  md: 18,
                },
              }}
            />
            All Hot Shot Services
          </Box>
        </motion.div>

        {/* =======================================================
            BADGE
        ======================================================= */}

        <motion.div
          initial={
            reduce
              ? {}
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={
            reduce
              ? {}
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: EASE,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.9,
              mb: {
                xs: 2.5,
                md: 3,
              },
              px: {
                xs: 1.4,
                md: 1.7,
              },
              py: {
                xs: 0.65,
                md: 0.75,
              },
              borderRadius: "999px",
              bgcolor: "rgba(200,255,0,0.10)",
              border: `1px solid ${LIME}55`,
              backdropFilter: "blur(7px)",
              boxShadow: `0 0 25px rgba(200,255,0,0.05)`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: LIME,
                boxShadow: `0 0 14px ${LIME}`,
                flexShrink: 0,
              }}
            />

            <BoltRoundedIcon
              sx={{
                fontSize: 16,
                color: LIME,
              }}
            />

            <Typography
              sx={{
                color: LIME,
                fontSize: {
                  xs: 9.5,
                  md: 10.5,
                },
                fontWeight: 800,
                letterSpacing: 1.7,
                textTransform: "uppercase",
              }}
            >
              {service.badge}
            </Typography>
          </Box>
        </motion.div>

        {/* =======================================================
            SERVICE NUMBER
        ======================================================= */}

        <motion.div
          initial={
            reduce
              ? {}
              : {
                  opacity: 0,
                  y: 18,
                }
          }
          animate={
            reduce
              ? {}
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          transition={{
            duration: 0.55,
            delay: 0.14,
            ease: EASE,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.34)",
              fontSize: {
                xs: 11,
                md: 13,
              },
              fontWeight: 800,
              letterSpacing: 3,
              mb: {
                xs: 1.5,
                md: 2,
              },
              textTransform: "uppercase",
            }}
          >
            Service {service.number}
          </Typography>
        </motion.div>

        {/* =======================================================
            TITLE + LIME BAR
        ======================================================= */}

        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            gap: {
              xs: 1.8,
              sm: 2.2,
              md: 3,
            },
          }}
        >
          {/* Lime vertical accent */}
          <Box
            component={motion.div}
            initial={
              reduce
                ? {}
                : {
                    scaleY: 0,
                  }
            }
            animate={
              reduce
                ? {}
                : {
                    scaleY: 1,
                  }
            }
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: EASE,
            }}
            sx={{
              width: {
                xs: 4,
                md: 6,
              },
              minHeight: {
                xs: 55,
                md: 95,
              },
              borderRadius: 4,
              background: `
                linear-gradient(
                  180deg,
                  ${LIME},
                  #00e5ff
                )
              `,
              transformOrigin: "top",
              flexShrink: 0,
              boxShadow: "0 0 20px rgba(200,255,0,0.12)",
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            {/* TITLE */}

            <Typography
              id="service-hero-title"
              component="h1"
              sx={{
                color: "#fff",
                fontWeight: 900,
                lineHeight: 0.94,
                letterSpacing: {
                  xs: "-2px",
                  sm: "-2.8px",
                  md: "-4px",
                },
                fontSize: {
                  xs: "3rem",
                  sm: "4.2rem",
                  md: "5.7rem",
                  lg: "6.7rem",
                },
                display: "flex",
                flexWrap: "wrap",
                columnGap: {
                  xs: "0.22em",
                  md: "0.25em",
                },
                maxWidth: 1100,
              }}
            >
              {titleWords.map((word, index) => (
                <Box
                  key={`${word}-${index}`}
                  component={motion.span}
                  initial={
                    reduce
                      ? {}
                      : {
                          opacity: 0,
                          y: 35,
                        }
                  }
                  animate={
                    reduce
                      ? {}
                      : {
                          opacity: 1,
                          y: 0,
                        }
                  }
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: 0.18 + index * 0.09,
                  }}
                  sx={{
                    display: "inline-block",
                  }}
                >
                  {word}
                </Box>
              ))}
            </Typography>

            {/* ===================================================
                BREADCRUMB
            =================================================== */}

            <motion.div
              initial={
                reduce
                  ? {}
                  : {
                      opacity: 0,
                      y: 15,
                    }
              }
              animate={
                reduce
                  ? {}
                  : {
                      opacity: 1,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.55,
                delay: 0.45,
                ease: EASE,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: {
                    xs: 1.2,
                    md: 1.5,
                  },
                  mt: {
                    xs: 2.5,
                    md: 3.5,
                  },
                  flexWrap: "wrap",
                }}
              >
                <Box
                  component={Link}
                  href="/"
                  sx={{
                    color: LIME,
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: {
                      xs: 13,
                      md: 15,
                    },
                    transition: "color .25s ease",

                    "&:hover": {
                      color: "#fff",
                    },
                  }}
                >
                  Home
                </Box>

                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.38)",
                  }}
                />

                <Box
                  component={Link}
                  href="/hot-shot"
                  sx={{
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: {
                      xs: 13,
                      md: 15,
                    },
                    transition: "color .25s ease",

                    "&:hover": {
                      color: LIME,
                    },
                  }}
                >
                  Hot Shot
                </Box>

                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.38)",
                  }}
                />

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.88)",
                    fontWeight: 700,
                    fontSize: {
                      xs: 13,
                      md: 15,
                    },
                  }}
                >
                  {service.title}
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* =======================================================
            DESCRIPTION
        ======================================================= */}

        <motion.div
          initial={
            reduce
              ? {}
              : {
                  opacity: 0,
                  y: 25,
                }
          }
          animate={
            reduce
              ? {}
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          transition={{
            duration: 0.65,
            delay: 0.52,
            ease: EASE,
          }}
        >
          <Typography
            sx={{
              mt: {
                xs: 3,
                md: 4,
              },
              ml: {
                xs: 0,
                md: 9,
              },
              maxWidth: 720,
              color: "rgba(255,255,255,0.70)",
              fontSize: {
                xs: 14.5,
                sm: 16,
                md: 18,
              },
              lineHeight: 1.75,
            }}
          >
            {service.shortDescription}
          </Typography>
        </motion.div>
      </Box>

      {/* =========================================================
          BOTTOM LIME LINE
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: {
            xs: 3,
            md: 4,
          },
          zIndex: 4,
          background: `
            linear-gradient(
              90deg,
              ${LIME} 0%,
              rgba(200,255,0,0.30) 42%,
              transparent 100%
            )
          `,
        }}
      />
    </Box>
  );
}
