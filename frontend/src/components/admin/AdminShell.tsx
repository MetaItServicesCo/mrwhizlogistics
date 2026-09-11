"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const EXPANDED = 264;
const MINI = 78;

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#070807" }}>
      {/* desktop sidebar (fixed) */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          width: collapsed ? MINI : EXPANDED,
          flexShrink: 0,
          transition: "width .25s ease",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            width: collapsed ? MINI : EXPANDED,
            transition: "width .25s ease",
            zIndex: 30,
          }}
        >
          <AdminSidebar
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
          />
        </Box>
      </Box>

      {/* mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: { width: EXPANDED, border: "none", bgcolor: "transparent" },
          },
        }}
      >
        <AdminSidebar
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* main column */}
      <Box
        sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        <AdminHeader
          onMobileMenu={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <Box
          component="main"
          sx={{ flex: 1, p: { xs: 2, md: 3 }, color: "#fff" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
