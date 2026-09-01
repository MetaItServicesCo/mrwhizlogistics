"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const LIME = "#c8ff00";
// Apne real client logos yahan daalein: src: '/logos/xyz.svg' (public/logos/ mein)
// src na ho to text wordmark render hoga (placeholder).
type Brand = { name: string; src?: string };

const ROW_A: Brand[] = [
  { name: "NordFreight" },
  { name: "CargoLine" },
  { name: "HaulPro" },
  { name: "Vertex Logistics" },
  { name: "IronRoad" },
  { name: "PrimeHaul" },
  { name: "BluePeak" },
  { name: "Summit Freight" },
  { name: "RoadNine" },
  { name: "Titan Cargo" },
];

const ROW_B: Brand[] = [
  { name: "Anchor Supply" },
  { name: "RapidDock" },
  { name: "Northline" },
  { name: "Freightly" },
  { name: "CoreCarry" },
  { name: "Trailblaze" },
  { name: "Metro Cargo" },
  { name: "Apex Transit" },
  { name: "WestPort" },
  { name: "Evercarry" },
];

// ---- ek logo chip ----
function LogoChip({ brand }: { brand: Brand }) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        mx: { xs: 1, md: 1.5 },
        px: { xs: 2.5, md: 4 },
        minWidth: { xs: 128, md: 180 },
        height: { xs: 70, md: 92 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(255,255,255,0.02)",
        color: "rgba(255,255,255,0.55)",
        cursor: "pointer",
        transition: "all .35s ease",
        "& img": {
          maxHeight: "58%",
          maxWidth: "78%",
          objectFit: "contain",
          filter: "grayscale(1) brightness(1.6)",
          opacity: 0.65,
          transition: "all .35s ease",
        },
        "&:hover": {
          color: LIME,
          borderColor: "rgba(200,255,0,0.5)",
          bgcolor: "rgba(200,255,0,0.05)",
          transform: "translateY(-6px)",
          boxShadow: "0 14px 34px rgba(200,255,0,0.14)",
        },
        "&:hover img": { filter: "grayscale(0)", opacity: 1 },
      }}
    >
      {brand.src ? (
        <Box component="img" src={brand.src} alt={brand.name} />
      ) : (
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 14.5, md: 19 },
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
          }}
        >
          {brand.name}
        </Typography>
      )}
    </Box>
  );
}

// ---- ek infinite marquee row (seamless loop) ----
function MarqueeRow({
  brands,
  direction = "left",
  duration = 40,
}: {
  brands: Brand[];
  direction?: "left" | "right";
  duration?: number;
}) {
  const items = [...brands, ...brands]; // duplicate => seamless loop
  return (
    <Box
      sx={{
        display: "flex",
        width: "max-content",
        willChange: "transform",
        animation: `${direction === "left" ? "mqLeft" : "mqRight"} ${duration}s linear infinite`,
        "&:hover": { animationPlayState: "paused" },
        "@keyframes mqLeft": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "@keyframes mqRight": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      {items.map((b, i) => (
        <LogoChip key={`${b.name}-${i}`} brand={b} />
      ))}
    </Box>
  );
}

export default function BrandsSection() {
  return (
    <Box
      component="section"
      aria-labelledby="brands-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, md: 8 },
        overflow: "hidden",
      }}
    >
      {/* lime glow (decorative) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 320,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.09), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* heading */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          px: 3,
          mb: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
            Trusted Partners
          </Typography>
          <Typography
            id="brands-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: { xs: "1.9rem", sm: "2.6rem", md: "3.2rem" },
              maxWidth: 900,
              mx: "auto",
              background: `linear-gradient(90deg, ${LIME}, #00e5ff, #ff4dd8, ${LIME})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "brandShimmer 6s linear infinite",
              "@keyframes brandShimmer": {
                to: { backgroundPosition: "200% center" },
              },
            }}
          >
            Powering the yards behind the brands you know
          </Typography>
        </motion.div>
      </Box>

      {/* marquee rows + edge fade mask */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, md: 3 },
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          padding: { xs: "2px0 0px", md: "20px 0px" },
        }}
      >
        <MarqueeRow brands={ROW_A} direction="left" duration={38} />
        <MarqueeRow brands={ROW_B} direction="right" duration={46} />
      </Box>
    </Box>
  );
}
