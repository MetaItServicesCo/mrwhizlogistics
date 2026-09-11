"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const LIME = "#c8ff00";

function titleFromPath(pathname: string) {
  const seg = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function AdminHeader({
  onMobileMenu,
  onToggleCollapse,
}: {
  onMobileMenu: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 68,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: { xs: 2, md: 3 },
        bgcolor: "rgba(12,13,12,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* mobile hamburger */}
      <IconButton
        onClick={onMobileMenu}
        sx={{ display: { xs: "inline-flex", lg: "none" }, color: "#fff" }}
      >
        <MenuRoundedIcon />
      </IconButton>
      {/* desktop collapse toggle */}
      <IconButton
        onClick={onToggleCollapse}
        sx={{
          display: { xs: "none", lg: "inline-flex" },
          color: "rgba(255,255,255,0.7)",
          "&:hover": { color: LIME },
        }}
      >
        <MenuOpenRoundedIcon />
      </IconButton>

      {/* title */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: "1.05rem", md: "1.25rem" },
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {titleFromPath(pathname)}
        </Typography>
        <Typography
          sx={{
            display: { xs: "none", sm: "block" },
            fontSize: 11.5,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Welcome back, Admin
        </Typography>
      </Box>

      {/* search (desktop) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1,
          ml: "auto",
          px: 1.8,
          height: 40,
          borderRadius: "999px",
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          width: 260,
          transition: "border-color .2s",
          "&:focus-within": { borderColor: LIME },
        }}
      >
        <SearchRoundedIcon
          sx={{ fontSize: 19, color: "rgba(255,255,255,0.45)" }}
        />
        <InputBase
          placeholder="Search…"
          sx={{
            flex: 1,
            color: "#fff",
            fontSize: 14,
            "& input::placeholder": {
              color: "rgba(255,255,255,0.4)",
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* right actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ml: { xs: "auto", md: 0 },
        }}
      >
        <IconButton
          sx={{
            position: "relative",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            width: 40,
            height: 40,
            "&:hover": { color: LIME, borderColor: `${LIME}55` },
          }}
        >
          <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: LIME,
              border: "2px solid #0c0d0c",
            }}
          />
        </IconButton>

        {/* user */}
        <Box
          component="button"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
            pr: { xs: 0.5, sm: 1.2 },
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: LIME,
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            A
          </Box>
          <Typography
            sx={{
              display: { xs: "none", sm: "block" },
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Admin
          </Typography>
        </Box>

        <Menu
          anchorEl={anchor}
          open={!!anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                bgcolor: "#141514",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                "& .MuiMenuItem-root": {
                  fontSize: 14,
                  gap: 1.5,
                  py: 1.1,
                  "&:hover": { bgcolor: "rgba(200,255,0,0.08)", color: LIME },
                },
                "& svg": { fontSize: 19 },
              },
            },
          }}
        >
          <MenuItem onClick={() => setAnchor(null)}>
            <PersonRoundedIcon /> Profile
          </MenuItem>
          <MenuItem onClick={() => setAnchor(null)}>
            <SettingsRoundedIcon /> Settings
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <MenuItem
            onClick={() => setAnchor(null)}
            sx={{ color: "#ff6b6b !important" }}
          >
            <LogoutRoundedIcon /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
