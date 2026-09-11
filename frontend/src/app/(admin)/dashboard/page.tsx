"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const LIME = "#c8ff00";

const STATS = [
  { label: "Quote Requests", value: "24", hint: "+5 this week" },
  { label: "Contact Messages", value: "12", hint: "3 unread" },
  { label: "Newsletter Subs", value: "148", hint: "+9 this week" },
  { label: "Active Rentals", value: "6", hint: "2 due soon" },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography
        sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", mb: 0.5 }}
      >
        Dashboard
      </Typography>
      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.5)", mb: 4 }}>
        Overview of your leads, messages and activity.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {STATS.map((s) => (
          <Box
            key={s.label}
            sx={{
              p: 3,
              borderRadius: "16px",
              bgcolor: "#0f100f",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography
              sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 1 }}
            >
              {s.label}
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 800,
                color: LIME,
                lineHeight: 1,
              }}
            >
              {s.value}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", mt: 1 }}
            >
              {s.hint}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: "16px",
          bgcolor: "#0f100f",
          border: "1px solid rgba(255,255,255,0.08)",
          minHeight: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
          Recent leads &amp; activity will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
