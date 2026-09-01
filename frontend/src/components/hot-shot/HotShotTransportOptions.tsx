"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import type { HotShotService } from "@/types/hotShot";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

function getIcon(icon: string) {
  switch (icon) {
    case "truck":
      return <LocalShippingRoundedIcon />;
    case "construction":
      return <ConstructionRoundedIcon />;
    case "inventory":
      return <Inventory2RoundedIcon />;
    case "bolt":
      return <BoltRoundedIcon />;
    case "location":
      return <LocationOnRoundedIcon />;
    case "store":
      return <StorefrontRoundedIcon />;
    default:
      return <LocalShippingRoundedIcon />;
  }
}

type Option = HotShotService["options"][number];

function OptionCard({ option, index }: { option: Option; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, rgba(200,255,0,0.12), transparent 70%)`;

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
      transition={{ duration: 0.6, delay: index * 0.07, ease: EASE }}
      style={{ height: "100%" }}
    >
      <Box
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",
          height: "100%",
          minHeight: 190,
          p: { xs: 2.75, md: 3.25 },
          borderRadius: "16px",
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
          transition:
            "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            borderColor: "rgba(200,255,0,.4)",
            boxShadow: "0 22px 50px rgba(0,0,0,.5)",
          },
          "&:hover .to-icon": { transform: "translateY(-4px) rotate(-6deg)" },
          "&:hover .to-spot": { opacity: 1 },
          "&:hover .to-sheen": { transform: "translateX(140%)" },
          "&:hover .to-bar": { transform: "scaleX(1)" },
        }}
      >
        {/* cursor spotlight */}
        <Box
          className="to-spot"
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
        {/* diagonal sheen */}
        <Box
          className="to-sheen"
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "55%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(200,255,0,0.06), transparent)",
            transform: "translateX(-140%)",
            transition: "transform .7s ease",
            pointerEvents: "none",
          }}
        />

        {/* number badge */}
        <Typography
          sx={{
            position: "absolute",
            top: 16,
            right: 18,
            color: "rgba(255,255,255,.18)",
            fontSize: 26,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </Typography>

        {/* label */}
        <Typography
          sx={{
            position: "relative",
            color: LIME,
            fontSize: 8.5,
            fontWeight: 900,
            letterSpacing: 1.4,
            mb: 2,
          }}
        >
          {option.label}
        </Typography>

        {/* icon */}
        <Box
          className="to-icon"
          sx={{
            position: "relative",
            width: 46,
            height: 46,
            borderRadius: "12px",
            bgcolor: LIME,
            color: "#080808",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: "0 8px 20px rgba(200,255,0,.28)",
            transition: "transform .35s ease",
            "& svg": { fontSize: 23 },
          }}
        >
          {getIcon(option.icon)}
        </Box>

        <Typography
          sx={{
            position: "relative",
            color: "#fff",
            fontSize: 15,
            fontWeight: 900,
            mb: 0.8,
          }}
        >
          {option.title}
        </Typography>
        <Typography
          sx={{
            position: "relative",
            color: "rgba(255,255,255,.48)",
            fontSize: 12.5,
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          {option.description}
        </Typography>

        {/* bottom accent bar */}
        <Box
          className="to-bar"
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

export default function HotShotTransportOptions({
  service,
}: {
  service: HotShotService;
}) {
  return (
    <Box component="section" sx={{ mt: 11 }}>
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
          EQUIPMENT & CAPACITY
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
          Transport options
        </Typography>
        <Typography
          sx={{ color: "rgba(255,255,255,.48)", fontSize: 14, mb: 4 }}
        >
          Flexible transportation solutions for different shipment requirements.
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
        {service.options.map((option, index) => (
          <OptionCard key={option.title} option={option} index={index} />
        ))}
      </Box>
    </Box>
  );
}
