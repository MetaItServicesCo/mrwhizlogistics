"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { api, mediaUrl } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { BlogPost } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SchemaMarkupEditor, { schemaMarkupError } from "@/components/admin/SchemaMarkupEditor";
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
} from "@/components/admin/ui";

const EMPTY = {
  card_id: "",
  title: "",
  slug: "",
  publish_date: "",
  read_time: "",
  category_tag: "",
  short_description: "",
  author_name: "Admin",
  content_html: "",
  tags: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  schema_markup: "",
};

const csvToJson = (v: string) =>
  JSON.stringify(
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

export default function BlogPostsPage() {
  const { items, loading, error, reload } = useResource<BlogPost>("/api/blogs/");
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [detailImage, setDetailImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      [p.title, p.slug, p.category_tag, p.author_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setError(null);
    setForm({
      ...EMPTY,
      publish_date: new Date().toISOString().slice(0, 10),
    });
    setCardImage(null);
    setDetailImage(null);
    setCreating(true);
  };

  const openEdit = (p: BlogPost) => {
    setError(null);
    setForm({
      card_id: p.card_id || "",
      title: p.title || "",
      slug: p.slug || "",
      publish_date: p.publish_date || "",
      read_time: p.read_time || "",
      category_tag: p.category_tag || "",
      short_description: p.short_description || "",
      author_name: p.author_name || "Admin",
      content_html: p.content_html || paragraphsToHtml(p.content_paragraphs),
      tags: (p.tags || []).join(", "),
      meta_title: p.meta_title || "",
      meta_description: p.meta_description || "",
      meta_keywords: p.meta_keywords || "",
      canonical_url: p.canonical_url || "",
      schema_markup: p.schema_markup || "",
    });
    setCardImage(null);
    setDetailImage(null);
    setEditing(p);
  };

  const buildFormData = (isCreate: boolean) => {
    const fd = new FormData();
    const put = (k: string, v: string) => {
      fd.append(k, v);
    };
    put("card_id", form.card_id);
    put("title", form.title);
    put("slug", form.slug);
    put("publish_date", form.publish_date);
    put("read_time", form.read_time);
    put("category_tag", form.category_tag);
    put("short_description", form.short_description);
    put("author_name", form.author_name);
    put("meta_title", form.meta_title);
    put("meta_description", form.meta_description);
    put("meta_keywords", form.meta_keywords);
    put("canonical_url", form.canonical_url);

    // The editor HTML is now the body. Legacy paragraphs were loaded into it
    // on open, so clearing them loses nothing and stops stale text from
    // resurfacing as a fallback if the editor is later emptied.
    fd.append("content_html", form.content_html);
    fd.append("content_paragraphs", "[]");
    // Always sent (even empty) so "Reset to automatic" clears stored markup.
    fd.append("schema_markup", form.schema_markup);
    fd.append("tags", csvToJson(form.tags));

    if (cardImage) fd.append("card_image_file", cardImage);
    if (detailImage) fd.append("detail_image_file", detailImage);
    return fd;
  };

  const create = async () => {
    const schemaError = schemaMarkupError(form.schema_markup);
    if (schemaError) {
      setError(schemaError);
      return;
    }
    if (!cardImage) {
      setError("A card image is required.");
      return;
    }
    const ok = await run(() => api.post("/api/blogs/", buildFormData(true)));
    if (ok) {
      setCreating(false);
      setToast("Post published.");
      void reload();
    }
  };

  const update = async () => {
    if (!editing) return;
    const schemaError = schemaMarkupError(form.schema_markup);
    if (schemaError) {
      setError(schemaError);
      return;
    }
    const ok = await run(() =>
      api.put(`/api/blogs/${editing.card_id}`, buildFormData(false)),
    );
    if (ok) {
      setEditing(null);
      setToast("Post updated.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/blogs/${deleting.card_id}`));
    if (ok) {
      setDeleting(null);
      setToast("Post deleted.");
      void reload();
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "card_image",
      label: "",
      width: 72,
      render: (p) => (
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
          {mediaUrl(p.card_image) ? (
            <Image
              src={mediaUrl(p.card_image)}
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
      label: "Post",
      render: (p) => (
        <Box sx={{ maxWidth: 360 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {p.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            /{p.slug} · {p.author_name}
          </Typography>
        </Box>
      ),
    },
    { key: "category_tag", label: "Category", hideBelow: "md" },
    { key: "publish_date", label: "Published", hideBelow: "lg" },
    {
      key: "comments_count",
      label: "Comments",
      width: 100,
      render: (p) => String(p.comments_count ?? 0),
    },
  ];

  const imagePicker = (
    label: string,
    file: File | null,
    existing: string | null | undefined,
    onPick: (f: File | null) => void,
    ref: React.RefObject<HTMLInputElement | null>,
    required?: boolean,
  ) => (
    <Box>
      <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 1 }}>
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
          {file || existing ? (
            <Image
              src={file ? URL.createObjectURL(file) : mediaUrl(existing)}
              alt=""
              fill
              sizes="96px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : null}
        </Box>
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
          <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)" }}>
            {file.name}
          </Typography>
        )}
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
          label="Card ID"
          value={form.card_id}
          onChange={set("card_id")}
          required={isCreate}
          helperText="Unique reference, e.g. b1"
        />
        <Field
          label="Category"
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
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.2,
        }}
      >
        <Field
          label="Publish date"
          value={form.publish_date}
          onChange={set("publish_date")}
          required={isCreate}
          helperText="e.g. 2026-09-23"
        />
        <Field
          label="Read time"
          value={form.read_time}
          onChange={set("read_time")}
          required={isCreate}
          helperText="e.g. 5 min read"
        />
        <Field
          label="Author"
          value={form.author_name}
          onChange={set("author_name")}
        />
      </Box>
      <RichTextEditor
        label="Content"
        value={form.content_html}
        onChange={(html) => setForm((f) => ({ ...f, content_html: html }))}
        placeholder="Write the article. Use the toolbar for headings, lists, links and images."
        minHeight={320}
      />
      <Field
        label="Tags"
        value={form.tags}
        onChange={set("tags")}
        helperText="Comma separated"
      />

      {imagePicker(
        "Card image",
        cardImage,
        editing?.card_image,
        setCardImage,
        cardRef,
        isCreate,
      )}
      {imagePicker(
        "Detail image",
        detailImage,
        editing?.detail_image,
        setDetailImage,
        detailRef,
      )}

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
      <Field label="Meta title" value={form.meta_title} onChange={set("meta_title")} />
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

      <SchemaMarkupEditor
        value={form.schema_markup}
        onChange={(v) => setForm((f) => ({ ...f, schema_markup: v }))}
        post={{
          title: form.title,
          slug: form.slug,
          excerpt: form.meta_description || form.short_description,
          image: editing?.card_image,
          author: form.author_name,
          datePublished: form.publish_date,
          keywords: form.meta_keywords,
        }}
      />
    </>
  );

  return (
    <Box>
      <PageHeader
        title="Posts"
        subtitle={`${items.length} blog post${items.length === 1 ? "" : "s"} published on the website.`}
        actionLabel="New post"
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
        emptyTitle={items.length ? "No matching posts" : "No posts yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : 'Use "New post" to publish the first article.'
        }
        actions={[
          { icon: "edit", label: "Edit", onClick: openEdit },
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            onClick: (p) => {
              setError(null);
              setDeleting(p);
            },
          },
        ]}
      />

      <FormDialog
        open={creating}
        title="New post"
        busy={busy}
        error={actionError}
        submitLabel="Publish post"
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
        title="Delete post?"
        message={`This permanently removes “${deleting?.title ?? ""}” and its comments.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
