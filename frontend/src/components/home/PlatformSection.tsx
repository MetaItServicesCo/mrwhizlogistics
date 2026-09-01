"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import SensorDoorRoundedIcon from "@mui/icons-material/SensorDoorRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";

const LIME = "#c8ff00";

type Variant = "image" | "dark" | "lime";
type Card = {
  tab: string;
  label: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  variant: Variant;
  image?: string;
};

// image: '/images/xyz.jpg' daalein (public/images/ mein) — hover par yehi reveal hogi.
// const CARDS: Card[] = [
//   {
//     tab: "At the Gate",
//     label: "AT THE GATE",
//     title: "Automate & Expedite Gate Operations",
//     body: "AI computer vision streamlines check-in and check-out — faster flow, better accuracy, and digital compliance instead of paper.",
//     icon: <SensorDoorRoundedIcon />,
//     variant: "image",
//   },
//   {
//     tab: "In the Yard",
//     label: "IN THE YARD",
//     title: "Real-Time Visibility & Workflow Automation",
//     body: "Know where every trailer and asset is at any moment. Automated moves cut deadhead miles and manual yard checks.",
//     icon: <GridViewRoundedIcon />,
//     variant: "dark",
//   },
//   {
//     tab: "At the Dock",
//     label: "AT THE DOCK",
//     title: "Optimize Loading & Dock Efficiency",
//     body: "Sequence arrivals to open doors, reduce detention, and keep the dock at full capacity with predictive scheduling.",
//     icon: <WarehouseRoundedIcon />,
//     variant: "dark",
//   },
//   {
//     tab: "Across Operations",
//     label: "ACROSS OPERATIONS",
//     title: "A Unified, Data-Driven System",
//     body: "One control tower across every site — unified analytics that scale from one yard to a national network.",
//     icon: <HubRoundedIcon />,
//     variant: "lime",
//   },
// ];
const CARDS: Card[] = [
  {
    tab: "At the Gate",
    label: "AT THE GATE",
    title: "Automate & Expedite Gate Operations",
    body: "AI computer vision streamlines check-in and check-out — faster flow, better accuracy, and digital compliance instead of paper.",
    icon: <SensorDoorRoundedIcon />,
    variant: "image",
    image: "/images/6.jpeg",
  },
  {
    tab: "In the Yard",
    label: "IN THE YARD",
    title: "Real-Time Visibility & Workflow Automation",
    body: "Know where every trailer and asset is at any moment. Automated moves cut deadhead miles and manual yard checks.",
    icon: <GridViewRoundedIcon />,
    variant: "dark",
    image: "/images/5.jpeg",
  },
  {
    tab: "At the Dock",
    label: "AT THE DOCK",
    title: "Optimize Loading & Dock Efficiency",
    body: "Sequence arrivals to open doors, reduce detention, and keep the dock at full capacity with predictive scheduling.",
    icon: <WarehouseRoundedIcon />,
    variant: "dark",
    image: "/images/4.jpeg",
  },
  {
    tab: "Across Operations",
    label: "ACROSS OPERATIONS",
    title: "A Unified, Data-Driven System",
    body: "One control tower across every site — unified analytics that scale from one yard to a national network.",
    icon: <HubRoundedIcon />,
    variant: "lime",
    image: "/images/1.png",
  },
];
/* Fallback wireframe truck (jab tak real image na ho) */
function TruckWire() {
  return (
    <Box
      component="svg"
      viewBox="0 0 440 220"
      aria-hidden
      sx={{ width: "86%", opacity: 0.9 }}
    >
      <g fill="none" stroke={LIME} strokeWidth={2.4} strokeLinejoin="round">
        <path d="M24 70 L250 70 L250 160 L24 160 Z" />
        <path d="M258 160 L258 96 L318 96 L346 126 L398 138 L398 160 Z" />
        <path d="M300 104 L340 104 L360 126 L300 126 Z" />
        <circle cx="86" cy="176" r="20" />
        <circle cx="140" cy="176" r="20" />
        <circle cx="356" cy="176" r="20" />
      </g>
    </Box>
  );
}

/* ---------- one card ---------- */
function PlatformCard({
  card,
  setRef,
}: {
  card: Card;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sX = useSpring(mx, { stiffness: 150, damping: 18 });
  const sY = useSpring(my, { stiffness: 150, damping: 18 });
  const rotateX = useTransform(sY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(sX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const spotX = useMotionValue(-200);
  const spotY = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(200px circle at ${spotX}px ${spotY}px, rgba(200,255,0,0.18), transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    spotX.set(-300);
    spotY.set(-300);
  };

  const isLime = card.variant === "lime";
  const textMain = isLime ? "#0a0a0a" : "#fff";
  const textSub = isLime ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)";

  return (
    <Box
      ref={setRef}
      sx={{
        scrollSnapAlign: "start",
        flexShrink: 0,
        minWidth: { xs: "74vw", sm: "46vw", md: 300, lg: 320 },
        perspective: 1300,
      }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <Box
          sx={{
            position: "relative",
            height: { xs: 340, md: 380 },
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            transition:
              "transform .4s ease, box-shadow .4s ease, border-color .4s ease",
            bgcolor: isLime ? LIME : "#0d0d0d",
            "&:hover": {
              transform: "translateY(-6px)",
              borderColor: isLime ? "transparent" : "rgba(200,255,0,0.5)",
              boxShadow: "0 22px 50px rgba(0,0,0,0.5)",
            },
            "&:hover .pc-reveal": { opacity: 1, transform: "scale(1.06)" }, // truck image reveal + zoom
            "&:hover .pc-scrim": { opacity: 1 },
            "&:hover .pc-spot": { opacity: 1 },
            "&:hover .pc-arrow": { transform: "translate(4px,-4px)" },
          }}
        >
          {/* base subtle bg */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: isLime
                ? "none"
                : card.variant === "image"
                  ? "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.10), transparent 55%), linear-gradient(155deg, #20281a, #0a0a0a)"
                  : "radial-gradient(circle at 70% 20%, rgba(0,229,255,0.08), transparent 55%), linear-gradient(155deg, #16181d, #0a0a0a)",
            }}
          />

          {/* watermark icon */}
          {!isLime && (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                zIndex: 0,
                color: "rgba(255,255,255,0.05)",
                "& svg": { fontSize: 130 },
              }}
            >
              {card.icon}
            </Box>
          )}

          {/* HOVER REVEAL: truck image (ya wireframe fallback) */}
          <Box
            className="pc-reveal"
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              opacity: 0,
              transform: "scale(1.14)",
              transition:
                "opacity .5s ease, transform .7s cubic-bezier(.2,.8,.2,1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...(card.image
                ? {
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}),
            }}
          >
            {!card.image && <TruckWire />}
          </Box>

          {/* scrim so text stays readable over revealed image */}
          <Box
            className="pc-scrim"
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              opacity: card.image ? 0 : 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.86) 100%)",
              transition: "opacity .5s ease",
            }}
          />

          {/* cursor spotlight */}
          {!isLime && (
            <motion.div
              className="pc-spot"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background: spotlight,
                opacity: 0,
                transition: "opacity .3s",
                pointerEvents: "none",
              }}
            />
          )}

          {/* content */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                alignSelf: "flex-start",
                mb: 1.5,
                px: 1.2,
                py: 0.4,
                borderRadius: "999px",
                bgcolor: isLime ? "rgba(0,0,0,0.12)" : "rgba(200,255,0,0.12)",
                border: `1px solid ${isLime ? "rgba(0,0,0,0.2)" : "rgba(200,255,0,0.3)"}`,
              }}
            >
              <Box
                sx={{
                  color: isLime ? "#0a0a0a" : LIME,
                  display: "flex",
                  "& svg": { fontSize: 14 },
                }}
              >
                {card.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.3,
                  color: isLime ? "#0a0a0a" : LIME,
                }}
              >
                {card.label}
              </Typography>
            </Box>

            <Typography
              component="h3"
              sx={{
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                fontWeight: 800,
                lineHeight: 1.2,
                color: textMain,
                mb: 1,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              sx={{
                color: textSub,
                fontSize: 13,
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {card.body}
            </Typography>

            <Box
              className="pc-arrow"
              sx={{
                mt: 1.5,
                alignSelf: "flex-start",
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: isLime ? "#0a0a0a" : LIME,
                color: isLime ? LIME : "#0a0a0a",
                transition: "transform .3s",
              }}
            >
              <ArrowOutwardRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

/* ---------- section ---------- */
export default function PlatformSection() {
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const drag = useRef({ down: false, startX: 0, startLeft: 0 });
  const raf = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = scroller.current;
      if (!el) return;
      const sr = el.getBoundingClientRect();
      let best = 0,
        bestD = Infinity;
      cards.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(c.getBoundingClientRect().left - sr.left - 24);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    });
  }, []);

  const goTo = (i: number) => {
    const el = scroller.current,
      c = cards.current[i];
    if (!el || !c) return;
    el.scrollBy({
      left:
        c.getBoundingClientRect().left - el.getBoundingClientRect().left - 24,
      behavior: "smooth",
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scroller.current!;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft };
    el.style.scrollSnapType = "none";
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    scroller.current!.scrollLeft =
      drag.current.startLeft - (e.clientX - drag.current.startX);
  };
  const onPointerUp = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    if (scroller.current) scroller.current.style.scrollSnapType = "";
  };

  return (
    <Box
      component="section"
      aria-labelledby="plat-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, md: 4 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 320,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          px: { xs: 3, md: 6 },
          mb: { xs: 4, md: 6 },
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
            Platform
          </Typography>
          <Typography
            id="plat-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem" },
              maxWidth: 860,
              mx: "auto",
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "platShimmer 6s linear infinite",
              "@keyframes platShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            One Modular Platform. Infinite Possibilities.
          </Typography>
          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 14.5, md: 16 },
              maxWidth: 660,
              mx: "auto",
            }}
          >
            Build your Yard Operating System one application at a time. Start
            with what you need most and expand as you grow.
          </Typography>
        </motion.div>
      </Box>

      {/* tabs + arrows */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 3, md: 6 },
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {CARDS.map((c, i) => (
            <Box
              key={c.tab}
              component="button"
              onClick={() => goTo(i)}
              sx={{
                flexShrink: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                px: 2,
                py: 1,
                borderRadius: "999px",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: 1,
                transition: "all .3s",
                border:
                  active === i
                    ? `1px solid ${LIME}`
                    : "1px solid rgba(255,255,255,0.15)",
                bgcolor: active === i ? LIME : "transparent",
                color: active === i ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                "&:hover": {
                  color: active === i ? "#0a0a0a" : "#fff",
                  borderColor: active === i ? LIME : "rgba(255,255,255,0.4)",
                },
              }}
            >
              {c.label}
            </Box>
          ))}
        </Box>

        <Box
          sx={{ display: { xs: "none", sm: "flex" }, gap: 1, flexShrink: 0 }}
        >
          <IconButton
            onClick={() => goTo(Math.max(0, active - 1))}
            disabled={active === 0}
            sx={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              "&.Mui-disabled": { opacity: 0.3, color: "#fff" },
              "&:hover": { borderColor: LIME, color: LIME },
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton
            onClick={() => goTo(Math.min(CARDS.length - 1, active + 1))}
            disabled={active === CARDS.length - 1}
            sx={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              "&.Mui-disabled": { opacity: 0.3, color: "#fff" },
              "&:hover": { borderColor: LIME, color: LIME },
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* scroller */}
      <Box
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          px: { xs: 3, md: 6 },
          pb: 1,
          cursor: "grab",
          userSelect: "none",
          "&:active": { cursor: "grabbing" },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {CARDS.map((c, i) => (
          <PlatformCard
            key={c.tab}
            card={c}
            setRef={(el) => {
              cards.current[i] = el;
            }}
          />
        ))}
        <Box sx={{ flexShrink: 0, width: { xs: 8, md: 24 } }} />
      </Box>

      {/* progress bar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          mx: { xs: 3, md: 6 },
          mt: 3,
          height: 3,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${20 + progress * 80}%`,
            background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
            borderRadius: 2,
            transition: "width .1s linear",
          }}
        />
      </Box>
    </Box>
  );
}
