"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import { useDeepLinkEdit } from "@/lib/adminNav";
import {
  CONTENT_PAGE_TYPES,
  CUSTOM_PAGE_TYPE,
  LEGAL_PAGES,
  SLUG_MAX,
  isStandardPage,
  pagePath,
  slugProblem,
  slugify,
} from "@/lib/contentPages";
import type { SitePage } from "@/lib/types";
import {
  ConfirmDialog,
  ErrorState,
  Field,
  FormDialog,
  LIME,
  LoadingState,
  PageHeader,
  Panel,
  Toast,
  fmtDateTime,
} from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const shrink = { inputLabel: { shrink: true } };
const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: LIME },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME },
};

interface Draft {
  title: string;
  slug: string;
  /** Still following the title (new pages, until the address is typed). */
  slugAuto: boolean;
  content: string;
  is_active: boolean;
  show_in_footer: boolean;
  sort_order: number;
  meta_title: string;
  meta_description: string;
}

const selectContentPages = (raw: unknown) =>
  (Array.isArray(raw) ? (raw as SitePage[]) : []).filter((p) => CONTENT_PAGE_TYPES.includes(p.page_type));

const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * Dashboard -> Pages -> Site pages: the standard legal pages (Privacy Policy,
 * Terms & Conditions, Services Disclaimer) plus any page an admin creates.
 * Each is served at /<address>; drafts are not visible on the website, and
 * published pages can be linked in the footer.
 */
export default function SitePagesAdmin() {
  const pages = useResource<SitePage>("/api/pages", selectContentPages);
  const { busy, error, setError, run } = useAction();
  // `editing` null + draft set = creating a new page.
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<SitePage | null>(null);
  const [toast, setToast] = useState<{ message: string; href?: string } | null>(null);

  const open = useCallback(
    (page: SitePage) => {
      setError(null);
      setEditing(page);
      setDraft({
        title: page.title,
        slug: page.slug,
        slugAuto: false,
        content: page.content || "",
        is_active: page.is_active,
        show_in_footer: Boolean(page.show_in_footer),
        sort_order: page.sort_order,
        meta_title: page.seo?.meta_title || "",
        meta_description: page.seo?.meta_description || "",
      });
    },
    [setError],
  );
  const matches = useCallback((p: SitePage, slug: string) => p.slug === slug, []);
  useDeepLinkEdit(pages.items, pages.loading, matches, open);

  const openNew = () => {
    setError(null);
    setEditing(null);
    const last = Math.max(0, ...pages.items.map((p) => p.sort_order));
    setDraft({
      title: "",
      slug: "",
      slugAuto: true,
      content: "",
      is_active: false,
      show_in_footer: false,
      sort_order: last + 10,
      meta_title: "",
      meta_description: "",
    });
  };

  const close = () => {
    setEditing(null);
    setDraft(null);
  };

  const creating = Boolean(draft && !editing);
  const standard = Boolean(editing && isStandardPage(editing.slug));
  const slugError = draft && !standard ? slugProblem(draft.slug) : null;
  const slugTaken =
    draft && !standard && pages.items.some((p) => p.slug === draft.slug && p.id !== editing?.id)
      ? `Another page already uses “/${draft.slug}”.`
      : null;

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return setError("Enter a page title.");
    if (slugError || slugTaken) return setError(slugError || slugTaken);
    if (draft.is_active && !plainText(draft.content))
      return setError("A published page needs some content. Add the text, or switch Published off to keep it as a draft.");
    const body = {
      title: draft.title.trim(),
      content: draft.content,
      is_active: draft.is_active,
      show_in_footer: draft.show_in_footer,
      sort_order: Number.isFinite(draft.sort_order) ? Math.round(draft.sort_order) : 0,
      seo: { meta_title: draft.meta_title.trim(), meta_description: draft.meta_description.trim() },
      ...(standard ? {} : { slug: draft.slug }),
    };
    const ok = await run(() =>
      editing ? api.patch(`/api/pages/${editing.id}`, body) : api.post("/api/pages", { ...body, page_type: CUSTOM_PAGE_TYPE }),
    );
    if (!ok) return;
    const wasLive = Boolean(editing?.is_active);
    close();
    await pages.reload();
    const where = draft.show_in_footer ? " and linked in the footer" : "";
    setToast(
      draft.is_active
        ? {
            message: wasLive ? "Page saved. Changes are live." : `Page published at ${pagePath(draft.slug)}${where}.`,
            href: pagePath(draft.slug),
          }
        : {
            message: wasLive
              ? "Page unpublished. It is hidden from the website."
              : creating
                ? "Draft created. It is not visible on the website until you publish it."
                : "Draft saved. It is not visible on the website yet.",
          },
    );
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/pages/${deleting.id}`));
    if (!ok) return;
    setToast({ message: `“${deleting.title}” deleted.` });
    setDeleting(null);
    await pages.reload();
  };

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  // Standard pages keep their familiar order; your pages follow footer order.
  const legalOrder = (slug: string) => LEGAL_PAGES.findIndex((p) => p.slug === slug);
  const standardRows = pages.items.filter((p) => isStandardPage(p.slug)).sort((a, b) => legalOrder(a.slug) - legalOrder(b.slug));
  const customRows = pages.items
    .filter((p) => !isStandardPage(p.slug))
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));

  const row = (p: SitePage) => (
    <Panel key={p.id} sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: "#fff", mr: 0.4 }}>{p.title}</Typography>
            <Chip on={p.is_active} label={p.is_active ? "PUBLISHED" : "DRAFT"} />
            {p.show_in_footer && <Chip on={p.is_active} label="IN FOOTER" subtle />}
          </Box>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {pagePath(p.slug)} · Last updated {fmtDateTime(p.updated_at || p.created_at)}
          </Typography>
        </Box>
        {p.is_active && (
          <Button
            href={pagePath(p.slug)}
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
        {!isStandardPage(p.slug) && (
          <Tooltip title="Delete page">
            <IconButton
              aria-label={`Delete ${p.title}`}
              onClick={() => {
                setError(null);
                setDeleting(p);
              }}
              sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff8a8a" } }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Panel>
  );

  const sectionTitle = (title: string, sub: string) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{sub}</Typography>
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title="Site pages"
        subtitle="Policies and any other page you add. Each has its own address on the website and can be linked in the footer."
        actionLabel="New page"
        onAction={openNew}
      />

      {pages.loading && !pages.items.length ? (
        <LoadingState label="Loading pages…" />
      ) : pages.error && !pages.items.length ? (
        <ErrorState message={pages.error} onRetry={pages.reload} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Box>
            {sectionTitle("Standard pages", "Their addresses are fixed. Unpublish one to hide it; they can't be deleted.")}
            <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: "12px", color: "rgba(255,255,255,0.8)" }}>
              The starter text is a general template, not legal advice. Have it reviewed for your business before publishing.
            </Alert>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {standardRows.length ? (
                standardRows.map(row)
              ) : (
                <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
                  The standard pages are created when the server starts. Restart the backend and reload.
                </Typography>
              )}
            </Box>
          </Box>

          <Box>
            {sectionTitle("Your pages", "Pages you create, e.g. a shipping guide, careers or FAQ-style information.")}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {customRows.length ? (
                customRows.map(row)
              ) : (
                <Panel sx={{ p: 3, textAlign: "center" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14, mb: 1.5 }}>No pages yet.</Typography>
                  <Button onClick={openNew} sx={{ color: LIME, textTransform: "none", fontWeight: 800 }}>
                    Create your first page
                  </Button>
                </Panel>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <FormDialog
        open={Boolean(draft)}
        title={creating ? "New page" : editing ? `Edit ${editing.title}` : ""}
        busy={busy}
        error={error}
        submitLabel={
          draft?.is_active ? (editing?.is_active ? "Save changes" : "Publish") : creating ? "Save as draft" : "Save draft"
        }
        onSubmit={() => void save()}
        onClose={close}
        maxWidth="md"
      >
        {draft && (
          <>
            <SwitchRow
              label="Published"
              hint={
                draft.is_active
                  ? `Visible at ${pagePath(draft.slug || "…")}.`
                  : "Draft: hidden from the website, footer and sitemap."
              }
              checked={draft.is_active}
              onChange={(is_active) => set({ is_active })}
            />
            <Field
              label="Page title (H1)"
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                set(draft.slugAuto ? { title, slug: slugify(title) } : { title });
              }}
              autoFocus={creating}
              slotProps={{ ...shrink, htmlInput: { maxLength: 255 } }}
            />
            <Field
              label="Page address"
              value={draft.slug}
              disabled={standard}
              onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-"), slugAuto: false })}
              error={Boolean(draft.slug && (slugError || slugTaken))}
              helperText={
                standard
                  ? `Standard page: the address is fixed at ${pagePath(draft.slug)}.`
                  : (draft.slug && (slugError || slugTaken)) ||
                    (editing && draft.slug !== editing.slug && editing.is_active
                      ? `Changing the address breaks links to ${pagePath(editing.slug)} (bookmarks, Google, other sites).`
                      : "Lowercase letters, numbers and hyphens. Filled in from the title until you change it.")
              }
              slotProps={{
                ...shrink,
                htmlInput: { maxLength: SLUG_MAX + 10 },
                input: { startAdornment: <InputAdornment position="start">mrwhizlogistics.com/</InputAdornment> },
              }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 180px" }, gap: 2, alignItems: "start" }}>
              <SwitchRow
                label="Show in footer"
                hint={
                  draft.show_in_footer
                    ? draft.is_active
                      ? "Linked in the footer's bottom row on every page."
                      : "Will be linked in the footer once published."
                    : "Not linked in the footer. Link to it from anywhere using its address."
                }
                checked={draft.show_in_footer}
                onChange={(show_in_footer) => set({ show_in_footer })}
              />
              <Field
                type="number"
                label="Footer order"
                value={draft.sort_order}
                disabled={!draft.show_in_footer}
                onChange={(e) => set({ sort_order: Number(e.target.value) })}
                helperText="Lower numbers come first."
                slotProps={{ ...shrink, htmlInput: { step: 10 } }}
              />
            </Box>
            <RichTextEditor
              label="Content"
              value={draft.content}
              onChange={(content) => set({ content })}
              placeholder="Write the page…"
              helperText="Use Heading 2 for each section; the page title is the H1."
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

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete page?"
        message={
          deleting
            ? `“${deleting.title}” will be removed and ${pagePath(deleting.slug)} will show “page not found”. You can restore it from Recently deleted for 7 days.${error ? ` (${error})` : ""}`
            : ""
        }
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

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

function Chip({ on, label, subtle }: { on: boolean; label: string; subtle?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        px: 1.1,
        py: 0.2,
        borderRadius: "999px",
        fontSize: 11.5,
        fontWeight: 800,
        letterSpacing: 0.4,
        ...(on && !subtle
          ? { bgcolor: `${LIME}22`, color: LIME }
          : { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }),
      }}
    >
      {label}
    </Box>
  );
}

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
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
        <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: 14.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>{hint}</Typography>
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} slotProps={{ input: { "aria-label": label } }} sx={switchSx} />
    </Box>
  );
}

function counter(value: string, max: number, hint: string) {
  const n = value.trim().length;
  return n ? `${n}/${max} characters${n > max ? " — Google will likely cut this off" : ""}` : hint;
}
