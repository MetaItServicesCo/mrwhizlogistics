"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChatHttpError, chatAdmin } from "@/lib/chatClient";
import { LIME } from "@/components/admin/ui";

export interface ConversationRow {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  message_count: number;
  language: string | null;
  page_url: string | null;
  last_route: string | null;
  lead_stage: string;
  lead_id: number | null;
  handoff: boolean;
  flagged: boolean;
  proactive: boolean;
}

export interface TranscriptMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  route: string | null;
  sources: { url: string; title: string }[];
  latency_ms: number | null;
  flagged: boolean;
  created_at: string;
}

export const ROUTE_LABELS: Record<string, string> = {
  knowledge: "Answered from site",
  lead: "Call back flow",
  handoff: "Asked for a person",
  smalltalk: "Small talk",
  off_topic: "Off topic",
  blocked: "Blocked",
  unknown: "Other",
};

export function friendlyError(e: unknown): string {
  if (e instanceof ChatHttpError) {
    if (e.status === 401) return "Your session has expired. Please sign in again.";
    return e.message;
  }
  return "The AI assistant service isn't reachable right now. Check that the chatbot container is running.";
}

/** GET from the chatbot admin API with loading/error state. */
export function useChatAdmin<T>(path: string | null) {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });
  const key = path ? `${path}#${nonce}` : null;

  useEffect(() => {
    if (!path || !key) return;
    let active = true;
    chatAdmin<T>(path).then(
      (data) => active && setResult({ key, data, error: null }),
      (e) => active && setResult((r) => ({ key, data: r.data, error: friendlyError(e) })),
    );
    return () => {
      active = false;
    };
  }, [path, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  // Previous data stays visible while a new page/filter loads.
  return { data: result.data, loading: Boolean(key) && result.key !== key, error: result.error, reload };
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "lime" | "muted" | "warn" }) {
  const styles = {
    lime: { bgcolor: `${LIME}22`, color: LIME },
    muted: { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" },
    warn: { bgcolor: "rgba(255,170,60,0.15)", color: "#ffbf66" },
  }[tone];
  return (
    <Box
      component="span"
      sx={{ px: 1, py: 0.2, borderRadius: "999px", fontSize: 11, fontWeight: 800, letterSpacing: 0.3, whiteSpace: "nowrap", ...styles }}
    >
      {label}
    </Box>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Box sx={{ p: 2.2, borderRadius: "14px", bgcolor: "#0f100f", border: "1px solid rgba(255,255,255,0.08)", minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", mb: 0.6 }}>{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{value}</Typography>
      {hint && <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)", mt: 0.6 }}>{hint}</Typography>}
    </Box>
  );
}
