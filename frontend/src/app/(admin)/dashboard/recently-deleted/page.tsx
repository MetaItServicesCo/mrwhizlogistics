"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { api } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/useResource";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LIME,
  LoadingState,
  PageHeader,
  Panel,
  SearchBox,
  SelectField,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";

interface DeletedItem {
  id: number;
  entity: string;
  type_label: string;
  title: string | null;
  item_count: number;
  deleted_by: string | null;
  deleted_at: string;
  expires_at: string;
  included: string[];
}

// Server times are UTC without a zone suffix.
const asUtc = (iso: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);

function timeLeft(expires: string): { label: string; urgent: boolean } {
  const ms = asUtc(expires).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  if (hours < 24) return { label: hours <= 1 ? "Less than an hour left" : `${hours} hours left`, urgent: true };
  const days = Math.ceil(hours / 24);
  return { label: `${days} day${days === 1 ? "" : "s"} left`, urgent: days <= 1 };
}

/**
 * Dashboard -> Recently deleted: anything deleted in the dashboard can be
 * restored for 7 days (with whatever was deleted along with it), then it is
 * removed for good.
 */
export default function RecentlyDeletedPage() {
  const { items, loading, error, reload } = useResource<DeletedItem>("/api/recycle-bin");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [purging, setPurging] = useState<DeletedItem | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const types = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((i) => seen.set(i.entity, i.type_label));
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (type === "all" || i.entity === type) &&
        (!q || [i.title, i.type_label, i.deleted_by].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [items, search, type]);

  const restore = async (item: DeletedItem) => {
    setBusyId(item.id);
    try {
      const res = await api.post<{ message: string }>(`/api/recycle-bin/${item.id}/restore`, {});
      setToast({ message: res.message, severity: "success" });
      await reload();
    } catch (e) {
      setToast({ message: errorMessage(e), severity: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const purge = async () => {
    if (!purging) return;
    setBusyId(purging.id);
    try {
      await api.del(`/api/recycle-bin/${purging.id}`);
      setToast({ message: `“${purging.title ?? purging.type_label}” was deleted permanently.`, severity: "success" });
      setPurging(null);
      await reload();
    } catch (e) {
      setToast({ message: errorMessage(e), severity: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Recently deleted"
        subtitle="Anything deleted in the dashboard stays here for 7 days. Restore it to put it back exactly as it was."
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <SearchBox value={search} onChange={setSearch} placeholder="Search deleted items…" />
          <SelectField
            value={type}
            onChange={(e) => setType(e.target.value)}
            size="small"
            fullWidth={false}
            sx={{ minWidth: 190 }}
            options={[{ value: "all", label: "All types" }, ...types.map(([value, label]) => ({ value, label }))]}
          />
        </Box>
      </PageHeader>

      {loading && !items.length ? (
        <LoadingState label="Loading deleted items…" />
      ) : error && !items.length ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState
          title={items.length ? "No matching items" : "Nothing deleted in the last 7 days"}
          hint={items.length ? "Try another search or type." : "Deleted posts, services, leads, pages and more appear here for 7 days."}
        />
      ) : (
        <Panel>
          {rows.map((item, index) => {
            const left = timeLeft(item.expires_at);
            const busy = busyId === item.id;
            return (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  px: { xs: 2, md: 2.5 },
                  py: 1.8,
                  borderTop: index ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.4 }}>
                    <Box
                      component="span"
                      sx={{ px: 1, py: 0.2, borderRadius: "999px", fontSize: 11, fontWeight: 800, bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
                    >
                      {item.type_label.toUpperCase()}
                    </Box>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#fff", overflowWrap: "anywhere" }}>
                      {item.title || "(untitled)"}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
                    Deleted {fmtDateTime(asUtc(item.deleted_at).toISOString())}
                    {item.deleted_by ? ` by ${item.deleted_by}` : ""}
                    {item.included.length ? ` · comes back with ${item.included.join(", ")}` : ""}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: left.urgent ? "#ffbf66" : "rgba(255,255,255,0.55)", minWidth: 120 }}>
                  {left.label}
                </Typography>
                <Button
                  onClick={() => void restore(item)}
                  disabled={busy}
                  startIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <RestoreRoundedIcon />}
                  aria-label={`Restore ${item.title ?? item.type_label}`}
                  sx={{
                    bgcolor: LIME,
                    color: "#0a0a0a",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    "&:hover": { bgcolor: "#d4ff33" },
                    "&.Mui-disabled": { bgcolor: "rgba(200,255,0,0.3)", color: "#0a0a0a" },
                  }}
                >
                  Restore
                </Button>
                <Tooltip title="Delete permanently">
                  <span>
                    <IconButton
                      aria-label={`Delete ${item.title ?? item.type_label} permanently`}
                      disabled={busy}
                      onClick={() => setPurging(item)}
                      sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#ff8a8a" } }}
                    >
                      <DeleteForeverRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            );
          })}
        </Panel>
      )}

      <ConfirmDialog
        open={Boolean(purging)}
        title="Delete permanently?"
        message={purging ? `“${purging.title ?? purging.type_label}” will be gone for good and can't be restored.` : ""}
        confirmLabel="Delete permanently"
        busy={busyId === purging?.id}
        onConfirm={() => void purge()}
        onClose={() => setPurging(null)}
      />
      <Toast message={toast?.message ?? null} severity={toast?.severity} onClose={() => setToast(null)} />
    </Box>
  );
}
