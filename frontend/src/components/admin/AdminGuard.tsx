"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/lib/auth";
import { ACCENT } from "@/theme/brand";


/** Blocks the admin area until a valid session is confirmed. */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "#07131e",
        }}
      >
        <CircularProgress sx={{ color: ACCENT }} />
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
          {loading ? "Checking your session…" : "Redirecting to sign in…"}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
