"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import { api } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/useResource";
import type { NewsletterCampaign } from "@/lib/types";
import DataTable, { type Column } from "./DataTable";
import RichTextEditor from "./RichTextEditor";
import { ConfirmDialog, Field, LIME, PageHeader, Panel, StatusChip, Toast, fmtDateTime } from "./ui";

const EMPTY = { subject: "", preview_text: "", content_html: "" };

export default function NewsletterCampaigns({ activeSubscribers }: { activeSubscribers: number }) {
  const { items, loading, error: loadError, reload } = useResource<NewsletterCampaign>("/api/newsletter/campaigns");
  const [editing, setEditing] = useState<NewsletterCampaign | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const [deleting, setDeleting] = useState<NewsletterCampaign | null>(null);

  const canEdit = !editing || editing.status === "draft" || (editing.status === "failed" && editing.delivered_count === 0);
  const valid = draft.subject.trim() && draft.content_html.replace(/<[^>]*>/g, "").trim();

  const startNew = () => {
    setEditing(null);
    setDraft(EMPTY);
    setTestEmail("");
    setActionError(null);
    setOpen(true);
  };

  const edit = (row: NewsletterCampaign) => {
    setEditing(row);
    setDraft({ subject: row.subject, preview_text: row.preview_text || "", content_html: row.content_html });
    setTestEmail("");
    setActionError(null);
    setOpen(true);
  };

  const save = async (): Promise<NewsletterCampaign | null> => {
    if (!valid) return null;
    setBusy(true);
    setActionError(null);
    try {
      const payload = {
        subject: draft.subject.trim(),
        preview_text: draft.preview_text.trim() || null,
        content_html: draft.content_html,
      };
      const row = editing
        ? await api.put<NewsletterCampaign>(`/api/newsletter/campaigns/${editing.id}`, payload)
        : await api.post<NewsletterCampaign>("/api/newsletter/campaigns", payload);
      setEditing(row);
      setToast(editing ? "Campaign saved." : "Campaign draft created.");
      await reload();
      return row;
    } catch (e) {
      setActionError(errorMessage(e));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    if (!editing || !testEmail.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      const result = await api.post<{ message: string }>(`/api/newsletter/campaigns/${editing.id}/test`, { email: testEmail.trim() });
      setToast(result.message);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!editing) return;
    setBusy(true);
    setActionError(null);
    try {
      const result = await api.post<{ message: string }>(`/api/newsletter/campaigns/${editing.id}/send`);
      setToast(result.message);
      setConfirmSend(false);
      setOpen(false);
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
      setConfirmSend(false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.del(`/api/newsletter/campaigns/${deleting.id}`);
      setDeleting(null);
      setToast("Campaign deleted.");
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo<Column<NewsletterCampaign>[]>(() => [
    { key: "subject", label: "Subject" },
    { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    {
      key: "delivery",
      label: "Delivery",
      hideBelow: "sm",
      render: (r) => r.recipient_count ? `${r.delivered_count}/${r.recipient_count}${r.failed_count ? ` · ${r.failed_count} failed` : ""}` : "Not sent",
    },
    { key: "updated_at", label: "Updated", hideBelow: "md", render: (r) => fmtDateTime(r.updated_at) },
  ], []);

  return (
    <Box>
      <PageHeader title="Campaigns" subtitle={`${items.length} campaign${items.length === 1 ? "" : "s"} · ${activeSubscribers} active recipients`}>
        <Button onClick={startNew} startIcon={<AddRoundedIcon />} sx={{ bgcolor: LIME, color: "#090909", fontWeight: 800, textTransform: "none", borderRadius: "12px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" } }}>
          New campaign
        </Button>
      </PageHeader>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      {open && (
        <Panel sx={{ p: { xs: 2, md: 3 }, mb: 3, overflow: "visible" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 19, fontWeight: 800 }}>{editing ? "Edit campaign" : "New campaign"}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.48)", fontSize: 13 }}>Save a draft, send yourself a test, then confirm the live send.</Typography>
            </Box>
            <Button onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,.65)", textTransform: "none" }}>Close</Button>
          </Box>
          {!canEdit && <Alert severity="info" sx={{ mb: 2 }}>Sent campaigns are read-only delivery records.</Alert>}
          <Box sx={{ display: "grid", gap: 2 }}>
            <Field label="Email subject" required value={draft.subject} disabled={!canEdit} slotProps={{ htmlInput: { maxLength: 200 } }} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
            <Field label="Preview text" value={draft.preview_text} disabled={!canEdit} slotProps={{ htmlInput: { maxLength: 300 } }} helperText="Shown beside the subject by many inboxes." onChange={(e) => setDraft((d) => ({ ...d, preview_text: e.target.value }))} />
            <Box sx={!canEdit ? { pointerEvents: "none", opacity: .65 } : undefined}>
              <RichTextEditor label="Newsletter content" value={draft.content_html} onChange={(content_html) => setDraft((d) => ({ ...d, content_html }))} minHeight={320} placeholder="Write the newsletter…" />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
              {canEdit && (
                <Button disabled={busy || !valid} onClick={() => void save()} sx={{ bgcolor: LIME, color: "#090909", fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: "#d4ff33" } }}>Save draft</Button>
              )}
              {editing && editing.status !== "sent" && editing.status !== "sending" && (
                <>
                  <Field size="small" type="email" label="Test recipient" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} sx={{ width: { xs: "100%", sm: 280 } }} />
                  <Button disabled={busy || !testEmail.trim()} onClick={() => void test()} startIcon={<ScienceRoundedIcon />} sx={{ color: LIME, border: `1px solid ${LIME}55`, textTransform: "none", borderRadius: "10px" }}>Send test</Button>
                  <Button disabled={busy || activeSubscribers === 0} onClick={() => setConfirmSend(true)} startIcon={<SendRoundedIcon />} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,.2)", textTransform: "none", borderRadius: "10px" }}>{editing.status === "failed" ? "Retry failed deliveries" : "Send to subscribers"}</Button>
                </>
              )}
            </Box>
          </Box>
        </Panel>
      )}

      <DataTable columns={columns} rows={items} loading={loading} error={loadError} onRetry={reload} emptyTitle="No campaigns yet" emptyHint="Create a draft, test it, and send it to active subscribers." actions={[
        { icon: "edit", label: (r) => r.status === "sent" ? "View campaign" : "Edit campaign", onClick: edit },
        { icon: "delete", label: (r) => r.status === "sent" || r.delivered_count > 0 ? "Campaigns with deliveries are retained" : "Delete draft", danger: true, onClick: (r) => r.status === "sent" || r.delivered_count > 0 ? setActionError("Campaigns with deliveries are retained as delivery history.") : setDeleting(r) },
      ]} />

      <ConfirmDialog
        open={confirmSend}
        title={editing?.status === "failed" ? "Retry failed deliveries?" : "Send newsletter now?"}
        message={editing?.status === "failed"
          ? "Only recipients whose previous delivery failed will be retried. Successfully delivered addresses will not receive a duplicate."
          : `This will email ${activeSubscribers} active subscriber${activeSubscribers === 1 ? "" : "s"}. The campaign content cannot be edited after a successful send.`}
        confirmLabel={editing?.status === "failed" ? "Retry deliveries" : "Send newsletter"}
        busy={busy}
        onConfirm={() => void send()}
        onClose={() => setConfirmSend(false)}
      />
      <ConfirmDialog open={!!deleting} title="Delete campaign?" message={`Delete “${deleting?.subject || ""}”? Sent campaigns are protected and cannot be deleted.`} confirmLabel="Delete" busy={busy} onConfirm={() => void remove()} onClose={() => setDeleting(null)} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
