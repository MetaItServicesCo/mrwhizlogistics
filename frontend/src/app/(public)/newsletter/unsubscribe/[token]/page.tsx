"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { unsubscribeNewsletter } from "@/lib/publicApi";
import { errorMessage } from "@/lib/useResource";

export default function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, setState] = useState<{ loading: boolean; message: string; error: boolean }>({ loading: true, message: "Updating your subscription…", error: false });

  useEffect(() => {
    let active = true;
    unsubscribeNewsletter(token)
      .then((result) => active && setState({ loading: false, message: result.message, error: false }))
      .catch((error) => active && setState({ loading: false, message: errorMessage(error), error: true }));
    return () => { active = false; };
  }, [token]);

  return (
    <Box component="main" sx={{ minHeight: "62vh", bgcolor: "#080908", color: "#fff", display: "grid", placeItems: "center", px: 3, py: 14 }}>
      <Box sx={{ maxWidth: 560, width: "100%", bgcolor: "#111211", border: "1px solid rgba(255,255,255,.1)", borderRadius: "20px", p: { xs: 3, md: 5 }, textAlign: "center" }}>
        {state.loading ? <CircularProgress size={44} sx={{ color: "#c8ff00" }} /> : state.error ? <ErrorOutlineRoundedIcon sx={{ fontSize: 52, color: "#ff8a8a" }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 52, color: "#c8ff00" }} />}
        <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, mt: 2 }}>Newsletter preferences</Typography>
        <Typography role="status" sx={{ color: "rgba(255,255,255,.65)", lineHeight: 1.7, mt: 1 }}>{state.message}</Typography>
        {!state.loading && <Box component={Link} href="/" sx={{ display: "inline-block", mt: 3, px: 3, py: 1.25, bgcolor: "#c8ff00", color: "#090909", borderRadius: "10px", fontWeight: 800, textDecoration: "none" }}>Return home</Box>}
      </Box>
    </Box>
  );
}
