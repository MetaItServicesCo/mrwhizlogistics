"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  {
    icon: <SupportAgentRoundedIcon />,
    t: "One Point of Contact",
    d: "A dedicated dispatcher owns your load from pickup to proof of delivery.",
  },
  {
    icon: <VisibilityRoundedIcon />,
    t: "Full Visibility",
    d: "Live GPS tracking, milestone alerts and ETAs, all in real time.",
  },
  {
    icon: <ReceiptLongRoundedIcon />,
    t: "Transparent Pricing",
    d: "Upfront, all-inclusive quotes. No hidden surcharges, ever.",
  },
  {
    icon: <VerifiedUserRoundedIcon />,
    t: "Fully Insured",
    d: "Cargo liability cover included on every hot shot haul.",
  },
  {
    icon: <BoltRoundedIcon />,
    t: "Rapid Dispatch",
    d: "Trucks roll within hours of your request, 24/7, any day.",
  },
  {
    icon: <RouteRoundedIcon />,
    t: "Direct Routes",
    d: "No consolidation stops. Straight from your gate to the dock.",
  },
];

function WhyCard({ c }: { c: (typeof CARDS)[number] }) {
  return (
    <Box
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 34 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
      sx={{
        position: "relative",
        overflow: "hidden",
        p: { xs: 3, md: 3.5 },
        borderRadius: "18px",
        bgcolor: "#101010",
        border: "1px solid rgba(255,255,255,0.08)",
        transition:
          "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: `${LIME}55`,
          boxShadow: "0 20px 46px rgba(200,255,0,0.1)",
        },
        "&:hover .wc-icon": { transform: "translateY(-3px) rotate(-6deg)" },
        "&:hover .wc-sheen": { transform: "translateX(120%)" },
      }}
    >
      {/* diagonal sheen on hover */}
      <Box
        className="wc-sheen"
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(120deg, transparent, rgba(200,255,0,0.06), transparent)",
          transform: "translateX(-130%)",
          transition: "transform .7s ease",
          pointerEvents: "none",
        }}
      />

      <Box
        className="wc-icon"
        sx={{
          width: 52,
          height: 52,
          borderRadius: "13px",
          bgcolor: LIME,
          color: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2.5,
          boxShadow: "0 8px 20px rgba(200,255,0,0.3)",
          transition: "transform .35s ease",
          "& svg": { fontSize: 26 },
        }}
      >
        {c.icon}
      </Box>
      <Typography
        component="h3"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.15rem", md: "1.2rem" },
          mb: 1,
          color: "#fff",
        }}
      >
        {c.t}
      </Typography>
      <Typography
        sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.65 }}
      >
        {c.d}
      </Typography>
    </Box>
  );
}

export default function HotShotWhy() {
  return (
    <Box
      component="section"
      aria-labelledby="hs-why-title"
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
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 820,
          mx: "auto",
          mb: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* eyebrow with side lines (reference jaisा) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
            <Typography
              component="p"
              sx={{
                color: LIME,
                letterSpacing: 3,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Why Our Services
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            id="hs-why-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.4rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "hsWhyShimmer 6s linear infinite",
              "@keyframes hsWhyShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            One partner, every urgent mile.
          </Typography>
        </motion.div>
      </Box>

      {/* grid */}
      <Box
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4,1fr)",
          },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {CARDS.map((c) => (
          <WhyCard key={c.t} c={c} />
        ))}
      </Box>
    </Box>
  );
}
