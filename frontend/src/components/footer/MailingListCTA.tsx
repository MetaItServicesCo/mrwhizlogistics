"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { subscribe } from "@/lib/publicApi";
import { errorMessage } from "@/lib/useResource";

const LIME = "#c8ff00";

export default function MailingListCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const handleSubscribe = async () => {
    if (submitting.current) return;
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    submitting.current = true;
    setStatus("loading");
    setError(null);
    try {
      await subscribe(normalized);
      setStatus("done");
    } catch (e) {
      setError(errorMessage(e));
      setStatus("idle");
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Box component="section" aria-labelledby="newsletter-heading" sx={{
      bgcolor: "#0a0a0a", color: "#fff",
      // Same gutters and width as the footer, in normal document flow.
      px: { xs: 2.5, sm: 4, md: 5, lg: 8, xl: 10 },
      py: { xs: 5, md: 7 },
    }}>
      <Box sx={{
        maxWidth: 1400, mx: "auto", p: { xs: 3, sm: 4, lg: 5 },
        bgcolor: "#101310", border: "1px solid rgba(200,255,0,0.18)",
        borderRadius: { xs: "20px", md: "28px" },
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" },
        alignItems: "center", gap: { xs: 3, md: 5, lg: 8 },
      }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: LIME, fontSize: 11, fontWeight: 800, letterSpacing: "2px", mb: 1.5 }}>
            NEWSLETTER
          </Typography>
          <Typography id="newsletter-heading" component="h2" sx={{
            fontSize: { xs: 26, sm: 30, lg: 36 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.5px",
          }}>
            Join Our Mailing List
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: { xs: 14, md: 15 }, lineHeight: 1.7, mt: 1.5, maxWidth: 460 }}>
            Logistics insights and yard-optimization tips, straight to your inbox.
          </Typography>
        </Box>

        <Box sx={{ minWidth: 0, minHeight: 130, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {status === "done" ? (
            <Box role="status" sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 2 }}>
              <CheckCircleRoundedIcon sx={{ color: LIME, fontSize: 28, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20 }}>You are on the list!</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, mt: 0.5 }}>
                  Thanks for subscribing. We will keep you posted.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); void handleSubscribe(); }} aria-busy={status === "loading"}>
              <Typography component="label" htmlFor="newsletter-email" sx={{ display: "block", fontSize: 13, fontWeight: 600, mb: 1 }}>
                Email address
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: "stretch" }}>
                <TextField
                  id="newsletter-email"
                  fullWidth type="email" required name="newsletter-email" autoComplete="email"
                  placeholder="you@example.com" value={email} disabled={status === "loading"} error={!!error}
                  slotProps={{ htmlInput: { "aria-describedby": error ? "newsletter-error newsletter-hint" : "newsletter-hint" } }}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  sx={{
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      height: 52, color: "#fff", bgcolor: "#0a0d0b", borderRadius: "12px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&.Mui-focused fieldset": { borderColor: LIME },
                    },
                    "& input::placeholder": { color: "rgba(255,255,255,0.5)", opacity: 1 },
                    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px #0a0d0b inset", WebkitTextFillColor: "#fff", caretColor: "#fff" },
                  }}
                />
                <Button type="submit" disableElevation disabled={status === "loading"}
                  endIcon={status === "loading" ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}
                  sx={{
                    minHeight: 52, minWidth: 150, flexShrink: 0, bgcolor: LIME, color: "#0a0a0a",
                    fontWeight: 800, px: 3, borderRadius: "12px", textTransform: "none", fontSize: 14,
                    "&:hover": { bgcolor: "#d4ff33" },
                    "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 3 },
                    "&.Mui-disabled": { bgcolor: LIME, opacity: 0.7, color: "#0a0a0a" },
                  }}
                >
                  {status === "loading" ? "Subscribing" : "Subscribe"}
                </Button>
              </Box>
              {error && <Typography id="newsletter-error" role="alert" sx={{ color: "#ff9c9c", fontSize: 13, mt: 1.5, overflowWrap: "anywhere" }}>{error}</Typography>}
              <Typography id="newsletter-hint" sx={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.6, mt: 1.5 }}>
                No spam. Unsubscribe anytime.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
