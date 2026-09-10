"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

// 👇 apni images daalein (public/images/ mein)
const IMG_BACK = "  /images/blog/ab1.jpg";
const IMG_FRONT = "/images/blog/ab2.jpg";

const FEATURES = [
  {
    icon: <PublicRoundedIcon />,
    title: "Nationwide Service",
    desc: "From hot shot to full truckload, we move freight across all 50 states — reliably, on time.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: "24/7 Dispatch",
    desc: "Our team is on call day and night, so your load keeps moving whenever you need it.",
  },
];

export default function AboutExpertise() {
  const reduce = useReducedMotion() ?? false;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 13 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "10%",
          left: "-6%",
          width: 520,
          height: 420,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 6, md: 8 },
          alignItems: "center",
        }}
      >
        {/* LEFT — content */}
        <Box
          component={motion.div}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
        >
          {/* eyebrow */}
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}
          >
            <Box sx={{ width: 26, height: 2, bgcolor: LIME }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2.5,
                color: LIME,
                textTransform: "uppercase",
              }}
            >
              Our Company
            </Typography>
            <LocalShippingRoundedIcon sx={{ fontSize: 18, color: LIME }} />
          </Box>

          {/* heading */}
          <Typography
            component={motion.h2}
            variants={fadeUp}
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3.1rem" },
              mb: 2.5,
            }}
          >
            Our expertise stands in{" "}
            <Box
              component="span"
              sx={{
                position: "relative",
                display: "inline-block",
                background: `linear-gradient(90deg, ${LIME}, #00e5ff, ${LIME})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                animation: "abShimmer 6s linear infinite",
                "@keyframes abShimmer": {
                  to: { backgroundPosition: "200% center" },
                },
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                },
              }}
            >
              logistics solutions
              <Box
                component={motion.span}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -4,
                  height: 3,
                  bgcolor: LIME,
                  transformOrigin: "left",
                  borderRadius: 2,
                }}
              />
            </Box>
          </Typography>

          {/* intro */}
          <Typography
            component={motion.p}
            variants={fadeUp}
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 15, md: 16 },
              lineHeight: 1.8,
              mb: 4,
              maxWidth: 520,
            }}
          >
            As a trucking and logistics company, we play a pivotal role in the
            supply chain — efficiently managing the movement of freight from
            origin to final destination with speed, visibility and care.
          </Typography>

          {/* feature boxes */}
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mb: 4,
            }}
          >
            {FEATURES.map((f) => (
              <Box
                key={f.title}
                sx={{
                  position: "relative",
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: "#101010",
                  borderLeft: `2px solid ${LIME}`,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderLeftColor: LIME,
                  borderLeftWidth: 2,
                  transition: "all .3s",
                  "&:hover": {
                    bgcolor: "#141414",
                    transform: "translateY(-4px)",
                  },
                  "&:hover .af-icon": { transform: "scale(1.1)" },
                }}
              >
                <Box
                  className="af-icon"
                  sx={{
                    color: LIME,
                    mb: 1.2,
                    transition: "transform .3s",
                    "& svg": { fontSize: 30 },
                  }}
                >
                  {f.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 15.5,
                    color: "#fff",
                    mb: 0.8,
                  }}
                >
                  {f.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* CTA row */}
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              href="/contact"
              endIcon={<ArrowForwardRoundedIcon className="ab-a" />}
              disableElevation
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: LIME,
                color: "#0a0a0a",
                fontWeight: 800,
                borderRadius: "12px",
                px: 3.5,
                py: 1.4,
                textTransform: "none",
                fontSize: 14.5,
                "&:hover": { bgcolor: "#d4ff33" },
                "& .ab-a": { transition: "transform .3s" },
                "&:hover .ab-a": { transform: "translateX(3px)" },
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
              More About Us
            </Button>

            <Box
              component="a"
              href="tel:+18002048820"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: `1px solid ${LIME}44`,
                  color: LIME,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  "& svg": { fontSize: 20 },
                }}
              >
                <PhoneInTalkRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: LIME, fontWeight: 700 }}>
                  Make a Phone Call
                </Typography>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 800, color: "#fff" }}
                >
                  +1 (800) 204-8820
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT — overlapping images + rotating badge */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.7, ease: EASE }}
          sx={{
            position: "relative",
            minHeight: { xs: 420, md: 520 },
            display: { xs: "none", sm: "block" },
          }}
        >
          {/* dotted grid deco */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              backgroundImage: `radial-gradient(${LIME}55 1.5px, transparent 1.5px)`,
              backgroundSize: "16px 16px",
              opacity: 0.5,
            }}
          />

          {/* back image */}
          <Box
            component={motion.div}
            initial={reduce ? {} : { y: 0 }}
            animate={reduce ? {} : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: "absolute",
              top: 20,
              left: 0,
              width: "70%",
              height: "70%",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              ...(IMG_BACK
                ? {
                    backgroundImage: `url(${IMG_BACK})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: "linear-gradient(150deg, #26301a, #0a0a0a)" }),
            }}
          />

          {/* front image */}
          <Box
            component={motion.div}
            initial={reduce ? {} : { y: 0 }}
            animate={reduce ? {} : { y: [0, 12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "62%",
              height: "66%",
              borderRadius: "18px",
              overflow: "hidden",
              border: `2px solid ${LIME}44`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              zIndex: 2,
              ...(IMG_FRONT
                ? {
                    backgroundImage: `url(${IMG_FRONT})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: "linear-gradient(150deg, #12202a, #0a0a0a)" }),
            }}
          />

          {/* rotating circular badge */}
          <Box
            sx={{
              position: "absolute",
              bottom: "28%",
              left: "34%",
              zIndex: 3,
              width: 108,
              height: 108,
            }}
          >
            <Box
              component={motion.div}
              aria-hidden
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              sx={{ position: "absolute", inset: 0 }}
            >
              <Box
                component="svg"
                viewBox="0 0 100 100"
                sx={{ width: "100%", height: "100%" }}
              >
                <defs>
                  <path
                    id="badgeCircle"
                    d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                  />
                </defs>
                <circle cx="50" cy="50" r="49" fill={LIME} />
                <text
                  fill="#0a0a0a"
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="2.5"
                >
                  <textPath href="#badgeCircle" startOffset="0%">
                    WELCOME · TO OUR COMPANY · SINCE 2015 ·{" "}
                  </textPath>
                </text>
              </Box>
            </Box>
            {/* center icon */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: "#0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": { fontSize: 26, color: LIME },
                }}
              >
                <LocalShippingRoundedIcon />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
