"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js router import kiya

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
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import type { RentalItem } from "@/data/hotShotRentals";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;
const AUTO_SLIDE_TIME = 4000;

export default function RentalCard({
  item,
  index,
  onQuote,
  phoneHref = "tel:+14697678853",
}: {
  item: RentalItem;
  index: number;
  onQuote: (item: RentalItem) => void;
  phoneHref?: string;
}) {
  const router = useRouter(); // Router initialization
  const reduce = useReducedMotion() ?? false;
  const flip = index % 2 === 1;

  const images = useMemo(() => {
    if (item.images && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    return [];
  }, [item.images, item.image]);

  const [activeImage, setActiveImage] = useState(0);
  const [isHoveringMedia, setIsHoveringMedia] = useState(false);

  useEffect(() => {
    setActiveImage(0);
  }, [item.title]);

  useEffect(() => {
    if (images.length <= 1 || isHoveringMedia || reduce) return;
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, AUTO_SLIDE_TIME);
    return () => window.clearInterval(interval);
  }, [images.length, isHoveringMedia, reduce]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Card click trigger hone se roknay ke liye
    if (images.length <= 1) return;
    setActiveImage((current) => (current + 1) % images.length);
  };

  const previousImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Card click trigger hone se roknay ke liye
    if (images.length <= 1) return;
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  };

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

  // Card click handler jo detail page par le jaye ga
  const handleCardClick = () => {
    router.push(`/rentals/${item.slug}`);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.6, ease: EASE }}
      onClick={handleCardClick} // Poore card par click event add kar diya
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
        cursor: "pointer", // Cursor pointer taake user ko pata chale ke yeh clickable hai
        transition: "border-color .4s ease, box-shadow .4s ease",
        "&:hover": {
          borderColor: `${LIME}55`,
          boxShadow: "0 26px 60px rgba(0,0,0,0.55)",
        },
        "&:hover .rc-media-inner": { transform: "scale(1.055)" },
        "&:hover .rc-slider-arrow": {
          opacity: 1,
          transform: "translateY(-50%)",
        },
      }}
    >
      {/* MEDIA / IMAGE SLIDER SECTION */}
      <Box
        onMouseEnter={() => setIsHoveringMedia(true)}
        onMouseLeave={() => setIsHoveringMedia(false)}
        sx={{
          position: "relative",
          minHeight: { xs: 260, md: 360 },
          overflow: "hidden",
          order: { xs: 0, md: flip ? 1 : 0 },
          bgcolor: "#080808",
        }}
      >
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

        {/* PRICE HINT CHIP (Top Left on Image) */}
        {item.priceHint && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 6,
              px: 1.6,
              py: 0.7,
              borderRadius: "999px",
              bgcolor: "rgba(10,10,10,0.85)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${LIME}66`,
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            }}
          >
            <LocalOfferRoundedIcon sx={{ fontSize: 13, color: LIME }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: LIME,
                letterSpacing: 0.3,
              }}
            >
              {item.priceHint}
            </Typography>
          </Box>
        )}

        {/* SLIDER CONTROLS */}
        {images.length > 1 && (
          <>
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
                opacity: { xs: 1, md: 0 },
                transition: "opacity .3s ease, transform .3s ease",
                "&:hover": { bgcolor: LIME, color: "#0a0a0a" },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>

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
                opacity: { xs: 1, md: 0 },
                transition: "opacity .3s ease, transform .3s ease",
                "&:hover": { bgcolor: LIME, color: "#0a0a0a" },
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </>
        )}
      </Box>

      {/* CONTENT SECTION */}
      <Box
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",
          p: { xs: 3, md: 4.5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          order: { xs: 1, md: flip ? 0 : 1 },
          overflow: "hidden",
        }}
      >
        <Box
          component={motion.div}
          style={{ background: spotlight }}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            transition: "opacity .3s ease",
            pointerEvents: "none",
          }}
        />

        <Typography
          aria-hidden
          sx={{
            position: "absolute",
            top: { xs: 10, md: 18 },
            right: { xs: 16, md: 24 },
            fontSize: { xs: 60, md: 92 },
            fontWeight: 900,
            lineHeight: 1,
            color: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {num}
        </Typography>

        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.2,
          }}
        >
          <Box sx={{ width: 22, height: 2, bgcolor: LIME }} />
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

        <Typography
          component="h3"
          sx={{
            position: "relative",
            fontWeight: 800,
            fontSize: { xs: "1.4rem", md: "1.85rem" },
            lineHeight: 1.15,
            color: "#fff",
            mb: 1.5,
            "&:hover": { color: LIME }, // Title par hover effect taake link jaisa feel aaye
            transition: "color .2s ease",
          }}
        >
          {item.title}
        </Typography>

        <Typography
          sx={{
            position: "relative",
            color: "rgba(255,255,255,0.6)",
            fontSize: { xs: 13.5, md: 14.5 },
            lineHeight: 1.7,
            mb: 2,
          }}
        >
          {item.desc}
        </Typography>

        {/* REFINED TAX & PROCESSING FEE BANNER */}
        {item.pricingIncludes && (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 1.5,
              py: 1,
              mb: 2,
              borderRadius: "10px",
              bgcolor: "rgba(200,255,0,0.04)",
              border: `1px solid ${LIME}25`,
            }}
          >
            <ReceiptLongRoundedIcon sx={{ fontSize: 16, color: LIME }} />
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {item.pricingIncludes}
            </Typography>
          </Box>
        )}

        {/* SPECS */}
        {item.specs && item.specs.length > 0 && (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 3,
            }}
          >
            {item.specs.map((spec) => (
              <Box
                key={spec}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.2,
                  py: 0.5,
                  borderRadius: "8px",
                  bgcolor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 13, color: LIME }} />
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 600,
                  }}
                >
                  {spec}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* BUTTONS */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Card click trigger hone se roknay ke liye
              onQuote(item);
            }}
            endIcon={<ArrowForwardRoundedIcon />}
            disableElevation
            sx={{
              bgcolor: LIME,
              color: "#0a0a0a",
              fontWeight: 800,
              borderRadius: "12px",
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontSize: 14,
              "&:hover": { bgcolor: "#d4ff33" },
            }}
          >
            {item.quoteLabel || "Get a Quote"}
          </Button>

          <Button
            component="a"
            href={phoneHref}
            onClick={(e) => e.stopPropagation()} // Card click trigger hone se roknay ke liye
            startIcon={<PhoneInTalkRoundedIcon />}
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.2)",
              fontWeight: 700,
              borderRadius: "12px",
              px: 2.5,
              py: 1.2,
              textTransform: "none",
              fontSize: 14,
              "&:hover": {
                borderColor: LIME,
                color: LIME,
                bgcolor: "rgba(200,255,0,0.05)",
              },
            }}
          >
            {item.callLabel || "Call Now"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

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
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 35, scale: 1.025 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -25, scale: 1.015 }}
        transition={{ duration: 0.65, ease: EASE }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.08)), url("${images[activeImage]}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="rc-media-inner"
      />
    </AnimatePresence>
  );
}
