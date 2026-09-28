"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { useAuth } from "@/lib/auth";
import { editTargetFor, rememberSitePath } from "@/lib/adminNav";

const LIME = "#c8ff00";
const COLLAPSED_KEY = "mrwhiz_admin_bar_collapsed";

const pillBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  px: { xs: 1.1, sm: 1.6 },
  height: 36,
  borderRadius: "999px",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background-color .2s, color .2s",
} as const;

const labelSx = { display: { xs: "none", sm: "inline" } } as const;

/**
 * Links are plain <a> on purpose: a full page load leaves the public site's
 * analytics behind. With client-side navigation Microsoft Clarity kept
 * running (and recording) inside the dashboard, which shows customer data.
 */

/**
 * Floating bar shown on the public site only to a signed-in admin: back to
 * the dashboard, or straight to the editor for the page on screen. Visitors
 * never see it (it renders nothing until an admin session is confirmed).
 */
export default function AdminBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  // Read lazily: the bar renders nothing until the admin session is
  // confirmed on the client, so server and client output always match.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  // "View site" in the dashboard returns to the last page viewed here.
  useEffect(() => {
    if (user) rememberSitePath(pathname);
  }, [user, pathname]);

  if (!user) return null;

  const toggle = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const edit = editTargetFor(pathname);

  return (
    <Box
      role="region"
      aria-label="Admin shortcuts"
      data-admin-bar
      sx={{
        position: "fixed",
        left: { xs: 12, md: 20 },
        bottom: { xs: 12, md: 20 },
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        p: 0.6,
        borderRadius: "999px",
        bgcolor: "rgba(14,15,14,0.92)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${LIME}55`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        color: "#fff",
      }}
    >
      {collapsed ? (
        <Tooltip title="Admin shortcuts">
          <IconButton
            aria-label="Show admin shortcuts"
            onClick={() => toggle(false)}
            sx={{ color: LIME, width: 36, height: 36 }}
          >
            <AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Box
            component="a"
            href="/dashboard"
            aria-label="Dashboard"
            sx={{ ...pillBtn, bgcolor: LIME, color: "#0a0a0a", "&:hover": { bgcolor: "#d4ff33" } }}
          >
            <DashboardRoundedIcon sx={{ fontSize: 18 }} />
            {/* Icon-only on phones so the bar stays clear of the chat button. */}
            <Box component="span" sx={labelSx}>Dashboard</Box>
          </Box>
          {edit && (
            <Box
              component="a"
              href={edit.href}
              aria-label={edit.label}
              sx={{
                ...pillBtn,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                "&:hover": { color: LIME, borderColor: `${LIME}88` },
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 16 }} />
              <Box component="span" sx={labelSx}>{edit.label}</Box>
            </Box>
          )}
          <Tooltip title="Hide">
            <IconButton
              aria-label="Hide admin shortcuts"
              onClick={() => toggle(true)}
              sx={{ color: "rgba(255,255,255,0.6)", width: 32, height: 32, "&:hover": { color: "#fff" } }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
}
