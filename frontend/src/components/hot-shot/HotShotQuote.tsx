"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import type { HotShotService } from "@/types/hotShot";
import QuoteModal from "@/components/hot-shot/QuoteModal";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function HotShotQuote({ service }: { service: HotShotService }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* gradient border */}
        <Box
          sx={{
            position: "relative",
            mt: 9,
            borderRadius: "20px",
            p: "1.5px",
            background: `linear-gradient(140deg, rgba(200,255,0,.55), rgba(255,255,255,.05) 45%)`,
            boxShadow: "0 26px 60px rgba(0,0,0,.5)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "19px",
              bgcolor: "#0d100c",
              p: { xs: 3.5, md: 5 },
            }}
          >
            {/* glows */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                width: 320,
                height: 320,
                right: -160,
                top: -160,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(200,255,0,.14), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                width: 220,
                height: 220,
                left: -110,
                bottom: -110,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,229,255,.1), transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: { xs: 3, md: 4 },
              }}
            >
              {/* left copy */}
              <Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    px: 1.4,
                    py: 0.6,
                    borderRadius: "999px",
                    bgcolor: "rgba(200,255,0,.1)",
                    border: `1px solid ${LIME}44`,
                  }}
                >
                  <RequestQuoteRoundedIcon sx={{ color: LIME, fontSize: 16 }} />
                  <Typography
                    sx={{
                      color: LIME,
                      fontSize: 9.5,
                      fontWeight: 900,
                      letterSpacing: 1.6,
                    }}
                  >
                    READY TO MOVE?
                  </Typography>
                </Box>

                <Typography
                  component="h2"
                  sx={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: { xs: 22, md: 30 },
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                    mb: 1,
                  }}
                >
                  Get your{" "}
                  <Box component="span" sx={{ color: LIME }}>
                    {service.title}
                  </Box>{" "}
                  quote.
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,.5)",
                    fontSize: { xs: 13, md: 14.5 },
                    lineHeight: 1.7,
                    maxWidth: 440,
                  }}
                >
                  Tell us what needs to move and where it needs to go. Our
                  dispatch team replies fast, usually within the hour.
                </Typography>
              </Box>

              {/* actions */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  flexShrink: 0,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Button
                  onClick={() => setOpen(true)}
                  endIcon={<ArrowForwardRoundedIcon className="hq-a" />}
                  disableElevation
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: LIME,
                    color: "#080808",
                    fontWeight: 900,
                    borderRadius: "12px",
                    px: 3.5,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: 14.5,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#d4ff33" },
                    "& .hq-a": { transition: "transform .3s ease" },
                    "&:hover .hq-a": { transform: "translateX(4px)" },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-70%",
                      width: "55%",
                      height: "100%",
                      background:
                        "linear-gradient(120deg, transparent, rgba(255,255,255,.6), transparent)",
                      transform: "skewX(-20deg)",
                      transition: "left .6s ease",
                    },
                    "&:hover::after": { left: "130%" },
                  }}
                >
                  Get a Quote
                </Button>

                <Button
                  component="a"
                  href="tel:+18002048820"
                  startIcon={<PhoneInTalkRoundedIcon />}
                  variant="outlined"
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,.25)",
                    fontWeight: 800,
                    borderRadius: "12px",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: LIME,
                      color: LIME,
                      bgcolor: "rgba(200,255,0,.05)",
                    },
                  }}
                >
                  Call
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* service-specific quote modal */}
      <QuoteModal
        open={open}
        onClose={() => setOpen(false)}
        service={service.title}
        lockService
      />
    </>
  );
}
