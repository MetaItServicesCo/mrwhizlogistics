"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
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
import { settingsMap } from "@/lib/contentAdapters";
import { getPublicSettings } from "@/lib/publicApi";

// ===== Tuning levers =====
const SECTION_HEIGHT = "300vh"; // zyada = dheema scrub + zyada scroll room
const VIDEO_END = 0.6; // is scroll point tak video poori
const TEXT_START = 0.55; // words reveal shuru
const TEXT_END = 0.95; // words reveal khatam

const DEFAULT_VIDEO = "/video/hero-video.mp4";
// First frame of DEFAULT_VIDEO, shown instantly while the video downloads.
const DEFAULT_POSTER = "/video/hero-video-poster.webp";
// The same footage at 640x360 (1.9 MB vs 11 MB), every frame a keyframe. It is
// downloaded first so the hero can scrub within ~2 s on a mobile connection,
// then replaced by the full-quality file as soon as that arrives.
const DEFAULT_PREVIEW = "/video/hero-video-preview.mp4";
// hero-video.mp4 is 30 fps with every frame a keyframe, so any frame can be
// shown directly. Seeks are snapped to whole frames to skip redundant work.
const VIDEO_FPS = 30;
// How quickly the shown frame catches up with the scroll position. Small
// enough to feel tied to the scroll, large enough to smooth mouse-wheel steps.
const SMOOTHING_SEC = 0.06;

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

export default function HomePage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const shownTimeRef = useRef(0);
  // Which video to use: the bundled one, unless the "hero_video" site setting
  // names another. Starts as the default so its download begins immediately
  // instead of waiting for the settings request (which on a mobile connection
  // pushed the preview's arrival from ~2 s to ~6 s).
  const [heroVideo, setHeroVideo] = useState<string>(DEFAULT_VIDEO);

  // What the <video> element actually plays: a local blob once downloaded.
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    void getPublicSettings()
      .then((items) => {
        const configured = settingsMap(items).hero_video;
        if (mounted && configured) setHeroVideo(configured);
      })
      .catch(() => {
        // Keep the bundled video when settings cannot be loaded.
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Progressive loading. Each file is downloaded in full and played from
  // memory, because scrubbing a *streamed* file is what broke the hero: on a
  // typical mobile connection every scroll jumped into a part not yet
  // downloaded, so each frame waited on the network (measured on 4G: frames
  // ~4 s behind the scroll, 98% of them wrong, 12 painted in a whole scroll).
  // The small preview makes it scrub within ~2 s; the full file then swaps in.
  // A file that can't be fetched (e.g. a cross-origin URL in the setting) is
  // streamed directly as a last resort.
  useEffect(() => {
    const controller = new AbortController();
    const objectUrls: string[] = [];
    const sources =
      heroVideo === DEFAULT_VIDEO ? [DEFAULT_PREVIEW, DEFAULT_VIDEO] : [heroVideo];

    const download = async (url: string) => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const objectUrl = URL.createObjectURL(await res.blob());
      objectUrls.push(objectUrl);
      return objectUrl;
    };

    (async () => {
      let loadedAny = false;
      // Sequential on purpose: the preview gets the whole connection first.
      for (const url of sources) {
        try {
          setVideoSrc(await download(url));
          loadedAny = true;
        } catch (error) {
          if ((error as Error)?.name === "AbortError") return;
          // Not fatal - the next source (or streaming) takes over - but say so,
          // since a silent failure here once left the hero on its poster.
          console.warn(`[hero] could not load ${url}; trying the next source`, error);
        }
      }
      if (!loadedAny) setVideoSrc(heroVideo);
    })();

    return () => {
      controller.abort();
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [heroVideo]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const onVideoMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isFinite(v.duration) && v.duration > 0) durationRef.current = v.duration;
    // iOS Safari will not paint frames for a video that has never played;
    // a muted play+pause primes it. Harmless elsewhere.
    v.play()
      .then(() => v.pause())
      .catch(() => {});
  };

  // Scroll -> video frame. Reads the scroll position every animation frame
  // (so a page loaded mid-hero is right immediately) and eases toward it.
  //
  // Two changes fix the lag:
  // 1. The old loop closed only 25% of the gap per frame, so during a normal
  //    scroll the video trailed by 0.5-2.5 s of footage and kept moving after
  //    scrolling stopped. This smoothing is time-based and catches up in ~60 ms.
  // 2. The old loop set currentTime every frame even while the previous seek
  //    was still decoding. On slower devices seeks queued up faster than they
  //    finished and the picture froze. Now a new seek starts only when the
  //    last one has been shown.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const halfFrame = 0.5 / VIDEO_FPS;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const v = videoRef.current;
      const d = durationRef.current;

      if (v && d && v.readyState >= 1) {
        const p = Math.max(scrollYProgress.get(), 0);
        const target = Math.min((Math.min(p / VIDEO_END, 1)) * d, d - 0.05);

        const ease = 1 - Math.exp(-dt / SMOOTHING_SEC);
        let shown = shownTimeRef.current + (target - shownTimeRef.current) * ease;
        if (Math.abs(target - shown) < halfFrame) shown = target;
        shownTimeRef.current = shown;

        const frameTime = Math.min(Math.round(shown * VIDEO_FPS) / VIDEO_FPS, d - 0.05);
        if (!v.seeking && Math.abs(v.currentTime - frameTime) >= halfFrame) {
          v.currentTime = frameTime;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress]);

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
              src={videoSrc}
              poster={
                heroVideo === DEFAULT_VIDEO ? DEFAULT_POSTER : undefined
              }
              onLoadedMetadata={onVideoMetadata}
              onDurationChange={onVideoMetadata}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
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
                  {/* The page's H1 (headingSx sets margin 0, so no visual change). */}
                  <Box
                    component="h1"
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
