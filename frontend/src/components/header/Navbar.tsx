"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FlatwareRoundedIcon from "@mui/icons-material/FlatwareRounded";
import AcUnitRoundedIcon from "@mui/icons-material/AcUnitRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const LIME = "#c8ff00";

type MenuItem = {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
};
type MegaKey = "Hot Shot" | "Box Truck" | "Semi Truck";

const MEGA: Record<
  MegaKey,
  { tagline: string; href: string; items: MenuItem[] }
> = {
  "Hot Shot": {
    tagline: "Urgent, specialized trailer & van transport",
    href: "/hot-shot",
    items: [
      {
        title: "Truck & Trailers",
        desc: "Heavy-duty transport setup",
        href: "/hot-shot/truck-trailers",
        icon: <LocalShippingRoundedIcon />,
      },
      {
        title: "Sprinter Van with Lift Gate",
        desc: "Hydraulic lift assistance",
        href: "/hot-shot/sprinter-van",
        icon: <DirectionsCarRoundedIcon />,
      },
      {
        title: "16 Feet Enclosed Trailer",
        desc: "Secure weatherproof hauling",
        href: "/hot-shot/16ft-enclosed-trailer",
        icon: <Inventory2RoundedIcon />,
      },
      {
        title: "24 Feet Enclosed Trailer",
        desc: "Large capacity cargo box",
        href: "/hot-shot/24ft-enclosed-trailer",
        icon: <Inventory2RoundedIcon />,
      },
      {
        title: "40 Feet Flat Bed",
        desc: "Extra-long open deck transport",
        href: "/hot-shot/40ft-flat-bed",
        icon: <LocalShippingOutlinedIcon />,
      },
      {
        title: "20 Feet Flat Bed",
        desc: "Standard open deck hauling",
        href: "/hot-shot/20ft-flat-bed",
        icon: <LocalShippingOutlinedIcon />,
      },
    ],
  },
  "Box Truck": {
    tagline: "Local and regional commercial transport",
    href: "/box-truck",
    items: [
      {
        title: "16 Feet Box Truck",
        desc: "Compact urban cargo delivery",
        href: "/box-truck/16ft-box-truck",
        icon: <LocalShippingRoundedIcon />,
      },
      {
        title: "26 Feet Box Truck",
        desc: "High-capacity commercial moving",
        href: "/box-truck/26ft-box-truck",
        icon: <LocalShippingRoundedIcon />,
      },
    ],
  },
  "Semi Truck": {
    tagline: "Heavy, long-haul industrial freight",
    href: "/semi-truck",
    items: [
      {
        title: "Reefer Trailer (Fridge)",
        desc: "Temperature-controlled cargo",
        href: "/semi-truck/reefer-trailer",
        icon: <AcUnitRoundedIcon />,
      },
      {
        title: "Dry Van",
        desc: "Standard enclosed freight hauling",
        href: "/semi-truck/dry-van",
        icon: <Inventory2RoundedIcon />,
      },
      {
        title: "Flat Bed",
        desc: "Heavy unconstrained open logistics",
        href: "/semi-truck/flat-bed",
        icon: <FlatwareRoundedIcon />,
      },
    ],
  },
};

const MEGA_KEYS = Object.keys(MEGA) as MegaKey[];

const navItemSx = {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  color: "rgba(255,255,255,0.75)",
  fontSize: 14,
  fontWeight: 500,
  px: 1.8,
  py: 1,
  borderRadius: "999px",
  cursor: "pointer",
  border: "none",
  background: "transparent",
  fontFamily: "inherit",
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
  transition: "color .2s ease",
  "&:hover": { color: "#fff" },
} as const;

const mobileLinkSx = { py: 1.4, fontSize: 17, fontWeight: 500 } as const;

export default function Navbar() {
  const [active, setActive] = useState<MegaKey | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileExpand, setMobileExpand] = useState<MegaKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (key: MegaKey | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const Logo = (
    <Link
      href="/"
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "8px",
          bgcolor: "#fff",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LocalShippingRoundedIcon sx={{ fontSize: 18 }} />
      </Box>
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: "-0.3px",
        }}
      >
        Terminal
      </Typography>
    </Link>
  );

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: { xs: 12, md: 20 },
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ position: "relative", width: "100%", maxWidth: 1240 }}>
        {/* ===== MAIN NAVBAR CONTAINER ===== */}
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: { xs: 0.8, md: 0.8 },
            borderRadius: "999px",
            bgcolor: "rgba(18,17,17,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {Logo}

          {/* DESKTOP LINKS WITH LEFT-TO-RIGHT GRADIENT ANIMATION */}
          <Stack
            direction="row"
            spacing={0.5}
            onMouseLeave={() => setHoveredTab(null)}
            sx={{
              alignItems: "center",
              display: { xs: "none", lg: "flex" },
              position: "relative",
            }}
          >
            {/* Home Link */}
            <Link
              href="/"
              style={{ textDecoration: "none", position: "relative" }}
              onMouseEnter={() => {
                setHoveredTab("home");
                openMenu(null);
              }}
            >
              <Box component="span" sx={navItemSx}>
                {hoveredTab === "home" && (
                  <motion.div
                    layoutId="navbarGradientBg"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.04) 100%)`,
                      borderRadius: "999px",
                      zIndex: -1,
                      borderBottom: `2px solid ${LIME}`,
                    }}
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                Home
              </Box>
            </Link>

            {/* Mega Menu Links */}
            {MEGA_KEYS.map((key) => {
              const isMegaOpen = active === key;
              const isHovered = hoveredTab === key;
              const isActiveState = isHovered || isMegaOpen;

              return (
                <Link
                  key={key}
                  href={MEGA[key].href}
                  style={{ textDecoration: "none", position: "relative" }}
                >
                  <Box
                    component="button"
                    type="button"
                    onMouseEnter={() => {
                      setHoveredTab(key);
                      openMenu(key);
                    }}
                    onMouseLeave={scheduleClose}
                    sx={{
                      ...navItemSx,
                      color: isActiveState ? "#fff" : navItemSx.color,
                      fontWeight: isActiveState ? 600 : 500,
                    }}
                  >
                    {key}
                    <KeyboardArrowDownRoundedIcon
                      sx={{
                        fontSize: 16,
                        transition: "transform .25s",
                        transform: isMegaOpen
                          ? "translateY(-1px) rotate(180deg)"
                          : "translateY(0) rotate(0)",
                      }}
                    />

                    {/* Smooth Left-to-Right Gradient Sweep Background & Bottom Border */}
                    {isActiveState && (
                      <motion.div
                        layoutId="navbarGradientBg"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(90deg, rgba(200,255,0,0.2) 0%, rgba(200,255,0,0.03) 100%)`,
                          borderRadius: "999px",
                          zIndex: -1,
                          borderBottom: `2px solid ${LIME}`,
                          boxShadow: `inset 0 -4px 12px rgba(200,255,0,0.15)`,
                        }}
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </Box>
                </Link>
              );
            })}

            {/* About Link */}
            <Link
              href="#"
              style={{ textDecoration: "none", position: "relative" }}
              onMouseEnter={() => {
                setHoveredTab("about");
                openMenu(null);
              }}
            >
              <Box component="span" sx={navItemSx}>
                {hoveredTab === "about" && (
                  <motion.div
                    layoutId="navbarGradientBg"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.04) 100%)`,
                      borderRadius: "999px",
                      zIndex: -1,
                      borderBottom: `2px solid ${LIME}`,
                    }}
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                About
              </Box>
            </Link>
          </Stack>

          {/* DESKTOP ACTIONS */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", display: { xs: "none", lg: "flex" } }}
          >
            <IconButton
              sx={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderColor: "#fff",
                },
              }}
            >
              <PhoneInTalkRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Button
              disableElevation
              sx={{
                bgcolor: LIME,
                color: "#000",
                fontWeight: 700,
                fontSize: 11.5,
                px: 1.8,
                py: 0.8,
                borderRadius: "999px",
                "&:hover": { bgcolor: "#d4ff33" },
              }}
            >
              Explore Product
            </Button>
            <Button
              sx={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 11.5,
                px: 1.8,
                py: 0.8,
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderColor: "#fff",
                },
              }}
            >
              Request Demo
            </Button>
          </Stack>

          {/* HAMBURGER (Mobile) */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", lg: "none" }, color: "#fff" }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Stack>

        {/* ===== MEGA DROPDOWN PANEL ===== */}
        <AnimatePresence>
          {active && (
            <Box
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                pt: 1.5,
                display: { xs: "none", lg: "flex" },
                justifyContent: "center",
              }}
            >
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: "100%",
                  maxWidth: active === "Hot Shot" ? 760 : 640,
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(18,17,17,0.96)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    p: 2.5,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  <Link
                    href={MEGA[active].href}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      sx={{
                        color: LIME,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        mb: 2,
                        "&:hover": { opacity: 0.85 },
                      }}
                    >
                      {active} · {MEGA[active].tagline}
                    </Typography>
                  </Link>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                    }}
                  >
                    {MEGA[active].items.map((it) => (
                      <Link
                        key={it.title}
                        href={it.href}
                        style={{ textDecoration: "none" }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            alignItems: "flex-start",
                            p: 1.25,
                            borderRadius: "14px",
                            cursor: "pointer",
                            transition: "background .2s",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                            "&:hover .mi-icon": {
                              transform: "translateY(-3px)",
                              color: LIME,
                            },
                          }}
                        >
                          <Box
                            className="mi-icon"
                            sx={{
                              color: "#fff",
                              bgcolor: "rgba(255,255,255,0.08)",
                              width: 38,
                              height: 38,
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "transform .25s, color .25s",
                              "& svg": { fontSize: 19 },
                            }}
                          >
                            {it.icon}
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {it.title}
                            </Typography>
                            <Typography
                              sx={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: 12,
                              }}
                            >
                              {it.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </Link>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* ===== MOBILE DRAWER ===== */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "85%",
              maxWidth: 360,
              bgcolor: "#0d0c0c",
              color: "#fff",
              p: 2.5,
            },
          },
        }}
      >
        <Stack
          direction="row"
          mb={3}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          {Logo}
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: "#fff" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Link
          href="/"
          style={{ textDecoration: "none" }}
          onClick={() => setDrawerOpen(false)}
        >
          <Typography sx={{ ...mobileLinkSx, color: "#fff" }}>Home</Typography>
        </Link>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {MEGA_KEYS.map((key) => (
          <Box key={key}>
            <Stack
              direction="row"
              sx={{
                ...mobileLinkSx,
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <Link
                href={MEGA[key].href}
                style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                onClick={() => setDrawerOpen(false)}
              >
                <span>{key}</span>
              </Link>
              <IconButton
                size="small"
                onClick={() =>
                  setMobileExpand(mobileExpand === key ? null : key)
                }
                sx={{ color: LIME }}
              >
                <KeyboardArrowDownRoundedIcon
                  sx={{
                    transition: "transform .25s",
                    transform: mobileExpand === key ? "rotate(180deg)" : "none",
                  }}
                />
              </IconButton>
            </Stack>
            <Collapse in={mobileExpand === key}>
              <Stack sx={{ pl: 1, pb: 1 }}>
                {MEGA[key].items.map((it) => (
                  <Link
                    key={it.title}
                    href={it.href}
                    style={{ textDecoration: "none" }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "center",
                        py: 1,
                        color: "rgba(255,255,255,0.75)",
                        "&:hover": { color: "#fff" },
                      }}
                    >
                      <Box
                        sx={{
                          color: LIME,
                          display: "flex",
                          "& svg": { fontSize: 18 },
                        }}
                      >
                        {it.icon}
                      </Box>
                      <Typography sx={{ fontSize: 14 }}>{it.title}</Typography>
                    </Stack>
                  </Link>
                ))}
              </Stack>
            </Collapse>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          </Box>
        ))}

        <Link
          href="#"
          style={{ textDecoration: "none" }}
          onClick={() => setDrawerOpen(false)}
        >
          <Typography sx={{ ...mobileLinkSx, color: "#fff" }}>About</Typography>
        </Link>

        <Stack spacing={1.2} mt={3}>
          <Button
            fullWidth
            disableElevation
            sx={{
              bgcolor: LIME,
              color: "#000",
              fontWeight: 700,
              py: 1.1,
              borderRadius: "999px",
            }}
          >
            Explore Product
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.25)",
              color: "#fff",
              py: 1.1,
              borderRadius: "999px",
            }}
          >
            Request Demo
          </Button>
          <Button
            fullWidth
            startIcon={<PhoneInTalkRoundedIcon />}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.18)",
              color: "#fff",
              py: 1.1,
              borderRadius: "999px",
            }}
          >
            Contact Us
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
