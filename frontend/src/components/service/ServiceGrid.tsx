"use client";

import { useRouter } from "next/navigation";
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

import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export type ServiceItem = {
  n: string;
  slug: string;
  title: string;
  desc: string;
  points: string[];
  image?: string;
};

const gradients = [
  "radial-gradient(circle at 30% 25%, rgba(200,255,0,0.22), transparent 55%), linear-gradient(150deg, #26301a, #0a0a0a)",
  "radial-gradient(circle at 70% 20%, rgba(0,229,255,0.18), transparent 55%), linear-gradient(150deg, #12202a, #0a0a0a)",
  "radial-gradient(circle at 40% 30%, rgba(255,179,64,0.16), transparent 55%), linear-gradient(150deg, #2a2612, #0a0a0a)",
  "radial-gradient(circle at 65% 25%, rgba(200,255,0,0.18), transparent 55%), linear-gradient(150deg, #1c2a1a, #0a0a0a)",
  "radial-gradient(circle at 35% 20%, rgba(255,77,216,0.14), transparent 55%), linear-gradient(150deg, #2a1626, #0a0a0a)",
  "radial-gradient(circle at 60% 30%, rgba(0,229,255,0.16), transparent 55%), linear-gradient(150deg, #0e2430, #0a0a0a)",
];

function Card({ s, i, href }: { s: ServiceItem; i: number; href: string }) {
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;

  /* =========================================================
     CARD 3D MOTION
  ========================================================= */

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sX = useSpring(mx, {
    stiffness: 150,
    damping: 18,
  });

  const sY = useSpring(my, {
    stiffness: 150,
    damping: 18,
  });

  const rotateX = useTransform(sY, [-0.5, 0.5], ["5deg", "-5deg"]);

  const rotateY = useTransform(sX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const imgX = useTransform(sX, [-0.5, 0.5], ["10px", "-10px"]);

  const imgY = useTransform(sY, [-0.5, 0.5], ["8px", "-8px"]);

  /* =========================================================
     SPOTLIGHT
  ========================================================= */

  const spotX = useMotionValue(-200);
  const spotY = useMotionValue(-200);

  const spotlight = useMotionTemplate`
    radial-gradient(
      240px circle at ${spotX}px ${spotY}px,
      rgba(200,255,0,0.14),
      transparent 72%
    )
  `;

  /* =========================================================
     MOUSE MOVE
  ========================================================= */

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

    spotX.set(-200);
    spotY.set(-200);
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const go = () => {
    router.push(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 44,
        },

        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            ease: EASE,
          },
        },
      }}
      style={{
        perspective: 1200,
        height: "100%",
      }}
    >
      <Box
        role="link"
        tabIndex={0}
        aria-label={`${s.title} — view details`}
        onClick={go}
        onKeyDown={onKey}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        component={motion.div}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        sx={{
          position: "relative",
          height: "100%",
          borderRadius: "22px",
          overflow: "hidden",
          cursor: "pointer",
          bgcolor: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          transition: "border-color .4s ease, box-shadow .4s ease",
          outline: "none",

          "&:hover, &:focus-visible": {
            borderColor: `${LIME}66`,
            boxShadow: "0 26px 60px rgba(0,0,0,0.55)",
          },

          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${LIME}, 0 26px 60px rgba(0,0,0,0.55)`,
          },

          /* IMAGE HOVER */

          "&:hover .sc-media": {
            transform: "scale(1.12)",
          },

          /* SPOTLIGHT */

          "&:hover .sc-spot": {
            opacity: 1,
          },

          /* SHEEN */

          "&:hover .sc-sheen": {
            transform: "translateX(220%)",
          },

          /* IMAGE CHIP */

          "&:hover .sc-chip": {
            transform: "translateY(-4px) rotate(-6deg)",
          },

          /* BOTTOM ARROW */

          "&:hover .sc-arrow": {
            transform: "translate(2px, -2px) rotate(0deg)",
            bgcolor: LIME,
            color: "#0a0a0a",
            borderColor: LIME,
          },
        }}
      >
        {/* =====================================================
            MEDIA
        ===================================================== */}

        <Box
          sx={{
            position: "relative",
            height: {
              xs: 195,
              md: 215,
            },
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              x: imgX,
              y: imgY,
              position: "absolute",
              inset: -14,
            }}
          >
            <Box
              className="sc-media"
              sx={{
                position: "absolute",
                inset: 0,
                transition: "transform .6s cubic-bezier(.2,.8,.2,1)",

                ...(s.image
                  ? {
                      backgroundImage: `url(${s.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {
                      background: gradients[i % gradients.length],
                    }),
              }}
            />
          </motion.div>

          {/* NUMBER CHIP */}

          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 3,
              px: 1.2,
              py: 0.4,
              borderRadius: "8px",
              bgcolor: "rgba(10,10,10,0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 800,
                color: LIME,
              }}
            >
              {s.n}
            </Typography>
          </Box>

          {/* SHEEN */}

          <Box
            className="sc-sheen"
            aria-hidden
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              width: "45%",
              height: "100%",
              background:
                "linear-gradient(120deg, transparent, rgba(255,255,255,0.14), transparent)",
              transform: "translateX(-160%)",
              transition: "transform .8s ease",
              pointerEvents: "none",
            }}
          />

          {/* DARK IMAGE OVERLAY */}

          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(180deg, transparent 48%, rgba(15,15,15,0.96) 100%)",
            }}
          />

          {/* =================================================
              IMAGE ARROW CHIP
          ================================================= */}

          <Box
            className="sc-chip"
            sx={{
              position: "absolute",
              bottom: -20,
              right: 20,
              zIndex: 4,
              width: 48,
              height: 48,
              borderRadius: "13px",
              bgcolor: LIME,
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(200,255,0,0.35)",
              transition: "transform .35s ease",

              "& svg": {
                fontSize: 24,
              },
            }}
          >
            <ArrowOutwardRoundedIcon />
          </Box>
        </Box>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <Box
          sx={{
            position: "relative",
            p: {
              xs: 3,
              md: 3.5,
            },
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* SPOTLIGHT */}

          <Box
            className="sc-spot"
            aria-hidden
            component={motion.div}
            style={{
              background: spotlight,
            }}
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              transition: "opacity .3s ease",
              pointerEvents: "none",
            }}
          />

          {/* TITLE */}

          <Typography
            component="h3"
            sx={{
              position: "relative",
              fontWeight: 800,
              fontSize: {
                xs: "1.3rem",
                md: "1.45rem",
              },
              mb: 1.2,
              color: "#fff",
            }}
          >
            {s.title}
          </Typography>

          {/* DESCRIPTION */}

          <Typography
            sx={{
              position: "relative",
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              lineHeight: 1.65,
              mb: 2.5,
            }}
          >
            {s.desc}
          </Typography>

          {/* =================================================
              POINTS
          ================================================= */}

          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              mb: 3,
            }}
          >
            {s.points.map((p) => (
              <Box
                key={p}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    fontSize: 19,
                    color: LIME,
                    flexShrink: 0,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {p}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* =================================================
              FOOTER / EXPLORE SERVICE
          ================================================= */}

          <Box
            sx={{
              position: "relative",
              mt: "auto",
              pt: 2.5,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Explore Service
            </Typography>

            {/* =================================================
                MODERN OUTWARD ARROW
            ================================================= */}

            <Box
              className="sc-arrow"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1px solid ${LIME}55`,
                color: LIME,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .3s ease",

                "& svg": {
                  fontSize: 20,
                },
              }}
            >
              <ArrowOutwardRoundedIcon />
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

/* ============================================================
   SERVICE GRID
============================================================ */

export default function ServiceGrid({
  eyebrow,
  title,
  subtitle,
  items,
  basePath,
  columns = 3,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
  basePath: string;
  columns?: 2 | 3;
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",

        px: {
          xs: 3,
          sm: 4,
          md: 6,
          lg: 8,
        },

        py: {
          xs: 8,
          md: 13,
        },

        overflow: "hidden",
      }}
    >
      {/* ======================================================
          BACKGROUND GLOW
      ====================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 780,
          mx: "auto",
          mb: {
            xs: 5,
            md: 8,
          },
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
            ease: EASE,
          }}
        >
          {/* EYEBROW */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 2,
                bgcolor: LIME,
                opacity: 0.7,
              }}
            />

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
              {eyebrow}
            </Typography>

            <Box
              sx={{
                width: 28,
                height: 2,
                bgcolor: LIME,
                opacity: 0.7,
              }}
            />
          </Box>

          {/* TITLE */}

          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.5px",

              fontSize: {
                xs: "2rem",
                sm: "2.6rem",
                md: "3.2rem",
              },

              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,

              backgroundSize: "200% auto",

              WebkitBackgroundClip: "text",

              backgroundClip: "text",

              color: "transparent",

              WebkitTextFillColor: "transparent",

              animation: "svcShimmer 6s linear infinite",

              "@keyframes svcShimmer": {
                to: {
                  backgroundPosition: "200% center",
                },
              },

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            {title}
          </Typography>

          {/* SUBTITLE */}

          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: {
                xs: 14.5,
                md: 16,
              },
              maxWidth: 620,
              mx: "auto",
            }}
          >
            {subtitle}
          </Typography>
        </motion.div>
      </Box>

      {/* ======================================================
          GRID
      ====================================================== */}

      <Box
        component={motion.div}
        variants={{
          hidden: {},

          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{
          once: false,
          margin: "-100px",
        }}
        sx={{
          position: "relative",
          zIndex: 1,
          mx: "auto",

          maxWidth: columns === 2 ? 840 : 1180,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "1fr 1fr",

            md: columns === 2 ? "1fr 1fr" : "repeat(3,1fr)",
          },

          gap: {
            xs: 3,
            md: 3.5,
          },

          alignItems: "stretch",
        }}
      >
        {items.map((s, i) => (
          <Card key={s.slug} s={s} i={i} href={`${basePath}/${s.slug}`} />
        ))}
      </Box>
    </Box>
  );
}
