"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const LIME = "#c8ff00";

const LINKS = [
  {
    href: "/hot-shot",
    title: "Hot Shot",
    text: "Same-day dispatch for urgent freight.",
  },
  {
    href: "/box-truck",
    title: "Box Truck",
    text: "16 ft and 26 ft trucks for local and last-mile loads.",
  },
  {
    href: "/semi-truck",
    title: "Semi Truck",
    text: "Reefer, dry van and flatbed freight.",
  },
  {
    href: "/contact",
    title: "Contact Us",
    text: "Get a quote or talk to dispatch.",
  },
];

/** Body of the branded 404 page (see app/not-found.tsx). */
export default function NotFoundContent() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "80vh",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 2, md: 4 },
        pt: { xs: 16, md: 24 },
        pb: { xs: 10, md: 14 },
        background:
          "radial-gradient(circle at 20% 10%, rgba(200,255,0,0.12), transparent 45%), #0a0a0a",
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Typography
          sx={{
            color: LIME,
            fontWeight: 800,
            letterSpacing: 3,
            fontSize: 13,
            mb: 2,
          }}
        >
          ERROR 404
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontWeight: 800,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            fontSize: { xs: "2.4rem", sm: "3.2rem", md: "4.2rem" },
            mb: 2,
          }}
        >
          We couldn&apos;t find that page
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.65)",
            fontSize: { xs: 16, md: 18 },
            maxWidth: 640,
            mb: 5,
          }}
        >
          The page may have moved or no longer exists. Pick a service below,
          head back to the{" "}
          <Box component={Link} href="/" sx={{ color: LIME, fontWeight: 700 }}>
            homepage
          </Box>
          , or contact our dispatch team.
        </Typography>

        <Box
          component="nav"
          aria-label="Popular pages"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {LINKS.map((l) => (
            <Box
              key={l.href}
              component={Link}
              href={l.href}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 3,
                borderRadius: "18px",
                textDecoration: "none",
                color: "#fff",
                bgcolor: "#111211",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "border-color .3s, transform .3s",
                "&:hover, &:focus-visible": {
                  borderColor: `${LIME}66`,
                  transform: "translateY(-4px)",
                  outline: "none",
                },
                "&:hover .nf-arrow, &:focus-visible .nf-arrow": {
                  transform: "translateX(4px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 19 }}>
                  {l.title}
                </Typography>
                <ArrowForwardRoundedIcon
                  className="nf-arrow"
                  sx={{ color: LIME, transition: "transform .3s" }}
                />
              </Box>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {l.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
