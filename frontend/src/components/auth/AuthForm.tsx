"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const fieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  "& .MuiInputLabel-root.Mui-focused": { color: LIME },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.03)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.14)",
      transition: "border-color .2s, box-shadow .2s",
    },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": {
      borderColor: LIME,
      boxShadow: "0 0 0 3px rgba(200,255,0,0.15)",
    },
  },
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
} as const;

const BRAND_POINTS = [
  "Track quotes, rentals and shipments in one place",
  "24/7 dispatch and real-time updates",
  "Manage your freight from any device",
];

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const reduce = useReducedMotion() ?? false;
  const router = useRouter();
  const isLogin = mode === "login";

  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.email.includes("@") || form.password.length < 4) return;
    if (!isLogin && (!form.name.trim() || form.password !== form.confirm))
      return;
    setStatus("loading");
    // TODO: API — login: POST /api/auth/login ; register: POST /api/auth/register
    setTimeout(() => {
      setStatus("idle");
      router.push("/dashboard");
    }, 1300);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#070807",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        sx={{
          width: "100%",
          maxWidth: 980,
          borderRadius: "24px",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          bgcolor: "#0d0f0d",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        {/* ===== BRAND PANEL ===== */}
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            p: 5,
            overflow: "hidden",
            background: "linear-gradient(160deg, #14301f, #071410)",
          }}
        >
          {!reduce && (
            <Box
              aria-hidden
              component={motion.div}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              sx={{
                position: "absolute",
                top: "-20%",
                right: "-20%",
                width: 360,
                height: 360,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(200,255,0,0.18), transparent 65%)",
                pointerEvents: "none",
              }}
            />
          )}
          {!reduce &&
            [30, 55, 78].map((top, i) => (
              <Box
                key={top}
                aria-hidden
                component={motion.div}
                animate={{ x: ["-20%", "130%"] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.6,
                }}
                sx={{
                  position: "absolute",
                  top: `${top}%`,
                  left: 0,
                  width: 120,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${LIME}66, transparent)`,
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />
            ))}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              bottom: 20,
              left: 20,
              width: 120,
              height: 120,
              backgroundImage: `radial-gradient(${LIME}44 1.5px, transparent 1.5px)`,
              backgroundSize: "16px 16px",
              opacity: 0.4,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.2,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: LIME,
                  color: "#0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": { fontSize: 24 },
                }}
              >
                <LocalShippingRoundedIcon />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>
                Terminal
              </Typography>
            </Box>

            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1.15,
                color: "#fff",
                mb: 2,
              }}
            >
              {isLogin
                ? "Welcome back to your dispatch hub."
                : "Join the future of freight logistics."}
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              {isLogin
                ? "Sign in to manage your quotes, rentals and shipments."
                : "Create an account to track everything in one place."}
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {BRAND_POINTS.map((p) => (
              <Box
                key={p}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flexShrink: 0,
                    bgcolor: "rgba(200,255,0,0.14)",
                    border: `1px solid ${LIME}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { fontSize: 14, color: LIME },
                  }}
                >
                  <CheckRoundedIcon />
                </Box>
                <Typography
                  sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}
                >
                  {p}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ===== FORM PANEL ===== */}
        <Box
          sx={{
            p: { xs: 3.5, sm: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.6rem", md: "1.9rem" },
              color: "#fff",
              mb: 0.5,
            }}
          >
            {isLogin ? "Sign in" : "Create account"}
          </Typography>
          <Typography
            sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", mb: 3.5 }}
          >
            {isLogin
              ? "Enter your details to access your dashboard."
              : "Fill in your details to get started."}
          </Typography>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="Full name"
                    value={form.name}
                    onChange={set("name")}
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonRoundedIcon sx={{ fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRoundedIcon sx={{ fontSize: 19 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Password — eye toggle */}
                <TextField
                  fullWidth
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon sx={{ fontSize: 19 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPw((v) => !v)}
                            edge="end"
                            aria-label="toggle password visibility"
                            sx={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {showPw ? (
                              <VisibilityOffRoundedIcon sx={{ fontSize: 19 }} />
                            ) : (
                              <VisibilityRoundedIcon sx={{ fontSize: 19 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Confirm password — eye toggle (register only) */}
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="Confirm password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={set("confirm")}
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRoundedIcon sx={{ fontSize: 19 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirm((v) => !v)}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                              sx={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              {showConfirm ? (
                                <VisibilityOffRoundedIcon
                                  sx={{ fontSize: 19 }}
                                />
                              ) : (
                                <VisibilityRoundedIcon sx={{ fontSize: 19 }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              </Box>
            </motion.div>
          </AnimatePresence>

          {isLogin && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Box
                component={Link}
                href="#"
                sx={{
                  fontSize: 12.5,
                  color: LIME,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "#d4ff33" },
                }}
              >
                Forgot password?
              </Box>
            </Box>
          )}

          <Button
            onClick={submit}
            disableElevation
            disabled={status === "loading"}
            endIcon={
              status === "loading" ? undefined : (
                <ArrowForwardRoundedIcon className="au-a" />
              )
            }
            sx={{
              position: "relative",
              overflow: "hidden",
              mt: 3,
              bgcolor: LIME,
              color: "#0a0a0a",
              fontWeight: 800,
              borderRadius: "12px",
              py: 1.4,
              textTransform: "none",
              fontSize: 15,
              "&:hover": { bgcolor: "#d4ff33" },
              "&.Mui-disabled": {
                bgcolor: LIME,
                opacity: 0.8,
                color: "#0a0a0a",
              },
              "& .au-a": { transition: "transform .3s" },
              "&:hover .au-a": { transform: "translateX(3px)" },
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
              <CircularProgress size={22} sx={{ color: "#0a0a0a" }} />
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
            <Box
              sx={{ flex: 1, height: 1, bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Typography
              sx={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 600,
              }}
            >
              OR
            </Typography>
            <Box
              sx={{ flex: 1, height: 1, bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>

          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.18)",
              fontWeight: 600,
              borderRadius: "12px",
              py: 1.2,
              textTransform: "none",
              fontSize: 14,
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255,255,255,0.04)",
              },
            }}
          >
            Continue with Google
          </Button>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: 13.5,
              color: "rgba(255,255,255,0.55)",
              mt: 3,
            }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Box
              component={Link}
              href={isLogin ? "/register" : "/login"}
              sx={{
                color: LIME,
                fontWeight: 700,
                textDecoration: "none",
                "&:hover": { color: "#d4ff33" },
              }}
            >
              {isLogin ? "Create one" : "Sign in"}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
