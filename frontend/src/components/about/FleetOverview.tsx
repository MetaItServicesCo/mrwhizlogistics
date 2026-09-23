"use client";

import { Box, Typography, Container, Grid, Button } from "@mui/material";
import { motion } from "motion/react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import Link from "next/link";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const fleets = [
  {
    title: "Hot Shot Trailers",
    subtitle: "Urgent & Heavy Haul",
    desc: "Engineered for time-critical commercial freight, construction equipment, and expedited over-the-road deliveries.",
    specs: {
      capacity: "Up to 20,000 lbs",
      length: "35' – 40' Flatbed",
      transit: "Expedited / Direct",
    },
    image: "/images/hot-shot-truck.jpg",
    tag: "01 // HOT SHOT",
  },
  {
    title: "Box Trucks",
    subtitle: "Secure & Weather-Proof",
    desc: "Optimized for palletized cargo, high-value retail distribution, and urban dock-to-dock routing with liftgates.",
    specs: {
      capacity: "10,000 – 26,000 lbs",
      length: "24' – 26' Box",
      transit: "Regional & Local",
    },
    image: "/images/box-truck.jpg",
    tag: "02 // BOX TRUCK",
  },
  {
    title: "Semi Trucks / Dry Vans",
    subtitle: "Long-Haul Enterprise Freight",
    desc: "Heavy-duty 53-foot dry van capacity built for large-scale, nationwide supply chain logistics and interstate hauling.",
    specs: {
      capacity: "Up to 45,000 lbs",
      length: "53' Swing/Roll-Up",
      transit: "All 50 States",
    },
    image: "/images/semi-truck.jpg",
    tag: "03 // SEMI / DRY VAN",
  },
];

export default function FleetOverview() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: "#0a0a0a",
        color: "#fff",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-end" },
            mb: { xs: 6, md: 8 },
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box sx={{ width: 22, height: 2, bgcolor: LIME }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: LIME,
                  textTransform: "uppercase",
                }}
              >
                Our Fleet
              </Typography>
            </Box>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.75rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Equipped For Every Cargo Type
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/rentals"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              color: LIME,
              fontWeight: 700,
              textTransform: "none",
              fontSize: 14,
              "&:hover": { bgcolor: "transparent", color: "#d4ff33" },
            }}
          >
            View All Equipment & Rentals
          </Button>
        </Box>

        {/* 3-Column Grid Layout */}
        <Grid container spacing={3}>
          {fleets.map((fleet, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={fleet.title}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
                sx={{
                  height: "100%",
                  borderRadius: "22px",
                  overflow: "hidden",
                  bgcolor: "#121212",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color .3s ease, transform .3s ease",
                  "&:hover": {
                    borderColor: `${LIME}55`,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                {/* Truck Image Box */}
                <Box
                  sx={{
                    height: 220,
                    position: "relative",
                    bgcolor: "#1a1a1a",
                    backgroundImage: `linear-gradient(to top, #121212, transparent), url("${fleet.image}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px",
                      bgcolor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: LIME,
                        letterSpacing: 1,
                      }}
                    >
                      {fleet.tag}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box
                  sx={{
                    p: 3.5,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: LIME,
                        textTransform: "uppercase",
                        mb: 0.5,
                      }}
                    >
                      {fleet.subtitle}
                    </Typography>
                    <Typography
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        mb: 1.5,
                        color: "#fff",
                      }}
                    >
                      {fleet.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                        mb: 3,
                      }}
                    >
                      {fleet.desc}
                    </Typography>
                  </Box>

                  {/* Specs footer inside card */}
                  <Box
                    sx={{
                      pt: 2,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ScaleRoundedIcon sx={{ fontSize: 14, color: LIME }} />
                        <Typography
                          sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                        >
                          Capacity
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}
                      >
                        {fleet.specs.capacity}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <StraightenRoundedIcon
                          sx={{ fontSize: 14, color: LIME }}
                        />
                        <Typography
                          sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                        >
                          Type
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}
                      >
                        {fleet.specs.length}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SpeedRoundedIcon sx={{ fontSize: 14, color: LIME }} />
                        <Typography
                          sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                        >
                          Transit
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}
                      >
                        {fleet.specs.transit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
