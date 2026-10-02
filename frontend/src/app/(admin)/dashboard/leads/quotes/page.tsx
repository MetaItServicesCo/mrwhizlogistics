"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { Quote } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  Field,
  LIME,
  FormDialog,
  PageHeader,
  SearchBox,
  SelectField,
  StatusChip,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "website", label: "Quote form" },
  { value: "chatbot", label: "AI assistant" },
];

const isChat = (r: Quote) => r.source === "chatbot";

/** A chat lead that asked for a call and hasn't been handled yet. */
const callNow = (r: Quote) => isChat(r) && !!r.callback_requested && (r.status || "new") === "new";

function SourceBadge({ row }: { row: Quote }) {
  if (!isChat(row)) return null;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        ml: 1,
        px: 0.8,
        py: 0.1,
        borderRadius: "999px",
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: 0.3,
        verticalAlign: "middle",
        ...(callNow(row)
          ? { bgcolor: LIME, color: "#0a0a0a" }
          : { bgcolor: "rgba(200,255,0,0.12)", color: LIME }),
      }}
    >
      {callNow(row) ? <PhoneInTalkRoundedIcon sx={{ fontSize: 12 }} /> : <SmartToyRoundedIcon sx={{ fontSize: 12 }} />}
      {callNow(row) ? "CALL NOW" : "AI CHAT"}
    </Box>
  );
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "closed", label: "Closed" },
];

export default function QuotesPage() {
  const { items, loading, error, reload } = useResource<Quote>("/api/quotes");
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [editing, setEditing] = useState<Quote | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [form, setForm] = useState({ status: "new", details: "" });
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (statusFilter !== "all" && (r.status || "new") !== statusFilter)
        return false;
      if (sourceFilter !== "all" && (r.source || "website") !== sourceFilter)
        return false;
      if (!q) return true;
      return [r.name, r.email, r.phone, r.selected_service, r.pickup, r.drop]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, statusFilter, sourceFilter]);

  const openEdit = (row: Quote) => {
    setError(null);
    setForm({ status: row.status || "new", details: row.details || "" });
    setEditing(row);
  };

  const save = async () => {
    if (!editing) return;
    const ok = await run(() =>
      api.patch(`/api/quotes/${editing.id}`, {
        status: form.status,
        details: form.details || null,
      }),
    );
    if (ok) {
      setEditing(null);
      setToast("Quote request updated.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/quotes/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Quote request deleted.");
      void reload();
    } else {
      setToast(null);
    }
  };

  const columns: Column<Quote>[] = [
    {
      key: "name",
      label: "Customer",
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {r.name}
            <SourceBadge row={r} />
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {[r.email, r.phone].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </Box>
      ),
    },
    { key: "selected_service", label: "Service", hideBelow: "md" },
    {
      key: "route",
      label: "Route",
      hideBelow: "lg",
      render: (r) => (
        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          {r.pickup || "—"} → {r.drop || "—"}
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "Received",
      hideBelow: "sm",
      render: (r) => fmtDateTime(r.created_at),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusChip status={r.status} />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Quote Requests"
        subtitle={`${items.length} request${items.length === 1 ? "" : "s"} from the website quote form and the AI assistant.`}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, phone…"
          />
          <SelectField
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            size="small"
            fullWidth={false}
            sx={{ minWidth: 160 }}
            options={SOURCE_OPTIONS}
          />
          <SelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            fullWidth={false}
            sx={{ minWidth: 170 }}
            options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS]}
          />
        </Box>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching requests" : "No quote requests yet"}
        emptyHint={
          items.length
            ? "Try a different search or status filter."
            : "Requests from the website quote form and the AI assistant will land here."
        }
        actions={[
          { icon: "edit", label: "Update status", onClick: openEdit },
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            onClick: (r) => {
              setError(null);
              setDeleting(r);
            },
          },
        ]}
      />

      <FormDialog
        open={!!editing}
        title={editing ? `Quote from ${editing.name}` : ""}
        busy={busy}
        error={actionError}
        submitLabel="Save changes"
        onSubmit={() => void save()}
        onClose={() => setEditing(null)}
      >
        {editing && callNow(editing) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "rgba(200,255,0,0.08)",
              border: `1px solid ${LIME}55`,
            }}
          >
            <PhoneInTalkRoundedIcon sx={{ color: LIME }} />
            <Typography sx={{ flex: 1, minWidth: 180, fontSize: 13, color: "#fff" }}>
              This visitor asked the AI assistant for a call back. Set the status to Contacted once you&apos;ve called.
            </Typography>
            {editing.phone && (
              <Button
                href={`tel:${editing.phone.replace(/[^\d+]/g, "")}`}
                sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "999px", px: 2, "&:hover": { bgcolor: "#d4ff33" } }}
              >
                Call {editing.phone}
              </Button>
            )}
          </Box>
        )}
        {editing && (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              ["Source", isChat(editing) ? "AI assistant" : "Quote form"],
              ["Email", editing.email || "—"],
              ["Phone", editing.phone || "—"],
              ["Service", editing.selected_service],
              ["Pickup", editing.pickup || "—"],
              ["Drop", editing.drop || "—"],
              ["Received", fmtDateTime(editing.created_at)],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", gap: 2, py: 0.4 }}>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.45)",
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  {k}
                </Typography>
                <Typography
                  sx={{ fontSize: 12.5, color: "#fff", wordBreak: "break-word" }}
                >
                  {v}
                </Typography>
              </Box>
            ))}
            {editing.chat_session_id && (
              <Button
                href={`/dashboard/chatbot?conversation=${editing.chat_session_id}`}
                startIcon={<SmartToyRoundedIcon />}
                sx={{ mt: 1, color: LIME, textTransform: "none", fontWeight: 700, px: 0 }}
              >
                Read the chat conversation
              </Button>
            )}
          </Box>
        )}

        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <Field
          label="Details / internal notes"
          value={form.details}
          onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
          multiline
          minRows={4}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete quote request?"
        message={`This permanently removes the request from ${deleting?.name ?? ""}. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
