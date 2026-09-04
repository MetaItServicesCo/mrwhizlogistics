"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";

import type { RentalItem } from "@/data/hotShotRentals";

const LIME = "#c8ff00";

const EASE = [0.22, 1, 0.36, 1] as const;

const AUTO_SLIDE_TIME = 2000;

export default function RentalCard({
  item,
  index,
  onQuote,
  phoneHref = "tel:+1 (469) 767 8853",
}: {
  item: RentalItem;
  index: number;
  onQuote: (title: string) => void;
  phoneHref?: string;
}) {
  const reduce = useReducedMotion() ?? false;

  const flip = index % 2 === 1;

  // ============================================================
  // IMAGES
  // ============================================================

  const images = useMemo(() => {
    if (item.images && item.images.length > 0) {
      return item.images;
    }

    if (item.image) {
      return [item.image];
    }

    return [];
  }, [item.images, item.image]);

  // ============================================================
  // SLIDER STATE
  // ============================================================

  const [activeImage, setActiveImage] = useState(0);

  const [isHoveringMedia, setIsHoveringMedia] = useState(false);

  // ============================================================
  // RESET IMAGE WHEN ITEM CHANGES
  // ============================================================

  useEffect(() => {
    setActiveImage(0);
  }, [item.title]);

  // ============================================================
  // AUTO SLIDER
  // ============================================================

  useEffect(() => {
    if (images.length <= 1) return;

    if (isHoveringMedia) return;

    if (reduce) return;

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, AUTO_SLIDE_TIME);

    return () => {
      window.clearInterval(interval);
    };
  }, [images.length, isHoveringMedia, reduce]);

  // ============================================================
  // NEXT IMAGE
  // ============================================================

  const nextImage = () => {
    if (images.length <= 1) return;

    setActiveImage((current) => (current + 1) % images.length);
  };

  // ============================================================
  // PREVIOUS IMAGE
  // ============================================================

  const previousImage = () => {
    if (images.length <= 1) return;

    setActiveImage((current) => (current - 1 + images.length) % images.length);
  };

  // ============================================================
  // CURSOR SPOTLIGHT
  // ============================================================

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const spotlight = useMotionTemplate`
    radial-gradient(
      300px circle at ${mx}px ${my}px,
      rgba(200,255,0,0.1),
      transparent 70%
    )
  `;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;

    const rect = e.currentTarget.getBoundingClientRect();

    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const onLeave = () => {
    mx.set(-200);
    my.set(-200);
  };

  const num = String(index + 1).padStart(2, "0");

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      component={motion.div}
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: false,
        margin: "-90px",
      }}
      transition={{
        duration: 0.6,
        ease: EASE,
      }}
      sx={{
        position: "relative",
        borderRadius: "22px",
        overflow: "hidden",
        bgcolor: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          md: flip ? "1fr 1.15fr" : "1.15fr 1fr",
        },

        transition: "border-color .4s ease, box-shadow .4s ease",

        "&:hover": {
          borderColor: `${LIME}55`,
          boxShadow: "0 26px 60px rgba(0,0,0,0.55)",
        },

        "&:hover .rc-media-inner": {
          transform: "scale(1.055)",
        },

        "&:hover .rc-corner": {
          opacity: 1,
        },

        "&:hover .rc-spot": {
          opacity: 1,
        },

        "&:hover .rc-bar": {
          transform: "scaleX(1)",
        },

        "&:hover .rc-quote svg": {
          transform: "translateX(3px)",
        },

        "&:hover .rc-slider-arrow": {
          opacity: 1,
          transform: "translateY(-50%)",
        },
      }}
    >
      {/* ========================================================
          MEDIA / IMAGE SLIDER
      ======================================================== */}

      <Box
        onMouseEnter={() => setIsHoveringMedia(true)}
        onMouseLeave={() => setIsHoveringMedia(false)}
        sx={{
          position: "relative",
          minHeight: {
            xs: 260,
            md: 360,
          },
          overflow: "hidden",
          order: {
            xs: 0,
            md: flip ? 1 : 0,
          },
          bgcolor: "#080808",
        }}
      >
        {/* ======================================================
            IMAGES
        ====================================================== */}

        {images.length > 0 ? (
          <AnimateImages
            images={images}
            activeImage={activeImage}
            reduce={reduce}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 25%, rgba(200,255,0,0.2), transparent 55%), linear-gradient(150deg, #26301a, #0a0a0a)",
            }}
          />
        )}

        {/* ======================================================
            DARK OVERLAY
        ====================================================== */}

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background: `
              linear-gradient(
                180deg,
                rgba(0,0,0,0.12) 0%,
                transparent 40%,
                rgba(0,0,0,0.35) 100%
              )
            `,
          }}
        />

        {/* ======================================================
            CORNER HUD
        ====================================================== */}

        <Box
          className="rc-corner"
          component="svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          sx={{
            position: "absolute",
            inset: 14,
            width: "calc(100% - 28px)",
            height: "calc(100% - 28px)",
            zIndex: 5,
            opacity: 0,
            transition: "opacity .4s ease",
            pointerEvents: "none",
          }}
        >
          {[
            "M0,14 L0,0 L14,0",
            "M86,0 L100,0 L100,14",
            "M100,86 L100,100 L86,100",
            "M14,100 L0,100 L0,86",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={LIME}
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          ))}
        </Box>

        {/* ======================================================
            PRICE CHIP
        ====================================================== */}

        {item.priceHint && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 6,
              px: 1.4,
              py: 0.6,
              borderRadius: "999px",
              bgcolor: "rgba(10,10,10,0.72)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${LIME}55`,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: LIME,
                letterSpacing: 0.5,
              }}
            >
              {item.priceHint}
            </Typography>
          </Box>
        )}

        {/* ======================================================
            PREVIOUS BUTTON
        ====================================================== */}

        {images.length > 1 && (
          <IconButton
            className="rc-slider-arrow"
            onClick={previousImage}
            aria-label="Previous image"
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              transform: "translateY(-50%)",

              zIndex: 7,

              width: 42,
              height: 42,

              color: "#fff",

              bgcolor: "rgba(0,0,0,0.55)",

              border: "1px solid rgba(255,255,255,0.16)",

              backdropFilter: "blur(8px)",

              opacity: {
                xs: 1,
                md: 0,
              },

              transition:
                "opacity .3s ease, transform .3s ease, background .3s ease",

              "&:hover": {
                bgcolor: LIME,
                color: "#0a0a0a",
              },
            }}
          >
            <ArrowBackIosNewRoundedIcon
              sx={{
                fontSize: 16,
              }}
            />
          </IconButton>
        )}

        {/* ======================================================
            NEXT BUTTON
        ====================================================== */}

        {images.length > 1 && (
          <IconButton
            className="rc-slider-arrow"
            onClick={nextImage}
            aria-label="Next image"
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              transform: "translateY(-50%)",

              zIndex: 7,

              width: 42,
              height: 42,

              color: "#fff",

              bgcolor: "rgba(0,0,0,0.55)",

              border: "1px solid rgba(255,255,255,0.16)",

              backdropFilter: "blur(8px)",

              opacity: {
                xs: 1,
                md: 0,
              },

              transition:
                "opacity .3s ease, transform .3s ease, background .3s ease",

              "&:hover": {
                bgcolor: LIME,
                color: "#0a0a0a",
              },
            }}
          >
            <ArrowForwardIosRoundedIcon
              sx={{
                fontSize: 16,
              }}
            />
          </IconButton>
        )}

        {/* ======================================================
            SLIDER DOTS
        ====================================================== */}

        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 18,
              transform: "translateX(-50%)",

              zIndex: 8,

              display: "flex",
              alignItems: "center",
              gap: 0.7,

              px: 1,
              py: 0.7,

              borderRadius: "999px",

              bgcolor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                component="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show image ${i + 1}`}
                sx={{
                  width: i === activeImage ? 22 : 7,
                  height: 7,

                  p: 0,
                  border: 0,

                  borderRadius: "999px",

                  cursor: "pointer",

                  bgcolor: i === activeImage ? LIME : "rgba(255,255,255,0.45)",

                  transition: "all .3s ease",

                  "&:hover": {
                    bgcolor: LIME,
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* ======================================================
            IMAGE COUNTER
        ====================================================== */}

        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 6,

              px: 1,
              py: 0.55,

              borderRadius: "8px",

              bgcolor: "rgba(0,0,0,0.58)",

              backdropFilter: "blur(8px)",

              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              {String(activeImage + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </Typography>
          </Box>
        )}

        {/* ======================================================
            DESKTOP EDGE FADE
        ====================================================== */}

        <Box
          aria-hidden
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            position: "absolute",
            inset: 0,

            zIndex: 3,

            pointerEvents: "none",

            background: flip
              ? "linear-gradient(90deg, rgba(15,15,15,0.85), transparent 42%)"
              : "linear-gradient(270deg, rgba(15,15,15,0.85), transparent 42%)",
          }}
        />

        {/* ======================================================
            MOBILE FADE
        ====================================================== */}

        <Box
          aria-hidden
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            position: "absolute",
            inset: 0,

            zIndex: 3,

            pointerEvents: "none",

            background:
              "linear-gradient(180deg, transparent 55%, rgba(15,15,15,0.92) 100%)",
          }}
        />
      </Box>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <Box
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",

          p: {
            xs: 3,
            md: 5,
          },

          display: "flex",
          flexDirection: "column",
          justifyContent: "center",

          order: {
            xs: 1,
            md: flip ? 0 : 1,
          },

          overflow: "hidden",
        }}
      >
        {/* ======================================================
            SPOTLIGHT
        ====================================================== */}

        <Box
          className="rc-spot"
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

        {/* ======================================================
            NUMBER
        ====================================================== */}

        <Typography
          aria-hidden
          sx={{
            position: "absolute",

            top: {
              xs: 10,
              md: 18,
            },

            right: {
              xs: 16,
              md: 24,
            },

            fontSize: {
              xs: 60,
              md: 92,
            },

            fontWeight: 900,
            lineHeight: 1,

            color: "rgba(255,255,255,0.04)",

            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {num}
        </Typography>

        {/* ======================================================
            EYEBROW
        ====================================================== */}

        <Box
          sx={{
            position: "relative",

            display: "flex",
            alignItems: "center",

            gap: 1,

            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 2,
              bgcolor: LIME,
            }}
          />

          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 2,

              color: LIME,

              textTransform: "uppercase",
            }}
          >
            For Rent
          </Typography>
        </Box>

        {/* ======================================================
            TITLE
        ====================================================== */}

        <Typography
          component="h3"
          sx={{
            position: "relative",

            fontWeight: 800,

            fontSize: {
              xs: "1.5rem",
              md: "2rem",
            },

            lineHeight: 1.12,

            color: "#fff",

            mb: 1.5,
          }}
        >
          {item.title}
        </Typography>

        {/* ======================================================
            DESCRIPTION
        ====================================================== */}

        <Typography
          sx={{
            position: "relative",

            color: "rgba(255,255,255,0.6)",

            fontSize: {
              xs: 14,
              md: 15,
            },

            lineHeight: 1.8,

            mb: 2.5,
          }}
        >
          {item.desc}
        </Typography>

        {/* ======================================================
            SPECS
        ====================================================== */}

        {item.specs && item.specs.length > 0 && (
          <Box
            component={motion.div}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
            }}
            sx={{
              position: "relative",

              display: "flex",
              flexWrap: "wrap",

              gap: 1,

              mb: 3.5,
            }}
          >
            {item.specs.map((spec) => (
              <Box
                key={spec}
                component={motion.div}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 8,
                  },

                  show: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",

                  gap: 0.6,

                  px: 1.3,
                  py: 0.6,

                  borderRadius: "10px",

                  bgcolor: "rgba(200,255,0,0.08)",

                  border: `1px solid ${LIME}33`,
                }}
              >
                <CheckRoundedIcon
                  sx={{
                    fontSize: 14,
                    color: LIME,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                  }}
                >
                  {spec}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ======================================================
            BUTTONS
        ====================================================== */}

        <Box
          sx={{
            position: "relative",

            display: "flex",
            gap: 1.5,

            flexWrap: "wrap",
          }}
        >
          {/* QUOTE */}

          <Button
            className="rc-quote"
            onClick={() => onQuote(item.title)}
            endIcon={
              <ArrowForwardRoundedIcon
                sx={{
                  transition: "transform .3s ease",
                }}
              />
            }
            disableElevation
            sx={{
              position: "relative",
              overflow: "hidden",

              bgcolor: LIME,
              color: "#0a0a0a",

              fontWeight: 800,

              borderRadius: "12px",

              px: 3,
              py: 1.2,

              textTransform: "none",

              fontSize: 14.5,

              "&:hover": {
                bgcolor: "#d4ff33",
              },

              "&::after": {
                content: '""',

                position: "absolute",

                top: 0,
                left: "-70%",

                width: "55%",
                height: "100%",

                background:
                  "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",

                transform: "skewX(-20deg)",

                transition: "left .6s ease",
              },

              "&:hover::after": {
                left: "130%",
              },
            }}
          >
            Get a Quote
          </Button>

          {/* CALL */}

          <Button
            component="a"
            href={phoneHref}
            startIcon={<PhoneInTalkRoundedIcon />}
            variant="outlined"
            sx={{
              color: "#fff",

              borderColor: "rgba(255,255,255,0.25)",

              fontWeight: 700,

              borderRadius: "12px",

              px: 3,
              py: 1.2,

              textTransform: "none",

              fontSize: 14.5,

              "&:hover": {
                borderColor: LIME,
                color: LIME,
                bgcolor: "rgba(200,255,0,0.05)",
              },
            }}
          >
            Call Now
          </Button>
        </Box>

        {/* ======================================================
            BOTTOM ACCENT
        ====================================================== */}

        <Box
          className="rc-bar"
          aria-hidden
          sx={{
            position: "absolute",

            left: 0,
            right: 0,
            bottom: 0,

            height: 3,

            background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,

            transform: "scaleX(0)",

            transformOrigin: "left",

            transition: "transform .4s ease",
          }}
        />
      </Box>
    </Box>
  );
}

/* ================================================================
   IMAGE SLIDER COMPONENT
================================================================ */

function AnimateImages({
  images,
  activeImage,
  reduce,
}: {
  images: string[];
  activeImage: number;
  reduce: boolean;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Box
        key={images[activeImage]}
        component={motion.div}
        initial={
          reduce
            ? {
                opacity: 0,
              }
            : {
                opacity: 0,
                x: 35,
                scale: 1.025,
              }
        }
        animate={
          reduce
            ? {
                opacity: 1,
              }
            : {
                opacity: 1,
                x: 0,
                scale: 1,
              }
        }
        exit={
          reduce
            ? {
                opacity: 0,
              }
            : {
                opacity: 0,
                x: -25,
                scale: 1.015,
              }
        }
        transition={{
          duration: 0.65,
          ease: EASE,
        }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,

          backgroundImage: `
            linear-gradient(
              180deg,
              rgba(0,0,0,0.02),
              rgba(0,0,0,0.08)
            ),
            url("${images[activeImage]}")
          `,

          backgroundSize: "cover",

          backgroundPosition: "center",

          backgroundRepeat: "no-repeat",

          transformOrigin: "center",
        }}
        className="rc-media-inner"
      />
    </AnimatePresence>
  );
}
