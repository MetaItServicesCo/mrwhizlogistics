"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CloseIcon from "@mui/icons-material/Close";
import YouTubeIcon from "@mui/icons-material/YouTube";

const LIME = "#c8ff00";

export default function AdvancedFooterCTA() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#04100d",
        color: "#fff",
        position: "relative",
        overflow: "hidden",

        // Reduced vertical padding
        pt: {
          xs: 7,
          sm: 8,
          md: 10,
          lg: 12,
        },

        pb: {
          xs: 5,
          sm: 6,
          md: 7,
          lg: 8,
        },

        px: {
          xs: 2.5,
          sm: 4,
          md: 5,
          lg: 8,
          xl: 10,
        },

        borderTop: "1px solid rgba(200, 255, 0, 0.15)",
      }}
    >
      {/* BACKGROUND FAST & BLINKING CIRCUIT LINES */}
      <Box
        component="div"
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.5,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Path 1 */}
          <motion.path
            d="M-100 150 H 350 L 450 250 H 800 L 900 150 H 1500"
            stroke="rgba(200, 255, 0, 0.7)"
            strokeWidth="2"
            strokeDasharray="8 8"
            initial={{
              pathLength: 0,
              opacity: 0.3,
            }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.2, 0.9, 0.3, 1, 0.4],
              strokeDashoffset: [0, -100],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Path 2 */}
          <motion.path
            d="M 150 900 L 250 750 H 600 L 700 850 H 1300"
            stroke="rgba(200, 255, 0, 0.5)"
            strokeWidth="1.5"
            initial={{
              pathLength: 0,
              opacity: 0.2,
            }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.1, 1, 0.2, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Glowing node */}
          <motion.circle
            cx="450"
            cy="250"
            r="4"
            fill={LIME}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.circle
            cx="700"
            cy="850"
            r="4"
            fill={LIME}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />

          {/* Top border curve */}
          <path
            d="M 0 50 C 400 50, 500 120, 720 120 C 940 120, 1040 50, 1440 50"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </Box>

      {/* MAIN CONTAINER */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* UPPER / MIDDLE SECTION */}
        <Box
          sx={{
            display: "grid",

            // Mobile: 1 column
            // Tablet: 2 columns
            // Desktop: 4 columns
            gridTemplateColumns: {
              xs: "1fr ",
              sm: "1fr 1fr",
              md: "1fr 1fr",
              lg: "1.4fr 1fr 1fr 1.6fr",
            },

            gap: {
              xs: 5,
              sm: 5,
              md: 6,
              lg: 4,
            },

            alignItems: "start",

            mb: {
              xs: 6,
              sm: 7,
              md: 8,
              lg: 9,
            },
          }}
        >
          {/* COLUMN 1: LOGO & ADDRESS */}
          <Stack
            spacing={{
              xs: 2.5,
              sm: 3,
              md: 3.5,
              lg: 4,
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "fit-content",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: LIME,
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                    fontSize: "16px",
                  }}
                >
                  T
                </Box>
              </Box>

              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: {
                    xs: 20,
                    sm: 21,
                  },
                  letterSpacing: "-0.5px",
                }}
              >
                Terminal
              </Typography>
            </Link>

            <Stack spacing={0.5}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: {
                    xs: "1.1rem",
                    sm: "1.2rem",
                  },
                  letterSpacing: "0.5px",
                  color: "#fff",
                  mb: 0.5,
                }}
              >
                Gartner.
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: {
                    xs: "12px",
                    sm: "13px",
                  },
                  lineHeight: 1.5,
                }}
              >
                555 N 5th St 109 B,
                <br />
                Garland, TX 75040,
                <br />
                United States
              </Typography>
            </Stack>
          </Stack>

          {/* COLUMN 2: SERVICES */}
          <Stack
            spacing={{
              xs: 1.5,
              sm: 1.7,
              md: 1.8,
              lg: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "17px",
                  sm: "18px",
                },
                fontWeight: 700,
                letterSpacing: "2.5px",
                color: "#fff",
                textTransform: "uppercase",
                mb: 0.5,
              }}
            >
              Services
            </Typography>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Hot Shot
            </Link>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Box Truck
            </Link>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Semi Truck
            </Link>
          </Stack>

          {/* COLUMN 3: QUICK LINKS */}
          <Stack
            spacing={{
              xs: 1.5,
              sm: 1.7,
              md: 1.8,
              lg: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "17px",
                  sm: "18px",
                },
                fontWeight: 700,
                letterSpacing: "2.5px",
                color: "#fff",
                textTransform: "uppercase",
                mb: 0.5,
              }}
            >
              Quick Links
            </Typography>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              About
            </Link>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Resources
            </Link>

            <Link
              href="#"
              style={{
                textDecoration: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Contact
            </Link>
          </Stack>

          {/* COLUMN 4: REACH US CARD */}
          <Box
            sx={{
              // On tablet make card span both columns
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
                md: "1 / -1",
                lg: "auto",
              },

              position: "relative",

              p: {
                xs: 2.5,
                sm: 3,
                md: 3.5,
                lg: 4.5,
              },

              borderRadius: {
                xs: "18px",
                sm: "20px",
                lg: "24px",
              },

              border: "1px solid rgba(200, 255, 0, 0.2)",

              backgroundColor: "rgba(5, 18, 14, 0.75)",

              backdropFilter: "blur(16px)",

              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",

              overflow: "hidden",

              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography
              sx={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                color: LIME,
                textTransform: "uppercase",
                mb: 2,
              }}
            >
              REACH US
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.1rem",
                  md: "1.15rem",
                  lg: "1.2rem",
                },

                fontWeight: 500,

                color: "#fff",

                lineHeight: 1.4,

                mb: 1.5,
              }}
            >
              Contact us today for a customized trucking quote!
              <br />
              <Box
                component="span"
                sx={{
                  color: LIME,
                  fontWeight: 700,
                }}
              >
                +1 (469) 767 8853
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "13.5px",
                mb: 3,
              }}
            >
              Give us a call today.
            </Typography>

            {/* SOCIAL ICONS */}
            <Stack direction="row" spacing={1.5}>
              <Box
                component="a"
                href="#"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  transition: "0.2s",
                  "&:hover": {
                    bgcolor: LIME,
                    color: "#000",
                  },
                }}
              >
                <LinkedInIcon sx={{ fontSize: 18 }} />
              </Box>

              <Box
                component="a"
                href="#"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  transition: "0.2s",
                  "&:hover": {
                    bgcolor: LIME,
                    color: "#000",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </Box>

              <Box
                component="a"
                href="#"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  transition: "0.2s",
                  "&:hover": {
                    bgcolor: LIME,
                    color: "#000",
                  },
                }}
              >
                <YouTubeIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* BOTTOM COPYRIGHT BAR */}
        <Box
          sx={{
            pt: 3,

            display: "flex",

            justifyContent: {
              xs: "center",
              sm: "space-between",
            },

            alignItems: {
              xs: "center",
              sm: "center",
            },

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            flexWrap: "wrap",

            gap: 2,

            color: "rgba(255,255,255,0.35)",

            fontSize: "12px",

            borderTop: "1px solid rgba(255, 255, 255, 0.05)",

            textAlign: {
              xs: "center",
              sm: "left",
            },
          }}
        >
          <Stack spacing={0.5}>
            <Typography
              sx={{
                fontSize: {
                  xs: "11px",
                  sm: "12px",
                },
                color: "#fff",
              }}
            >
              Mr.Whiz Logisttics © 2025 All Rights Reserved
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
