"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { ErrorState, LoadingState, Panel } from "@/components/admin/ui";
import { ROUTE_LABELS, StatTile, useChatAdmin } from "./shared";

interface Stats {
  days: number;
  conversations: number;
  leads: number;
  conversion_rate: number;
  handoffs: number;
  flagged: number;
  messages: number;
  median_latency_ms: number | null;
  routes: Record<string, number>;
  daily: { date: string; conversations: number; leads: number }[];
  unanswered: { conversation_id: string; question: string; created_at: string }[];
  proactive: { shown: number; opened: number; leads: number };
}

interface SystemStatus {
  ok: boolean;
  problems: { area: "model" | "knowledge"; message: string }[];
  model: { provider: string; chat_model: string; reachable: boolean };
  knowledge: { chunks: number; last_success: string | null };
}

/** Live health: shown only when something needs attention. */
function StatusBanner() {
  const { data, error, reload } = useChatAdmin<SystemStatus>("/status");
  if (error) return <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>;
  if (!data) return null;
  if (data.ok)
    return (
      <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
        ● Model {data.model.chat_model} reachable · {data.knowledge.chunks} website passages indexed
      </Typography>
    );
  return (
    <Alert
      severity={data.problems.some((p) => p.area === "model") ? "error" : "warning"}
      action={
        <Button color="inherit" size="small" onClick={reload} sx={{ textTransform: "none", fontWeight: 700 }}>
          Re-check
        </Button>
      }
      sx={{ borderRadius: "12px" }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 0.5 }}>The assistant needs attention. Visitors currently get basic replies.</Typography>
      {data.problems.map((p) => (
        <Typography key={p.area} sx={{ fontSize: 13 }}>
          {p.area === "model" ? "AI model: " : "Website knowledge: "}
          {p.message}
        </Typography>
      ))}
    </Alert>
  );
}

// Deeper step of the brand lime: passes the dark-surface lightness band
// (the bright brand lime glares as a large fill). Validated with dataviz.
const BAR = "#7aa300";

function fillDays(daily: Stats["daily"], days: number) {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const out: Stats["daily"] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push(byDate.get(key) ?? { date: key, conversations: 0, leads: 0 });
  }
  return out;
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Conversations per day: one series, so no legend; leads in the tooltip. */
function DailyChart({ daily, days }: { daily: Stats["daily"]; days: number }) {
  const series = fillDays(daily, days);
  const max = Math.max(1, ...series.map((d) => d.conversations));
  const [hover, setHover] = useState<number | null>(null);
  const tip = hover !== null ? series[hover] : null;
  return (
    <Box>
      <Box sx={{ position: "relative", height: 170, display: "flex", alignItems: "flex-end", gap: "2px", px: 0.5 }}>
        {/* recessive gridline at the max */}
        <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, borderTop: "1px dashed rgba(255,255,255,0.08)" }} />
        <Typography sx={{ position: "absolute", right: 0, top: -18, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{max}</Typography>
        {series.map((d, i) => (
          <Box
            key={d.date}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            aria-label={`${shortDate(d.date)}: ${d.conversations} conversations, ${d.leads} leads`}
            // Hit target is the full column height, larger than the bar.
            sx={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", cursor: "default", outline: "none" }}
          >
            <Box
              sx={{
                width: "100%",
                height: `${(d.conversations / max) * 100}%`,
                minHeight: d.conversations ? 3 : 0,
                bgcolor: BAR,
                borderRadius: "4px 4px 0 0",
                opacity: hover === null || hover === i ? 1 : 0.55,
                transition: "opacity .15s",
              }}
            />
          </Box>
        ))}
        {tip && (
          <Box
            role="tooltip"
            sx={{
              position: "absolute",
              top: 0,
              left: `${Math.min(80, Math.max(0, (hover! / series.length) * 100 - 8))}%`,
              px: 1.2,
              py: 0.8,
              borderRadius: "8px",
              bgcolor: "#1c1d1c",
              border: "1px solid rgba(255,255,255,0.14)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{shortDate(tip.date)}</Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{tip.conversations} conversations</Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{tip.leads} leads</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.8, px: 0.5 }}>
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{shortDate(series[0].date)}</Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{shortDate(series[series.length - 1].date)}</Typography>
      </Box>
      {/* Table view of the same data for screen readers. */}
      <Box component="table" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        <caption>Conversations and leads per day</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Conversations</th>
            <th>Leads</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.conversations}</td>
              <td>{d.leads}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

export default function ChatbotOverview({ onOpenConversation }: { onOpenConversation: (id: string) => void }) {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useChatAdmin<Stats>(`/stats?days=${days}`);

  if (loading && !data) return <LoadingState label="Loading assistant analytics…" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const pct = (n: number) => `${(n * 100).toFixed(n > 0 && n < 0.1 ? 1 : 0)}%`;
  const routes = Object.entries(data.routes).sort((a, b) => b[1] - a[1]);
  const routeTotal = routes.reduce((sum, [, n]) => sum + n, 0) || 1;

  const pro = data.proactive;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <StatusBanner />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography sx={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          How visitors use the assistant, and how many become call-back leads.
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={days}
          onChange={(_, v) => v && setDays(v)}
          aria-label="Date range"
          sx={{ "& .MuiToggleButton-root": { color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.14)", textTransform: "none", px: 1.5 }, "& .Mui-selected": { color: "#0a0a0a !important", bgcolor: "#c8ff00 !important" } }}
        >
          <ToggleButton value={7}>7 days</ToggleButton>
          <ToggleButton value={30}>30 days</ToggleButton>
          <ToggleButton value={90}>90 days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
        <StatTile label="Conversations" value={data.conversations.toLocaleString()} hint={`${data.messages.toLocaleString()} messages`} />
        <StatTile label="Call-back leads" value={data.leads.toLocaleString()} hint={`${pct(data.conversion_rate)} of conversations`} />
        <StatTile label="Asked for a person" value={data.handoffs.toLocaleString()} />
        <StatTile
          label="Typical reply time"
          value={data.median_latency_ms !== null ? `${(data.median_latency_ms / 1000).toFixed(1)}s` : "—"}
          hint={data.flagged ? `${data.flagged} conversation${data.flagged === 1 ? "" : "s"} flagged by guards` : "No guard flags"}
        />
      </Box>

      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 0.5 }}>
          Proactive invites
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 2 }}>
          The call-back offer shown to visitors who stay on the site without opening the chat.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
          <StatTile label="Shown" value={pro.shown.toLocaleString()} />
          <StatTile label="Opened" value={pro.opened.toLocaleString()} hint={pro.shown ? `${pct(pro.opened / pro.shown)} of invites shown` : undefined} />
          <StatTile label="Leads from invites" value={pro.leads.toLocaleString()} hint={pro.opened ? `${pct(pro.leads / pro.opened)} of opened invites` : undefined} />
        </Box>
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 3 }}>
          Conversations per day
        </Typography>
        <DailyChart daily={data.daily} days={days} />
      </Panel>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" }, gap: 2 }}>
        <Panel sx={{ p: { xs: 2, md: 3 } }}>
          <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 2 }}>
            What visitors ask for
          </Typography>
          {routes.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>No conversations yet.</Typography>
          ) : (
            routes.map(([route, n]) => (
              <Box key={route} sx={{ mb: 1.4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.8)", mb: 0.5 }}>
                  <span>{ROUTE_LABELS[route] ?? route}</span>
                  <span>
                    {n} · {Math.round((n / routeTotal) * 100)}%
                  </span>
                </Box>
                <Box sx={{ height: 6, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.06)" }}>
                  <Box sx={{ height: "100%", width: `${(n / routeTotal) * 100}%`, bgcolor: BAR, borderRadius: "4px" }} />
                </Box>
              </Box>
            ))
          )}
        </Panel>

        <Panel sx={{ p: { xs: 2, md: 3 } }}>
          <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            Questions the website couldn&apos;t answer
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 2 }}>
            Add this information to a page (or to the assistant&apos;s facts in Settings) so the assistant can answer next time.
          </Typography>
          {data.unanswered.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>None in this period.</Typography>
          ) : (
            data.unanswered.map((u) => (
              <Box
                key={`${u.conversation_id}-${u.created_at}`}
                sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.8, borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Typography sx={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.85)", overflowWrap: "anywhere" }}>“{u.question}”</Typography>
                <Button size="small" onClick={() => onOpenConversation(u.conversation_id)} sx={{ color: "#c8ff00", textTransform: "none", fontWeight: 700, flexShrink: 0 }}>
                  View
                </Button>
              </Box>
            ))
          )}
        </Panel>
      </Box>
    </Box>
  );
}
