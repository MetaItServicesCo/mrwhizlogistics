"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import Navbar from "@/components/header/Navbar";
import DispatchSection from "@/components/home/DispatchSection";
import BrandsSection from "@/components/home/BrandsSection";
import TiersSection from "@/components/home/TiersSection";
import CalculatorSection from "@/components/home/CalculatorSection";
import YardOSSection from "@/components/home/YardOSSection";
import PlatformSection from "@/components/home/PlatformSection";
import CaseShowSection from "@/components/home/CaseShowSection";
import ProcessSection from "@/components/home/ProcessSection";
import ContactSection from "@/components/home/ContactSection";
import FaqSection from "@/components/home/FaqSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

// ===== Tuning levers =====
const SECTION_HEIGHT = "300vh"; // zyada = dheema scrub + zyada scroll room
const VIDEO_END = 0.6; // is scroll point tak video poori
const TEXT_START = 0.55; // words reveal shuru
const TEXT_END = 0.95; // words reveal khatam

const SENTENCE =
  "Fast, reliable trucking that moves your freight from pickup to delivery without the hassle";
const WORDS = SENTENCE.split(" ");
// const GRADIENT =
//   "linear-gradient(90deg, #c8ff00 0%, #00e5ff 50%, #ff4dd8 100%)";
const GRADIENT = "#ffffff";
const STEP = (TEXT_END - TEXT_START) / WORDS.length;

const headingSx = {
  m: 0,
  fontWeight: 800,
  lineHeight: 1.08,
  letterSpacing: "-0.5px",
  fontSize: { xs: "2.1rem", sm: "3.2rem", md: "4.4rem" },
} as const;

function GradientWord({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export default function PublicHomePage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Video duration robustly resolve (Infinity-duration bug fix)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const setDur = () => {
      if (isFinite(v.duration) && v.duration > 0) {
        durationRef.current = v.duration;
        return true;
      }
      return false;
    };
    if (!setDur()) {
      const forceSeek = () => {
        const onSeeked = () => {
          v.removeEventListener("seeked", onSeeked);
          setDur();
          v.currentTime = 0;
        };
        v.addEventListener("seeked", onSeeked);
        v.currentTime = 1e7;
      };
      if (v.readyState >= 1) forceSeek();
      else v.addEventListener("loadedmetadata", forceSeek, { once: true });
    }
  }, []);

  // Scroll → video target time (0→100% pehle VIDEO_END tak)
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const d = durationRef.current;
    if (!d) return;
    const vp = Math.min(Math.max(p, 0) / VIDEO_END, 1);
    targetTimeRef.current = Math.min(vp * d, d - 0.05);
  });

  // rAF easing → smooth scrub
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && durationRef.current && v.readyState >= 2) {
        const diff = targetTimeRef.current - v.currentTime;
        if (Math.abs(diff) > 0.015) v.currentTime += diff * 0.25;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Heading video poori hone par reveal
  const headingReveal = useTransform(
    scrollYProgress,
    [VIDEO_END - 0.04, VIDEO_END + 0.03],
    [0, 1],
  );
  const headingY = useTransform(
    scrollYProgress,
    [VIDEO_END - 0.04, VIDEO_END + 0.03],
    [50, 0],
  );
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <>
      <Box sx={{ color: "#fff", overflowX: "clip", bgcolor: "#0b0b0b" }}>
        {/* <Navbar /> */}

        {/* HERO — tall section (height = poore sequence ka scroll) */}
        <Box
          ref={sectionRef}
          sx={{ height: SECTION_HEIGHT, position: "relative" }}
        >
          {/* Sticky full-screen viewport */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              height: "100dvh",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* Full background video — no overlay */}
            <video
              ref={videoRef}
              src="/video/hero-video.mp4"
              muted
              playsInline
              preload="auto"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />

            {/* Heading — video ke baad reveal, phir word-by-word gradient fill */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 3, md: 6 },
                pointerEvents: "none",
              }}
            >
              <motion.div
                style={{
                  opacity: headingReveal,
                  y: headingY,
                  width: "100%",
                  maxWidth: 1000,
                }}
              >
                <Box sx={{ position: "relative", textAlign: "center" }}>
                  {/* Base layer — bright frames par bhi visible */}
                  {/* <Box sx={{ ...headingSx, color: 'rgba(255,255,255,0.38)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>
                  {SENTENCE}
                </Box> */}
                  <Box
                    sx={{
                      ...headingSx,
                      color: "#ffffff",
                      textShadow: "0 2px 24px rgba(0,0,0,0.6)",
                    }}
                  >
                    {SENTENCE}
                  </Box>
                  {/* <Box sx={{ ...headingSx, color: '#000000', textShadow: '0 2px 12px rgba(255,255,255,0.3)' }}>
  {SENTENCE}
</Box> */}

                  {/* Gradient layer — har word ki opacity scroll se */}
                  <Box
                    aria-hidden
                    sx={{
                      ...headingSx,
                      position: "absolute",
                      inset: 0,
                      background: GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {WORDS.map((w, i) => {
                      const start = TEXT_START + i * STEP;
                      return (
                        <GradientWord
                          key={i}
                          word={w}
                          progress={scrollYProgress}
                          start={start}
                          end={Math.min(start + STEP * 1.8, 0.99)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </motion.div>
            </Box>

            {/* Scroll hint */}
            <motion.div
              style={{
                opacity: hintOpacity,
                position: "absolute",
                bottom: 28,
                left: "50%",
                translateX: "-50%",
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  letterSpacing: 3,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                SCROLL TO EXPLORE
              </Typography>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
              >
                <KeyboardDoubleArrowDownRoundedIcon
                  sx={{ color: "#c8ff00", fontSize: 22 }}
                />
              </motion.div>
            </motion.div>
          </Box>
        </Box>
        <DispatchSection />
        {/* <BrandsSection /> */}
      </Box>
      <TiersSection />
      {/* <CalculatorSection /> */}
      {/* <YardOSSection /> */}
      {/* <PlatformSection /> */}
      <CaseShowSection />
      <ProcessSection />
      <ContactSection />
      <TestimonialsSection />

      <FaqSection />
    </>
  );
}
