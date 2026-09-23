"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { submitContact } from "@/lib/publicApi";
import { errorMessage } from "@/lib/useResource";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

const SERVICES = [
  "Hot Shot",
  "Box Truck",
  "Semi Truck",
  "Equipment Rental",
  "Other",
];

const INFO = [
  {
    icon: <LocationOnRoundedIcon />,
    label: "Address",
    value: "555 N 5th St 109 B, Garland, TX 75040, United States",
  },
  {
    icon: <PhoneInTalkRoundedIcon />,
    label: "Contact Number",
    value: "+1 (469) 767 8853",
    href: "tel:+14697678853",
  },
  {
    icon: <EmailRoundedIcon />,
    label: "Email Us",
    value: "dispatch@yourcompany.com",
    href: "mailto:dispatch@yourcompany.com",
  },
  {
    icon: <AccessTimeRoundedIcon />,
    label: "Working Hours",
    value: "24/7 Dispatch — Always available",
  },
];

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
    color: "rgba(255,255,255,0.4)",
    opacity: 1,
  },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
} as const;

const menuSx = {
  "& .MuiPaper-root": {
    bgcolor: "#141812",
    color: "#fff",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    mt: 1,
  },
  "& .MuiMenuItem-root": {
    fontSize: 14,
    "&:hover": { bgcolor: "rgba(200,255,0,0.1)", color: LIME },
    "&.Mui-selected": { bgcolor: "rgba(200,255,0,0.18)", color: LIME },
  },
} as const;

export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    company: "",
    message: "",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.includes("@")) return;
    setStatus("loading");
    setError(null);
    try {
      await submitContact({
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone_number: form.phone.trim(),
        service_needed: form.service,
        company_name: form.company.trim(),
        message: form.message.trim(),
      });
      setStatus("done");
    } catch (e) {
      setError(errorMessage(e));
      setStatus("idle");
    }
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 13 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "10%",
          right: "-6%",
          width: 520,
          height: 420,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            md: "0.8fr minmax(0,1fr)",
          },
          gap: { xs: 4, md: 6 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT — contact info */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "22px",
            p: { xs: 3, md: 4 },
            background: "linear-gradient(160deg, #0e2a24, #071410)",
            border: `1px solid ${LIME}22`,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(200,255,0,0.14), transparent 70%)",
            }}
          />

          <Typography
            component="h2"
            sx={{
              position: "relative",
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "1.8rem" },
              mb: 1,
            }}
          >
            Contact Information
          </Typography>
          <Box
            sx={{
              width: 54,
              height: 3,
              bgcolor: LIME,
              borderRadius: 2,
              mb: 3.5,
            }}
          />

          <Box
            component={motion.div}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false }}
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {INFO.map((it) => (
              <Box
                key={it.label}
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0 },
                }}
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 2,
                  borderRadius: "14px",
                  bgcolor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transition: "all .3s",
                  "&:hover": {
                    borderColor: `${LIME}44`,
                    bgcolor: "rgba(200,255,0,0.04)",
                  },
                  "&:hover .ci-icon": { bgcolor: LIME, color: "#0a1f1a" },
                }}
              >
                <Box
                  className="ci-icon"
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "12px",
                    bgcolor: "rgba(200,255,0,0.12)",
                    color: LIME,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .3s",
                    "& svg": { fontSize: 22 },
                  }}
                >
                  {it.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      mb: 0.3,
                    }}
                  >
                    {it.label}
                  </Typography>
                  {it.href ? (
                    <Box
                      component="a"
                      href={it.href}
                      sx={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        lineHeight: 1.6,
                        "&:hover": { color: LIME },
                      }}
                    >
                      {it.value}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                      }}
                    >
                      {it.value}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* RIGHT — form */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          sx={{ minWidth: 0 }}
        >
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.9rem", md: "2.4rem" },
              mb: 1,
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "cShimmer 6s linear infinite",
              "@keyframes cShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            Get a Quote
          </Typography>
          <Box
            sx={{
              width: 54,
              height: 3,
              bgcolor: LIME,
              borderRadius: 2,
              mb: 3.5,
            }}
          />

          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    borderRadius: "18px",
                    bgcolor: "#101010",
                    border: `1px solid ${LIME}33`,
                  }}
                >
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
                    sx={{ fontSize: "1.5rem", fontWeight: 800, mt: 2 }}
                  >
                    Message sent!
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 14.5,
                      mt: 1,
                    }}
                  >
                    Thanks {form.name ? form.name.split(" ")[0] : ""} — our team
                    will reply the same day.
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Your Name"
                    required
                    value={form.name}
                    onChange={set("name")}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    required
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={form.phone}
                    onChange={set("phone")}
                    sx={fieldSx}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Service Needed"
                    value={form.service}
                    onChange={set("service")}
                    sx={fieldSx}
                    slotProps={{ select: { MenuProps: { sx: menuSx } } }}
                  >
                    {SERVICES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ gridColumn: { sm: "span 2" } }}>
                    <TextField
                      fullWidth
                      label="Company Name (optional)"
                      value={form.company}
                      onChange={set("company")}
                      sx={fieldSx}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { sm: "span 2" } }}>
                    <TextField
                      fullWidth
                      label="Tell us about your shipment"
                      multiline
                      minRows={4}
                      value={form.message}
                      onChange={set("message")}
                      sx={fieldSx}
                    />
                  </Box>
                </Box>

                {error && (
                  <Typography
                    role="alert"
                    sx={{
                      mt: 2.5,
                      px: 2,
                      py: 1.4,
                      fontSize: 13.5,
                      color: "#ff8a80",
                      borderRadius: "12px",
                      bgcolor: "rgba(255,82,82,0.08)",
                      border: "1px solid rgba(255,82,82,0.3)",
                    }}
                  >
                    {error}
                  </Typography>
                )}

                <Button
                  onClick={() => void submit()}
                  disableElevation
                  disabled={status === "loading"}
                  endIcon={
                    status === "loading" ? undefined : (
                      <ArrowOutwardRoundedIcon className="c-arrow" />
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
                    px: 4,
                    py: 1.4,
                    textTransform: "none",
                    fontSize: 15,
                    "&:hover": { bgcolor: "#d4ff33" },
                    "&.Mui-disabled": {
                      bgcolor: LIME,
                      opacity: 0.8,
                      color: "#0a0a0a",
                    },
                    "& .c-arrow": { transition: "transform .3s ease" },
                    "&:hover .c-arrow": { transform: "translate(3px,-3px)" },
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
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
