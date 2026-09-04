"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AcUnitRoundedIcon from "@mui/icons-material/AcUnitRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import TrainRoundedIcon from "@mui/icons-material/TrainRounded";

const LIME = "#c8ff00";
const DURATION = 5000;

type Case = {
  label: string;
  title: string;
  body: string;
  stat: string;
  ticker: string;
  icon: React.ReactNode;
  image?: string;
};

const CASES: Case[] = [
  {
    label: "Hot Shot",
    title: "Fast, flexible freight transportation",
    body: "Ideal for urgent deliveries, equipment, machinery, construction materials, and commercial loads.",
    stat: "Time-sensitive freight",
    ticker:
      "Expedited delivery · Flexible scheduling · Direct transport · Fast response",
    icon: <LocalShippingRoundedIcon />,
    image: "/images/Hotshot/24-feet-flat-bed/24.png",
  },
  {
    label: "Box Truck",
    title: "Local & regional freight delivery",
    body: "Reliable box truck transportation for local and regional deliveries, commercial goods, equipment, and scheduled freight.",
    stat: "Local & regional freight",
    ticker:
      "Local delivery · Regional routes · Commercial freight · Flexible scheduling",
    icon: <Inventory2RoundedIcon />,
    image:
      "/images/BoxTruck/16-feet-box-truck/half_side_view_box_truck_isolated_on_background.jpg",
  },
  {
    label: "Reefer",
    title: "Temperature-controlled freight",
    body: "Dependable refrigerated transportation for freight that requires consistent temperature control throughout the journey.",
    stat: "Temperature-controlled",
    ticker:
      "Refrigerated freight · Temperature control · Cold-chain transport · Reliable delivery",
    icon: <AcUnitRoundedIcon />,
    image: "/images/Semi-truck/reefer/das.jpeg",
  },
  {
    label: "Dry Van",
    title: "General commercial freight",
    body: "Versatile dry van transportation for general cargo, commercial goods, packaged products, and everyday freight needs.",
    stat: "General commercial freight",
    ticker:
      "General cargo · Commercial goods · Full loads · Secure transportation",
    icon: <LocalShippingRoundedIcon />,
    image: "/images/Semi-truck/dryvan/5.jpeg",
  },
  {
    label: "Flatbed",
    title: "Oversized & open-deck loads",
    body: "Flexible flatbed transportation for oversized equipment, machinery, construction materials, and open-deck freight.",
    stat: "Oversized & open-deck loads",
    ticker:
      "Flatbed hauling · Oversized freight · Equipment transport · Open-deck loads",
    icon: <LocalShippingRoundedIcon />,
    image: "/images/Semi-truck/flatbed/ssjfksd.jpeg",
  },
];

const gradients = [
  "radial-gradient(circle at 30% 25%, rgba(200,255,0,0.18), transparent 55%), linear-gradient(150deg, #26301a, #0a0a0a)",
  "radial-gradient(circle at 70% 20%, rgba(0,229,255,0.14), transparent 55%), linear-gradient(150deg, #12202a, #0a0a0a)",
  "radial-gradient(circle at 40% 30%, rgba(0,229,255,0.16), transparent 55%), linear-gradient(150deg, #0e2430, #0a0a0a)",
  "radial-gradient(circle at 65% 25%, rgba(200,255,0,0.14), transparent 55%), linear-gradient(150deg, #2a2612, #0a0a0a)",
  "radial-gradient(circle at 35% 20%, rgba(255,77,216,0.12), transparent 55%), linear-gradient(150deg, #2a1626, #0a0a0a)",
  "radial-gradient(circle at 60% 30%, rgba(200,255,0,0.14), transparent 55%), linear-gradient(150deg, #1c2a1a, #0a0a0a)",
];

function Corners() {
  const seg = [
    "M2,22 L2,2 L22,2",
    "M78,2 L98,2 L98,22",
    "M98,78 L98,98 L78,98",
    "M22,98 L2,98 L2,78",
  ];

  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      sx={{
        position: "absolute",
        inset: 12,
        width: "calc(100% - 24px)",
        height: "calc(100% - 24px)",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {seg.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={LIME}
          strokeWidth={0.6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{
            duration: 0.5,
            delay: 0.15 + i * 0.08,
            ease: "easeOut",
          }}
        />
      ))}
    </Box>
  );
}

export default function CaseShowSection() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  const pausedRef = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const c = CASES[active];

  const go = (i: number) => {
    setActive((i + CASES.length) % CASES.length);
  };

  // Filmstrip slider state + drag
  const [strip, setStrip] = useState({
    overflow: false,
    atStart: true,
    atEnd: false,
  });

  const dragRef = useRef({
    down: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  });

  const updateStrip = useCallback(() => {
    const s = stripRef.current;

    if (!s) return;

    setStrip({
      overflow: s.scrollWidth > s.clientWidth + 4,
      atStart: s.scrollLeft <= 2,
      atEnd: s.scrollLeft + s.clientWidth >= s.scrollWidth - 2,
    });
  }, []);

  const scrollStrip = (dir: number) => {
    const s = stripRef.current;

    if (s) {
      s.scrollBy({
        left: dir * s.clientWidth * 0.7,
        behavior: "smooth",
      });
    }
  };

  const onStripDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !stripRef.current) return;

    dragRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: stripRef.current.scrollLeft,
      moved: false,
    };
  };

  const onStripMove = (e: React.PointerEvent) => {
    if (!dragRef.current.down || !stripRef.current) return;

    const dx = e.clientX - dragRef.current.startX;

    if (Math.abs(dx) > 4) {
      dragRef.current.moved = true;
    }

    stripRef.current.scrollLeft = dragRef.current.startLeft - dx;
  };

  const endStripDrag = () => {
    dragRef.current.down = false;
  };

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx1 = useSpring(mx, {
    stiffness: 120,
    damping: 20,
  });

  const sy1 = useSpring(my, {
    stiffness: 120,
    damping: 20,
  });

  const imgX = useTransform(sx1, [-0.5, 0.5], [-18, 18]);
  const imgY = useTransform(sy1, [-0.5, 0.5], [-14, 14]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;

    const r = e.currentTarget.getBoundingClientRect();

    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeaveMedia = () => {
    mx.set(0);
    my.set(0);
  };

  // Auto advance + progress
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transform = "scaleX(0)";
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const loop = (now: number) => {
      const dt = now - last;

      last = now;

      if (!pausedRef.current) {
        acc += dt;

        const p = Math.min(acc / DURATION, 1);

        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${p})`;
        }

        if (p >= 1) {
          setActive((a) => (a + 1) % CASES.length);
          return;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Keep active thumbnail in view
  useEffect(() => {
    const t = thumbRefs.current[active];
    const s = stripRef.current;

    if (t && s) {
      s.scrollTo({
        left: t.offsetLeft - s.clientWidth / 2 + t.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [active]);

  // Strip overflow detect
  useEffect(() => {
    updateStrip();

    window.addEventListener("resize", updateStrip);

    return () => {
      window.removeEventListener("resize", updateStrip);
    };
  }, [updateStrip]);

  // Keyboard arrows
  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        go(active + 1);
      }

      if (e.key === "ArrowLeft") {
        go(active - 1);
      }
    };

    el.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
  };

  const arrowBtnSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 4,
    width: 34,
    height: 34,
    bgcolor: "rgba(10,10,10,0.85)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    backdropFilter: "blur(6px)",
    "&:hover": {
      bgcolor: "#000",
      borderColor: LIME,
      color: LIME,
    },
  } as const;

  return (
    <Box
      ref={rootRef}
      tabIndex={-1}
      component="section"
      aria-labelledby="case-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, md: 10, lg: 12 },
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        overflow: "hidden",
        outline: "none",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "8%",
          right: "-6%",
          width: 520,
          height: 380,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}
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
            Freight Solutions
          </Typography>

          <Typography
            id="case-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: {
                xs: "1.8rem",
                sm: "2.6rem",
                md: "3.2rem",
                lg: "3.6rem",
              },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "caseShimmer 6s linear infinite",
              "@keyframes caseShimmer": {
                to: {
                  backgroundPosition: "200% center",
                },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            One Fleet. Multiple Freight Solutions.
          </Typography>

          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: {
                xs: 13.5,
                sm: 14.5,
                md: 16,
              },
              maxWidth: 640,
              mx: "auto",
            }}
          >
            From expedited deliveries to large commercial loads, we have
            equipment built for the job.
          </Typography>
        </motion.div>
      </Box>

      {/* GRID */}
      <Box
        onMouseEnter={pause}
        onMouseLeave={resume}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "280px minmax(0, 1fr)",
            lg: "320px minmax(0, 1fr)",
          },
          gap: {
            xs: 3,
            md: 4,
            lg: 5,
          },
          alignItems: "start",
        }}
      >
        {/* LEFT — SERVICE LIST */}
        <Box
          sx={{
            minWidth: 0,
            bgcolor: "#111111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          <Box
            sx={{
              display: "inline-block",
              bgcolor: "#181818",
              border: "1px solid rgba(255,255,255,0.1)",
              px: 2,
              py: 1,
              borderRadius: "10px",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#fff",
              }}
            >
              SERVICE TYPE
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "row",
                md: "column",
              },
              gap: 1,
              overflowX: {
                xs: "auto",
                md: "visible",
              },
              pb: {
                xs: 1,
                md: 0,
              },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {CASES.map((item, i) => {
              const on = i === active;

              return (
                <Box
                  key={`${item.label}-${i}`}
                  component="button"
                  onClick={() => go(i)}
                  sx={{
                    position: "relative",
                    flexShrink: 0,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    border: "none",
                    background: "none",
                    p: 0,
                    borderRadius: "12px",
                    minWidth: {
                      xs: 150,
                      md: "auto",
                    },
                  }}
                >
                  {on && (
                    <Box
                      component={motion.div}
                      layoutId="caseHighlight"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 34,
                      }}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "12px",
                        bgcolor: "rgba(200,255,0,0.08)",
                        border: `1px solid ${LIME}66`,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      px: 1.5,
                      py: 1.3,
                    }}
                  >
                    <Box
                      sx={{
                        color: on ? LIME : "rgba(255,255,255,0.35)",
                        display: "flex",
                        transition: "color .3s",
                        "& svg": {
                          fontSize: 20,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: 1,
                          color: on ? LIME : "rgba(255,255,255,0.4)",
                          transition: "color .3s",
                        }}
                      >
                        {item.label.toUpperCase()}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: on ? "#fff" : "rgba(255,255,255,0.6)",
                          whiteSpace: {
                            xs: "nowrap",
                            md: "normal",
                          },
                          transition: "color .3s",
                        }}
                      >
                        {item.stat}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* RIGHT — SHOWCASE */}
        <Box sx={{ minWidth: 0 }}>
          {/* MEDIA */}
          <Box
            onMouseMove={onMove}
            onMouseLeave={onLeaveMedia}
            sx={{
              position: "relative",
              height: {
                xs: 280,
                sm: 380,
                md: 440,
                lg: 500,
                xl: 540,
              },
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              bgcolor: "#0d0d0d",
            }}
          >
            <AnimatePresence>
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                }}
              >
                <Box
                  component={motion.div}
                  style={{
                    x: imgX,
                    y: imgY,
                  }}
                  initial={
                    reduce
                      ? {}
                      : {
                          scale: 1.06,
                        }
                  }
                  animate={
                    reduce
                      ? {}
                      : {
                          scale: 1.16,
                        }
                  }
                  transition={{
                    duration: DURATION / 1000 + 1,
                    ease: "linear",
                  }}
                  sx={{
                    position: "absolute",
                    inset: -24,
                    ...(c.image
                      ? {
                          backgroundImage: `url(${c.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          background: gradients[active % gradients.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }),
                  }}
                >
                  {!c.image && (
                    <Box
                      sx={{
                        color: "rgba(255,255,255,0.07)",
                        "& svg": {
                          fontSize: {
                            xs: 110,
                            sm: 150,
                            md: 200,
                            lg: 240,
                          },
                        },
                      }}
                    >
                      {c.icon}
                    </Box>
                  )}
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* DARK OVERLAY */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.9) 100%)",
              }}
            />

            <Corners />

            {/* COUNTER */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 18,
                zIndex: 3,
                px: 1.4,
                py: 0.5,
                borderRadius: "999px",
                bgcolor: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: LIME,
                  }}
                >
                  {String(active + 1).padStart(2, "0")}
                </Box>{" "}
                / {String(CASES.length).padStart(2, "0")}
              </Typography>
            </Box>

            {/* OVERLAY CONTENT */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                p: {
                  xs: 2.5,
                  sm: 3,
                  md: 4,
                  lg: 4.5,
                },
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -16,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* LABEL */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.8,
                      mb: 1.5,
                      px: 1.3,
                      py: 0.4,
                      borderRadius: "999px",
                      bgcolor: "rgba(200,255,0,0.14)",
                      border: `1px solid ${LIME}55`,
                    }}
                  >
                    <Box
                      sx={{
                        color: LIME,
                        display: "flex",
                        "& svg": {
                          fontSize: 15,
                        },
                      }}
                    >
                      {c.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: 1.3,
                        color: LIME,
                      }}
                    >
                      {c.label.toUpperCase()}
                    </Typography>
                  </Box>

                  {/* TITLE */}
                  <Typography
                    component="h3"
                    sx={{
                      fontSize: {
                        xs: "1.3rem",
                        sm: "1.5rem",
                        md: "1.8rem",
                        lg: "2.1rem",
                      },
                      fontWeight: 800,
                      lineHeight: 1.15,
                      mb: 1,
                    }}
                  >
                    {c.title}
                  </Typography>

                  {/* BODY */}
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.72)",
                      fontSize: {
                        xs: 12.5,
                        sm: 13.5,
                        md: 15,
                      },
                      lineHeight: 1.65,
                      maxWidth: 560,
                      mb: 2,
                    }}
                  >
                    {c.body}
                  </Typography>

                  {/* STAT + DETAILS */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        color: LIME,
                        fontWeight: 800,
                        fontSize: {
                          xs: 13,
                          sm: 14,
                          md: 16,
                        },
                      }}
                    >
                      {c.stat}
                    </Typography>

                    {/* DETAILS BUTTON */}
                    <Box
                      component={motion.div}
                      whileHover={
                        reduce
                          ? undefined
                          : {
                              scale: 1.05,
                            }
                      }
                      whileTap={
                        reduce
                          ? undefined
                          : {
                              scale: 0.96,
                            }
                      }
                      sx={{
                        display: "inline-flex",
                      }}
                    >
                      <Button
                        endIcon={
                          <ArrowOutwardRoundedIcon className="det-arrow" />
                        }
                        disableElevation
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          bgcolor: LIME,
                          color: "#000",
                          fontWeight: 700,
                          borderRadius: "999px",
                          px: 2.2,
                          py: 0.8,
                          textTransform: "none",

                          "&:hover": {
                            bgcolor: "#d4ff33",
                          },

                          "& .det-arrow": {
                            transition: "transform .3s ease",
                          },

                          "&:hover .det-arrow": {
                            transform: "translate(3px,-3px)",
                          },

                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-70%",
                            width: "55%",
                            height: "100%",
                            background:
                              "linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent)",
                            transform: "skewX(-20deg)",
                            transition: "left .6s ease",
                            pointerEvents: "none",
                          },

                          "&:hover::after": {
                            left: "130%",
                          },
                        }}
                      >
                        Details
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>

          {/* TICKER LINE */}
          <Box
            sx={{
              mt: 1.5,
              height: 22,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    letterSpacing: 1,
                    color: "rgba(255,255,255,0.45)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.ticker}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* PROGRESS BAR */}
          <Box
            sx={{
              mt: 1,
              height: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              ref={progressRef}
              sx={{
                height: "100%",
                width: "100%",
                transformOrigin: "left",
                transform: "scaleX(0)",
                background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
                borderRadius: 2,
              }}
            />
          </Box>

          {/* THUMBNAIL FILMSTRIP */}
          <Box
            sx={{
              position: "relative",
              mt: 2,
            }}
          >
            {strip.overflow && !strip.atStart && (
              <IconButton
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll thumbnails left"
                sx={{
                  ...arrowBtnSx,
                  left: -8,
                }}
              >
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
            )}

            <Box
              ref={stripRef}
              onScroll={updateStrip}
              onPointerDown={onStripDown}
              onPointerMove={onStripMove}
              onPointerUp={endStripDrag}
              onPointerLeave={endStripDrag}
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                pb: 0.5,
                cursor: "grab",
                userSelect: "none",

                "&:active": {
                  cursor: "grabbing",
                },

                scrollbarWidth: "none",

                "&::-webkit-scrollbar": {
                  display: "none",
                },

                ...(strip.overflow
                  ? {
                      WebkitMaskImage: `linear-gradient(to right, ${
                        strip.atStart ? "#000" : "transparent"
                      }, #000 7%, #000 93%, ${
                        strip.atEnd ? "#000" : "transparent"
                      })`,

                      maskImage: `linear-gradient(to right, ${
                        strip.atStart ? "#000" : "transparent"
                      }, #000 7%, #000 93%, ${
                        strip.atEnd ? "#000" : "transparent"
                      })`,
                    }
                  : {}),
              }}
            >
              {CASES.map((item, i) => {
                const on = i === active;

                return (
                  <Box
                    key={`${item.label}-thumb-${i}`}
                    component="button"
                    ref={(el: HTMLButtonElement | null) => {
                      thumbRefs.current[i] = el;
                    }}
                    onClick={() => {
                      if (dragRef.current.moved) return;

                      go(i);
                    }}
                    sx={{
                      flexShrink: 0,
                      width: {
                        xs: 82,
                        sm: 92,
                        md: 110,
                        lg: 128,
                      },
                      height: {
                        xs: 50,
                        sm: 56,
                        md: 64,
                        lg: 74,
                      },
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      p: 0,
                      position: "relative",

                      border: on
                        ? `2px solid ${LIME}`
                        : "2px solid rgba(255,255,255,0.12)",

                      transition: "border-color .3s, transform .3s",

                      opacity: on ? 1 : 0.55,

                      "&:hover": {
                        opacity: 1,
                        transform: "translateY(-2px)",
                      },

                      ...(item.image
                        ? {
                            backgroundImage: `url(${item.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            background: gradients[i % gradients.length],
                          }),
                    }}
                  >
                    {!item.image && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: on ? LIME : "rgba(255,255,255,0.3)",

                          "& svg": {
                            fontSize: 22,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {strip.overflow && !strip.atEnd && (
              <IconButton
                onClick={() => scrollStrip(1)}
                aria-label="Scroll thumbnails right"
                sx={{
                  ...arrowBtnSx,
                  right: -8,
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* CONTROLS */}
          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* READ MORE */}
            {/* <Button
              variant="outlined"
              sx={{
                position: "relative",
                overflow: "hidden",
                zIndex: 0,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.25)",
                fontWeight: 700,
                borderRadius: "999px",
                px: 3,
                textTransform: "none",
                transition: "color .35s ease, border-color .35s ease",

                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: LIME,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .35s ease",
                  zIndex: -1,
                },

                "&:hover": {
                  color: "#000",
                  borderColor: LIME,
                },

                "&:hover::before": {
                  transform: "scaleX(1)",
                },
              }}
            >
              Read More
            </Button> */}

            {/* ARROWS */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <IconButton
                onClick={() => go(active - 1)}
                aria-label="Previous service"
                sx={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",

                  "&:hover": {
                    borderColor: LIME,
                    color: LIME,
                  },
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>

              <IconButton
                onClick={() => go(active + 1)}
                aria-label="Next service"
                sx={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",

                  "&:hover": {
                    borderColor: LIME,
                    color: LIME,
                  },
                }}
              >
                <ArrowForwardRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
