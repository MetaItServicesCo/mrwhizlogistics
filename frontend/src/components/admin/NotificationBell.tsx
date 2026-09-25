"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/useResource";
import type { NotificationFeed, NotificationKind } from "@/lib/types";

const LIME = "#c8ff00";
const POLL_MS = 60_000;

const KIND_ICON: Record<NotificationKind, React.ReactNode> = {
  quote: <RequestQuoteRoundedIcon />,
  contact: <MailRoundedIcon />,
  rental: <LocalShippingRoundedIcon />,
  comment: <ChatBubbleRoundedIcon />,
  subscriber: <MarkEmailReadRoundedIcon />,
};

function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * The header bell: visitor submissions (quotes, rental requests, messages,
 * comments awaiting approval, subscribers), newest first. The badge counts
 * what arrived since this admin last opened the panel; opening it marks them
 * seen on the server, so the count is shared across devices.
 */
export default function NotificationBell() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const open = Boolean(anchor);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const load = useCallback(async () => {
    const data = await api.get<NotificationFeed>("/api/dashboard/notifications?limit=20");
    setFeed(data);
    setNow(Date.now());
    return data;
  }, []);

  // Badge: poll in the background, and refresh when the tab regains focus.
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (openRef.current || document.visibilityState !== "visible") return;
      load()
        .then((d) => alive && setUnread(d.unread))
        .catch(() => {}); // a missed poll is retried on the next tick
    };
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);

  const handleOpen = async (el: HTMLElement) => {
    setAnchor(el);
    setError(null);
    setLoading(true);
    try {
      const data = await load();
      // Keep the per-item "new" highlight for this viewing, clear the badge.
      if (data.unread > 0) {
        setUnread(0);
        await api.post("/api/dashboard/notifications/seen");
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const go = (href: string) => {
    setAnchor(null);
    router.push(href);
  };

  const items = feed?.items ?? [];
  const newCount = items.filter((i) => i.unread).length;

  return (
    <>
      <IconButton
        onClick={(e) => void handleOpen(e.currentTarget)}
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        sx={{
          color: open ? LIME : "rgba(255,255,255,0.7)",
          border: "1px solid",
          borderColor: open ? `${LIME}55` : "rgba(255,255,255,0.1)",
          width: 40,
          height: 40,
          "&:hover": { color: LIME, borderColor: `${LIME}55` },
        }}
      >
        <Badge
          badgeContent={unread}
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: LIME,
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: 10.5,
              minWidth: 18,
              height: 18,
              px: 0.5,
              border: "2px solid #0c0d0c",
            },
          }}
        >
          <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": "Notifications",
            sx: {
              mt: 1,
              width: 380,
              maxWidth: "calc(100vw - 24px)",
              bgcolor: "#141514",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.2,
            py: 1.6,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Notifications</Typography>
          {newCount > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: "999px",
                bgcolor: "rgba(200,255,0,0.12)",
                color: LIME,
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              {newCount} new
            </Box>
          )}
        </Box>

        <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
          {loading && !feed ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={26} sx={{ color: LIME }} />
            </Box>
          ) : error && !feed ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13.5, color: "#ff8a8a", mb: 1.5 }}>{error}</Typography>
              <Button
                size="small"
                onClick={() => anchor && void handleOpen(anchor)}
                sx={{ color: LIME, textTransform: "none", fontWeight: 700 }}
              >
                Try again
              </Button>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
              <DoneAllRoundedIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.25)", mb: 1 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>You&apos;re all caught up</Typography>
              <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", mt: 0.5 }}>
                New quote requests, messages and comments will show up here.
              </Typography>
            </Box>
          ) : (
            items.map((n) => (
              <Box
                key={n.id}
                component="button"
                onClick={() => go(n.href)}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  width: "100%",
                  textAlign: "left",
                  px: 2.2,
                  py: 1.5,
                  border: 0,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  bgcolor: n.unread ? "rgba(200,255,0,0.04)" : "transparent",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  "&:hover, &:focus-visible": { bgcolor: "rgba(200,255,0,0.08)", outline: "none" },
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: n.unread ? "rgba(200,255,0,0.14)" : "rgba(255,255,255,0.06)",
                    color: n.unread ? LIME : "rgba(255,255,255,0.55)",
                    "& svg": { fontSize: 18 },
                  }}
                >
                  {KIND_ICON[n.kind]}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: n.unread ? 800 : 600 }}>
                      {n.title}
                    </Typography>
                    <Typography sx={{ flexShrink: 0, fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>
                      {timeAgo(n.created_at, now)}
                    </Typography>
                  </Box>
                  {n.detail && (
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.55)",
                        mt: 0.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                      }}
                    >
                      {n.detail}
                    </Typography>
                  )}
                </Box>
                {n.unread && (
                  <Box
                    aria-label="new"
                    sx={{ flexShrink: 0, mt: 0.8, width: 8, height: 8, borderRadius: "50%", bgcolor: LIME }}
                  />
                )}
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", p: 1 }}>
          <Button
            fullWidth
            onClick={() => go("/dashboard/messages")}
            sx={{ color: LIME, textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
          >
            Open all messages
          </Button>
        </Box>
      </Popover>
    </>
  );
}
