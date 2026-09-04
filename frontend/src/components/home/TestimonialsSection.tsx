"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const LIME = "#c8ff00";
const DURATION = 6500;
const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;
const EASE = [0.22, 1, 0.36, 1] as const;

type T = {
  quote: string;
  name: string;
  role: string;
  rating: number;
  initials: string;
  accent: string;
  image?: string;
};

// 👇 Apne ASLI clients ke testimonials daalein. image (optional): "/images/avatar1.jpg"
const TESTIMONIALS: T[] = [
  {
    quote:
      "Mr. Whiz Logistics has made our transportation process much easier. Their team is responsive, professional, and always keeps us updated from pickup through delivery.",
    name: "James Carter",
    role: "Logistics Manager, WestPoint Freight",
    rating: 5,
    initials: "JC",
    accent: "linear-gradient(135deg, #c8ff00, #7fb800)",
  },
  {
    quote:
      "We needed a reliable Hot Shot carrier for an urgent shipment, and Mr. Whiz Logistics delivered exactly what they promised. Great communication and dependable service.",
    name: "Emily Thompson",
    role: "Operations Manager, Summit Supply Co.",
    rating: 5,
    initials: "ET",
    accent: "linear-gradient(135deg, #00e5ff, #0088aa)",
  },
  {
    quote:
      "The driver arrived on time, handled our equipment carefully, and completed the delivery without any issues. Mr. Whiz Logistics is definitely a company we can rely on.",
    name: "Robert Williams",
    role: "Fleet Coordinator, Prime Industrial",
    rating: 5,
    initials: "RW",
    accent: "linear-gradient(135deg, #ff4dd8, #aa2288)",
  },
  {
    quote:
      "From booking to final delivery, the entire experience was smooth and professional. Their flexibility and quick response really stood out when we had a time-sensitive load.",
    name: "Sarah Mitchell",
    role: "Supply Chain Manager, BlueLine Distribution",
    rating: 5,
    initials: "SM",
    accent: "linear-gradient(135deg, #ffb340, #cc7700)",
  },
  {
    quote:
      "We've worked with several transportation providers, but Mr. Whiz Logistics has consistently provided excellent service. They're dependable, communicative, and easy to work with.",
    name: "Daniel Brooks",
    role: "Operations Director, NorthStar Logistics",
    rating: 5,
    initials: "DB",
    accent: "linear-gradient(135deg, #a78bfa, #6d28d9)",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          component={motion.div}
          initial={{ scale: 0, opacity: 0, y: 4 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            delay: 0.2 + i * 0.07,
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          sx={{ display: "flex" }}
        >
          <StarRoundedIcon
            sx={{
              fontSize: { xs: 20, md: 23 },
              color: i < rating ? LIME : "rgba(255,255,255,0.16)",
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

export default function TestimonialsSection() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const dragRef = useRef({ down: false, startX: 0 });
  const N = TESTIMONIALS.length;
  const t = TESTIMONIALS[active];

  const go = (i: number) => setActive((i + N) % N);

  useEffect(() => {
    if (reduce) return;
    if (ringRef.current)
      ringRef.current.style.strokeDashoffset = String(RING_C);
    let raf = 0,
      last = performance.now(),
      acc = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) {
        acc += dt;
        const p = Math.min(acc / DURATION, 1);
        if (ringRef.current)
          ringRef.current.style.strokeDashoffset = String(RING_C * (1 - p));
        if (p >= 1) {
          setActive((a) => (a + 1) % N);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, N]);

  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { down: true, startX: e.clientX };
    pausedRef.current = true;
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.down = false;
    pausedRef.current = false;
    if (dx < -60) go(active + 1);
    else if (dx > 60) go(active - 1);
  };

  return (
    <Box
      component="section"
      aria-labelledby="tst-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 9, md: 14 },
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
          width: 700,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 40,
          left: { xs: 6, md: 60 },
          color: "rgba(200,255,0,0.04)",
          pointerEvents: "none",
          "& svg": { fontSize: { xs: 150, md: 260 } },
        }}
      >
        <FormatQuoteRoundedIcon />
      </Box>

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 820,
          mx: "auto",
          mb: { xs: 6, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
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
            Testimonials
          </Typography>
          <Typography
            id="tst-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3.2rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "tstShimmer 7s linear infinite",
              "@keyframes tstShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            Loved by logistics teams
          </Typography>
        </motion.div>
      </Box>

      {/* spotlight card */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.65, ease: EASE }}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 880,
          mx: "auto",
          borderRadius: "28px",
          p: "1.5px",
          background: `linear-gradient(150deg, rgba(200,255,0,0.45), rgba(255,255,255,0.05) 45%)`,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "27px",
            bgcolor: "#0d100c",
            px: { xs: 3.5, sm: 6, md: 8 },
            py: { xs: 5.5, md: 7 },
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -70,
              right: -50,
              width: 260,
              height: 260,
              background:
                "radial-gradient(circle, rgba(200,255,0,0.13), transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <FormatQuoteRoundedIcon
            sx={{
              color: LIME,
              fontSize: { xs: 38, md: 50 },
              mb: 2,
              transform: "scaleX(-1)",
              opacity: 0.9,
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{
                opacity: 0,
                y: 18,
                filter: reduce ? "none" : "blur(6px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: -14,
                filter: reduce ? "none" : "blur(6px)",
              }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <Typography
                component="blockquote"
                sx={{
                  m: 0,
                  fontSize: { xs: "1.18rem", sm: "1.4rem", md: "1.7rem" },
                  fontWeight: 500,
                  lineHeight: 1.55,
                  letterSpacing: "-0.2px",
                  color: "rgba(255,255,255,0.95)",
                  maxWidth: 700,
                  mx: "auto",
                  mb: 3.5,
                  textWrap: "balance",
                }}
              >
                “{t.quote}”
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Stars rating={t.rating} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 15.5, md: 17 },
                  color: "#fff",
                  letterSpacing: "0.1px",
                }}
              >
                {t.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 12.5, md: 13.5 },
                  color: LIME,
                  mt: 0.5,
                  letterSpacing: "0.2px",
                }}
              >
                {t.role}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* avatar strip + arrows */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          mt: { xs: 4.5, md: 5.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        <IconButton
          onClick={() => go(active - 1)}
          aria-label="Previous"
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            transition: "all .25s",
            "&:hover": { borderColor: LIME, color: LIME },
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {TESTIMONIALS.map((item, i) => {
            const on = i === active;
            return (
              <Box
                key={i}
                component="button"
                onClick={() => go(i)}
                aria-label={`Show testimonial from ${item.name}`}
                sx={{
                  position: "relative",
                  flexShrink: 0,
                  p: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  width: on ? { xs: 58, md: 64 } : { xs: 42, md: 48 },
                  height: on ? { xs: 58, md: 64 } : { xs: 42, md: 48 },
                  transition:
                    "width .4s cubic-bezier(.22,1,.36,1), height .4s cubic-bezier(.22,1,.36,1), opacity .35s ease",
                  opacity: on ? 1 : 0.45,
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {on && !reduce && (
                  <Box
                    component="svg"
                    viewBox="0 0 100 100"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: -5,
                      width: "calc(100% + 10px)",
                      height: "calc(100% + 10px)",
                      transform: "rotate(-90deg)",
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r={RING_R}
                      fill="none"
                      stroke="rgba(255,255,255,0.14)"
                      strokeWidth="3.5"
                    />
                    <circle
                      ref={ringRef}
                      cx="50"
                      cy="50"
                      r={RING_R}
                      fill="none"
                      stroke={LIME}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={RING_C}
                    />
                  </Box>
                )}
                {on && reduce && (
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      border: `2px solid ${LIME}`,
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: on ? 18 : 14,
                    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    transition: "font-size .35s ease",
                    ...(item.image
                      ? {
                          backgroundImage: `url(${item.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: item.accent }),
                  }}
                >
                  {!item.image && item.initials}
                </Box>
              </Box>
            );
          })}
        </Box>

        <IconButton
          onClick={() => go(active + 1)}
          aria-label="Next"
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            transition: "all .25s",
            "&:hover": { borderColor: LIME, color: LIME },
          }}
        >
          <ArrowForwardRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
