"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { chatAdmin } from "@/lib/chatClient";
import { ConfirmDialog, EmptyState, ErrorState, LIME, LoadingState, Panel, SearchBox, fmtDateTime } from "@/components/admin/ui";
import { type ConversationRow, Pill, ROUTE_LABELS, type TranscriptMessage, friendlyError, useChatAdmin } from "./shared";

interface Listing {
  items: ConversationRow[];
  total: number;
  page: number;
  size: number;
}

const PAGE_SIZE = 25;
const FILTERS = [
  { value: "all", label: "All" },
  { value: "leads", label: "Leads" },
  { value: "handoff", label: "Asked for a person" },
  { value: "proactive", label: "From invites" },
  { value: "flagged", label: "Flagged" },
];

function badges(c: ConversationRow) {
  return (
    <>
      {c.lead_id && <Pill tone="lime" label="LEAD" />}
      {!c.lead_id && c.lead_stage !== "none" && <Pill label="LEAD STARTED" />}
      {c.proactive && <Pill label="INVITED" />}
      {c.handoff && <Pill label="PERSON" />}
      {c.flagged && <Pill tone="warn" label="FLAGGED" />}
    </>
  );
}

export function TranscriptDrawer({
  conversationId,
  onClose,
  onDeleted,
}: {
  conversationId: string | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { data, loading, error, reload } = useChatAdmin<ConversationRow & { messages: TranscriptMessage[] }>(
    conversationId ? `/conversations/${conversationId}` : null,
  );
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = async () => {
    if (!conversationId) return;
    setBusy(true);
    setDeleteError(null);
    try {
      await chatAdmin(`/conversations/${conversationId}`, { method: "DELETE" });
      setConfirm(false);
      onDeleted();
    } catch (e) {
      setDeleteError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(conversationId)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, bgcolor: "#0b0c0b", color: "#fff", borderLeft: "1px solid rgba(255,255,255,0.08)" } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Typography component="h2" sx={{ flex: 1, fontSize: 16, fontWeight: 800 }}>
          Conversation
        </Typography>
        <IconButton aria-label="Delete conversation" onClick={() => setConfirm(true)} sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#ff8a8a" } }}>
          <DeleteOutlineRoundedIcon />
        </IconButton>
        <IconButton aria-label="Close" onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)" }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
        {loading ? (
          <LoadingState label="Loading conversation…" />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data ? (
          <>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1 }}>{badges(data)}</Box>
            <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 2 }}>
              Started {fmtDateTime(data.created_at)}
              {data.page_url ? ` on ${data.page_url}` : ""}
              {data.language && data.language !== "en" ? ` · language: ${data.language}` : ""}
            </Typography>
            {data.lead_id && (
              <Button
                href="/dashboard/leads/quotes"
                sx={{ mb: 2, bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "999px", px: 2, "&:hover": { bgcolor: "#d4ff33" } }}
              >
                Open lead #{data.lead_id} in Quote Requests
              </Button>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {data.messages.map((m) => (
                <Box key={m.id} sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                  <Box
                    sx={{
                      px: 1.6,
                      py: 1.1,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                      ...(m.role === "user"
                        ? { bgcolor: LIME, color: "#0a0a0a", fontWeight: 500 }
                        : { bgcolor: "#16181a", color: "rgba(255,255,255,0.9)", border: m.flagged ? "1px solid #ffbf66" : "1px solid rgba(255,255,255,0.05)" }),
                    }}
                  >
                    {m.content}
                  </Box>
                  <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", mt: 0.4, textAlign: m.role === "user" ? "right" : "left" }}>
                    {fmtDateTime(m.created_at)}
                    {m.role === "assistant" && m.route ? ` · ${ROUTE_LABELS[m.route] ?? m.route}` : ""}
                    {m.latency_ms ? ` · ${(m.latency_ms / 1000).toFixed(1)}s` : ""}
                    {m.flagged ? " · guard rewrote this reply" : ""}
                  </Typography>
                  {m.sources.length > 0 && (
                    <Box sx={{ mt: 0.4, display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                      {m.sources.map((s) => (
                        <Box key={s.url} component="a" href={s.url} target="_blank" rel="noopener" sx={{ fontSize: 11, color: LIME }}>
                          {s.title}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </>
        ) : null}
      </Box>
      <ConfirmDialog
        open={confirm}
        title="Delete this conversation?"
        message={`The transcript is removed permanently. A lead it created stays in Quote Requests.${deleteError ? ` (${deleteError})` : ""}`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setConfirm(false)}
      />
    </Drawer>
  );
}

export default function ChatbotConversations({
  openId,
  onOpen,
}: {
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ filter, page: String(page), size: String(PAGE_SIZE) });
  if (query) params.set("q", query);
  const { data, loading, error, reload } = useChatAdmin<Listing>(`/conversations?${params}`);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Tabs
          value={filter}
          onChange={(_, v) => {
            setFilter(v);
            setPage(1);
          }}
          sx={{ flex: 1, minHeight: 0, "& .MuiTab-root": { color: "rgba(255,255,255,0.6)", textTransform: "none", minHeight: 40 }, "& .Mui-selected": { color: `${LIME} !important` }, "& .MuiTabs-indicator": { bgcolor: LIME } }}
        >
          {FILTERS.map((f) => (
            <Tab key={f.value} value={f.value} label={f.label} />
          ))}
        </Tabs>
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            setQuery(search.trim());
            setPage(1);
          }}
        >
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              if (!v.trim()) {
                setQuery("");
                setPage(1);
              }
            }}
            placeholder="Search messages… (Enter)"
          />
        </Box>
      </Box>

      {loading && !data ? (
        <LoadingState label="Loading conversations…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={query || filter !== "all" ? "No matching conversations" : "No conversations yet"}
          hint={query || filter !== "all" ? "Try another filter or search." : "Conversations appear here as soon as visitors use the assistant."}
        />
      ) : (
        <>
          <Panel>
            {data.items.map((c, i) => (
              <Box
                key={c.id}
                component="button"
                type="button"
                onClick={() => onOpen(c.id)}
                sx={{
                  all: "unset",
                  boxSizing: "border-box",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  px: { xs: 2, md: 2.5 },
                  py: 1.6,
                  cursor: "pointer",
                  borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none",
                  "&:hover, &:focus-visible": { bgcolor: "rgba(255,255,255,0.03)" },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title || "(no message)"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    {fmtDateTime(c.updated_at)} · {c.message_count} messages{c.page_url ? ` · ${c.page_url}` : ""}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>{badges(c)}</Box>
              </Box>
            ))}
          </Panel>
          {data.total > PAGE_SIZE && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil(data.total / PAGE_SIZE)}
                page={page}
                onChange={(_, p) => setPage(p)}
                sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.7)" }, "& .Mui-selected": { bgcolor: `${LIME} !important`, color: "#0a0a0a" } }}
              />
            </Box>
          )}
        </>
      )}

      <TranscriptDrawer
        conversationId={openId}
        onClose={() => onOpen(null)}
        onDeleted={() => {
          onOpen(null);
          void reload();
        }}
      />
    </Box>
  );
}
