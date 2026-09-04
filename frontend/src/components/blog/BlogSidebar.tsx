"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { BlogPost } from "@/data/blogPosts";

const LIME = "#c8ff00";

const CATEGORIES = [
  "Logistics",
  "Delivery",
  "Freight",
  "Hot Shot",
  "Reefer",
  "Technology",
];
const TAGS = [
  "Freight",
  "Transport",
  "Dispatch",
  "Reefer",
  "FTL",
  "LTL",
  "Tracking",
];

function Widget({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: "16px",
        bgcolor: "#101010",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <Box sx={{ width: 20, height: 3, bgcolor: LIME, borderRadius: 2 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

export default function BlogSidebar({
  currentSlug,
  allPosts,
}: {
  currentSlug: string;
  allPosts: BlogPost[];
}) {
  const recent = allPosts.filter((p) => p.slug !== currentSlug).slice(0, 4);

  return (
    <Box>
      {/* search */}
      <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search…"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              borderRadius: "12px",
              bgcolor: "#101010",
              "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
              "&.Mui-focused fieldset": { borderColor: LIME },
            },
            "& input::placeholder": {
              color: "rgba(255,255,255,0.4)",
              opacity: 1,
            },
          }}
        />
        <IconButton
          sx={{
            bgcolor: LIME,
            color: "#0a0a0a",
            borderRadius: "12px",
            "&:hover": { bgcolor: "#d4ff33" },
          }}
        >
          <SearchRoundedIcon />
        </IconButton>
      </Box>

      {/* categories */}
      <Widget title="Categories">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {CATEGORIES.map((c) => (
            <Box
              key={c}
              component={Link}
              href="/blog"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1.5,
                py: 1,
                borderRadius: "10px",
                textDecoration: "none",
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all .25s",
                "&:hover": {
                  color: "#0a0a0a",
                  bgcolor: LIME,
                  borderColor: LIME,
                },
              }}
            >
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {c}
              </Typography>
            </Box>
          ))}
        </Box>
      </Widget>

      {/* recent */}
      <Widget title="Recent Posts">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {recent.map((p) => (
            <Box
              key={p.slug}
              component={Link}
              href={`/blog/${p.slug}`}
              sx={{
                display: "flex",
                gap: 1.5,
                textDecoration: "none",
                alignItems: "center",
                "&:hover .rp-title": { color: LIME },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "10px",
                  flexShrink: 0,
                  overflow: "hidden",
                  bgcolor: "#1a1a1a",
                  ...(p.image
                    ? {
                        backgroundImage: `url(${p.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              />
              <Box>
                <Typography
                  className="rp-title"
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.4,
                    transition: "color .25s",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.title}
                </Typography>
                <Typography
                  sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)", mt: 0.4 }}
                >
                  {new Date(p.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Widget>

      {/* tags */}
      <Widget title="Tags Cloud">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {TAGS.map((t) => (
            <Box
              key={t}
              component={Link}
              href="/blog"
              sx={{
                px: 1.4,
                py: 0.6,
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                transition: "all .2s",
                "&:hover": {
                  color: "#0a0a0a",
                  bgcolor: LIME,
                  borderColor: LIME,
                },
              }}
            >
              {t}
            </Box>
          ))}
        </Box>
      </Widget>
    </Box>
  );
}
