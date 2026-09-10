"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import DirectionsRoundedIcon from "@mui/icons-material/DirectionsRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

// 👇 apna address yahan daalein (map + directions dono isi se banenge)
const ADDRESS = "555 N 5th St 109 B, Garland, TX 75040, United States";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

export default function ContactMap() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        pb: { xs: 8, md: 13 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        sx={{
          position: "relative",
          maxWidth: 1200,
          mx: "auto",
          borderRadius: "22px",
          p: "1.5px",
          background: `linear-gradient(140deg, rgba(200,255,0,0.5), rgba(255,255,255,0.05) 45%)`,
          boxShadow: "0 26px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "21px",
            overflow: "hidden",
            bgcolor: "#0d100c",
          }}
        >
          {/* map */}
          <Box
            component="iframe"
            title={`Map showing ${ADDRESS}`}
            src={MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: 300, sm: 380, md: 460 },
              border: 0,
              // dark-mode friendly: thoda dim + inverted feel (optional; hata sakte hain)
              filter: "grayscale(0.3) contrast(1.05) brightness(0.92)",
            }}
          />

          {/* floating address chip (bottom-left) */}
          <Box
            sx={{
              position: "absolute",
              left: { xs: 14, md: 24 },
              bottom: { xs: 14, md: 24 },
              zIndex: 2,
              maxWidth: { xs: "calc(100% - 28px)", md: 380 },
              p: { xs: 2, md: 2.5 },
              borderRadius: "16px",
              bgcolor: "rgba(13,16,12,0.9)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${LIME}33`,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: "12px",
                bgcolor: LIME,
                color: "#0a1f1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& svg": { fontSize: 22 },
              }}
            >
              <LocationOnRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: LIME,
                  mb: 0.4,
                }}
              >
                VISIT US
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.55,
                  mb: 1,
                }}
              >
                {ADDRESS}
              </Typography>
              <Box
                component="a"
                href={DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.7,
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: LIME,
                  textDecoration: "none",
                  "&:hover": { color: "#d4ff33" },
                  "& svg": { fontSize: 16, transition: "transform .3s" },
                  "&:hover svg": { transform: "translateX(3px)" },
                }}
              >
                Get Directions <DirectionsRoundedIcon />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
