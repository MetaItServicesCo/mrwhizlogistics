"use client";

import { motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const LIME = "#c8ff00";
const BG = "#0a0a0a";
const CARD = "#111411";

const EASE = [0.22, 1, 0.36, 1] as const;

type Benefit = {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: <VerifiedRoundedIcon />,
    number: "01",
    title: "Reliable Equipment",
    description:
      "Well-maintained trucks and trailers inspected regularly so you can move your freight with confidence.",
  },
  {
    icon: <EventAvailableRoundedIcon />,
    number: "02",
    title: "Flexible Rental Terms",
    description:
      "Choose daily, weekly or monthly rental options based on your project, shipment or business needs.",
  },
  {
    icon: <SpeedRoundedIcon />,
    number: "03",
    title: "Fast Availability",
    description:
      "Need equipment quickly? Our rental process is designed to help you get on the road without unnecessary delays.",
  },
  {
    icon: <LocalShippingRoundedIcon />,
    number: "04",
    title: "Multiple Equipment Options",
    description:
      "From hot shot trucks and trailers to enclosed and flatbed equipment, choose the setup that fits your load.",
  },
  {
    icon: <BuildRoundedIcon />,
    number: "05",
    title: "Job-Ready Equipment",
    description:
      "Our rental equipment is selected for real-world hauling, job-site deliveries, equipment transport and freight movement.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    number: "06",
    title: "Dedicated Support",
    description:
      "Have questions before renting? Our team can help you choose the right truck or trailer for your requirements.",
  },
];

export default function RentalBenefits() {
  const reduce = useReducedMotion() ?? false;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: BG,
        color: "#fff",
        py: { xs: 9, sm: 11, md: 14 },
      }}
    >
      {/* =========================================================
          BACKGROUND EFFECTS
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "10%",
          left: "-180px",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.08), transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: "-180px",
          bottom: "5%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* subtle grid */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* =======================================================
            HEADER
        ======================================================= */}

        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 25 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          sx={{
            maxWidth: 820,
            mb: { xs: 6, md: 8 },
          }}
        >
          {/* eyebrow */}

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              px: 1.5,
              py: 0.65,
              borderRadius: "999px",
              bgcolor: "rgba(200,255,0,0.08)",
              border: `1px solid ${LIME}33`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: LIME,
                boxShadow: `0 0 14px ${LIME}`,
              }}
            />

            <Typography
              sx={{
                color: LIME,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.8,
                textTransform: "uppercase",
              }}
            >
              Built For The Road
            </Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: "-1.8px",
              lineHeight: 1.05,
              fontSize: {
                xs: "2.35rem",
                sm: "3.3rem",
                md: "4.4rem",
              },
            }}
          >
            Why Rent
            <Box
              component="span"
              sx={{
                color: LIME,
                ml: { xs: 0.8, sm: 1.2 },
              }}
            >
              With Us?
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 2.5,
              maxWidth: 680,
              color: "rgba(255,255,255,0.58)",
              fontSize: { xs: 14, md: 16 },
              lineHeight: 1.75,
            }}
          >
            Get dependable trucks and trailers without the long-term commitment.
            Our rental options are designed to keep your freight, project and
            business moving.
          </Typography>
        </Box>

        {/* =======================================================
            BENEFIT GRID
        ======================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {BENEFITS.map((benefit, index) => (
            <BenefitCard
              key={benefit.number}
              benefit={benefit}
              index={index}
              reduce={reduce}
            />
          ))}
        </Box>

        {/* =======================================================
            BOTTOM CTA STRIP
        ======================================================= */}

        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 25 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: EASE,
          }}
          sx={{
            mt: { xs: 4, md: 5 },
            p: { xs: 2.5, md: 3 },
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(255,255,255,0.025)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 18, md: 21 },
              }}
            >
              Not sure which equipment you need?
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: "rgba(255,255,255,0.5)",
                fontSize: 13.5,
              }}
            >
              Tell us about your load and our team can help you choose.
            </Typography>
          </Box>

          <Button
            href="/quote"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            disableElevation
            sx={{
              flexShrink: 0,
              bgcolor: LIME,
              color: "#0a0a0a",
              borderRadius: "12px",
              px: 2.5,
              py: 1.25,
              fontWeight: 900,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#d8ff4d",
                transform: "translateX(2px)",
              },
              transition: "all 0.25s ease",
            }}
          >
            Help Me Choose
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

/* ================================================================
   BENEFIT CARD
================================================================ */

function BenefitCard({
  benefit,
  index,
  reduce,
}: {
  benefit: Benefit;
  index: number;
  reduce: boolean;
}) {
  return (
    <Box
      component={motion.div}
      initial={
        reduce
          ? {}
          : {
              opacity: 0,
              y: 35,
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
        duration: 0.6,
        delay: reduce ? 0 : index * 0.07,
        ease: EASE,
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -7,
            }
      }
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 250, md: 275 },
        p: { xs: 2.5, md: 3 },
        borderRadius: "20px",
        bgcolor: CARD,
        border: "1px solid rgba(255,255,255,0.075)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          borderColor: `${LIME}44`,
          boxShadow: "0 20px 55px rgba(0,0,0,0.3)",
        },
      }}
    >
      {/* top lime line */}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "42%",
          height: 2,
          background: `linear-gradient(90deg, ${LIME}, transparent)`,
          opacity: 0.8,
        }}
      />

      {/* number */}

      <Typography
        sx={{
          position: "absolute",
          top: 20,
          right: 22,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.16)",
        }}
      >
        {benefit.number}
      </Typography>

      {/* icon */}

      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "15px",
          bgcolor: "rgba(200,255,0,0.09)",
          border: `1px solid ${LIME}22`,
          color: LIME,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          "& svg": {
            fontSize: 25,
          },
        }}
      >
        {benefit.icon}
      </Box>

      {/* title */}

      <Typography
        component="h3"
        sx={{
          fontWeight: 850,
          fontSize: { xs: 18, md: 20 },
          letterSpacing: "-0.4px",
        }}
      >
        {benefit.title}
      </Typography>

      {/* description */}

      <Typography
        sx={{
          mt: 1.3,
          color: "rgba(255,255,255,0.52)",
          fontSize: 13.5,
          lineHeight: 1.7,
        }}
      >
        {benefit.description}
      </Typography>

      {/* bottom accent */}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "12%",
          right: "12%",
          height: 1,
          background: `linear-gradient(
            90deg,
            transparent,
            ${LIME}33,
            transparent
          )`,
        }}
      />
    </Box>
  );
}
