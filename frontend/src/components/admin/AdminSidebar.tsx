"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { ADMIN_MENU, type NavItem } from "@/data/adminMenu";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const LIME = "#c8ff00";

function Badge({ n, mini = false }: { n: number; mini?: boolean }) {
  return (
    <Box
      sx={{
        minWidth: 18,
        height: 18,
        px: 0.6,
        borderRadius: "999px",
        bgcolor: mini ? LIME : "rgba(200,255,0,0.15)",
        color: mini ? "#0a0a0a" : LIME,
        fontSize: 14,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: mini ? "none" : `1px solid ${LIME}44`,
      }}
    >
      {n}
    </Box>
  );
}

export default function AdminSidebar({
  collapsed,
  onExpand,
  onNavigate,
}: {
  collapsed: boolean;
  onExpand?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>([]);
  const [counts, setCounts] = useState<DashboardStats | null>(null);

  // Live "new item" counts for the nav badges.
  useEffect(() => {
    let active = true;
    api
      .get<DashboardStats>("/api/dashboard/stats")
      .then((s) => {
        if (active) setCounts(s);
      })
      .catch(() => {
        /* badges are decoration - a failure here must not break the nav */
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const badgeFor = (key: string): number | undefined => {
    if (!counts) return undefined;
    const map: Record<string, number> = {
      leads: counts.quotes.new + counts.contacts.new,
      "/dashboard/leads/quotes": counts.quotes.new,
      "/dashboard/leads/contact": counts.contacts.new,
      messages: counts.quotes.new + counts.contacts.new,
    };
    const n = map[key];
    return n && n > 0 ? n : undefined;
  };

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(href + "/"));
  const parentActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  // auto-open the group containing the active route
  useEffect(() => {
    const activeParent = ADMIN_MENU.find((i) => i.children && parentActive(i));
    if (activeParent)
      setOpen((o) =>
        o.includes(activeParent.key) ? o : [...o, activeParent.key],
      );
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key: string) =>
    setOpen((o) =>
      o.includes(key) ? o.filter((k) => k !== key) : [...o, key],
    );

  const rowSx = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "100%",
    px: collapsed ? 0 : 1.5,
    py: 1.15,
    borderRadius: "12px",
    cursor: "pointer",
    justifyContent: collapsed ? "center" : "flex-start",
    border: "none",
    background: "transparent",
    fontFamily: "inherit",
    textAlign: "left" as const,
    color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",
    bgcolor: active ? LIME : "transparent",
    transition: "background .2s, color .2s",
    "&:hover": {
      bgcolor: active ? LIME : "rgba(255,255,255,0.06)",
      color: active ? "#0a0a0a" : "#fff",
    },
    "& .nav-ic": { fontSize: 21, flexShrink: 0, display: "flex" },
  });

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0c0d0c",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* logo */}
      <Box
        sx={{
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 0 : 2.5,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          style={{ display: "flex", alignItems: "center" }}
        >
          {collapsed ? (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: LIME,
                color: "#0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              T
            </Box>
          ) : (
            <Box sx={{ position: "relative", width: 150, height: 42 }}>
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                sizes="150px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </Box>
          )}
        </Link>
      </Box>

      {/* nav */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: collapsed ? 1 : 1.5,
          py: 2,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.12)",
            borderRadius: 10,
          },
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              px: 1.5,
              mb: 1,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            Menu
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {ADMIN_MENU.map((item) => {
            const active = isActive(item.href) || parentActive(item);
            const isOpen = open.includes(item.key);

            // leaf link
            if (!item.children) {
              const node = (
                <Box
                  component={Link}
                  href={item.href!}
                  onClick={onNavigate}
                  sx={rowSx(isActive(item.href))}
                >
                  <Box className="nav-ic">{item.icon}</Box>
                  {!collapsed && (
                    <Typography sx={{ flex: 1, fontSize: 20, fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                  )}
                  {!collapsed && badgeFor(item.key) ? (
                    <Badge n={badgeFor(item.key)!} />
                  ) : null}
                </Box>
              );
              return collapsed ? (
                <Tooltip
                  key={item.key}
                  title={item.title}
                  placement="right"
                  arrow
                >
                  {node}
                </Tooltip>
              ) : (
                <Box key={item.key}>{node}</Box>
              );
            }

            // parent with submenu
            const parentBtn = (
              <Box
                component="button"
                onClick={() => {
                  if (collapsed) {
                    onExpand?.();
                    setOpen((o) =>
                      o.includes(item.key) ? o : [...o, item.key],
                    );
                  } else {
                    toggle(item.key);
                  }
                }}
                sx={rowSx(active)}
              >
                <Box className="nav-ic">{item.icon}</Box>
                {!collapsed && (
                  <Typography sx={{ flex: 1, fontSize: 20, fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                )}
                {!collapsed && badgeFor(item.key) ? (
                  <Badge n={badgeFor(item.key)!} />
                ) : null}
                {!collapsed && (
                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      fontSize: 18,
                      transition: "transform .25s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                )}
              </Box>
            );

            return (
              <Box key={item.key}>
                {collapsed ? (
                  <Tooltip title={item.title} placement="right" arrow>
                    {parentBtn}
                  </Tooltip>
                ) : (
                  parentBtn
                )}

                {!collapsed && (
                  <Collapse in={isOpen}>
                    <Box
                      sx={{
                        ml: 2.5,
                        mt: 0.5,
                        pl: 1.5,
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                      }}
                    >
                      {item.children.map((c) => {
                        const cActive = isActive(c.href);
                        return (
                          <Box
                            key={c.href}
                            component={Link}
                            href={c.href}
                            onClick={onNavigate}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                              px: 1.2,
                              py: 0.9,
                              borderRadius: "9px",
                              textDecoration: "none",
                              transition: "all .2s",
                              color: cActive ? LIME : "rgba(255,255,255,0.55)",
                              bgcolor: cActive
                                ? "rgba(200,255,0,0.08)"
                                : "transparent",
                              "&:hover": {
                                color: "#fff",
                                bgcolor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                flexShrink: 0,
                                bgcolor: cActive
                                  ? LIME
                                  : "rgba(255,255,255,0.3)",
                              }}
                            />
                            <Typography
                              sx={{ flex: 1, fontSize: 16, fontWeight: 600 }}
                            >
                              {c.title}
                            </Typography>
                            {badgeFor(c.href) ? (
                              <Badge n={badgeFor(c.href)!} />
                            ) : null}
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* footer */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "rgba(200,255,0,0.05)",
              border: `1px solid ${LIME}22`,
            }}
          >
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 800, color: "#fff", mb: 0.3 }}
            >
              24/7 Dispatch
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              All systems operational
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
