"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const LIME = "#c8ff00";

const FEATURES = [
  {
    n: "01",
    title: "Orchestrate Yard Execution",
    body: "Computer vision automates check-in, location, and validation from gate to dock — up to 50% more throughput and 85% faster gate processing.",
    hud: "ASSET DETECTED",
    bay: 2,
  },
  {
    n: "02",
    title: "Build the System You Need",
    body: "Start with the applications you need most, then expand as your operations grow. Live in 5 days, low IT lift, no third-party devices to support.",
    hud: "SYSTEM ONLINE",
    bay: 4,
  },
  {
    n: "03",
    title: "Eliminate Unnecessary Labor",
    body: "Automated workflows remove manual work at the gate, dispatch and yard checks — and keep the dock running at full efficiency.",
    hud: "LABOR OPTIMIZED",
    bay: 1,
  },
  {
    n: "04",
    title: "Fast Payback",
    body: "All-inclusive and priced as a service. Measurable payback in months — without a heavy capital project.",
    hud: "PAYBACK IN MONTHS",
    bay: 3,
  },
];

const BAYS = [8, 9, 10, 11, 12, 13];
const cx = (i: number) => 66 + i * 74;
const DOTS = [
  { x: 40, y: 70 },
  { x: 120, y: 130 },
  { x: 210, y: 60 },
  { x: 300, y: 110 },
  { x: 380, y: 80 },
  { x: 450, y: 150 },
  { x: 70, y: 300 },
  { x: 160, y: 360 },
  { x: 260, y: 320 },
  { x: 350, y: 380 },
  { x: 440, y: 330 },
  { x: 100, y: 470 },
  { x: 230, y: 500 },
  { x: 330, y: 470 },
  { x: 420, y: 520 },
  { x: 180, y: 250 },
];

/* ---------- Right: sticky animated yard scene ---------- */
function YardVisual({ active }: { active: number }) {
  const f = FEATURES[active];
  const dx = cx(f.bay) - cx(0);
  const bTop = 205,
    bBot = 425,
    hw = 26;

  return (
    <Box
      sx={{
        order: { xs: -1, md: 2 },
        position: "sticky",
        top: { xs: 64, md: 50 },
        zIndex: 2,
        height: { xs: "42vh", sm: "48vh", md: "100dvh" },
        display: "flex",
        alignItems: "center",
        bgcolor: { xs: "#0a0a0a", md: "transparent" },
        mb: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "100%", md: "82vh" },
          borderRadius: { xs: "16px", md: "20px" },
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          bgcolor: "#05070a",
        }}
      >
        {/* glow */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "-15%",
            right: "-15%",
            width: 360,
            height: 360,
            background:
              "radial-gradient(circle, rgba(200,255,0,0.14), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* HUD chip */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 14, md: 20 },
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 3,
            px: 2,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(10,14,8,0.8)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${LIME}55`,
                maxWidth: "90%",
              }}
            >
              <Typography
                sx={{
                  color: LIME,
                  fontSize: { xs: 10.5, md: 13 },
                  fontWeight: 700,
                  letterSpacing: { xs: 1.5, md: 3 },
                  whiteSpace: "nowrap",
                }}
              >
                {f.hud}
              </Typography>
              <CheckRoundedIcon sx={{ color: LIME, fontSize: 16 }} />
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Scene */}
        <Box
          component="svg"
          viewBox="0 0 500 600"
          preserveAspectRatio="xMidYMid slice"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* perspective floor lines */}
          {[450, 480, 512, 548, 588].map((y, i) => (
            <line
              key={y}
              x1={40 - i * 6}
              y1={y}
              x2={460 + i * 6}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {[80, 170, 260, 350, 420].map((x) => (
            <line
              key={x}
              x1={x}
              y1={445}
              x2={250 + (x - 250) * 2.4}
              y2={595}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* twinkling particles */}
          {DOTS.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={1.6}
              fill={LIME}
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                delay: (i % 6) * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* bays */}
          {BAYS.map((num, i) => {
            const on = i === f.bay;
            const x = cx(i);
            return (
              <g key={num}>
                <text
                  x={x}
                  y={185}
                  textAnchor="middle"
                  fontSize={22}
                  fontWeight="700"
                  fill={on ? LIME : "rgba(255,255,255,0.28)"}
                  style={{ transition: "fill .35s" }}
                >
                  {num}
                </text>
                <rect
                  x={x - hw}
                  y={bTop}
                  width={hw * 2}
                  height={bBot - bTop}
                  rx={4}
                  fill={on ? "rgba(200,255,0,0.06)" : "none"}
                  stroke={on ? LIME : "rgba(255,255,255,0.16)"}
                  strokeWidth={on ? 2 : 1.5}
                  style={{ transition: "stroke .35s, fill .35s" }}
                />
                <line
                  x1={x - hw}
                  y1={bTop + 70}
                  x2={x + hw}
                  y2={bTop + 70}
                  stroke={on ? `${LIME}88` : "rgba(255,255,255,0.12)"}
                  strokeWidth={1}
                />
                <line
                  x1={x - hw}
                  y1={bTop + 150}
                  x2={x + hw}
                  y2={bTop + 150}
                  stroke={on ? `${LIME}88` : "rgba(255,255,255,0.12)"}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* detection bracket → active bay */}
          <motion.g
            animate={{ x: dx }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            {(() => {
              const L = cx(0) - hw - 10,
                R = cx(0) + hw + 10,
                T = bTop - 12,
                B = bBot + 12,
                s = 18;
              const seg = [
                `M${L},${T + s} L${L},${T} L${L + s},${T}`,
                `M${R - s},${T} L${R},${T} L${R},${T + s}`,
                `M${R},${B - s} L${R},${B} L${R - s},${B}`,
                `M${L + s},${B} L${L},${B} L${L},${B - s}`,
              ];
              return seg.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={LIME}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ));
            })()}
          </motion.g>

          {/* scan line */}
          <motion.g
            animate={{ y: [70, 560, 70] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect
              x={30}
              y={-30}
              width={440}
              height={30}
              fill="url(#scanGrad)"
              opacity={0.5}
            />
            <line
              x1={30}
              y1={0}
              x2={470}
              y2={0}
              stroke={LIME}
              strokeWidth={1.5}
              opacity={0.8}
            />
          </motion.g>

          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LIME} stopOpacity={0} />
              <stop offset="100%" stopColor={LIME} stopOpacity={0.35} />
            </linearGradient>
          </defs>
        </Box>

        {/* bottom-left label */}
        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            left: 16,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 3,
          }}
        >
          <Box
            component={motion.span}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: LIME }}
          />
          <Typography
            sx={{
              fontSize: 10,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            YARD OS · LIVE
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------- Left: one scrolling feature ---------- */
function FeatureBlock({
  f,
  index,
  onActivate,
  active,
}: {
  f: (typeof FEATURES)[number];
  index: number;
  onActivate: (i: number) => void;
  active: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActivate(index);
  }, [inView, index, onActivate]);
  const on = active === index;

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: { xs: "auto", md: "64vh" },
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 0 },
      }}
    >
      <motion.div
        animate={{ opacity: on ? 1 : 0.3 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%" }}
      >
        <Box sx={{ display: "flex", gap: { xs: 2, md: 2.5 } }}>
          {/* accent bar */}
          <Box
            sx={{
              position: "relative",
              width: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              flexShrink: 0,
              alignSelf: "stretch",
            }}
          >
            <Box
              component={motion.div}
              animate={{ scaleY: on ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: LIME,
                borderRadius: 2,
                transformOrigin: "top",
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                mb: 1,
                color: on ? LIME : "rgba(255,255,255,0.4)",
                transition: "color .4s",
              }}
            >
              {f.n}
            </Typography>

            <Typography
              component="h3"
              sx={{
                fontWeight: 800,
                lineHeight: 1.15,
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2.1rem" },
                ...(on
                  ? {
                      background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      animation: "yosShimmer 5s linear infinite",
                      "@keyframes yosShimmer": {
                        to: { backgroundPosition: "200% center" },
                      },
                    }
                  : { color: "#fff" }),
              }}
            >
              {f.title}
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.62)",
                fontSize: { xs: 14.5, md: 16.5 },
                lineHeight: 1.75,
                maxWidth: 460,
              }}
            >
              {f.body}
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

export default function YardOSSection() {
  const [active, setActive] = useState(0);

  return (
    <Box
      component="section"
      aria-labelledby="yos-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 6 },
      }}
    >
      {/* header */}
      <Box
        sx={{
          textAlign: "center",
          maxWidth: 820,
          mx: "auto",
          mb: { xs: 4, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
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
            Why Terminal
          </Typography>
          <Typography
            id="yos-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: { xs: "1.9rem", sm: "2.4rem", md: "3.2rem" },
            }}
          >
            Introducing the Terminal Yard Operating System
          </Typography>
          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 14.5, md: 16 },
              maxWidth: 640,
              mx: "auto",
            }}
          >
            The Terminal Yard Operating System uses computer vision and
            autonomous decision intelligence to turn chaotic, manually run yards
            into self-aware logistics environments.
          </Typography>
        </motion.div>
      </Box>

      {/* two-column scrollytelling */}
      <Box
        sx={{
          position: "relative",
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          columnGap: { md: 5, lg: 8 },
          alignItems: "start",
        }}
      >
        {/* LEFT — scrolls */}
        <Box sx={{ order: { xs: 0, md: 1 }, zIndex: 1 }}>
          {FEATURES.map((f, i) => (
            <FeatureBlock
              key={f.n}
              f={f}
              index={i}
              active={active}
              onActivate={setActive}
            />
          ))}
        </Box>

        {/* RIGHT — sticky visual */}
        <YardVisual active={active} />
      </Box>
    </Box>
  );
}
