"use client";

import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const benefits = [
  {
    icon: <ScheduleRoundedIcon />,
    number: "01",
    title: "Flexible Rental Terms",
    description:
      "Choose daily, weekly or monthly rental options based on your hauling schedule and project requirements.",
  },
  {
    icon: <VerifiedRoundedIcon />,
    number: "02",
    title: "Reliable Equipment",
    description:
      "Dependable trucks and trailers ready for commercial hauling, job-site work and time-sensitive transportation.",
  },
  {
    icon: <Inventory2RoundedIcon />,
    number: "03",
    title: "Multiple Equipment Options",
    description:
      "Choose from Truck & Trailer, Sprinter Van, enclosed trailers and flatbeds for different load requirements.",
  },
  {
    icon: <LocalShippingRoundedIcon />,
    number: "04",
    title: "Fast Availability",
    description:
      "Get access to the equipment you need without unnecessary delays or complicated rental processes.",
  },
  {
    icon: <PriceCheckRoundedIcon />,
    number: "05",
    title: "Clear Rental Pricing",
    description:
      "Straightforward rental options and flexible plans designed around your equipment and rental duration.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    number: "06",
    title: "Professional Support",
    description:
      "Our team helps you choose the right truck or trailer based on your freight, load and hauling requirements.",
  },
];

export default function WhyRentWithUs() {
  const reduce = useReducedMotion() ?? false;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",

        bgcolor: "#0a0a0a",
        color: "#fff",

        px: {
          xs: 2.5,
          sm: 4,
          md: 6,
          lg: 8,
        },

        py: {
          xs: 8,
          md: 12,
          lg: 14,
        },
      }}
    >
      {/* ======================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",

          top: "5%",
          left: "-8%",

          width: {
            xs: 280,
            md: 520,
          },

          height: {
            xs: 280,
            md: 520,
          },

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(200,255,0,0.07), transparent 70%)",

          pointerEvents: "none",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",

          right: "-12%",
          bottom: "-25%",

          width: {
            xs: 300,
            md: 600,
          },

          height: {
            xs: 300,
            md: 600,
          },

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(0,229,255,0.045), transparent 70%)",

          pointerEvents: "none",
        }}
      />

      {/* ======================================================
          CONTAINER
      ====================================================== */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,

          maxWidth: 1280,
          mx: "auto",

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "0.85fr 1.45fr",
          },

          gap: {
            xs: 6,
            md: 8,
            lg: 10,
          },

          alignItems: "start",
        }}
      >
        {/* ====================================================
            LEFT CONTENT
        ==================================================== */}

        <Box
          component={motion.div}
          initial={{
            opacity: 0,
            x: reduce ? 0 : -35,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: false,
            margin: "-100px",
          }}
          transition={{
            duration: 0.65,
            ease: EASE,
          }}
          sx={{
            position: {
              xs: "relative",
              lg: "sticky",
            },

            top: {
              lg: 120,
            },
          }}
        >
          {/* EYEBROW */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 2,
                bgcolor: LIME,
              }}
            />

            <Typography
              sx={{
                color: LIME,

                fontSize: 11,
                fontWeight: 900,

                letterSpacing: 2.5,

                textTransform: "uppercase",
              }}
            >
              Why Rent With Us
            </Typography>
          </Box>

          {/* TITLE */}

          <Typography
            component="h2"
            sx={{
              fontWeight: 900,

              lineHeight: 1.05,

              letterSpacing: {
                xs: "-1px",
                md: "-1.8px",
              },

              fontSize: {
                xs: "2.2rem",
                sm: "3rem",
                md: "3.8rem",
                lg: "4rem",
              },
            }}
          >
            Equipment that keeps
            <Box
              component="span"
              sx={{
                display: "block",
                color: LIME,
              }}
            >
              your work moving.
            </Box>
          </Typography>

          {/* DESCRIPTION */}

          <Typography
            sx={{
              mt: 2.5,

              maxWidth: 480,

              color: "rgba(255,255,255,0.55)",

              fontSize: {
                xs: 14.5,
                md: 16,
              },

              lineHeight: 1.8,
            }}
          >
            From expedited hauling to job-site transportation, our rental
            equipment gives you the flexibility to choose the right setup for
            your load without committing to equipment you do not need.
          </Typography>

          {/* MINI STAT / VISUAL */}

          <Box
            sx={{
              mt: 4,

              display: "grid",

              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                lg: "repeat(2, 1fr)",
              },

              gap: 1,
            }}
          >
            {[
              ["6", "Rental Options"],
              ["24/7", "Support"],
              ["Fast", "Availability"],
            ].map(([value, label]) => (
              <Box
                key={label}
                sx={{
                  px: 2,
                  py: 2,

                  borderRadius: "14px",

                  bgcolor: "rgba(255,255,255,0.025)",

                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Typography
                  sx={{
                    color: LIME,

                    fontSize: {
                      xs: "1.25rem",
                      md: "1.4rem",
                    },

                    fontWeight: 900,

                    lineHeight: 1,
                  }}
                >
                  {value}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,

                    color: "rgba(255,255,255,0.42)",

                    fontSize: 10.5,

                    fontWeight: 700,

                    textTransform: "uppercase",

                    letterSpacing: 0.7,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ====================================================
            RIGHT BENEFITS
        ==================================================== */}

        <Box
          component={motion.div}
          variants={{
            hidden: {},

            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: false,
            margin: "-90px",
          }}
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },

            gap: {
              xs: 1.5,
              md: 2,
            },
          }}
        >
          {benefits.map((item) => (
            <Box
              key={item.number}
              component={motion.div}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                },

                show: {
                  opacity: 1,
                  y: 0,

                  transition: {
                    duration: 0.55,
                    ease: EASE,
                  },
                },
              }}
              sx={{
                position: "relative",

                minHeight: {
                  xs: 225,
                  md: 245,
                },

                p: {
                  xs: 2.5,
                  md: 3,
                },

                overflow: "hidden",

                borderRadius: {
                  xs: "18px",
                  md: "22px",
                },

                bgcolor: "#101210",

                border: "1px solid rgba(255,255,255,0.07)",

                transition:
                  "transform .35s ease, border-color .35s ease, box-shadow .35s ease",

                "&:hover": {
                  transform: reduce ? "none" : "translateY(-6px)",

                  borderColor: `${LIME}55`,

                  boxShadow:
                    "0 22px 55px rgba(0,0,0,0.4), 0 0 35px rgba(200,255,0,0.04)",
                },

                "&:hover .why-icon": {
                  bgcolor: LIME,
                  color: "#090b09",

                  transform: "rotate(-5deg) scale(1.06)",
                },

                "&:hover .why-line": {
                  transform: "scaleX(1)",
                },
              }}
            >
              {/* NUMBER */}

              <Typography
                aria-hidden
                sx={{
                  position: "absolute",

                  top: 14,
                  right: 18,

                  color: "rgba(255,255,255,0.035)",

                  fontSize: {
                    xs: 52,
                    md: 70,
                  },

                  fontWeight: 900,

                  lineHeight: 1,

                  userSelect: "none",
                }}
              >
                {item.number}
              </Typography>

              {/* ICON */}

              <Box
                className="why-icon"
                sx={{
                  width: 48,
                  height: 48,

                  borderRadius: "14px",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  bgcolor: "rgba(200,255,0,0.09)",

                  color: LIME,

                  border: `1px solid ${LIME}30`,

                  transition: "all .35s cubic-bezier(.2,.8,.2,1)",

                  "& svg": {
                    fontSize: 23,
                  },
                }}
              >
                {item.icon}
              </Box>

              {/* TITLE */}

              <Typography
                component="h3"
                sx={{
                  position: "relative",

                  mt: 3,

                  color: "#fff",

                  fontWeight: 850,

                  lineHeight: 1.2,

                  fontSize: {
                    xs: "1.15rem",
                    md: "1.3rem",
                  },
                }}
              >
                {item.title}
              </Typography>

              {/* DESCRIPTION */}

              <Typography
                sx={{
                  position: "relative",

                  mt: 1.2,

                  color: "rgba(255,255,255,0.5)",

                  fontSize: 13.5,

                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </Typography>

              {/* BOTTOM LINE */}

              <Box
                className="why-line"
                aria-hidden
                sx={{
                  position: "absolute",

                  left: 0,
                  right: 0,
                  bottom: 0,

                  height: 2,

                  background: `linear-gradient(
                    90deg,
                    ${LIME},
                    #00e5ff
                  )`,

                  transform: "scaleX(0)",

                  transformOrigin: "left",

                  transition: "transform .4s ease",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
