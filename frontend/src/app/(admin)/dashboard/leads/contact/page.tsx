"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { ContactInquiry } from "@/lib/types";
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

export default function ContactMessagesPage() {
  const { items, loading, error, reload } =
    useResource<ContactInquiry>("/api/contact-us");
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<ContactInquiry | null>(null);
  const [deleting, setDeleting] = useState<ContactInquiry | null>(null);
  const [form, setForm] = useState({ status: "new" });
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (statusFilter !== "all" && (r.status || "new") !== statusFilter)
        return false;
      if (!q) return true;
      return [
        r.full_name,
        r.email,
        r.phone_number,
        r.company_name,
        r.service_needed,
        r.message,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, statusFilter]);

  const openView = (row: ContactInquiry) => {
    setError(null);
    setForm({ status: row.status || "new" });
    setViewing(row);
  };

  const save = async () => {
    if (!viewing) return;
    const ok = await run(() =>
      api.patch(`/api/contact-us/${viewing.id}`, { status: form.status }),
    );
    if (ok) {
      setViewing(null);
      setToast("Message updated.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/contact-us/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Message deleted.");
      void reload();
    }
  };

  const columns: Column<ContactInquiry>[] = [
    {
      key: "full_name",
      label: "From",
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {r.full_name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {r.email}
            {r.phone_number ? ` · ${r.phone_number}` : ""}
          </Typography>
        </Box>
      ),
    },
    { key: "company_name", label: "Company", hideBelow: "lg" },
    { key: "service_needed", label: "Service", hideBelow: "md" },
    {
      key: "message",
      label: "Message",
      hideBelow: "lg",
      render: (r) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 280,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {r.message || "—"}
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
        title="Contact Messages"
        subtitle={`${items.length} message${items.length === 1 ? "" : "s"} from the website contact form.`}
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
        emptyTitle={items.length ? "No matching messages" : "No messages yet"}
        emptyHint={
          items.length
            ? "Try a different search or status filter."
            : "Submissions from the website contact form will appear here."
        }
        actions={[
          { icon: "view", label: "Open message", onClick: openView },
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
        open={!!viewing}
        title={viewing ? `Message from ${viewing.full_name}` : ""}
        busy={busy}
        error={actionError}
        submitLabel="Save status"
        onSubmit={() => void save()}
        onClose={() => setViewing(null)}
        maxWidth="md"
      >
        {viewing && (
          <>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {[
                ["Email", viewing.email],
                ["Phone", viewing.phone_number || "—"],
                ["Company", viewing.company_name || "—"],
                ["Service", viewing.service_needed || "—"],
                ["Received", fmtDateTime(viewing.created_at)],
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
                    sx={{
                      fontSize: 12.5,
                      color: "#fff",
                      wordBreak: "break-word",
                    }}
                  >
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Field
              label="Message"
              value={viewing.message || "(no message)"}
              multiline
              minRows={5}
              slotProps={{ input: { readOnly: true } }}
            />
          </>
        )}

        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ status: e.target.value })}
          options={STATUS_OPTIONS}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete message?"
        message={`This permanently removes the message from ${deleting?.full_name ?? ""}. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
