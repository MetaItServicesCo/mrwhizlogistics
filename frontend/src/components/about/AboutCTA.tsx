"use client";

import { Box, Typography, Container, Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import Link from "next/link";

const LIME = "#c8ff00";

export default function AboutCTA() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        bgcolor: "#0f0f0f",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            p: { xs: 4, md: 6 },
            bgcolor: "#141414",
            border: `1px solid ${LIME}33`,
            textAlign: "center",
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(200,255,0,0.08), transparent 60%)",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: LIME,
              mb: 1.5,
              textTransform: "uppercase",
            }}
          >
            Ready To Move Your Freight?
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.6rem" },
              color: "#fff",
              mb: 2,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            Experience Stress-Free Logistics With Our Dedicated Fleet
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: { xs: 14, md: 15 },
              maxWidth: 550,
              mx: "auto",
              mb: 4,
            }}
          >
            Get instant quotes or speak directly with our 24/7 dispatch team to
            handle your hot shot or heavy freight today.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              href="/contact"
              endIcon={<ArrowForwardRoundedIcon />}
              disableElevation
              sx={{
                bgcolor: LIME,
                color: "#0a0a0a",
                fontWeight: 800,
                borderRadius: "12px",
                px: 3.5,
                py: 1.5,
                textTransform: "none",
                fontSize: 14,
                "&:hover": { bgcolor: "#d4ff33" },
              }}
            >
              Get a Free Quote
            </Button>
            <Button
              component="a"
              href="tel:+14697678853"
              startIcon={<PhoneInTalkRoundedIcon />}
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.2)",
                fontWeight: 700,
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  borderColor: LIME,
                  color: LIME,
                  bgcolor: "rgba(200,255,0,0.05)",
                },
              }}
            >
              (469) 767-8853
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
