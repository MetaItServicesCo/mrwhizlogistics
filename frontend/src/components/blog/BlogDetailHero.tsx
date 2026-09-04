"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import type { BlogPost } from "@/data/blogPosts";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

function fmtLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogDetailHero({ post }: { post: BlogPost }) {
  const reduce = useReducedMotion() ?? false;
  const words = post.title.split(" ");

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: { xs: 340, sm: 420, md: 500 },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        bgcolor: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* background image (Ken Burns) */}
      <Box
        component={motion.div}
        aria-hidden
        initial={reduce ? {} : { scale: 1.12 }}
        animate={reduce ? {} : { scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          ...(post.image
            ? {
                backgroundImage: `url(${post.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: "linear-gradient(135deg, #1c2a15, #05070a)" }),
        }}
      />

      {/* overlays */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(90deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.72) 45%, rgba(10,10,10,0.4) 100%)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.5) 0%, transparent 35%, rgba(10,10,10,0.6) 100%)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 2,
          background: `linear-gradient(90deg, ${LIME}, transparent 60%)`,
        }}
      />

      {/* content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1300,
          mx: "auto",
          px: { xs: 3, sm: 5, md: 8, lg: 10 },
        }}
      >
        {/* category */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            mb: 2.5,
            px: 1.6,
            py: 0.6,
            borderRadius: "999px",
            bgcolor: "rgba(200,255,0,0.12)",
            border: `1px solid ${LIME}55`,
            backdropFilter: "blur(4px)",
          }}
        >
          <LocalOfferRoundedIcon sx={{ fontSize: 15, color: LIME }} />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: LIME,
              textTransform: "uppercase",
            }}
          >
            {post.category}
          </Typography>
        </Box>

        {/* title with accent bar */}
        <Box
          sx={{ display: "flex", alignItems: "stretch", gap: { xs: 2, md: 3 } }}
        >
          <Box
            component={motion.div}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            sx={{
              width: { xs: 4, md: 6 },
              borderRadius: 3,
              background: `linear-gradient(180deg, ${LIME}, #00e5ff)`,
              transformOrigin: "top",
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-1px",
                fontSize: { xs: "1.9rem", sm: "2.8rem", md: "3.6rem" },
                display: "flex",
                flexWrap: "wrap",
                columnGap: "0.28em",
                maxWidth: 900,
              }}
            >
              {words.map((w, i) => (
                <Box
                  key={i}
                  component={motion.span}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: 0.15 + i * 0.05,
                  }}
                  sx={{ display: "inline-block" }}
                >
                  {w}
                </Box>
              ))}
            </Typography>

            {/* meta + breadcrumb */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: { xs: 1.5, md: 2.5 },
                mt: { xs: 2, md: 3 },
              }}
            >
              {/* breadcrumb */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  component={Link}
                  href="/"
                  sx={{
                    color: LIME,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: { xs: 13, md: 15 },
                    "&:hover": { color: "#fff" },
                  }}
                >
                  Home
                </Box>
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Box
                  component={Link}
                  href="/blog"
                  sx={{
                    color: LIME,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: { xs: 13, md: 15 },
                    "&:hover": { color: "#fff" },
                  }}
                >
                  Blog
                </Box>
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    fontSize: { xs: 13, md: 15 },
                  }}
                >
                  Details
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 1,
                  height: 16,
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: { xs: "none", md: "block" },
                }}
              />

              {/* author + date */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <PersonRoundedIcon sx={{ fontSize: 16, color: LIME }} />
                  <Typography sx={{ fontSize: 13 }}>{post.author}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <CalendarMonthRoundedIcon
                    sx={{ fontSize: 15, color: LIME }}
                  />
                  <Typography sx={{ fontSize: 13 }}>
                    {fmtLong(post.date)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
