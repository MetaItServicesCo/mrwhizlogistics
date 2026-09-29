"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import { useDeepLinkEdit } from "@/lib/adminNav";
import { LEGAL_PAGES, legalPath } from "@/lib/legalPages";
import type { SitePage } from "@/lib/types";
import { EmptyState, ErrorState, Field, FormDialog, LIME, LoadingState, PageHeader, Panel, Toast, fmtDateTime } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const shrink = { inputLabel: { shrink: true } };

interface Draft {
  title: string;
  content: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
}

const LEGAL_SLUGS = new Set<string>(LEGAL_PAGES.map((p) => p.slug));
const selectLegal = (raw: unknown) =>
  (Array.isArray(raw) ? (raw as SitePage[]) : []).filter((p) => p.page_type === "legal" || LEGAL_SLUGS.has(p.slug));

const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * Dashboard -> Pages -> Legal pages: Privacy Policy, Terms & Conditions and
 * Services Disclaimer. Published pages are linked in the footer and sitemap;
 * drafts are not visible on the website.
 */
export default function LegalPagesAdmin() {
  const pages = useResource<SitePage>("/api/pages", selectLegal);
  const { busy, error, setError, run } = useAction();
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<{ message: string; href?: string } | null>(null);

  const open = useCallback(
    (page: SitePage) => {
      setError(null);
      setEditing(page);
      setDraft({
        title: page.title,
        content: page.content || "",
        is_active: page.is_active,
        meta_title: page.seo?.meta_title || "",
        meta_description: page.seo?.meta_description || "",
      });
    },
    [setError],
  );
  const matches = useCallback((p: SitePage, slug: string) => p.slug === slug, []);
  useDeepLinkEdit(pages.items, pages.loading, matches, open);

  const close = () => {
    setEditing(null);
    setDraft(null);
  };

  const save = async () => {
    if (!editing || !draft) return;
    if (!draft.title.trim()) return setError("Enter a page title.");
    if (draft.is_active && !plainText(draft.content)) return setError("A published page needs some content. Add the text, or switch Published off to keep it as a draft.");
    const ok = await run(() =>
      api.patch(`/api/pages/${editing.id}`, {
        title: draft.title.trim(),
        content: draft.content,
        is_active: draft.is_active,
        seo: { meta_title: draft.meta_title.trim(), meta_description: draft.meta_description.trim() },
      }),
    );
    if (!ok) return;
    const wasLive = editing.is_active;
    close();
    await pages.reload();
    setToast(
      draft.is_active
        ? { message: wasLive ? "Page saved. Changes are live." : "Page published. It is now linked in the footer.", href: legalPath(editing.slug) }
        : { message: wasLive ? "Page unpublished. It is hidden from the website and footer." : "Draft saved. It is not visible on the website yet." },
    );
  };

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  // Keep the familiar order even if sort_order was changed in the database.
  const order = (slug: string) => {
    const i = LEGAL_PAGES.findIndex((p) => p.slug === slug);
    return i < 0 ? 99 : i;
  };
  const rows = [...pages.items].sort((a, b) => order(a.slug) - order(b.slug) || a.sort_order - b.sort_order);

  return (
    <Box>
      <PageHeader
        title="Legal pages"
        subtitle="Privacy Policy, Terms & Conditions and Services Disclaimer. Published pages appear in the footer of every page."
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}>
        The starter text is a general template, not legal advice. Have it reviewed for your business before publishing.
      </Alert>

      {pages.loading && !pages.items.length ? (
        <LoadingState label="Loading legal pages…" />
      ) : pages.error && !pages.items.length ? (
        <ErrorState message={pages.error} onRetry={pages.reload} />
      ) : !rows.length ? (
        <EmptyState title="No legal pages yet" hint="They are created automatically when the server starts. Restart the backend and reload." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map((p) => (
            <Panel key={p.id} sx={{ p: { xs: 2, md: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: "#fff" }}>{p.title}</Typography>
                    <Box
                      component="span"
                      sx={{
                        px: 1.1,
                        py: 0.2,
                        borderRadius: "999px",
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        ...(p.is_active
                          ? { bgcolor: `${LIME}22`, color: LIME }
                          : { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }),
                      }}
                    >
                      {p.is_active ? "PUBLISHED" : "DRAFT"}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {legalPath(p.slug)} · Last updated {fmtDateTime(p.updated_at || p.created_at)}
                  </Typography>
                </Box>
                {p.is_active && (
                  <Button
                    href={legalPath(p.slug)}
                    target="_blank"
                    rel="noopener"
                    endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: "rgba(255,255,255,0.75)", textTransform: "none", fontWeight: 700 }}
                  >
                    View
                  </Button>
                )}
                <Button
                  onClick={() => open(p)}
                  startIcon={<EditRoundedIcon />}
                  aria-label={`Edit ${p.title}`}
                  sx={{ color: "#0a0a0a", bgcolor: LIME, textTransform: "none", fontWeight: 800, borderRadius: "10px", px: 2, "&:hover": { bgcolor: "#d4ff33" } }}
                >
                  Edit
                </Button>
              </Box>
            </Panel>
          ))}
        </Box>
      )}

      <FormDialog
        open={Boolean(editing && draft)}
        title={editing ? `Edit ${editing.title}` : ""}
        busy={busy}
        error={error}
        submitLabel={draft?.is_active ? (editing?.is_active ? "Save changes" : "Publish") : "Save draft"}
        onSubmit={() => void save()}
        onClose={close}
        maxWidth="md"
      >
        {draft && editing && (
          <>
            <Box
              component="label"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                pl: 2,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: 14.5 }}>Published</Typography>
                <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
                  {draft.is_active
                    ? `Visible at ${legalPath(editing.slug)} and linked in the footer.`
                    : "Draft: hidden from the website, footer and sitemap."}
                </Typography>
              </Box>
              <Switch
                checked={draft.is_active}
                onChange={(e) => set({ is_active: e.target.checked })}
                slotProps={{ input: { "aria-label": "Published" } }}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: LIME },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME },
                }}
              />
            </Box>
            <Field
              label="Page title (H1 and footer link)"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              helperText={`The address stays ${legalPath(editing.slug)}.`}
              slotProps={{ ...shrink, htmlInput: { maxLength: 255 } }}
            />
            <RichTextEditor
              label="Content"
              value={draft.content}
              onChange={(content) => set({ content })}
              placeholder="Write the policy…"
              helperText="Use Heading 2 for each section. The “Last updated” date is shown automatically."
              minHeight={380}
            />
            <Field
              label="Meta title"
              value={draft.meta_title}
              placeholder={draft.title}
              onChange={(e) => set({ meta_title: e.target.value })}
              helperText={counter(draft.meta_title, META_TITLE_MAX, "Empty = the page title.")}
              slotProps={shrink}
            />
            <Field
              label="Meta description"
              value={draft.meta_description}
              onChange={(e) => set({ meta_description: e.target.value })}
              helperText={counter(draft.meta_description, META_DESC_MAX, "Empty = the opening text of the page.")}
              multiline
              minRows={2}
              slotProps={shrink}
            />
          </>
        )}
      </FormDialog>

      <Toast
        message={toast?.message ?? null}
        onClose={() => setToast(null)}
        action={
          toast?.href ? (
            <Button href={toast.href} target="_blank" rel="noopener" size="small" sx={{ color: "inherit", fontWeight: 700, textTransform: "none" }}>
              View live
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
}

function counter(value: string, max: number, hint: string) {
  const n = value.trim().length;
  return n ? `${n}/${max} characters${n > max ? " — Google will likely cut this off" : ""}` : hint;
}
