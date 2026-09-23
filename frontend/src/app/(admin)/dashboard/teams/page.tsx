"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { api, mediaUrl } from "@/lib/api";
import { useAction, useResource } from "@/lib/useResource";
import type { TeamMember } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
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
  name: "",
  role: "",
  linkedin: "#",
  facebook: "#",
  x: "#",
  email: "mailto:info@company.com",
};

export default function TeamsPage() {
  const { items, loading, error, reload } = useResource<TeamMember>("/api/team/");
  const { busy, error: actionError, setError, run } = useAction();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) =>
      [m.name, m.role].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, search]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setError(null);
    setForm(EMPTY);
    setImage(null);
    setCreating(true);
  };

  const openEdit = (m: TeamMember) => {
    setError(null);
    setForm({
      name: m.name,
      role: m.role,
      linkedin: m.socials?.linkedin || "#",
      facebook: m.socials?.facebook || "#",
      x: m.socials?.x || "#",
      email: m.socials?.email || "mailto:info@company.com",
    });
    setImage(null);
    setEditing(m);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("role", form.role.trim());
    fd.append(
      "socials",
      JSON.stringify({
        linkedin: form.linkedin || "#",
        facebook: form.facebook || "#",
        x: form.x || "#",
        email: form.email || "#",
      }),
    );
    if (image) fd.append("image_file", image);
    return fd;
  };

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setError("Name and role are required.");
      return;
    }
    const ok = await run(() =>
      editing
        ? api.put(`/api/team/${editing.id}`, buildFormData())
        : api.post("/api/team/", buildFormData()),
    );
    if (ok) {
      setEditing(null);
      setCreating(false);
      setToast(editing ? "Team member updated." : "Team member added.");
      void reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const ok = await run(() => api.del(`/api/team/${deleting.id}`));
    if (ok) {
      setDeleting(null);
      setToast("Team member removed.");
      void reload();
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      key: "image",
      label: "",
      width: 64,
      render: (m) => (
        <Box
          sx={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        >
          {mediaUrl(m.image) ? (
            <Image
              src={mediaUrl(m.image)}
              alt=""
              fill
              sizes="44px"
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
                color: "rgba(255,255,255,0.4)",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {m.name.charAt(0).toUpperCase()}
            </Box>
          )}
        </Box>
      ),
    },
    {
      key: "name",
      label: "Member",
      render: (m) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {m.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {m.role}
          </Typography>
        </Box>
      ),
    },
    {
      key: "socials",
      label: "Links",
      hideBelow: "md",
      render: (m) => {
        const set = Object.entries(m.socials || {}).filter(
          ([, v]) => v && v !== "#",
        );
        return (
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
            {set.length ? set.map(([k]) => k).join(", ") : "—"}
          </Typography>
        );
      },
    },
  ];

  const fields = (
    <>
      <Field label="Name" value={form.name} onChange={set("name")} required />
      <Field label="Role" value={form.role} onChange={set("role")} required />

      <Box>
        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 1 }}>
          Photo
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              position: "relative",
              width: 64,
              height: 64,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: "rgba(255,255,255,0.04)",
              border: BORDER,
            }}
          >
            {image || editing?.image ? (
              <Image
                src={image ? URL.createObjectURL(image) : mediaUrl(editing?.image)}
                alt=""
                fill
                sizes="64px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : null}
          </Box>
          <Button
            onClick={() => fileRef.current?.click()}
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
            {image || editing?.image ? "Replace" : "Upload"}
          </Button>
          {image && (
            <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)" }}>
              {image.name}
            </Typography>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </Box>
      </Box>

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
        Social links
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.2,
        }}
      >
        <Field label="LinkedIn" value={form.linkedin} onChange={set("linkedin")} />
        <Field label="Facebook" value={form.facebook} onChange={set("facebook")} />
        <Field label="X / Twitter" value={form.x} onChange={set("x")} />
        <Field label="Email link" value={form.email} onChange={set("email")} />
      </Box>
    </>
  );

  return (
    <Box>
      <PageHeader
        title="Teams"
        subtitle={`${items.length} member${items.length === 1 ? "" : "s"} shown on the About page.`}
        actionLabel="Add member"
        onAction={openCreate}
      >
        <SearchBox value={search} onChange={setSearch} placeholder="Search name…" />
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={items.length ? "No matching members" : "No team members yet"}
        emptyHint={
          items.length
            ? "Try a different search."
            : 'Use "Add member" to publish the first one.'
        }
        actions={[
          { icon: "edit", label: "Edit", onClick: openEdit },
          {
            icon: "delete",
            label: "Remove",
            danger: true,
            onClick: (m) => {
              setError(null);
              setDeleting(m);
            },
          },
        ]}
      />

      <FormDialog
        open={creating || !!editing}
        title={editing ? `Edit ${editing.name}` : "New team member"}
        busy={busy}
        error={actionError}
        submitLabel={editing ? "Save changes" : "Add member"}
        onSubmit={() => void save()}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        {fields}
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        title="Remove team member?"
        message={`This permanently removes ${deleting?.name ?? ""} from the About page.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
