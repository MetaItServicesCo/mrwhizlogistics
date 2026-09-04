"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import type { BlogPost } from "@/data/blogPosts";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;
const PER_PAGE = 6;

const gradients = [
  "radial-gradient(circle at 30% 25%, rgba(200,255,0,0.2), transparent 55%), linear-gradient(150deg, #26301a, #0a0a0a)",
  "radial-gradient(circle at 70% 20%, rgba(0,229,255,0.16), transparent 55%), linear-gradient(150deg, #12202a, #0a0a0a)",
  "radial-gradient(circle at 40% 30%, rgba(255,179,64,0.15), transparent 55%), linear-gradient(150deg, #2a2612, #0a0a0a)",
];

function fmt(date: string) {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    mon: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

function Card({
  p,
  i,
  basePath,
}: {
  p: BlogPost;
  i: number;
  basePath: string;
}) {
  const router = useRouter();
  const go = () => router.push(`${basePath}/${p.slug}`);
  const { day, mon } = fmt(p.date);

  return (
    <Box
      component={motion.article}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
      onClick={go}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter") go();
      }}
      tabIndex={0}
      role="link"
      aria-label={p.title}
      sx={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        bgcolor: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        outline: "none",
        transition:
          "transform .4s ease, border-color .4s ease, box-shadow .4s ease",
        "&:hover, &:focus-visible": {
          transform: "translateY(-8px)",
          borderColor: `${LIME}55`,
          boxShadow: "0 24px 55px rgba(0,0,0,0.5)",
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 2px ${LIME}, 0 24px 55px rgba(0,0,0,0.5)`,
        },
        "&:hover .bl-media": { transform: "scale(1.08)" },
        "&:hover .bl-sheen": { transform: "translateX(220%)" },
        "&:hover .bl-title": { color: LIME },
        "&:hover .bl-btn": { bgcolor: "#d4ff33" },
        "&:hover .bl-btn svg": { transform: "translateX(3px)" },
      }}
    >
      {/* media */}
      <Box sx={{ position: "relative", height: 210, overflow: "hidden" }}>
        <Box
          className="bl-media"
          sx={{
            position: "absolute",
            inset: 0,
            transition: "transform .6s cubic-bezier(.2,.8,.2,1)",
            ...(p.image
              ? {
                  backgroundImage: `url(${p.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: gradients[i % gradients.length] }),
          }}
        />

        {/* diagonal sheen on hover */}
        <Box
          className="bl-sheen"
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            width: "45%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.14), transparent)",
            transform: "translateX(-160%)",
            transition: "transform .8s ease",
            pointerEvents: "none",
          }}
        />

        {/* date badge — top-left, clean floating */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 3,
            bgcolor: LIME,
            color: "#0a0a0a",
            borderRadius: "12px",
            px: 1.5,
            py: 0.9,
            textAlign: "center",
            boxShadow: "0 8px 20px rgba(200,255,0,0.35)",
            minWidth: 48,
          }}
        >
          <Typography sx={{ fontSize: 19, fontWeight: 900, lineHeight: 1 }}>
            {day}
          </Typography>
          <Typography
            sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, mt: 0.2 }}
          >
            {mon}
          </Typography>
        </Box>

        {/* category chip — top-right */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 3,
            px: 1.3,
            py: 0.45,
            borderRadius: "999px",
            bgcolor: "rgba(10,10,10,0.72)",
            backdropFilter: "blur(6px)",
            border: `1px solid ${LIME}55`,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              color: LIME,
              textTransform: "uppercase",
            }}
          >
            {p.category}
          </Typography>
        </Box>

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 55%, rgba(15,15,15,0.85) 100%)",
          }}
        />
      </Box>

      {/* content */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* meta */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1.5,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <PersonRoundedIcon sx={{ fontSize: 15, color: LIME }} />
            <Typography sx={{ fontSize: 12 }}>{p.author}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, color: LIME }} />
            <Typography sx={{ fontSize: 12 }}>{p.comments}</Typography>
          </Box>
          {p.readTime && (
            <Typography sx={{ fontSize: 12, ml: "auto" }}>
              {p.readTime}
            </Typography>
          )}
        </Box>

        <Typography
          className="bl-title"
          component="h3"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.2rem", md: "1.3rem" },
            lineHeight: 1.3,
            color: "#fff",
            mb: 1.2,
            transition: "color .3s",
          }}
        >
          {p.title}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 14,
            lineHeight: 1.7,
            mb: 3,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {p.excerpt}
        </Typography>

        <Box
          className="bl-btn"
          sx={{
            mt: "auto",
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: LIME,
            color: "#0a0a0a",
            fontWeight: 800,
            fontSize: 13,
            px: 2.2,
            py: 1,
            borderRadius: "999px",
            transition: "background .3s ease",
            "& svg": { fontSize: 17, transition: "transform .3s ease" },
          }}
        >
          Read More <ArrowForwardRoundedIcon />
        </Box>
      </Box>
    </Box>
  );
}

export default function BlogGrid({
  posts,
  basePath = "/blog",
}: {
  posts: BlogPost[];
  basePath?: string;
}) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const pagePosts = useMemo(
    () => posts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [posts, page],
  );

  const goPage = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      ref={topRef}
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 12 },
        overflow: "hidden",
        scrollMarginTop: "90px",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 780,
          mx: "auto",
          mb: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
            <Typography
              component="p"
              sx={{
                color: LIME,
                letterSpacing: 3,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Our Blog
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "blogShimmer 6s linear infinite",
              "@keyframes blogShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            News &amp; insights
          </Typography>
        </motion.div>
      </Box>

      {/* grid — re-animates on page change */}
      <AnimatePresence mode="wait">
        <Box
          key={page}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1180,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3,1fr)",
            },
            gap: { xs: 3, md: 3.5 },
            alignItems: "stretch",
          }}
        >
          {pagePosts.map((p, i) => (
            <Card key={p.slug} p={p} i={i} basePath={basePath} />
          ))}
        </Box>
      </AnimatePresence>

      {/* pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: { xs: 5, md: 7 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <PageBtn
            disabled={page === 1}
            onClick={() => goPage(page - 1)}
            aria="Previous page"
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </PageBtn>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
            <Box
              key={n}
              component="button"
              onClick={() => goPage(n)}
              aria-label={`Page ${n}`}
              aria-current={page === n ? "page" : undefined}
              sx={{
                minWidth: 42,
                height: 42,
                borderRadius: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 800,
                fontSize: 14,
                transition: "all .25s ease",
                border:
                  page === n
                    ? `1px solid ${LIME}`
                    : "1px solid rgba(255,255,255,0.14)",
                bgcolor: page === n ? LIME : "transparent",
                color: page === n ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                "&:hover": {
                  borderColor: LIME,
                  color: page === n ? "#0a0a0a" : "#fff",
                },
              }}
            >
              {n}
            </Box>
          ))}

          <PageBtn
            disabled={page === totalPages}
            onClick={() => goPage(page + 1)}
            aria="Next page"
          >
            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
          </PageBtn>
        </Box>
      )}
    </Box>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  aria: string;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      sx={{
        width: 42,
        height: 42,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        border: "1px solid rgba(255,255,255,0.14)",
        bgcolor: "transparent",
        color: "#fff",
        transition: "all .25s ease",
        opacity: disabled ? 0.3 : 1,
        "&:hover": disabled ? {} : { borderColor: LIME, color: LIME },
      }}
    >
      {children}
    </Box>
  );
}
