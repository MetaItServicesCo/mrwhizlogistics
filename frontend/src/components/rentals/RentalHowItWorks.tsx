"use client";

import { RENTAL_DEFAULTS, type RentalPageContent } from "@/lib/rentalContent";

import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { ctaProps, useCta } from "@/components/common/CtaProvider";
import { ACCENT, ACCENT_HOVER } from "@/theme/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

type Step = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Choose Your Rental",
    description:
      "Browse our available trucks and trailers and choose the rental option that best fits your load, distance and hauling requirements.",
    icon: <SearchRoundedIcon />,
  },
  {
    number: "02",
    title: "Request a Quote",
    description:
      "Tell us what you need, your rental duration and preferred pickup date. Our team will provide clear pricing and availability.",
    icon: <DescriptionRoundedIcon />,
  },
  {
    number: "03",
    title: "Pickup & Inspect",
    description:
      "Once your rental is confirmed, pick up your truck or trailer. Our team will walk you through the equipment before you leave.",
    icon: <LocalShippingRoundedIcon />,
  },
  {
    number: "04",
    title: "Hit the Road",
    description:
      "Load your freight and get moving with dependable equipment designed for safe, efficient and flexible hauling.",
    icon: <CheckCircleRoundedIcon />,
  },
];

export default function RentalHowItWorks({ content = RENTAL_DEFAULTS.page.sections.RentalHowItWorks }: { content?: RentalPageContent["sections"]["RentalHowItWorks"] }) {
  const { copy } = content;
  const quoteCta = useCta("rentals_how_quote");
  const callCta = useCta("rentals_how_call");
  const reduce = useReducedMotion() ?? false;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "var(--bg)",
        color: "var(--fg)",
        py: {
          xs: 9,
          sm: 4,
          md: 6,
        },
      }}
    >
      {/* =========================================================
          BACKGROUND DETAILS
      ========================================================= */}

      {/* Very subtle lime ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-12%",
          left: "-8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(var(--accent-rgb), 0.02), transparent 68%)",
          filter: "blur(15px)",
          pointerEvents: "none",
        }}
      />

      {/* Very subtle cyan ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "-8%",
          width: 550,
          height: 550,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(var(--accent-2-rgb), 0.035), transparent 60%)",
          filter: "blur(15px)",
          pointerEvents: "none",
        }}
      />

      {/* Center ambient glow - extremely subtle */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "46%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: 500,
            md: 850,
          },
          height: {
            xs: 180,
            md: 260,
          },
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(var(--accent-rgb), 0.025), transparent 20%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* subtle grid */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.14,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(var(--fg-rgb), 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--fg-rgb), 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1300,
          mx: "auto",
          px: {
            xs: 2.5,
            sm: 4,
            md: 6,
            lg: 8,
          },
        }}
      >
        {/* =======================================================
            SECTION HEADER
        ======================================================= */}

        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 30 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          sx={{
            maxWidth: 720,
            mx: "auto",
            textAlign: "center",
            mb: {
              xs: 7,
              md: 9,
            },
          }}
        >
          {/* eyebrow */}

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              px: 1.6,
              py: 0.65,
              borderRadius: "999px",
              border: `1px solid ${ACCENT}35`,
              bgcolor: `${ACCENT}08`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: ACCENT,
                boxShadow: `0 0 10px ${ACCENT}90`,
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >{copy.simpleRentalProcess}</Typography>
          </Box>

          {/* heading */}

          <Typography
            component="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: "-1.8px",
              lineHeight: 1.02,
              fontSize: {
                xs: "2.5rem",
                sm: "3.4rem",
                md: "4.5rem",
              },
            }}
          >{copy.howIt}{" "}
            <Box
              component="span"
              sx={{
                color: ACCENT,
              }}
            >{copy.works}</Box>
          </Typography>

          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(var(--fg-rgb), 0.58)",
              fontSize: {
                xs: 14,
                sm: 16,
              },
              lineHeight: 1.7,
              maxWidth: 620,
              mx: "auto",
            }}
          >{copy.rentingTheRightTruckOr}</Typography>
        </Box>

        {/* =======================================================
            STEPS
        ======================================================= */}

        <Box
          sx={{
            position: "relative",
          }}
        >
          {/* connecting line */}

          <Box
            aria-hidden
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              position: "absolute",
              top: 54,
              left: "11%",
              right: "11%",
              height: 1,
              background: `linear-gradient(
                90deg,
                transparent,
                rgba(var(--accent-rgb), 0.20) 12%,
                rgba(var(--accent-rgb), 0.20) 88%,
                transparent
              )`,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: {
                xs: 2,
                sm: 2.5,
                md: 2,
              },
            }}
          >
            {content.items.map((step, index) => (
              <Box
                key={index}
                component={motion.div}
                initial={
                  reduce
                    ? {}
                    : {
                        opacity: 0,
                        y: 40,
                      }
                }
                whileInView={
                  reduce
                    ? {}
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                  ease: EASE,
                }}
                sx={{
                  position: "relative",
                }}
              >
                {/* =================================================
                    CARD
                ================================================= */}

                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: {
                      xs: 280,
                      md: 320,
                    },
                    p: {
                      xs: 2.5,
                      md: 3,
                    },
                    borderRadius: "22px",
                    overflow: "hidden",

                    /* Cleaner black glass */
                    bgcolor: "rgba(var(--fg-rgb), 0.025)",

                    border: "1px solid rgba(var(--fg-rgb), 0.085)",

                    transition:
                      "transform 0.35s ease, border-color 0.35s ease, background-color 0.35s ease, box-shadow 0.35s ease",

                    "&:hover": {
                      transform: "translateY(-8px)",

                      /* subtle lime border */
                      borderColor: `${ACCENT}42`,

                      /* almost invisible green tint */
                      bgcolor: "rgba(var(--accent-rgb), 0.018)",

                      boxShadow: `
                        0 25px 60px rgba(var(--shadow-rgb), 0.112),
                        0 0 24px rgba(var(--accent-rgb), 0.035)
                      `,
                    },

                    "&:hover .step-icon": {
                      bgcolor: ACCENT,
                      color: "#081521",
                      transform: "rotate(-4deg) scale(1.06)",
                      boxShadow: `0 0 24px ${ACCENT}25`,
                    },

                    "&:hover .step-arrow": {
                      transform: "translateX(5px)",
                      opacity: 1,
                    },
                  }}
                >
                  {/* =================================================
                      NUMBER
                  ================================================= */}

                  <Typography
                    aria-hidden
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 18,
                      fontSize: {
                        xs: 58,
                        md: 72,
                      },
                      lineHeight: 1,
                      fontWeight: 900,
                      letterSpacing: "-4px",

                      /* slightly darker than before */
                      color: "rgba(var(--fg-rgb), 0.028)",

                      userSelect: "none",
                    }}
                  >
                    {step.number}
                  </Typography>

                  {/* =================================================
                      ICON
                  ================================================= */}

                  <Box
                    className="step-icon"
                    sx={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      borderRadius: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      /* subtle icon background */
                      bgcolor: "rgba(var(--accent-rgb), 0.075)",

                      color: ACCENT,
                      border: `1px solid ${ACCENT}20`,
                      transition: "all 0.35s ease",

                      "& svg": {
                        fontSize: 29,
                      },
                    }}
                  >
                    {STEPS[index % STEPS.length].icon}

                    {/* small status dot */}

                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        bgcolor: ACCENT,
                        border: "3px solid var(--bg)",
                      }}
                    />
                  </Box>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <Typography
                    sx={{
                      mt: 3,
                      fontSize: {
                        xs: 20,
                        md: 21,
                      },
                      fontWeight: 800,
                      letterSpacing: "-0.4px",
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1.2,
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: "rgba(var(--fg-rgb), 0.52)",
                    }}
                  >
                    {step.description}
                  </Typography>

                  {/* =================================================
                      BOTTOM
                  ================================================= */}

                  <Box
                    sx={{
                      position: "absolute",
                      left: 24,
                      right: 24,
                      bottom: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1.4,
                        color: "rgba(var(--fg-rgb), 0.25)",
                      }}
                    >{copy.step}{step.number}
                    </Typography>

                    <ArrowForwardRoundedIcon
                      className="step-arrow"
                      sx={{
                        fontSize: 17,
                        color: ACCENT,
                        opacity: 0.35,
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* =======================================================
            CTA
        ======================================================= */}

        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 25 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.65,
            delay: 0.15,
            ease: EASE,
          }}
          sx={{
            mt: {
              xs: 7,
              md: 9,
            },
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {/* Request Quote */}

          {!quoteCta.hidden && (
          <Button
            {...ctaProps(quoteCta)}
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 190,
              },
              px: 3,
              py: 1.35,
              borderRadius: "12px",
              bgcolor: ACCENT,
              color: "#081521",
              fontSize: 14,
              fontWeight: 900,
              textTransform: "none",
              boxShadow: `0 12px 35px ${ACCENT}18`,

              "&:hover": {
                bgcolor: ACCENT_HOVER,
                transform: "translateY(-2px)",
                boxShadow: `0 16px 40px ${ACCENT}25`,
              },

              transition: "all 0.25s ease",
            }}
          >
            {quoteCta.label}
          </Button>
          )}

          {/* Call Team */}

          {!callCta.hidden && (
          <Button
            {...ctaProps(callCta)}
            variant="outlined"
            sx={{
              minWidth: {
                xs: "100%",
                sm: 150,
              },
              px: 3,
              py: 1.35,
              borderRadius: "12px",
              borderColor: "rgba(var(--fg-rgb), 0.15)",
              color: "var(--fg)",
              fontSize: 14,
              fontWeight: 800,
              textTransform: "none",

              "&:hover": {
                borderColor: `${ACCENT}60`,
                bgcolor: `${ACCENT}06`,
              },
            }}
          >
            {callCta.label}
          </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
