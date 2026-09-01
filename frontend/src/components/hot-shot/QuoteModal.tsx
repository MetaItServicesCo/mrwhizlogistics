"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const LIME = "#c8ff00";

const SERVICE_OPTIONS = [
  { value: "Hot Shot", label: "Hot Shot" },
  { value: "Box Truck", label: "Box Truck" },
  { value: "Semi Truck", label: "Semi Truck" },
];

function Confetti() {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 260,
    y: -(70 + Math.random() * 150),
    rot: (Math.random() - 0.5) * 600,
    color: ["#c8ff00", "#00e5ff", "#ff4dd8", "#fff"][i % 4],
    delay: Math.random() * 0.1,
  }));
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        left: "50%",
        top: "38%",
        zIndex: 5,
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

const fieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  "& .MuiInputLabel-root.Mui-focused": { color: LIME },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.03)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.14)",
      transition: "border-color .25s, box-shadow .25s",
    },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": {
      borderColor: LIME,
      boxShadow: "0 0 0 3px rgba(200,255,0,0.15)",
    },
  },
  "& input::placeholder, & textarea::placeholder": {
    color: "rgba(255,255,255,0.3)",
    opacity: 1,
  },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
} as const;

export default function QuoteModal({
  open,
  onClose,
  service = "Hot Shot",
  lockService = false,
}: {
  open: boolean;
  onClose: () => void;
  service?: string;
  lockService?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickup: "",
    drop: "",
    selectedService: service,
    details: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, selectedService: service }));
  }, [service, open]);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.name || !form.email.includes("@")) return;
    setStatus("loading");
    // TODO: backend banne par yahan real API call lagegi (form + selectedService bhejein)
    setTimeout(() => setStatus("done"), 1300);
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setForm({
        name: "",
        phone: "",
        email: "",
        pickup: "",
        drop: "",
        selectedService: service,
        details: "",
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          {/* backdrop */}
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* dialog */}
          <Box
            role="dialog"
            aria-modal="true"
            aria-label="Request a quote"
            component={motion.div}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }
            }
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 540,
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: "22px",
              p: "1.5px",
              background: `linear-gradient(150deg, rgba(200,255,0,0.55), rgba(255,255,255,0.06) 45%)`,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: "21px",
                bgcolor: "#0d100c",
                p: { xs: 3, md: 4 },
                overflow: "hidden",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: -70,
                  right: -50,
                  width: 240,
                  height: 240,
                  background:
                    "radial-gradient(circle, rgba(200,255,0,0.14), transparent 65%)",
                  pointerEvents: "none",
                }}
              />

              {/* close */}
              <IconButton
                onClick={close}
                aria-label="Close"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 3,
                  color: "rgba(255,255,255,0.6)",
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>

              <AnimatePresence mode="wait">
                {status === "done" ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      position: "relative",
                      textAlign: "center",
                      padding: "24px 4px",
                    }}
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
                        sx={{ fontSize: 60, color: LIME }}
                      />
                    </motion.div>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        mt: 2,
                        color: "#fff",
                      }}
                    >
                      Quote request sent!
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 14.5,
                        mt: 1,
                        maxWidth: 380,
                        mx: "auto",
                      }}
                    >
                      Thanks {form.name ? form.name.split(" ")[0] : ""} — our
                      dispatch team will call you back shortly, 24/7.
                    </Typography>
                    <Button
                      onClick={close}
                      disableElevation
                      sx={{
                        mt: 3,
                        bgcolor: LIME,
                        color: "#0a0a0a",
                        fontWeight: 800,
                        borderRadius: "12px",
                        px: 4,
                        py: 1.2,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#d4ff33" },
                      }}
                    >
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "relative" }}
                  >
                    {/* header */}
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.8,
                        mb: 2,
                        px: 1.4,
                        py: 0.5,
                        borderRadius: "999px",
                        bgcolor: "rgba(200,255,0,0.12)",
                        border: `1px solid ${LIME}55`,
                      }}
                    >
                      <BoltRoundedIcon sx={{ fontSize: 15, color: LIME }} />
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: 1.3,
                          color: LIME,
                        }}
                      >
                        {form.selectedService.toUpperCase()} QUOTE
                      </Typography>
                    </Box>
                    <Typography
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", md: "1.8rem" },
                        color: "#fff",
                        mb: 0.5,
                      }}
                    >
                      Get a fast quote
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 14,
                        mb: 3,
                      }}
                    >
                      Fill this in and we will call you back with pricing,
                      usually within the hour.
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Full name"
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={set("name")}
                        sx={fieldSx}
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        placeholder="(469) 767 8853"
                        value={form.phone}
                        onChange={set("phone")}
                        sx={fieldSx}
                      />
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <TextField
                          fullWidth
                          label="Email"
                          required
                          type="email"
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={set("email")}
                          sx={fieldSx}
                        />
                      </Box>

                      {/* SERVICE: locked → chip, warna dropdown */}
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        {lockService ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 2,
                              py: 1.5,
                              borderRadius: "12px",
                              bgcolor: "rgba(200,255,0,0.06)",
                              border: `1px solid ${LIME}33`,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  color: "rgba(255,255,255,0.45)",
                                  letterSpacing: 0.5,
                                  mb: 0.3,
                                }}
                              >
                                SERVICE
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "#fff",
                                }}
                              >
                                {form.selectedService}
                              </Typography>
                            </Box>
                            <BoltRoundedIcon
                              sx={{ color: LIME, fontSize: 20 }}
                            />
                          </Box>
                        ) : (
                          <TextField
                            select
                            fullWidth
                            label="Select Service"
                            value={form.selectedService}
                            onChange={set("selectedService")}
                            sx={fieldSx}
                            slotProps={{
                              select: {
                                MenuProps: {
                                  sx: {
                                    zIndex: 3000,
                                    "& .MuiPaper-root": {
                                      bgcolor: "#141812",
                                      color: "#fff",
                                      borderRadius: "12px",
                                      border:
                                        "1px solid rgba(255,255,255,0.14)",
                                      mt: 1,
                                      boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                                    },
                                    "& .MuiMenuItem-root": {
                                      fontSize: 14,
                                      "&:hover": {
                                        bgcolor: "rgba(200,255,0,0.1)",
                                        color: LIME,
                                      },
                                      "&.Mui-selected": {
                                        bgcolor: "rgba(200,255,0,0.18)",
                                        color: LIME,
                                        fontWeight: 700,
                                        "&:hover": {
                                          bgcolor: "rgba(200,255,0,0.22)",
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            {SERVICE_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </Box>

                      <TextField
                        fullWidth
                        label="Pickup location"
                        placeholder="City, State"
                        value={form.pickup}
                        onChange={set("pickup")}
                        sx={fieldSx}
                      />
                      <TextField
                        fullWidth
                        label="Drop-off location"
                        placeholder="City, State"
                        value={form.drop}
                        onChange={set("drop")}
                        sx={fieldSx}
                      />
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <TextField
                          fullWidth
                          label="Load details"
                          placeholder="What are we moving, and by when?"
                          multiline
                          minRows={2}
                          value={form.details}
                          onChange={set("details")}
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      disableElevation
                      onClick={submit}
                      disabled={status === "loading"}
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
                      ) : (
                        "Request Quote"
                      )}
                    </Button>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 12,
                        mt: 1.5,
                        textAlign: "center",
                      }}
                    >
                      No obligation. Free instant quote.
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
