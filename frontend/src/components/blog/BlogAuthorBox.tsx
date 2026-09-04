"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { BlogPost } from "@/data/blogPosts";

const LIME = "#c8ff00";

export default function BlogAuthorBox({ post }: { post: BlogPost }) {
  return (
    <Box
      sx={{
        mt: 5,
        p: { xs: 3, md: 3.5 },
        borderRadius: "18px",
        bgcolor: "#101010",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        gap: 2.5,
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: "rgba(200,255,0,0.12)",
          color: LIME,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${LIME}33`,
          "& svg": { fontSize: 30 },
        }}
      >
        <PersonRoundedIcon />
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: LIME,
            mb: 0.5,
          }}
        >
          WRITTEN BY
        </Typography>
        <Typography
          sx={{ fontSize: 18, fontWeight: 800, color: "#fff", mb: 0.5 }}
        >
          {post.author}
        </Typography>
        <Typography
          sx={{
            fontSize: 13.5,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
          }}
        >
          Logistics writer covering freight, dispatch and the technology
          reshaping how goods move across the country.
        </Typography>
      </Box>
    </Box>
  );
}
