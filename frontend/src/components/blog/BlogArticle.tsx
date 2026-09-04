"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import type { BlogPost } from "@/data/blogPosts";

const LIME = "#c8ff00";

export default function BlogArticle({ post }: { post: BlogPost }) {
  const paras = post.content?.length ? post.content : [post.excerpt];

  return (
    <Box component="article">
      {/* cover */}
      {post.image && (
        <Box
          sx={{
            position: "relative",
            height: { xs: 240, sm: 340, md: 440 },
            borderRadius: "18px",
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Box
            component="img"
            src={post.image}
            alt={post.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      )}

      {/* body */}
      {paras.map((p, i) => (
        <Typography
          key={i}
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: { xs: 15, md: 16 },
            lineHeight: 1.9,
            mb: 2.5,
          }}
        >
          {p}
        </Typography>
      ))}

      {/* tags + share */}
      <Box
        sx={{
          mt: 5,
          pt: 3,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
              mr: 0.5,
            }}
          >
            TAGS:
          </Typography>
          {[post.category, "Freight", "Transport"].map((t) => (
            <Box
              key={t}
              sx={{
                px: 1.4,
                py: 0.5,
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              #{t}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            SHARE:
          </Typography>
          {[FacebookRoundedIcon, XIcon, LinkedInIcon].map((Icon, idx) => (
            <Box
              key={idx}
              component="a"
              href="#"
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .2s",
                "&:hover": { bgcolor: LIME, color: "#0a0a0a" },
                "& svg": { fontSize: 16 },
              }}
            >
              <Icon />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
