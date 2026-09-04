"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const BENEFITS = [
  "Flexible rental periods",
  "Multiple truck & trailer options",
  "Fast availability checks",
  "Simple quote process",
];

export default function RentalFinalCta() {
  const reduce = useReducedMotion() ?? false;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, sm: 10, md: 12 },
      }}
    >
      {/* Main lime glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: { xs: 360, md: 650 },
          height: { xs: 360, md: 650 },
          borderRadius: "50%",
          right: { xs: "-220px", md: "-260px" },
          top: "50%",
          transform: "translateY(-50%)",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.13), rgba(200,255,0,0.03) 35%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "55px 55px",
          maskImage: "linear-gradient(90deg, black, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      {/* Top lime line */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${LIME}, transparent)`,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: "24px", md: "32px" },
            border: "1px solid rgba(200,255,0,0.2)",
            background:
              "linear-gradient(135deg, rgba(200,255,0,0.075), rgba(255,255,255,0.025) 45%, rgba(255,255,255,0.015))",
            boxShadow: "0 35px 100px rgba(0,0,0,0.45)",
          }}
        >
          {/* Decorative circle */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              right: -100,
              top: -120,
              width: 350,
              height: 350,
              borderRadius: "50%",
              border: `1px solid ${LIME}18`,
              boxShadow: `0 0 0 45px ${LIME}08, 0 0 0 90px ${LIME}04`,
            }}
          />

          {/* Animated horizontal line */}
          {!reduce && (
            <Box
              component={motion.div}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              aria-hidden
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "35%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${LIME}, transparent)`,
              }}
            />
          )}

          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.2fr 0.8fr",
              },
              gap: { xs: 5, md: 8 },
              p: {
                xs: 3,
                sm: 4.5,
                md: 6,
              },
            }}
          >
            {/* LEFT */}
            <Box>
              {/* Badge */}
              <Box
                component={motion.div}
                initial={reduce ? {} : { opacity: 0, y: 15 }}
                whileInView={reduce ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.5,
                  py: 0.65,
                  mb: 2.5,
                  borderRadius: "999px",
                  bgcolor: "rgba(200,255,0,0.1)",
                  border: `1px solid ${LIME}40`,
                }}
              >
                <BoltRoundedIcon
                  sx={{
                    color: LIME,
                    fontSize: 16,
                  }}
                />

                <Typography
                  sx={{
                    color: LIME,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 1.6,
                  }}
                >
                  READY TO RENT?
                </Typography>
              </Box>

              <Typography
                component="h2"
                sx={{
                  maxWidth: 700,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: "-1.8px",
                  fontSize: {
                    xs: "2.35rem",
                    sm: "3.3rem",
                    md: "4.5rem",
                  },
                }}
              >
                Get The Right
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: LIME,
                  }}
                >
                  Equipment.
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 620,
                  mt: 2.5,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: {
                    xs: 14,
                    md: 16,
                  },
                  lineHeight: 1.75,
                }}
              >
                Tell us what you need, when you need it and how you plan to use
                it. Our team will help you find the right truck or trailer for
                your job.
              </Typography>

              {/* Benefits */}
              <Box
                sx={{
                  mt: 3.5,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 1.4,
                }}
              >
                {BENEFITS.map((benefit, index) => (
                  <Box
                    key={benefit}
                    component={motion.div}
                    initial={reduce ? {} : { opacity: 0, x: -10 }}
                    whileInView={reduce ? {} : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                      delay: index * 0.06,
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        color: LIME,
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 13,
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mt: 4,
                }}
              >
                <Button
                  component={Link}
                  href="/quote"
                  endIcon={<ArrowForwardRoundedIcon />}
                  disableElevation
                  sx={{
                    minHeight: 52,
                    px: 3,
                    borderRadius: "13px",
                    bgcolor: LIME,
                    color: "#0a0a0a",
                    fontSize: 14,
                    fontWeight: 900,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#d6ff3d",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.25s ease",
                  }}
                >
                  Get a Rental Quote
                </Button>

                <Button
                  component="a"
                  href="tel:+18000000000"
                  startIcon={<PhoneRoundedIcon />}
                  disableElevation
                  sx={{
                    minHeight: 52,
                    px: 2.7,
                    borderRadius: "13px",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.16)",
                    bgcolor: "rgba(255,255,255,0.04)",
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.09)",
                      borderColor: "rgba(255,255,255,0.28)",
                    },
                  }}
                >
                  Call Now
                </Button>
              </Box>
            </Box>

            {/* RIGHT VISUAL */}
            <Box
              sx={{
                minHeight: {
                  xs: 230,
                  sm: 280,
                  md: 360,
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Glow */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  width: "75%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(200,255,0,0.18), transparent 68%)",
                  filter: "blur(12px)",
                }}
              />

              {/* Truck icon card */}
              <Box
                component={motion.div}
                initial={
                  reduce
                    ? {}
                    : {
                        opacity: 0,
                        scale: 0.85,
                        rotate: -4,
                      }
                }
                whileInView={
                  reduce
                    ? {}
                    : {
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }
                }
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.8,
                  ease: EASE,
                }}
                whileHover={
                  reduce
                    ? undefined
                    : {
                        y: -6,
                        rotate: 1,
                      }
                }
                sx={{
                  position: "relative",
                  width: {
                    xs: 190,
                    sm: 240,
                    md: 285,
                  },
                  height: {
                    xs: 190,
                    sm: 240,
                    md: 285,
                  },
                  borderRadius: "50%",
                  border: `1px solid ${LIME}35`,
                  bgcolor: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 70px ${LIME}12`,
                }}
              >
                <Box
                  sx={{
                    width: "76%",
                    height: "76%",
                    borderRadius: "50%",
                    border: `1px dashed ${LIME}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocalShippingRoundedIcon
                    sx={{
                      fontSize: {
                        xs: 75,
                        sm: 100,
                        md: 125,
                      },
                      color: LIME,
                      filter: `drop-shadow(0 0 20px ${LIME}40)`,
                    }}
                  />
                </Box>
              </Box>

              {/* floating availability card */}
              <Box
                component={motion.div}
                animate={
                  reduce
                    ? {}
                    : {
                        y: [0, -8, 0],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                sx={{
                  position: "absolute",
                  left: {
                    xs: 0,
                    sm: 5,
                    md: 0,
                  },
                  bottom: {
                    xs: 15,
                    md: 20,
                  },
                  px: 1.6,
                  py: 1.2,
                  borderRadius: "13px",
                  bgcolor: "rgba(13,16,12,0.92)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#19d957",
                      boxShadow: "0 0 10px rgba(25,217,87,0.6)",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    Rental Fleet
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Check availability today
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom micro text */}
        <Typography
          sx={{
            textAlign: "center",
            mt: 3,
            color: "rgba(255,255,255,0.25)",
            fontSize: 10.5,
          }}
        >
          Need help choosing equipment? Contact our rental team for guidance.
        </Typography>
      </Box>
    </Box>
  );
}
