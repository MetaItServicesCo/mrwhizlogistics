"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function RentalsIntro() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#0a0a0a",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 5, md: 8 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        sx={{
          maxWidth: 1100,
          mx: "auto",
          textAlign: "center",
          borderRadius: "24px",
          p: { xs: 4, md: 7 },
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: "-1px",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
            color: "#fff",
            mb: 2.5,
            lineHeight: 1.05,
          }}
        >
          Hot Shot Equipment Rentals
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: { xs: 15, md: 18 },
            lineHeight: 1.7,
            maxWidth: 820,
            mx: "auto",
          }}
        >
          Browse our hot shot rental equipment to find the right solution for
          construction, industrial, job-site and specialty hauling. Flatbed,
          gooseneck and enclosed trailers — available on flexible daily, weekly
          and monthly terms.
        </Typography>
      </Box>
    </Box>
  );
}
