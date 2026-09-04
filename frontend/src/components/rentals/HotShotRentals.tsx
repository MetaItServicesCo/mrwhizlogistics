"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RentalCard from "./RentalCard";
import QuoteModal from "@/components/hot-shot/QuoteModal";
import { HOT_SHOT_RENTALS } from "@/data/hotShotRentals";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function HotShotRentals() {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("Hot Shot Rental");

  const openQuote = (title: string) => {
    setService(title);
    setOpen(true);
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 6 },
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
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* title */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 780,
          mx: "auto",
          mb: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
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
              Available for Rent
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.4rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "rentShimmer 6s linear infinite",
              "@keyframes rentShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            Hot Shot rental equipment
          </Typography>
          <Typography
            sx={{
              mt: 2.5,
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 14.5, md: 16 },
              maxWidth: 620,
              mx: "auto",
            }}
          >
            Flexible daily, weekly and monthly rentals — the right trailer for
            every hot shot haul, ready when you are.
          </Typography>
        </motion.div>
      </Box>

      {/* cards (stacked, zig-zag) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 4 },
        }}
      >
        {HOT_SHOT_RENTALS.map((item, i) => (
          <RentalCard
            key={item.slug}
            item={item}
            index={i}
            onQuote={openQuote}
          />
        ))}
      </Box>

      <QuoteModal
        open={open}
        onClose={() => setOpen(false)}
        service={service}
        lockService
      />
    </Box>
  );
}
