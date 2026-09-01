"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    icon: <EditNoteRoundedIcon />,
    t: "Request a Quote",
    d: "Share pickup, drop-off and load details. Get pricing in minutes.",
  },
  {
    icon: <PersonSearchRoundedIcon />,
    t: "Instant Driver Match",
    d: "We assign the nearest available dedicated driver right away.",
  },
  {
    icon: <LocalShippingRoundedIcon />,
    t: "On the Road",
    d: "Driver dispatched and tracked live from pickup to your dock.",
  },
  {
    icon: <TaskAltRoundedIcon />,
    t: "Delivered",
    d: "Proof of delivery confirmed, and the job is closed out.",
  },
];

function StepCard({ s, i }: { s: (typeof STEPS)[number]; i: number }) {
  return (
    <Box
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      sx={{
        position: "relative",
        zIndex: 1,
        flex: { md: 1 },
        minWidth: 0,
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        alignItems: { xs: "flex-start", md: "center" },
        textAlign: { xs: "left", md: "center" },
        gap: { xs: 2.5, md: 0 },
      }}
    >
      {/* number + icon disc */}
      <Box sx={{ position: "relative", flexShrink: 0, mb: { md: 3 } }}>
        <Box
          className="hw-disc"
          sx={{
            width: { xs: 66, md: 84 },
            height: { xs: 66, md: 84 },
            borderRadius: "50%",
            bgcolor: "#101010",
            border: `1px solid rgba(255,255,255,0.12)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
            "& svg": {
              fontSize: { xs: 28, md: 34 },
              color: LIME,
              transition: "transform .35s ease",
            },
            "&:hover": {
              transform: "translateY(-5px)",
              borderColor: `${LIME}66`,
              boxShadow: "0 16px 38px rgba(200,255,0,0.16)",
            },
            "&:hover svg": { transform: "scale(1.12)" },
          }}
        >
          {s.icon}
        </Box>
        {/* number badge */}
        <Box
          sx={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: LIME,
            color: "#0a0a0a",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #0a0a0a",
          }}
        >
          {i + 1}
        </Box>
      </Box>

      {/* text */}
      <Box sx={{ px: { md: 1 } }}>
        <Typography
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.1rem", md: "1.2rem" },
            mb: 0.75,
            color: "#fff",
          }}
        >
          {s.t}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            lineHeight: 1.65,
            maxWidth: { md: 210 },
            mx: { md: "auto" },
          }}
        >
          {s.d}
        </Typography>
      </Box>
    </Box>
  );
}

export default function HotShotHow() {
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 78%", "end 60%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26 });
  const lineScaleX = reduce ? 1 : smooth;
  const lineScaleY = reduce ? 1 : smooth;

  return (
    <Box
      component="section"
      aria-labelledby="hs-how-title"
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
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 660,
          height: 320,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 780,
          mx: "auto",
          mb: { xs: 6, md: 9 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
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
              How It Works
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            id="hs-how-title"
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
              animation: "hsHowShimmer 6s linear infinite",
              "@keyframes hsHowShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            From request to delivered, fast.
          </Typography>
        </motion.div>
      </Box>

      {/* steps */}
      <Box
        ref={trackRef}
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.16 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        sx={{
          position: "relative",
          maxWidth: 1120,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 4, md: 2 },
        }}
      >
        {/* DESKTOP line (disc center ≈ 42px from top) */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 42,
            left: "12%",
            right: "12%",
            height: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <Box
            component={motion.div}
            style={{ scaleX: lineScaleX }}
            sx={{
              height: "100%",
              width: "100%",
              transformOrigin: "left",
              background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
              borderRadius: 2,
            }}
          />
        </Box>

        {/* MOBILE vertical line */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 33,
            width: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <Box
            component={motion.div}
            style={{ scaleY: lineScaleY }}
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
          <StepCard key={s.t} s={s} i={i} />
        ))}
      </Box>
    </Box>
  );
}
