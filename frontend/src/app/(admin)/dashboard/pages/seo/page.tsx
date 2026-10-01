"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { SiteSetting } from "@/lib/types";
import { SEO_PAGES, seoPageCopy, seoPageSettingKey, type SeoPageCopy, type SeoPageId } from "@/lib/seoPages";
import { Field, LIME, PageHeader, Panel } from "@/components/admin/ui";

export default function SeoPagesAdmin() {
  const settings = useResource<SiteSetting>("/api/settings");
  const { busy, error, setError, run } = useAction();
  const [selected, setSelected] = useState<SeoPageId>("home");
  const [draft, setDraft] = useState<SeoPageCopy | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const page = SEO_PAGES.find((entry) => entry.id === selected)!;
  const key = seoPageSettingKey(selected);
  const row = settings.items.find((item) => item.key === key);
  const saved = seoPageCopy(selected, row?.value);
  const current = draft ?? saved;
  const dirty = current.title !== saved.title || current.description !== saved.description;

  const choose = (id: SeoPageId) => {
    if (id === selected) return;
    if (dirty && !window.confirm("Discard unsaved SEO changes?")) return;
    setSelected(id);
    setDraft(null);
    setError(null);
    setSavedMessage("");
  };

  const save = async () => {
    const title = current.title.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const description = current.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!title || !description) {
      setError("Enter both a meta title and description.");
      return;
    }
    const value = JSON.stringify({ title, description });
    const ok = await run(() => row
      ? api.patch(`/api/settings/${row.id}`, { value })
      : api.post("/api/settings", { key, value, label: `SEO metadata: ${page.label}` }));
    if (ok) {
      await settings.reload();
      setDraft(null);
      setSavedMessage(`${page.label} metadata saved. New page requests will use it now.`);
    }
  };

  return (
    <Box>
      <PageHeader
        title="SEO metadata"
        subtitle="Edit the search title and description for the six main pages. This does not change visible page content."
      />
      {settings.error && <Alert severity="error" sx={{ mb: 2 }}>{settings.error}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {savedMessage && <Alert severity="success" sx={{ mb: 2 }}>{savedMessage}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px minmax(0,1fr)" }, gap: 2.5 }}>
        <Panel sx={{ p: 1.5, alignSelf: "start" }}>
          {SEO_PAGES.map((entry) => (
            <Button
              key={entry.id}
              fullWidth
              onClick={() => choose(entry.id)}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                mb: 0.5,
                color: selected === entry.id ? "#0a0a0a" : "#fff",
                bgcolor: selected === entry.id ? LIME : "transparent",
                "&:hover": { bgcolor: selected === entry.id ? LIME : "rgba(255,255,255,0.08)" },
              }}
            >
              {entry.label}
            </Button>
          ))}
        </Panel>
        <Panel sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
            <Box>
              <Typography component="h2" sx={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{page.label}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{`https://mrwhizlogistics.com${page.path === "/" ? "" : page.path}`}</Typography>
            </Box>
            <Button component={Link} href={page.path} target="_blank" rel="noopener noreferrer" sx={{ color: LIME, textTransform: "none" }}>View page</Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Field
              label="Meta title"
              value={current.title}
              onChange={(event) => { setDraft({ ...current, title: event.target.value }); setSavedMessage(""); }}
              helperText={`${current.title.length} characters · Used exactly as entered; the brand is not added again.`}
              disabled={settings.loading || Boolean(settings.error) || busy}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Field
              label="Meta description"
              value={current.description}
              onChange={(event) => { setDraft({ ...current, description: event.target.value }); setSavedMessage(""); }}
              multiline
              minRows={3}
              helperText={`${current.description.length} characters · Plain text only.`}
              disabled={settings.loading || Boolean(settings.error) || busy}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button onClick={() => setDraft(null)} disabled={!dirty || busy} sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none" }}>Discard</Button>
              <Button
                onClick={save}
                disabled={!dirty || busy || settings.loading || Boolean(settings.error)}
                sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", px: 3, borderRadius: "10px", "&:hover": { bgcolor: "#d4ff33" } }}
              >
                {busy ? "Saving…" : "Save metadata"}
              </Button>
            </Box>
          </Box>
        </Panel>
      </Box>
    </Box>
  );
}
