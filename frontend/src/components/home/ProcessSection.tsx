"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import DesignServicesRoundedIcon from "@mui/icons-material/DesignServicesRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const LIME = "#c8ff00";

const STEPS = [
  {
    title: "Request & Research",
    desc: "Tell us your load details. We research lanes, rates and equipment to find the best match.",
    icon: <FactCheckRoundedIcon />,
  },
  {
    title: "Plan & Design",
    desc: "We create a customized transport plan with the right truck, route, timeline and budget.",
    icon: <DesignServicesRoundedIcon />,
  },
  {
    title: "Get a Quote",
    desc: "Receive a clear, all-inclusive quote with no hidden fees or surcharges.",
    icon: <RequestQuoteRoundedIcon />,
  },
  {
    title: "Book & Confirm",
    desc: "Review terms, SLAs and coverage. Once approved, we lock it in.",
    icon: <HandshakeRoundedIcon />,
  },
  {
    title: "Transport & Track",
    desc: "Live dispatch and real-time tracking keep you updated every mile of the way.",
    icon: <LocalShippingRoundedIcon />,
  },
  {
    title: "On-Time Delivery",
    desc: "We deliver safely, on time with proof of delivery and post-haul support.",
    icon: <Inventory2RoundedIcon />,
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  return (
    <Box
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        alignItems: "center",
        gap: { xs: 2.5, md: 0 },
        textAlign: { xs: "left", md: "center" },
        flex: { md: 1 },
        minWidth: 0,
      }}
    >
      {/* icon disc */}
      <Box
        className="step-disc"
        sx={{
          position: "relative",
          flexShrink: 0,
          width: { xs: 74, md: 104 },
          height: { xs: 74, md: 104 },
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,0.1)",
          transition:
            "transform .35s ease, box-shadow .35s ease, border-color .35s ease",
          "& .step-icon": {
            color: LIME,
            transition: "transform .35s ease",
            "& svg": { fontSize: { xs: 30, md: 40 } },
          },
          "& .step-ring": {
            transition: "transform .6s ease, opacity .35s ease",
            opacity: 0.35,
          },
          "&:hover": {
            transform: "translateY(-6px)",
            borderColor: `${LIME}66`,
            boxShadow: `0 16px 40px rgba(200,255,0,0.16)`,
          },
          "&:hover .step-icon": { transform: "scale(1.12)" },
          "&:hover .step-ring": { transform: "rotate(90deg)", opacity: 1 },
        }}
      >
        {/* rotating dashed ring */}
        <Box
          component="svg"
          className="step-ring"
          viewBox="0 0 100 100"
          aria-hidden
          sx={{
            position: "absolute",
            inset: -5,
            width: "calc(100% + 10px)",
            height: "calc(100% + 10px)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke={LIME}
            strokeWidth="1.5"
            strokeDasharray="6 10"
            strokeLinecap="round"
          />
        </Box>

        {/* number badge */}
        <Box
          sx={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 26,
            height: 26,
            borderRadius: "50%",
            bgcolor: LIME,
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            border: "3px solid #0a0a0a",
          }}
        >
          {index + 1}
        </Box>

        <Box className="step-icon">{step.icon}</Box>
      </Box>

      {/* text */}
      <Box sx={{ mt: { xs: 0, md: 2.5 }, px: { md: 1 } }}>
        <Typography
          component="h3"
          sx={{
            fontSize: { xs: "1rem", md: "1.05rem" },
            fontWeight: 700,
            color: "#fff",
            mb: 0.5,
          }}
        >
          {step.title}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.55)",
            maxWidth: { md: 190 },
            mx: { md: "auto" },
          }}
        >
          {step.desc}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ProcessSection() {
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);

  // scroll progress across the timeline → fills line + moves truck
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 55%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26 });
  const lineScale = reduce ? 1 : smooth; // desktop horizontal fill
  const truckLeft = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const lineScaleYMobile = reduce ? 1 : smooth; // mobile vertical fill

  return (
    <Box
      component="section"
      aria-labelledby="process-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 4, md: 4 },
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 320,
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
          maxWidth: 860,
          mx: "auto",
          mb: { xs: 6, md: 9 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            component="p"
            sx={{
              color: LIME,
              letterSpacing: 3,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            How It Works
          </Typography>
          <Typography
            id="process-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.14,
              fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "procShimmer 6s linear infinite",
              "@keyframes procShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            An easy 6-step solution for all your trucking needs
          </Typography>
        </motion.div>
      </Box>

      {/* timeline */}
      <Box
        ref={trackRef}
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.14 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        sx={{
          position: "relative",
          maxWidth: 1180,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 4, md: 2 },
          alignItems: { xs: "stretch", md: "flex-start" },
        }}
      >
        {/* DESKTOP connecting line (behind discs, aligned to disc center = 52px) */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 52,
            left: "8%",
            right: "8%",
            height: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <Box
            component={motion.div}
            style={{ scaleX: lineScale }}
            sx={{
              height: "100%",
              width: "100%",
              transformOrigin: "left",
              background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
              borderRadius: 2,
            }}
          />
        </Box>

        {/* DESKTOP moving truck along the line */}
        {!reduce && (
          <Box
            aria-hidden
            component={motion.div}
            style={{ left: truckLeft }}
            sx={{
              display: { xs: "none", md: "flex" },
              position: "absolute",
              top: 34,
              ml: "8%",
              transform: "translateX(-50%)",
              zIndex: 2,
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: LIME,
              color: "#0a0a0a",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(200,255,0,0.4)",
              "& svg": { fontSize: 20 },
            }}
          >
            <LocalShippingRoundedIcon />
          </Box>
        )}

        {/* MOBILE vertical line */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 37,
            width: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <Box
            component={motion.div}
            style={{ scaleY: lineScaleYMobile }}
            sx={{
              width: "100%",
              height: "100%",
              transformOrigin: "top",
              background: `linear-gradient(180deg, ${LIME}, #00e5ff)`,
              borderRadius: 2,
            }}
          />
        </Box>

        {STEPS.map((s, i) => (
          <StepCard key={s.title} step={s} index={i} />
        ))}
      </Box>
    </Box>
  );
}
