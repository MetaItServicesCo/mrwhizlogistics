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
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export type FeatureItem = { icon: string; title: string; description: string };

function getIcon(icon: string) {
  switch (icon) {
    case "truck":
      return <LocalShippingRoundedIcon />;
    case "liftgate":
      return <HeightRoundedIcon />;
    case "location":
      return <LocationOnRoundedIcon />;
    case "clock":
      return <AccessTimeRoundedIcon />;
    case "shield":
      return <VerifiedUserRoundedIcon />;
    case "route":
      return <RouteRoundedIcon />;
    case "bolt":
      return <BoltRoundedIcon />;
    case "construction":
      return <ConstructionRoundedIcon />;
    case "globe":
      return <PublicRoundedIcon />;
    default:
      return <BoltRoundedIcon />;
  }
}

function Card({ f }: { f: FeatureItem }) {
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
      style={{ height: "100%" }}
    >
      <Box
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        sx={{
          position: "relative",
          height: "100%",
          p: { xs: 3, md: 3.5 },
          borderRadius: "16px",
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
          transition:
            "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            borderColor: `${LIME}55`,
            boxShadow: "0 20px 46px rgba(0,0,0,.5)",
          },
          "&:hover .fw-icon": { transform: "translateY(-3px) rotate(-6deg)" },
          "&:hover .fw-spot": { opacity: 1 },
          "&:hover .fw-sheen": { transform: "translateX(150%)" },
          "&:hover .fw-bar": { transform: "scaleX(1)" },
        }}
      >
        <Box
          className="fw-spot"
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
        <Box
          className="fw-sheen"
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

        <Box
          className="fw-icon"
          sx={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: "13px",
            bgcolor: LIME,
            color: "#080808",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: "0 8px 20px rgba(200,255,0,.3)",
            transition: "transform .35s ease",
            "& svg": { fontSize: 26 },
          }}
        >
          {getIcon(f.icon)}
        </Box>
        <Typography
          component="h3"
          sx={{
            position: "relative",
            fontWeight: 800,
            fontSize: { xs: "1.15rem", md: "1.2rem" },
            mb: 1,
            color: "#fff",
          }}
        >
          {f.title}
        </Typography>
        <Typography
          sx={{
            position: "relative",
            color: "rgba(255,255,255,.6)",
            fontSize: 14,
            lineHeight: 1.65,
          }}
        >
          {f.description}
        </Typography>

        <Box
          className="fw-bar"
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

export default function ServiceWhy({
  eyebrow,
  title,
  subtitle,
  items,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 13 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 820,
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
              {eyebrow}
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.4rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "swWhyShimmer 6s linear infinite",
              "@keyframes swWhyShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                mt: 2.5,
                color: "rgba(255,255,255,0.6)",
                fontSize: { xs: 14.5, md: 16 },
                maxWidth: 620,
                mx: "auto",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </motion.div>
      </Box>
      <Box
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: "-90px" }}
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
          gap: { xs: 2.5, md: 3 },
          alignItems: "stretch",
        }}
      >
        {items.map((f) => (
          <Card key={f.title} f={f} />
        ))}
      </Box>
    </Box>
  );
}
