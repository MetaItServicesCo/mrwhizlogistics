"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { Testimonial } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  ConfirmDialog,
  Field,
  FormDialog,
  LIME,
  PageHeader,
  SearchBox,
  Toast,
} from "@/components/admin/ui";

const EMPTY = {
  quote: "",
  name: "",
  role: "",
  rating: 5,
  initials: "",
  accent: "",
  image: "",
  sort_order: "0",
  is_active: true,
};

export default function TestimonialsPage() {
  // /api/testimonials returns a paginated envelope.
  const select = useCallback(
    (raw: unknown) =>
      Array.isArray(raw)
        ? (raw as Testimonial[])
        : ((raw as { items?: Testimonial[] })?.items ?? []),
    [],
  );
  const { items, loading, error, reload } = useResource<Testimonial>(
    "/api/testimonials",
    select,
  );
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      [t.name, t.role, t.quote]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setError(null);
    setForm(EMPTY);
    setCreating(true);
  };

  const openEdit = (t: Testimonial) => {
    setError(null);
    setForm({
      quote: t.quote,
      name: t.name,
      role: t.role || "",
      rating: t.rating,
      initials: t.initials || "",
      accent: t.accent || "",
      image: t.image || "",
      sort_order: String(t.sort_order),
      is_active: t.is_active,
    });
    setEditing(t);
  };

  const payload = () => ({
    quote: form.quote.trim(),
    name: form.name.trim(),
    role: form.role.trim() || null,
    rating: Number(form.rating) || 5,
    initials: form.initials.trim() || null,
    accent: form.accent.trim() || null,
    image: form.image.trim() || null,
    sort_order: Number(form.sort_order) || 0,
    is_active: form.is_active,
  });

  const save = async () => {
    if (!form.quote.trim() || !form.name.trim()) {
      setError("Quote and name are required.");
      return;
    }
    const ok = await run(() =>
      editing
        ? api.put(`/api/testimonials/${editing.id}`, payload())
        : api.post("/api/testimonials", payload()),
    );
    if (ok) {
      setEditing(null);
      setCreating(false);
      setToast(editing ? "Testimonial updated." : "Testimonial created.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/testimonials/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Testimonial deleted.");
      void reload();
    }
  };

  const toggle = async (t: Testimonial) => {
    const ok = await run(() =>
      api.put(`/api/testimonials/${t.id}`, { is_active: !t.is_active }),
    );
    if (ok) {
      setToast(t.is_active ? "Testimonial hidden." : "Testimonial published.");
      void reload();
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "name",
      label: "Author",
      render: (t) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {t.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {t.role || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "quote",
      label: "Quote",
      hideBelow: "md",
      render: (t) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 360,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t.quote}
        </Typography>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      width: 130,
      render: (t) => (
        <Rating
          value={t.rating}
          readOnly
          size="small"
          sx={{ "& .MuiRating-iconFilled": { color: LIME } }}
        />
      ),
    },
    { key: "sort_order", label: "Order", hideBelow: "lg", width: 80 },
    {
      key: "is_active",
      label: "Published",
      width: 110,
      render: (t) => (
        <Switch
          checked={t.is_active}
          disabled={busy}
          onChange={() => void toggle(t)}
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

  return (
    <Box>
      <PageHeader
        title="Testimonials"
        subtitle={`${items.length} testimonial${items.length === 1 ? "" : "s"} shown on the website.`}
        actionLabel="Add testimonial"
        onAction={openCreate}
      >
        <SearchBox value={search} onChange={setSearch} placeholder="Search…" />
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching testimonials" : "No testimonials yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : 'Use "Add testimonial" to publish the first one.'
        }
        actions={[
          { icon: "edit", label: "Edit", onClick: openEdit },
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            onClick: (t) => {
              setError(null);
              setDeleting(t);
            },
          },
        ]}
      />

      <FormDialog
        open={creating || !!editing}
        title={editing ? `Edit testimonial` : "New testimonial"}
        busy={busy}
        error={actionError}
        submitLabel={editing ? "Save changes" : "Create testimonial"}
        onSubmit={() => void save()}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        maxWidth="md"
      >
        <Field
          label="Quote"
          value={form.quote}
          onChange={set("quote")}
          multiline
          minRows={4}
          required
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.2,
          }}
        >
          <Field label="Name" value={form.name} onChange={set("name")} required />
          <Field
            label="Role / company"
            value={form.role}
            onChange={set("role")}
          />
          <Field
            label="Initials"
            value={form.initials}
            onChange={set("initials")}
            helperText="Shown when there is no photo"
          />
          <Field
            label="Accent"
            value={form.accent}
            onChange={set("accent")}
            helperText="Optional colour/style key"
          />
        </Box>
        <Field
          label="Image URL"
          value={form.image}
          onChange={set("image")}
          helperText="Optional — path or full URL"
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography
              sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 0.5 }}
            >
              Rating
            </Typography>
            <Rating
              value={Number(form.rating)}
              onChange={(_, v) =>
                setForm((f) => ({ ...f, rating: v ?? 5 }))
              }
              sx={{ "& .MuiRating-iconFilled": { color: LIME } }}
            />
          </Box>
          <Field
            label="Sort order"
            type="number"
            value={form.sort_order}
            onChange={set("sort_order")}
            sx={{ maxWidth: 160 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              sx={{
                "& .Mui-checked": { color: LIME },
                "& .Mui-checked + .MuiSwitch-track": {
                  backgroundColor: `${LIME} !important`,
                },
              }}
            />
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
              Published
            </Typography>
          </Box>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete testimonial?"
        message={`This permanently removes the testimonial from ${deleting?.name ?? ""}.`}
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
