"use client";

import { RENTAL_DEFAULTS, type RentalPageContent } from "@/lib/rentalContent";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function RentalsIntro({ content = RENTAL_DEFAULTS.page.sections.RentalsIntro }: { content?: RentalPageContent["sections"]["RentalsIntro"] }) {
  const { copy } = content;
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "var(--surface)",
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
          bgcolor: "var(--surface)",
          border: "1px solid rgba(var(--fg-rgb), 0.08)",
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: "-1px",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
            color: "var(--fg)",
            mb: 2.5,
            lineHeight: 1.05,
          }}
        >{copy.logisticsEquipmentRental}</Typography>
        <Typography
          sx={{
            color: "rgba(var(--fg-rgb), 0.6)",
            fontSize: { xs: 15, md: 18 },
            lineHeight: 1.7,
            maxWidth: 820,
            mx: "auto",
          }}
        >{copy.browseOurHotShotRental}</Typography>
      </Box>
    </Box>
  );
}
