"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    t: "Request & Quote",
    d: "Share pickup, drop-off and load details. We price the run upfront — no hidden surcharges, no surprises.",
  },
  {
    t: "Instant Dispatch",
    d: "We match the nearest available dedicated driver and confirm your pickup window, usually within the hour.",
  },
  {
    t: "On the Road",
    d: "Your load moves direct — no consolidation stops — with live GPS tracking and milestone alerts the whole way.",
  },
  {
    t: "Delivered & Confirmed",
    d: "Proof of delivery is captured and shared instantly, and our team stays on call until the job is closed out.",
  },
];

export default function HotShotHowItWorks() {
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 65%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26 });
  const lineScaleY = reduce ? 1 : smooth;

  return (
    <Box component="section" sx={{ mt: { xs: 8, md: 12 } }}>
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Typography
          sx={{
            color: LIME,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 2.5,
            mb: 2,
          }}
        >
          HOW IT WORKS
        </Typography>
        <Typography
          component="h2"
          sx={{
            color: "#fff",
            fontWeight: 900,
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
            maxWidth: 700,
            mb: { xs: 5, md: 7 },
          }}
        >
          From first call to{" "}
          <Box component="span" sx={{ color: LIME }}>
            final delivery.
          </Box>
        </Typography>
      </motion.div>

      {/* timeline */}
      <Box
        ref={trackRef}
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.16 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: "-100px" }}
        sx={{ position: "relative", pl: { xs: 0, sm: 1 } }}
      >
        {/* vertical track (behind) */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 24,
            bottom: 24,
            left: 27,
            width: 2,
            bgcolor: "rgba(255,255,255,0.1)",
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
            }}
          />
        </Box>

        {STEPS.map((s, i) => (
          <Box
            key={s.t}
            component={motion.div}
            variants={{
              hidden: { opacity: 0, x: 24 },
              show: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.55, ease: EASE },
              },
            }}
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              gap: { xs: 2.5, md: 3.5 },
              pb: i === STEPS.length - 1 ? 0 : { xs: 4.5, md: 5.5 },
            }}
          >
            {/* number badge */}
            <Box
              className="hiw-badge"
              sx={{
                flexShrink: 0,
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: "#0e0e0e",
                border: `1px solid ${LIME}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: LIME,
                fontWeight: 900,
                fontSize: 20,
                transition:
                  "transform .35s ease, box-shadow .35s ease, background .35s ease",
                "&:hover": {
                  transform: "scale(1.08)",
                  bgcolor: LIME,
                  color: "#080808",
                  boxShadow: "0 12px 30px rgba(200,255,0,0.3)",
                },
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </Box>

            {/* text */}
            <Box sx={{ pt: 0.5 }}>
              <Typography
                component="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: "1.15rem", md: "1.35rem" },
                  mb: 1,
                }}
              >
                {s.t}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: { xs: 14, md: 15 },
                  lineHeight: 1.8,
                  maxWidth: 560,
                }}
              >
                {s.d}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
