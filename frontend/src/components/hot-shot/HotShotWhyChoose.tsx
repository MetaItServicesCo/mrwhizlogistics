"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

import type { HotShotService } from "@/types/hotShot";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

function getIcon(icon: string) {
  switch (icon) {
    case "bolt":
      return <BoltRoundedIcon />;
    case "truck":
      return <LocalShippingRoundedIcon />;
    case "clock":
      return <AccessTimeRoundedIcon />;
    case "location":
      return <LocationOnRoundedIcon />;
    case "construction":
      return <ConstructionRoundedIcon />;
    case "globe":
      return <PublicRoundedIcon />;
    default:
      return <BoltRoundedIcon />;
  }
}

type Feature = HotShotService["features"][number];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(200px circle at ${mx}px ${my}px, rgba(200,255,0,0.1), transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(-200);
    my.set(-200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      style={{ height: "100%" }}
    >
      <Box
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",
          height: "100%",
          minHeight: 135,
          p: { xs: 2.75, md: 3.25 },
          display: "flex",
          gap: 2,
          borderRadius: "16px",
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
          transition:
            "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            borderColor: "rgba(200,255,0,.4)",
            boxShadow: "0 20px 46px rgba(0,0,0,.5)",
          },
          "&:hover .fc-icon": {
            transform: "translateY(-3px) rotate(-6deg)",
            bgcolor: LIME,
            color: "#080808",
          },
          "&:hover .fc-spot": { opacity: 1 },
          "&:hover .fc-sheen": { transform: "translateX(150%)" },
          "&:hover .fc-bar": { transform: "scaleX(1)" },
        }}
      >
        {/* cursor spotlight */}
        <Box
          className="fc-spot"
          aria-hidden
          component={motion.div}
          style={{ background: spotlight }}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            transition: "opacity .3s ease",
            pointerEvents: "none",
          }}
        />
        {/* sheen */}
        <Box
          className="fc-sheen"
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "55%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(200,255,0,0.05), transparent)",
            transform: "translateX(-150%)",
            transition: "transform .7s ease",
            pointerEvents: "none",
          }}
        />

        {/* icon */}
        <Box
          className="fc-icon"
          sx={{
            position: "relative",
            width: 46,
            height: 46,
            flexShrink: 0,
            borderRadius: "12px",
            bgcolor: "rgba(200,255,0,.09)",
            color: LIME,
            border: "1px solid rgba(200,255,0,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "transform .35s ease, background .35s ease, color .35s ease",
            "& svg": { fontSize: 22 },
          }}
        >
          {getIcon(feature.icon)}
        </Box>

        {/* text */}
        <Box sx={{ position: "relative" }}>
          <Typography
            sx={{ color: "#fff", fontSize: 14, fontWeight: 900, mb: 0.7 }}
          >
            {feature.title}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,.48)",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {feature.description}
          </Typography>
        </Box>

        {/* bottom accent bar */}
        <Box
          className="fc-bar"
          aria-hidden
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
            transform: "scaleX(0)",
            transformOrigin: "left",
            transition: "transform .4s ease",
          }}
        />
      </Box>
    </motion.div>
  );
}

export default function HotShotWhyChoose({
  service,
}: {
  service: HotShotService;
}) {
  return (
    <Box component="section" sx={{ mt: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Typography
          sx={{
            color: LIME,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 2.5,
            mb: 1.5,
          }}
        >
          WHY IT WORKS
        </Typography>
        <Typography
          component="h2"
          sx={{
            color: "#fff",
            fontSize: { xs: 27, md: 38 },
            fontWeight: 900,
            letterSpacing: "-1px",
            mb: 1.2,
          }}
        >
          Why choose this service?
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,.48)",
            fontSize: 14,
            lineHeight: 1.7,
            mb: 4,
          }}
        >
          Built around speed, visibility and dependable delivery.
        </Typography>
      </motion.div>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {service.features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </Box>
    </Box>
  );
}
