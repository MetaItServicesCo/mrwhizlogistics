"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

const LIME = "#c8ff00";

// 👇 Apni image daalein (public/images/ mein). Na ho to gradient+icon dikhega.
const FREIGHT_IMAGE: string | undefined = "/images/cta-img.png";

// ===== OVERLAP knobs (half-in/half-out) — dono barabar rakhein =====
const OVERLAP_MD = 120;
const OVERLAP_XS = 70;

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 220,
    y: -(60 + Math.random() * 130),
    rot: (Math.random() - 0.5) * 560,
    color: ["#c8ff00", "#00e5ff", "#ff4dd8", "#fff"][i % 4],
    delay: Math.random() * 0.1,
  }));
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        left: "18%",
        top: "50%",
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </Box>
  );
}

export default function MailingListCTA() {
  const reduce = useReducedMotion() ?? false;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const subscribe = () => {
    if (!email.includes("@")) return;
    setStatus("loading");
    // TODO: backend banne par yahan real API call lagegi
    setTimeout(() => setStatus("done"), 1200);
  };

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 20,
        bgcolor: "#0a0a0a",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        pt: { xs: 5, md: 7 },
        mb: { xs: `-${OVERLAP_XS}px`, md: `-${OVERLAP_MD}px` },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        sx={{ position: "relative", zIndex: 2, maxWidth: 1120, mx: "auto" }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "22px",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* LEFT — light form panel (compact padding) */}
          <Box
            sx={{
              position: "relative",
              bgcolor: "#f4f6f4",
              color: "#0a1f1a",
              p: { xs: 3, sm: 3.5, md: 4.5 },
              zIndex: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: "relative" }}
                >
                  {!reduce && <Confetti />}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                      delay: 0.1,
                    }}
                    style={{ display: "inline-flex" }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 48, color: "#1c7a3f" }}
                    />
                  </motion.div>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.4rem", md: "1.7rem" },
                      fontWeight: 800,
                      mt: 1.5,
                    }}
                  >
                    You are on the list!
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(10,31,26,0.6)",
                      fontSize: 14,
                      mt: 0.75,
                      maxWidth: 420,
                    }}
                  >
                    Thanks for subscribing — we will keep you posted.
                  </Typography>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Typography
                    component="h2"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.1,
                      fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
                      mb: 1,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Join Our Mailing List
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(10,31,26,0.65)",
                      fontSize: { xs: 13.5, md: 15 },
                      mb: 2.5,
                      maxWidth: 440,
                    }}
                  >
                    Logistics insights and yard-optimization tips, straight to
                    your inbox.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1.2, sm: 0 },
                      maxWidth: 500,
                      borderRadius: { sm: "12px" },
                      overflow: { sm: "hidden" },
                      boxShadow: { sm: "0 6px 20px rgba(0,0,0,0.12)" },
                    }}
                  >
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Type Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") subscribe();
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          bgcolor: "#0e3b34",
                          borderRadius: { xs: "12px", sm: "12px 0 0 12px" },
                          "& fieldset": { borderColor: "transparent" },
                          "&:hover fieldset": { borderColor: "transparent" },
                          "&.Mui-focused fieldset": { borderColor: LIME },
                        },
                        "& .MuiOutlinedInput-input": { py: 1.4 },
                        "& input::placeholder": {
                          color: "rgba(255,255,255,0.55)",
                          opacity: 1,
                        },
                      }}
                    />
                    <Button
                      onClick={subscribe}
                      disableElevation
                      disabled={status === "loading"}
                      endIcon={
                        status === "loading" ? undefined : (
                          <SendRoundedIcon className="ml-arrow" />
                        )
                      }
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: LIME,
                        color: "#0a1f1a",
                        fontWeight: 800,
                        px: 3.5,
                        py: { xs: 1.3, sm: 0 },
                        borderRadius: { xs: "12px", sm: "0 12px 12px 0" },
                        textTransform: "none",
                        fontSize: 14.5,
                        whiteSpace: "nowrap",
                        "&:hover": { bgcolor: "#d4ff33" },
                        "&.Mui-disabled": {
                          bgcolor: LIME,
                          opacity: 0.85,
                          color: "#0a1f1a",
                        },
                        "& .ml-arrow": { transition: "transform .3s ease" },
                        "&:hover .ml-arrow": { transform: "translateX(3px)" },
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
                        "&:hover::after": { left: "130%" },
                      }}
                    >
                      {status === "loading" ? (
                        <CircularProgress size={20} sx={{ color: "#0a1f1a" }} />
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </Box>

                  <Typography
                    sx={{
                      color: "rgba(10,31,26,0.45)",
                      fontSize: 11.5,
                      mt: 1.5,
                    }}
                  >
                    No spam. Unsubscribe anytime.
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* RIGHT — custom image (Ken Burns), compact height */}
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 140, md: 190 },
              overflow: "hidden",
            }}
          >
            {/* base gradient (fallback) */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 60% 30%, rgba(200,255,0,0.2), transparent 55%), linear-gradient(150deg, #24361c, #05070a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!FREIGHT_IMAGE && (
                <Box
                  component={motion.div}
                  animate={reduce ? {} : { x: [-14, 14, -14] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    color: "rgba(200,255,0,0.55)",
                    "& svg": { fontSize: { xs: 72, md: 110 } },
                  }}
                >
                  <LocalShippingRoundedIcon />
                </Box>
              )}
            </Box>

            {/* image layer */}
            {FREIGHT_IMAGE && (
              <Box
                component={motion.div}
                initial={reduce ? {} : { scale: 1.08 }}
                animate={reduce ? {} : { scale: 1.18 }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${FREIGHT_IMAGE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
