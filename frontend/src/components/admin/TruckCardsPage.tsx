"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { api, mediaUrl } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { TruckCard } from "@/lib/types";
import DataTable, { type Column } from "./DataTable";
import RichTextEditor from "./RichTextEditor";
import { paragraphsToHtml } from "@/lib/richText";
import {
  BORDER,
  ConfirmDialog,
  Field,
  FormDialog,
  LIME,
  PageHeader,
  SearchBox,
  Toast,
} from "./ui";

type FormState = {
  card_number: string;
  category_tag: string;
  title: string;
  short_description: string;
  detail_heading: string;
  slug: string;
  page_heading: string;
  page_subheading: string;
  features: string;
  content_html: string;
  trailer_length: string;
  max_payload: string;
  cargo_type: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
};

const EMPTY: FormState = {
  card_number: "",
  category_tag: "",
  title: "",
  short_description: "",
  detail_heading: "",
  slug: "",
  page_heading: "",
  page_subheading: "",
  features: "",
  content_html: "",
  trailer_length: "",
  max_payload: "",
  cargo_type: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
};

/** The API stores these as JSON arrays; the form edits them one-per-line. */
const linesToJson = (v: string) =>
  JSON.stringify(
    v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );

const jsonToLines = (v: string[] | null | undefined) =>
  Array.isArray(v) ? v.join("\n") : "";

function ImagePicker({
  label,
  file,
  existing,
  onPick,
  required,
}: {
  label: string;
  file: File | null;
  existing?: string | null;
  onPick: (f: File | null) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : mediaUrl(existing);

  return (
    <Box>
      <Typography
        sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 1 }}
      >
        {label}
        {required ? " *" : ""}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            position: "relative",
            width: 96,
            height: 68,
            borderRadius: "10px",
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "rgba(255,255,255,0.04)",
            border: BORDER,
          }}
        >
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              sizes="96px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.25)",
                fontSize: 11,
              }}
            >
              No image
            </Box>
          )}
        </Box>

        <Box>
          <Button
            onClick={() => ref.current?.click()}
            startIcon={<UploadRoundedIcon />}
            size="small"
            sx={{
              color: LIME,
              border: `1px solid ${LIME}55`,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(200,255,0,0.08)" },
            }}
          >
            {file || existing ? "Replace" : "Upload"}
          </Button>
          {file && (
            <Typography
              sx={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.45)",
                mt: 0.6,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </Typography>
          )}
        </Box>

        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </Box>
    </Box>
  );
}

export default function TruckCardsPage({
  title,
  subtitle,
  endpoint,
  withSemiFields = false,
}: {
  title: string;
  subtitle: string;
  /** e.g. "/api/hotshots" — list is GET `${endpoint}/`, writes are POST/PUT/DELETE. */
  endpoint: string;
  /** semi-trucks carry three extra spec fields */
  withSemiFields?: boolean;
}) {
  const { items, loading, error, reload } = useResource<TruckCard>(
    `${endpoint}/`,
  );
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TruckCard | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TruckCard | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [detailImage, setDetailImage] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.title, r.slug, r.category_tag, r.short_description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setError(null);
    setForm(EMPTY);
    setCardImage(null);
    setDetailImage(null);
    setCreating(true);
  };

  const openEdit = (row: TruckCard) => {
    setError(null);
    setForm({
      card_number: row.card_number || "",
      category_tag: row.category_tag || "",
      title: row.title || "",
      short_description: row.short_description || "",
      detail_heading: row.detail_heading || "",
      slug: row.slug || "",
      page_heading: row.page_heading || "",
      page_subheading: row.page_subheading || "",
      features: jsonToLines(row.features),
      content_html: row.content_html || paragraphsToHtml(row.detail_paragraphs),
      trailer_length: row.trailer_length || "",
      max_payload: row.max_payload || "",
      cargo_type: row.cargo_type || "",
      meta_title: row.meta_title || "",
      meta_description: row.meta_description || "",
      meta_keywords: row.meta_keywords || "",
      canonical_url: row.canonical_url || "",
    });
    setCardImage(null);
    setDetailImage(null);
    setEditing(row);
  };

  const buildFormData = (isCreate: boolean) => {
    const fd = new FormData();
    const put = (k: string, v: string) => {
      fd.append(k, v);
    };

    put("card_number", form.card_number);
    put("category_tag", form.category_tag);
    put("title", form.title);
    put("short_description", form.short_description);
    put("detail_heading", form.detail_heading);
    put("slug", form.slug);
    put("page_heading", form.page_heading);
    put("page_subheading", form.page_subheading);
    if (withSemiFields) {
      put("trailer_length", form.trailer_length);
      put("max_payload", form.max_payload);
      put("cargo_type", form.cargo_type);
    }
    put("meta_title", form.meta_title);
    put("meta_description", form.meta_description);
    put("meta_keywords", form.meta_keywords);
    put("canonical_url", form.canonical_url);

    fd.append("features", linesToJson(form.features));
    // The editor HTML is now the detail body. Legacy paragraphs were loaded
    // into it on open, so clearing them loses nothing and stops stale text
    // from resurfacing as a fallback if the editor is later emptied.
    fd.append("content_html", form.content_html);
    fd.append("detail_paragraphs", "[]");

    if (cardImage) fd.append("card_image_file", cardImage);
    if (detailImage) fd.append("detail_image_file", detailImage);
    return fd;
  };

  const create = async () => {
    if (!cardImage) {
      setError("A card image is required.");
      return;
    }
    const ok = await run(() => api.post(`${endpoint}/`, buildFormData(true)));
    if (ok) {
      setCreating(false);
      setToast(`${title} card created.`);
      void reload();
    }
  };

  const update = async () => {
    if (!editing) return;
    const ok = await run(() =>
      api.put(`${endpoint}/${editing.id}`, buildFormData(false)),
    );
    if (ok) {
      setEditing(null);
      setToast(`${title} card updated.`);
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`${endpoint}/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Card deleted.");
      void reload();
    }
  };

  const columns: Column<TruckCard>[] = [
    {
      key: "card_image",
      label: "",
      width: 72,
      render: (r) => (
        <Box
          sx={{
            position: "relative",
            width: 56,
            height: 40,
            borderRadius: "8px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.05)",
          }}
        >
          {mediaUrl(r.card_image) ? (
            <Image
              src={mediaUrl(r.card_image)}
              alt=""
              fill
              sizes="56px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : null}
        </Box>
      ),
    },
    {
      key: "title",
      label: "Card",
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {r.card_number ? `${r.card_number}. ` : ""}
            {r.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            /{r.slug}
          </Typography>
        </Box>
      ),
    },
    { key: "category_tag", label: "Category", hideBelow: "md" },
    {
      key: "short_description",
      label: "Summary",
      hideBelow: "lg",
      render: (r) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 320,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {r.short_description}
        </Typography>
      ),
    },
  ];

  const fields = (isCreate: boolean) => (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.2,
        }}
      >
        <Field
          label="Card number"
          value={form.card_number}
          onChange={set("card_number")}
          required={isCreate}
        />
        <Field
          label="Category tag"
          value={form.category_tag}
          onChange={set("category_tag")}
          required={isCreate}
        />
      </Box>

      <Field
        label="Title"
        value={form.title}
        onChange={set("title")}
        required={isCreate}
      />
      <Field
        label="Slug"
        value={form.slug}
        onChange={set("slug")}
        required={isCreate}
        helperText="URL segment, e.g. 26-feet-box-truck"
      />
      <Field
        label="Short description"
        value={form.short_description}
        onChange={set("short_description")}
        multiline
        minRows={2}
        required={isCreate}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.2,
        }}
      >
        <Field
          label="Page heading"
          value={form.page_heading}
          onChange={set("page_heading")}
        />
        <Field
          label="Page subheading"
          value={form.page_subheading}
          onChange={set("page_subheading")}
        />
      </Box>

      {withSemiFields && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.2,
          }}
        >
          <Field
            label="Trailer length"
            value={form.trailer_length}
            onChange={set("trailer_length")}
          />
          <Field
            label="Max payload"
            value={form.max_payload}
            onChange={set("max_payload")}
          />
          <Field
            label="Cargo type"
            value={form.cargo_type}
            onChange={set("cargo_type")}
          />
        </Box>
      )}

      <Field
        label="Detail heading"
        value={form.detail_heading}
        onChange={set("detail_heading")}
        required={isCreate}
      />
      <Field
        label="Features"
        value={form.features}
        onChange={set("features")}
        multiline
        minRows={3}
        helperText="One feature per line"
      />
      <RichTextEditor
        label="Detail page content"
        value={form.content_html}
        onChange={(html) => setForm((f) => ({ ...f, content_html: html }))}
        placeholder="Describe the service. Use the toolbar for headings, lists, links and images."
        helperText="Shown on this service's own page"
      />

      <ImagePicker
        label="Card image"
        file={cardImage}
        existing={editing?.card_image}
        onPick={setCardImage}
        required={isCreate}
      />
      <ImagePicker
        label="Detail image"
        file={detailImage}
        existing={editing?.detail_image}
        onPick={setDetailImage}
      />

      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          mt: 1,
        }}
      >
        SEO
      </Typography>
      <Field
        label="Meta title"
        value={form.meta_title}
        onChange={set("meta_title")}
      />
      <Field
        label="Meta description"
        value={form.meta_description}
        onChange={set("meta_description")}
        multiline
        minRows={2}
      />
      <Field
        label="Meta keywords"
        value={form.meta_keywords}
        onChange={set("meta_keywords")}
      />
      <Field
        label="Canonical URL"
        value={form.canonical_url}
        onChange={set("canonical_url")}
      />
    </>
  );

  return (
    <Box>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionLabel="Add card"
        onAction={openCreate}
      >
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search title, slug…"
        />
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching cards" : "No cards yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : 'Use "Add card" to publish the first one.'
        }
        actions={[
          { icon: "edit", label: "Edit", onClick: openEdit },
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
        open={creating}
        title={`New ${title} card`}
        busy={busy}
        error={actionError}
        submitLabel="Create card"
        onSubmit={() => void create()}
        onClose={() => setCreating(false)}
        maxWidth="md"
      >
        {fields(true)}
      </FormDialog>

      <FormDialog
        open={!!editing}
        title={editing ? `Edit “${editing.title}”` : ""}
        busy={busy}
        error={actionError}
        submitLabel="Save changes"
        onSubmit={() => void update()}
        onClose={() => setEditing(null)}
        maxWidth="md"
      >
        {fields(false)}
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete card?"
        message={`This permanently removes “${deleting?.title ?? ""}” from the website. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
