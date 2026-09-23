"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { Subscriber } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  LIME,
  PageHeader,
  SearchBox,
  StatusChip,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";

export default function NewsletterPage() {
  const { items, loading, error, reload } =
    useResource<Subscriber>("/api/subscribers");
  const { busy, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Subscriber | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.email.toLowerCase().includes(q));
  }, [items, search]);

  const toggleActive = async (row: Subscriber) => {
    const ok = await run(() =>
      api.patch(`/api/subscribers/${row.id}`, { is_active: !row.is_active }),
    );
    if (ok) {
      setToast(row.is_active ? "Subscriber deactivated." : "Subscriber reactivated.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/subscribers/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Subscriber removed.");
      void reload();
    }
  };

  /** Export the current (filtered) list as CSV, generated in the browser. */
  const exportCsv = () => {
    const header = "email,status,subscribed_at\n";
    const body = rows
      .map(
        (r) =>
          `"${r.email}","${r.is_active ? "active" : "inactive"}","${r.created_at}"`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Exported ${rows.length} subscriber${rows.length === 1 ? "" : "s"}.`);
  };

  const columns: Column<Subscriber>[] = [
    { key: "email", label: "Email" },
    {
      key: "created_at",
      label: "Subscribed",
      hideBelow: "sm",
      render: (r) => fmtDateTime(r.created_at),
    },
    {
      key: "is_active",
      label: "Status",
      render: (r) => <StatusChip status={r.is_active ? "active" : "inactive"} />,
    },
    {
      key: "toggle",
      label: "Subscribed?",
      width: 110,
      render: (r) => (
        <Switch
          checked={r.is_active}
          disabled={busy}
          onChange={() => void toggleActive(r)}
          size="small"
          sx={{
            "& .Mui-checked": { color: LIME },
            "& .Mui-checked + .MuiSwitch-track": {
              backgroundColor: `${LIME} !important`,
            },
          }}
        />
      ),
    },
  ];

  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <Box>
      <PageHeader
        title="Newsletter"
        subtitle={`${items.length} subscriber${items.length === 1 ? "" : "s"} · ${activeCount} active`}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search email…"
          />
          <Button
            onClick={exportCsv}
            disabled={!rows.length}
            startIcon={<DownloadRoundedIcon />}
            sx={{
              color: LIME,
              border: `1px solid ${LIME}55`,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(200,255,0,0.08)" },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching subscribers" : "No subscribers yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : "Signups from the website mailing-list form will appear here."
        }
        actions={[
          {
            icon: "delete",
            label: "Remove",
            danger: true,
            onClick: (r) => {
              setError(null);
              setDeleting(r);
            },
          },
        ]}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remove subscriber?"
        message={`This permanently removes ${deleting?.email ?? ""} from the mailing list.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
