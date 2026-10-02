"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { chatAdmin } from "@/lib/chatClient";
import { ErrorState, Field, LIME, LoadingState, Panel, Toast, fmtDateTime } from "@/components/admin/ui";
import { Pill, StatTile, friendlyError, useChatAdmin } from "./shared";

interface KnowledgeStatus {
  chunks: number;
  loaded_chunks: number;
  pages: { url: string; link: string | null; title: string | null; status: string; error: string | null; chunk_count: number; fetched_at: string | null }[];
  runs: {
    id: number;
    trigger: string;
    status: string;
    started_at: string;
    finished_at: string | null;
    pages_total: number;
    pages_changed: number;
    pages_failed: number;
    chunks_total: number;
    duration_s: number | null;
    error: string | null;
  }[];
}

interface SearchPreview {
  query: string;
  hits: { url: string; title: string; heading: string; content: string; similarity: number }[];
}

const pageLabel = (url: string) => (url === "kb://company" ? "Company details (Settings)" : url === "kb://facts" ? "Assistant facts (Chatbot settings)" : url);

export default function ChatbotKnowledge() {
  const { data, loading, error, reload } = useChatAdmin<KnowledgeStatus>("/knowledge");
  const [indexing, setIndexing] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [question, setQuestion] = useState("");
  const [preview, setPreview] = useState<SearchPreview | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const reindex = async () => {
    const lastId = data?.runs[0]?.id ?? 0;
    setIndexing(true);
    try {
      await chatAdmin("/knowledge/reindex", { method: "POST" });
    } catch (e) {
      setIndexing(false);
      setToast({ message: friendlyError(e), severity: "error" });
      return;
    }
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      try {
        const status = await chatAdmin<KnowledgeStatus>("/knowledge");
        const run = status.runs[0];
        if (run && run.id > lastId && run.status !== "running") {
          if (pollRef.current) clearInterval(pollRef.current);
          setIndexing(false);
          await reload();
          setToast(
            run.status === "ok"
              ? { message: `Knowledge updated: ${run.pages_changed} page${run.pages_changed === 1 ? "" : "s"} changed, ${run.chunks_total} passages indexed.`, severity: "success" }
              : { message: `Indexing failed: ${run.error || "unknown error"}`, severity: "error" },
          );
        }
      } catch {
        /* keep polling */
      }
      if (tries > 90 && pollRef.current) {
        clearInterval(pollRef.current);
        setIndexing(false);
        void reload();
      }
    }, 2000);
  };

  const test = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 2) return;
    setSearching(true);
    setSearchError(null);
    try {
      setPreview(await chatAdmin<SearchPreview>(`/knowledge/search?q=${encodeURIComponent(question.trim())}`));
    } catch (err) {
      setSearchError(friendlyError(err));
    } finally {
      setSearching(false);
    }
  };

  if (loading && !data) return <LoadingState label="Loading knowledge base…" />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const last = data.runs.find((r) => r.status !== "running");
  const realPages = data.pages.filter((p) => p.url.startsWith("/"));
  const problemPages = data.pages.filter((p) => p.status !== "ok");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography sx={{ flex: 1, minWidth: 240, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          The assistant answers from your live website. It re-reads every published page automatically every 30 minutes; only changed pages are re-processed.
        </Typography>
        <Button
          onClick={() => void reindex()}
          disabled={indexing}
          startIcon={indexing ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <RefreshRoundedIcon />}
          sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "999px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" }, "&.Mui-disabled": { bgcolor: "rgba(200,255,0,0.3)", color: "#0a0a0a" } }}
        >
          {indexing ? "Reading the website…" : "Re-read website now"}
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
        <StatTile label="Pages indexed" value={String(realPages.length)} />
        <StatTile label="Passages" value={data.chunks.toLocaleString()} hint={data.loaded_chunks !== data.chunks ? `${data.loaded_chunks} loaded (reloading…)` : "searchable now"} />
        <StatTile label="Last update" value={last?.finished_at ? fmtDateTime(last.finished_at) : "—"} hint={last ? `${last.trigger} · ${last.duration_s ?? "?"}s` : "Not indexed yet"} />
        <StatTile label="Problems" value={String(problemPages.length)} hint={problemPages.length ? "See pages below" : "All pages readable"} />
      </Box>

      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 0.5 }}>
          Test a question
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", mb: 2 }}>
          See which passages the assistant would read before answering. If nothing relevant comes up, the website doesn&apos;t cover it yet.
        </Typography>
        <Box component="form" onSubmit={test} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Field size="small" label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Do you have reefer trailers?" slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <Button type="submit" disabled={searching || question.trim().length < 2} startIcon={searching ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <SearchRoundedIcon />} sx={{ color: LIME, border: `1px solid ${LIME}55`, borderRadius: "999px", textTransform: "none", fontWeight: 700, px: 2, height: 40 }}>
            Search
          </Button>
        </Box>
        {searchError && <Typography sx={{ mt: 1.5, fontSize: 13, color: "#ff8a8a" }}>{searchError}</Typography>}
        {preview && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
            {preview.hits.length === 0 && <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Nothing indexed yet.</Typography>}
            {preview.hits.map((h, i) => (
              <Box key={`${h.url}-${i}`} sx={{ p: 1.5, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{h.title || pageLabel(h.url)}</Typography>
                  <Pill tone={h.similarity >= 0.6 ? "lime" : "muted"} label={`${Math.round(h.similarity * 100)}% match`} />
                </Box>
                <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden" }}>{h.content}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Panel>

      <Panel>
        <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", p: { xs: 2, md: 2.5 }, pb: 1 }}>
          Indexed pages
        </Typography>
        {data.pages.length === 0 ? (
          <Typography sx={{ px: 2.5, pb: 2.5, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Nothing indexed yet. The first run starts a few seconds after the assistant service starts, or use “Re-read website now”.
          </Typography>
        ) : (
          data.pages.map((p) => (
            <Box key={p.url} sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", px: { xs: 2, md: 2.5 }, py: 1.1, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography sx={{ fontSize: 13.5, color: "#fff", fontWeight: 600 }}>{p.title || pageLabel(p.url)}</Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)", overflowWrap: "anywhere" }}>
                  {p.link ? (
                    <Box component="a" href={p.link} target="_blank" rel="noopener" sx={{ color: "inherit" }}>
                      {p.url}
                    </Box>
                  ) : (
                    pageLabel(p.url)
                  )}
                  {p.error ? ` · ${p.error}` : ""}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.chunk_count} passages</Typography>
              <Pill tone={p.status === "ok" ? "lime" : "warn"} label={p.status === "ok" ? "OK" : p.status === "stale" ? "LAST FETCH FAILED" : "ERROR"} />
            </Box>
          ))
        )}
      </Panel>

      <Toast message={toast?.message ?? null} severity={toast?.severity} onClose={() => setToast(null)} />
    </Box>
  );
}
