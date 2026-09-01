"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FireTruckRoundedIcon from "@mui/icons-material/FireTruckRounded";

const LIME = "#c8ff00";

type Tier = {
  n: string;
  label: string;
  title: string;
  items: string[];
  cta: string;
  icon: React.ReactNode;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    n: "HOT SHOT",
    label: "Hot Shot",
    title: "Fast & Flexible",
    items: [
      "Truck & Trailer",
      "Sprinter Van",
      "16' Enclosed",
      "24' Enclosed",
      "40' Flatbed",
      "20' Flatbed",
    ],
    cta: "VIEW OPTIONS",
    icon: <FireTruckRoundedIcon />,
  },
  {
    n: "BOX TRUCK",
    label: "Box Truck",
    title: "Commercial Freight",
    items: ["16' Box Truck", "26' Box Truck"],
    cta: "VIEW OPTIONS",
    icon: <LocalShippingRoundedIcon />,
    featured: true,
  },
  {
    n: "SEMI-TRUCK",
    label: "Semi-Truck",
    title: "Full-Size Freight",
    items: ["Reefer Trailer", "Dry Van", "Flatbed"],
    cta: "VIEW OPTIONS",
    icon: <LocalShippingOutlinedIcon />,
  },
];

function TierCard({ tier }: { tier: Tier }) {
  // 3D tilt
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

  const rotateX = useTransform(sY, [-0.5, 0.5], ["6deg", "-6deg"]);

  const rotateY = useTransform(sX, [-0.5, 0.5], ["-6deg", "6deg"]);

  // Cursor spotlight
  const spotX = useMotionValue(-300);
  const spotY = useMotionValue(-300);

  const spotlight = useMotionTemplate`
    radial-gradient(
      220px circle at ${spotX}px ${spotY}px,
      rgba(200,255,0,0.16),
      transparent 72%
    )
  `;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();

    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);

    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 60,
        },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      style={{
        perspective: 1200,
        height: "100%",
      }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          height: "100%",
        }}
      >
        {/* Gradient border wrapper */}
        <Box
          sx={{
            height: "100%",
            borderRadius: "26px",
            p: "1.5px",

            background: tier.featured
              ? "linear-gradient(160deg, rgba(200,255,0,0.7), rgba(255,255,255,0.05) 45%)"
              : "rgba(255,255,255,0.09)",

            transform: {
              xs: "none",
              md: tier.featured ? "translateY(-30px)" : "none",
            },

            transition: "background .4s ease",

            "&:hover": {
              background: tier.featured
                ? "linear-gradient(160deg, rgba(200,255,0,0.95), rgba(200,255,0,0.15) 55%)"
                : "rgba(200,255,0,0.35)",
            },

            "&:hover .tier-spot": {
              opacity: 1,
            },

            "&:hover .tier-visual": {
              transform: "scale(1.07)",
            },

            "&:hover .tier-arrow": {
              transform: "translateX(4px)",
            },
          }}
        >
          {/* Inner dark card */}
          <Box
            sx={{
              position: "relative",
              height: "100%",
              borderRadius: "25px",
              bgcolor: "#0d0d0d",
              p: {
                xs: 3,
                md: 3.5,
              },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Cursor spotlight */}
            <motion.div
              className="tier-spot"
              style={{
                position: "absolute",
                inset: 0,
                background: spotlight,
                opacity: 0,
                transition: "opacity .3s",
                pointerEvents: "none",
              }}
            />

            {/* Most Popular */}
            {tier.featured && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  bgcolor: LIME,
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  px: 1.2,
                  py: 0.5,
                  borderRadius: "999px",
                }}
              >
                MOST POPULAR
              </Box>
            )}

            {/* Visual Icon Area */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                height: 130,
                borderRadius: "18px",
                overflow: "hidden",
                mb: 2.5,
              }}
            >
              <Box
                className="tier-visual"
                sx={{
                  position: "absolute",
                  inset: 0,

                  transition: "transform .5s ease",

                  background:
                    "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.16), transparent 55%), linear-gradient(150deg, #1c1c1c, #0a0a0a)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  // ICON SIZE UNCHANGED
                  "& svg": {
                    fontSize: 50,
                    color: "rgba(200,255,0,0.85)",
                  },
                }}
              >
                {tier.icon}
              </Box>
            </Box>

            {/* Content */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {/* TRUCK TYPE — INCREASED */}
              <Typography
                sx={{
                  color: LIME,

                  // Increased from 11px
                  fontSize: {
                    xs: 14,
                    md: 15,
                  },

                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  mb: 0.8,
                  lineHeight: 1.2,
                }}
              >
                {tier.label}
              </Typography>

              {/* SUB TITLE — DECREASED */}
              <Typography
                component="h3"
                sx={{
                  // Reduced from 1.3rem / 1.45rem
                  fontSize: {
                    xs: "1rem",
                    md: "1.1rem",
                  },

                  fontWeight: 700,
                  color: "#fff",
                  mb: 2,
                  lineHeight: 1.25,
                }}
              >
                {tier.title}
              </Typography>

              {/* Equipment List */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 3,
                  flex: 1,
                  alignContent: "flex-start",
                }}
              >
                {tier.items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.8,
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s ease",

                      "&:hover": {
                        borderColor: "rgba(200,255,0,0.4)",
                        bgcolor: "rgba(200,255,0,0.06)",
                        color: "#fff",
                      },
                    }}
                  >
                    {item}
                  </Box>
                ))}
              </Box>

              {/* CTA */}
              <Button
                fullWidth
                disableElevation
                endIcon={
                  <ArrowForwardRoundedIcon
                    className="tier-arrow"
                    sx={{
                      transition: "transform .3s",
                    }}
                  />
                }
                variant={tier.featured ? "contained" : "outlined"}
                sx={
                  tier.featured
                    ? {
                        bgcolor: LIME,
                        color: "#000",
                        fontWeight: 700,
                        borderRadius: "999px",
                        py: 1.1,
                        textTransform: "none",

                        "&:hover": {
                          bgcolor: "#d4ff33",
                        },
                      }
                    : {
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.25)",
                        fontWeight: 600,
                        borderRadius: "999px",
                        py: 1.1,
                        textTransform: "none",

                        "&:hover": {
                          borderColor: LIME,
                          color: LIME,
                          bgcolor: "rgba(200,255,0,0.05)",
                        },
                      }
                }
              >
                {tier.cta}
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
}

export default function TiersSection() {
  return (
    <Box
      component="section"
      aria-labelledby="fleet-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: {
          xs: 8,
          md: 10,
        },
        px: {
          xs: 3,
          md: 6,
        },
        overflow: "hidden",
      }}
    >
      {/* Lime glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 360,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Heading */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 820,
          mx: "auto",
          mb: {
            xs: 6,
            md: 10,
          },
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
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
          }}
        >
          <Typography
            sx={{
              color: LIME,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              mb: 1.5,
            }}
          >
            OUR FLEET
          </Typography>

          <Typography
            id="fleet-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              fontSize: {
                xs: "2rem",
                sm: "2.8rem",
                md: "3.6rem",
              },

              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",

              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",

              animation: "tierShimmer 6s linear infinite",

              "@keyframes tierShimmer": {
                to: {
                  backgroundPosition: "200% center",
                },
              },
            }}
          >
            Flexible Equipment. Reliable Delivery.
          </Typography>

          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: {
                xs: 15,
                md: 17,
              },
              maxWidth: 620,
              mx: "auto",
            }}
          >
            Choose the transportation solution that fits your freight, schedule,
            and load requirements.
          </Typography>
        </motion.div>
      </Box>

      {/* Cards Grid */}
      <motion.div
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{
          once: false,
          margin: "-100px",
        }}
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            maxWidth: 1180,
            mx: "auto",
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },

            gap: 3,
            alignItems: "stretch",

            pt: {
              md: 4,
            },
          }}
        >
          {TIERS.map((t) => (
            <TierCard key={t.label} tier={t} />
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}
