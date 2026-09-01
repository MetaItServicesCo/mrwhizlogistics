"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

const LIME = "#c8ff00";

const ITEMS = [
  {
    n: "01",
    title: "Personal Service",
    body: "Dedicated support from load planning to final delivery.",
  },
  {
    n: "02",
    title: "Flexible Equipment",
    body: "The right truck and trailer for your specific freight requirements.",
  },
  {
    n: "03",
    title: "Experienced Dispatching",
    body: "We coordinate routes, loads, schedules, and communication efficiently.",
  },
  {
    n: "04",
    title: "Reliable Transportation",
    body: "Professional handling designed to keep your freight moving safely and on schedule.",
  },
  {
    n: "05",
    title: "Complete Support",
    body: "From paperwork and coordination to delivery updates, we handle the details.",
  },
  {
    n: "06",
    title: "Support 24/7",
    body: "Our team is available whenever you need assistance with your shipment.",
  },
];

// ---- Animated checkmark (draws in on scroll) ----
function CheckMark() {
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 64 46"
      sx={{ width: 56, height: 40, mb: 2, display: "block" }}
    >
      <motion.path
        d="M6 24 L24 42 L58 5"
        fill="none"
        stroke={LIME}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
    </Box>
  );
}

// ---- Truck: scroll par draw + left→right move + halka bob ----
function TruckDrawing() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // is wrapper ke viewport se guzarne par progress 0→1
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.4,
  });

  // left (-6%) se right (12%) — truck section ke aar-paar chalta hai
  const x = useTransform(smooth, [0, 1], ["-6%", "12%"]);
  // halka upar-neeche bob
  const y = useTransform(smooth, [0, 0.25, 0.5, 0.75, 1], [0, -6, 0, -6, 0]);
  // road line scroll ke saath fill hoti hai
  const roadLen = useTransform(smooth, [0, 0.6], [0, 1]);

  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: false },
    transition: {
      pathLength: { duration: 1.4, ease: "easeInOut", delay },
      opacity: { duration: 0.2, delay },
    },
  });

  return (
    <Box
      ref={wrapRef}
      sx={{ position: "relative", mt: 4, width: "100%", maxWidth: 460 }}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 440 220"
        sx={{ width: "100%", overflow: "visible" }}
      >
        {/* Road line — scroll ke saath draw hoti hai */}
        <motion.line
          x1={0}
          y1={210}
          x2={440}
          y2={210}
          stroke={LIME}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
          style={{ pathLength: roadLen }}
        />

        {/* Poori truck ek group mein — yeh scroll par move + bob karta hai */}
        <motion.g style={{ x, y }}>
          {/* trailer */}
          <motion.path
            d="M24 64 L268 64 L268 168 L24 168 Z"
            fill="none"
            stroke="#eaeaea"
            strokeWidth={2.5}
            strokeLinejoin="round"
            {...draw(0.15)}
          />
          <motion.path
            d="M244 64 L244 168"
            fill="none"
            stroke="#eaeaea"
            strokeWidth={2.5}
            {...draw(0.7)}
          />
          {/* cab */}
          <motion.path
            d="M276 168 L276 86 L332 86 L360 120 L410 132 L410 168 Z"
            fill="none"
            stroke="#eaeaea"
            strokeWidth={2.5}
            strokeLinejoin="round"
            {...draw(0.5)}
          />
          <motion.path
            d="M302 96 L328 96 L346 118 L302 118 Z"
            fill="none"
            stroke="#eaeaea"
            strokeWidth={2.5}
            strokeLinejoin="round"
            {...draw(0.9)}
          />
          {/* wheels */}
          <motion.circle
            cx={82}
            cy={184}
            r={22}
            fill="none"
            stroke={LIME}
            strokeWidth={2.5}
            {...draw(1.0)}
          />
          <motion.circle
            cx={142}
            cy={184}
            r={22}
            fill="none"
            stroke={LIME}
            strokeWidth={2.5}
            {...draw(1.15)}
          />
          <motion.circle
            cx={362}
            cy={184}
            r={22}
            fill="none"
            stroke={LIME}
            strokeWidth={2.5}
            {...draw(1.3)}
          />
        </motion.g>
      </Box>
    </Box>
  );
}

// ---- One accordion row (semantic + accessible) ----
function AccordionRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: (typeof ITEMS)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const btnId = `dispatch-btn-${index}`;
  const panelId = `dispatch-panel-${index}`;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 30 },
        show: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      <Box component="h3" sx={{ m: 0 }}>
        <Box
          component="button"
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={btnId}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            py: { xs: 1.8, md: 2.2 },
            px: 0,
            color: "inherit",
            fontFamily: "inherit",
            transition: "opacity .2s",
            "&:hover": { opacity: 0.9 },
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 800,
              minWidth: 34,
              color: open ? LIME : "rgba(255,255,255,0.45)",
              transition: "color .3s",
            }}
          >
            {item.n}
          </Box>
          <Box
            component="span"
            sx={{
              flex: 1,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              fontWeight: 700,
              color: open ? LIME : "#fff",
              transition: "color .3s",
            }}
          >
            {item.title}
          </Box>
          <KeyboardArrowDownRoundedIcon
            sx={{
              color: open ? LIME : "rgba(255,255,255,0.5)",
              transition: "transform .3s, color .3s",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </Box>
      </Box>

      {/* Panel — DOM mein hamesha maujood (SEO crawlable), sirf height animate hoti hai */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <Typography
          sx={{
            pl: "50px",
            pr: 4,
            pb: 2.5,
            color: "rgba(255,255,255,0.6)",
            fontSize: { xs: 14, md: 15 },
            lineHeight: 1.75,
          }}
        >
          {item.body}
        </Typography>
      </motion.div>
    </motion.div>
  );
}

export default function DispatchSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Box
      component="section"
      aria-labelledby="dispatch-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, md: 8 },
        px: { xs: 3, md: 8 },
        overflow: "hidden",
      }}
    >
      {/* dotted grid + lime glow (decorative) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 40%, #000 35%, transparent 80%)",
          maskImage:
            "radial-gradient(circle at 50% 40%, #000 35%, transparent 80%)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-8%",
          left: "6%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.10), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1240,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 5, md: 8 },
          alignItems: "center",
        }}
      >
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <CheckMark />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              id="dispatch-title"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.8rem", md: "2.6rem" },
                lineHeight: 1.15,
              }}
            >
              What Does Our{" "}
              <Box component="span" sx={{ color: LIME }}>
                Trucking Service
              </Box>{" "}
              Include?
            </Typography>
          </Box>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            style={{
              transformOrigin: "0%",
              height: 3,
              background: LIME,
              width: 140,
              marginTop: 14,
              borderRadius: 2,
            }}
          />
          <Typography
            sx={{
              mt: 3,
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 15, md: 16 },
              lineHeight: 1.7,
              maxWidth: 460,
            }}
          >
            From local deliveries to long-haul freight, we provide flexible
            trucking solutions designed to match your load, timeline, and
            budget.
          </Typography>
          <TruckDrawing />
        </motion.div>

        {/* RIGHT — accordion */}
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {ITEMS.map((item, i) => (
            <AccordionRow
              key={item.n}
              item={item}
              index={i}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </Box>
    </Box>
  );
}
