"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { BlogPost } from "@/data/blogPosts";

import BlogArticle from "./BlogArticle";
import BlogAuthorBox from "./BlogAuthorBox";
import BlogComments from "./BlogComments";
import BlogSidebar from "./BlogSidebar";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BlogDetail({
  post,
  allPosts,
}: {
  post: BlogPost;
  allPosts: BlogPost[];
}) {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 12 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1300,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            lg: "minmax(0,1fr) 340px",
          },
          gap: { xs: 6, lg: 8 },
          alignItems: "start",
        }}
      >
        {/* LEFT — scrolls normally */}
        <Box sx={{ minWidth: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <BlogArticle post={post} />
          </motion.div>

          <BlogAuthorBox post={post} />
          <BlogComments postSlug={post.slug} />
        </Box>

        {/* RIGHT — sticky (alignSelf stretch + sticky inside) */}
        <Box
          sx={{ display: { xs: "none", lg: "block" }, alignSelf: "stretch" }}
        >
          <Box sx={{ position: "sticky", top: 100 }}>
            <BlogSidebar currentSlug={post.slug} allPosts={allPosts} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
