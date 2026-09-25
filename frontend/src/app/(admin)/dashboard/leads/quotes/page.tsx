"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { Quote } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  Field,
  FormDialog,
  PageHeader,
  SearchBox,
  SelectField,
  StatusChip,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";

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
  const [editing, setEditing] = useState<Quote | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [form, setForm] = useState({ status: "new", details: "" });
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (statusFilter !== "all" && (r.status || "new") !== statusFilter)
        return false;
      if (!q) return true;
      return [r.name, r.email, r.phone, r.selected_service, r.pickup, r.drop]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, statusFilter]);

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
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {r.email}
            {r.phone ? ` · ${r.phone}` : ""}
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
        subtitle={`${items.length} request${items.length === 1 ? "" : "s"} from the website quote form.`}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search name, email…"
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
            : "Requests submitted from the website quote form will land here."
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
              ["Email", editing.email],
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
