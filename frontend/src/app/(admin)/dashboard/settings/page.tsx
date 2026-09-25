"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction, useResource } from "@/lib/useResource";
import type { SiteSetting, User } from "@/lib/types";
import DataTable, { type Column } from "@/components/admin/DataTable";
import LogoSettingsPanel from "@/components/admin/LogoSettingsPanel";
import { BRANDING_KEYS as BRANDING_KEY_LIST } from "@/lib/branding";
import {
  ConfirmDialog,
  Field,
  FormDialog,
  LIME,
  PageHeader,
  SearchBox,
  SelectField,
  StatusChip,
  ErrorState,
  LoadingState,
  Toast,
  fmtDate,
} from "@/components/admin/ui";

/** Managed by the Branding tab, so they're kept out of the generic table. */
const BRANDING_KEYS = new Set(BRANDING_KEY_LIST);

type SettingsTab = "branding" | "settings" | "users";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
];

export default function SettingsPage() {
  const { user: me } = useAuth();
  const settings = useResource<SiteSetting>("/api/settings");
  const users = useResource<User>("/api/users");
  const { busy, error: actionError, setError, run } = useAction();

  const [tab, setTab] = useState<SettingsTab>("branding");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // settings dialogs
  const [sForm, setSForm] = useState({ key: "", value: "", label: "" });
  const [editingS, setEditingS] = useState<SiteSetting | null>(null);
  const [creatingS, setCreatingS] = useState(false);
  const [deletingS, setDeletingS] = useState<SiteSetting | null>(null);

  // user dialogs
  const [uForm, setUForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
    is_active: true,
  });
  const [editingU, setEditingU] = useState<User | null>(null);
  const [creatingU, setCreatingU] = useState(false);
  const [deletingU, setDeletingU] = useState<User | null>(null);

  const generalSettings = useMemo(
    () => settings.items.filter((s) => !BRANDING_KEYS.has(s.key)),
    [settings.items],
  );

  const settingRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return generalSettings;
    return generalSettings.filter((s) =>
      [s.key, s.label, s.value]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [generalSettings, search]);

  const userRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users.items;
    return users.items.filter((u) =>
      [u.username, u.email, u.role].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [users.items, search]);

  /* ---------------------------- site settings ---------------------------- */

  const openCreateS = () => {
    setError(null);
    setSForm({ key: "", value: "", label: "" });
    setCreatingS(true);
  };

  const openEditS = (s: SiteSetting) => {
    setError(null);
    setSForm({ key: s.key, value: s.value || "", label: s.label || "" });
    setEditingS(s);
  };

  const saveS = async () => {
    if (!sForm.key.trim()) {
      setError("Key is required.");
      return;
    }
    const ok = await run(() =>
      editingS
        ? // PATCH only accepts value + label; the key is the identifier.
          api.patch(`/api/settings/${editingS.id}`, {
            value: sForm.value || null,
            label: sForm.label || null,
          })
        : api.post("/api/settings", {
            key: sForm.key.trim(),
            value: sForm.value || null,
            label: sForm.label || null,
          }),
    );
    if (ok) {
      setEditingS(null);
      setCreatingS(false);
      setToast(editingS ? "Setting updated." : "Setting created.");
      void settings.reload();
    }
  };

  const removeS = async () => {
    if (!deletingS) return;
    const ok = await run(() => api.del(`/api/settings/${deletingS.id}`));
    if (ok) {
      setDeletingS(null);
      setToast("Setting deleted.");
      void settings.reload();
    }
  };

  /* ------------------------------- users --------------------------------- */

  const openCreateU = () => {
    setError(null);
    setUForm({
      username: "",
      email: "",
      password: "",
      role: "admin",
      is_active: true,
    });
    setCreatingU(true);
  };

  const openEditU = (u: User) => {
    setError(null);
    setUForm({
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
      is_active: u.is_active,
    });
    setEditingU(u);
  };

  const saveU = async () => {
    if (!uForm.username.trim() || !uForm.email.trim()) {
      setError("Username and email are required.");
      return;
    }
    if (!editingU && uForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (editingU && uForm.password && uForm.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    const ok = await run(() => {
      if (editingU) {
        const body: Record<string, unknown> = {
          username: uForm.username.trim(),
          email: uForm.email.trim(),
          role: uForm.role,
          is_active: uForm.is_active,
        };
        // Only send a password when the admin actually typed a new one.
        if (uForm.password) body.password = uForm.password;
        return api.patch(`/api/users/${editingU.id}`, body);
      }
      return api.post("/api/users", {
        username: uForm.username.trim(),
        email: uForm.email.trim(),
        password: uForm.password,
        role: uForm.role,
        is_active: uForm.is_active,
      });
    });

    if (ok) {
      setEditingU(null);
      setCreatingU(false);
      setToast(editingU ? "User updated." : "User created.");
      void users.reload();
    }
  };

  const removeU = async () => {
    if (!deletingU) return;
    const ok = await run(() => api.del(`/api/users/${deletingU.id}`));
    if (ok) {
      setDeletingU(null);
      setToast("User deleted.");
      void users.reload();
    }
  };

  /* ------------------------------ columns -------------------------------- */

  const settingColumns: Column<SiteSetting>[] = [
    {
      key: "key",
      label: "Key",
      render: (s) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {s.key}
          </Typography>
          {s.label && (
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {s.label}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "value",
      label: "Value",
      render: (s) => (
        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 420,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.value || "—"}
        </Typography>
      ),
    },
  ];

  const userColumns: Column<User>[] = [
    {
      key: "username",
      label: "User",
      render: (u) => (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {u.username}
            {me?.id === u.id && (
              <Box
                component="span"
                sx={{ ml: 1, fontSize: 11, color: LIME, fontWeight: 700 }}
              >
                (you)
              </Box>
            )}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {u.email}
          </Typography>
        </Box>
      ),
    },
    { key: "role", label: "Role", hideBelow: "md" },
    {
      key: "created_at",
      label: "Created",
      hideBelow: "lg",
      render: (u) => fmtDate(u.created_at),
    },
    {
      key: "is_active",
      label: "Status",
      render: (u) => <StatusChip status={u.is_active ? "active" : "inactive"} />,
    },
  ];

  const onUsersTab = tab === "users";
  const onBrandingTab = tab === "branding";

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Your logo, the site-wide values used across the website, and the admin accounts that can sign in."
        actionLabel={onBrandingTab ? undefined : onUsersTab ? "Add user" : "Add setting"}
        onAction={onUsersTab ? openCreateU : openCreateS}
      >
        {!onBrandingTab && <SearchBox value={search} onChange={setSearch} />}
      </PageHeader>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2.5,
          minHeight: 40,
          "& .MuiTab-root": {
            color: "rgba(255,255,255,0.5)",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,
            minHeight: 40,
          },
          "& .Mui-selected": { color: `${LIME} !important` },
          "& .MuiTabs-indicator": { backgroundColor: LIME },
        }}
      >
        <Tab value="branding" label="Branding" />
        <Tab value="settings" label={`Site settings (${generalSettings.length})`} />
        <Tab value="users" label={`Admin users (${users.items.length})`} />
      </Tabs>

      {onBrandingTab ? (
        settings.loading && !settings.items.length ? (
          <LoadingState label="Loading branding…" />
        ) : settings.error ? (
          <ErrorState message={settings.error} onRetry={settings.reload} />
        ) : (
          <LogoSettingsPanel
            settings={settings.items}
            onSaved={(msg) => {
              setToast(msg);
              void settings.reload();
            }}
          />
        )
      ) : onUsersTab ? (
        <DataTable
          columns={userColumns}
          rows={userRows}
          loading={users.loading}
          error={users.error}
          onRetry={users.reload}
          emptyTitle="No admin users"
          emptyHint="Accounts created here can sign in to this dashboard."
          actions={[
            { icon: "edit", label: "Edit", onClick: openEditU },
            {
              icon: "delete",
              label: "Delete",
              danger: true,
              onClick: (u) => {
                setError(null);
                setDeletingU(u);
              },
            },
          ]}
        />
      ) : (
        <DataTable
          columns={settingColumns}
          rows={settingRows}
          loading={settings.loading}
          error={settings.error}
          onRetry={settings.reload}
          emptyTitle={
            generalSettings.length ? "No matching settings" : "No settings yet"
          }
          emptyHint={
            generalSettings.length
              ? "Try a different search."
              : "Add key/value pairs the website reads, e.g. phone or address."
          }
          actions={[
            { icon: "edit", label: "Edit", onClick: openEditS },
            {
              icon: "delete",
              label: "Delete",
              danger: true,
              onClick: (s) => {
                setError(null);
                setDeletingS(s);
              },
            },
          ]}
        />
      )}

      {/* --------------------------- setting form --------------------------- */}
      <FormDialog
        open={creatingS || !!editingS}
        title={editingS ? `Edit “${editingS.key}”` : "New setting"}
        busy={busy}
        error={actionError}
        submitLabel={editingS ? "Save changes" : "Create setting"}
        onSubmit={() => void saveS()}
        onClose={() => {
          setCreatingS(false);
          setEditingS(null);
        }}
      >
        <Field
          label="Key"
          value={sForm.key}
          onChange={(e) => setSForm((f) => ({ ...f, key: e.target.value }))}
          required
          disabled={!!editingS}
          helperText={
            editingS
              ? "The key identifies the setting and cannot be changed."
              : "e.g. contact_phone"
          }
        />
        <Field
          label="Label"
          value={sForm.label}
          onChange={(e) => setSForm((f) => ({ ...f, label: e.target.value }))}
          helperText="Human-readable name for this dashboard"
        />
        <Field
          label="Value"
          value={sForm.value}
          onChange={(e) => setSForm((f) => ({ ...f, value: e.target.value }))}
          multiline
          minRows={3}
        />
      </FormDialog>

      {/* ----------------------------- user form ---------------------------- */}
      <FormDialog
        open={creatingU || !!editingU}
        title={editingU ? `Edit ${editingU.username}` : "New admin user"}
        busy={busy}
        error={actionError}
        submitLabel={editingU ? "Save changes" : "Create user"}
        onSubmit={() => void saveU()}
        onClose={() => {
          setCreatingU(false);
          setEditingU(null);
        }}
      >
        <Field
          label="Username"
          value={uForm.username}
          onChange={(e) =>
            setUForm((f) => ({ ...f, username: e.target.value }))
          }
          required
        />
        <Field
          label="Email"
          type="email"
          value={uForm.email}
          onChange={(e) => setUForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Field
          label={editingU ? "New password" : "Password"}
          type="password"
          value={uForm.password}
          onChange={(e) =>
            setUForm((f) => ({ ...f, password: e.target.value }))
          }
          required={!editingU}
          helperText={
            editingU
              ? "Leave blank to keep the current password"
              : "At least 6 characters"
          }
        />
        <SelectField
          label="Role"
          value={uForm.role}
          onChange={(e) => setUForm((f) => ({ ...f, role: e.target.value }))}
          options={ROLE_OPTIONS}
          helperText="Only admins can sign in to this dashboard"
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch
            checked={uForm.is_active}
            onChange={(e) =>
              setUForm((f) => ({ ...f, is_active: e.target.checked }))
            }
            sx={{
              "& .Mui-checked": { color: LIME },
              "& .Mui-checked + .MuiSwitch-track": {
                backgroundColor: `${LIME} !important`,
              },
            }}
          />
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
            Account active
          </Typography>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={!!deletingS}
        title="Delete setting?"
        message={`This removes “${deletingS?.key ?? ""}”. Any part of the website reading it will fall back to its default.`}
        busy={busy}
        onConfirm={() => void removeS()}
        onClose={() => setDeletingS(null)}
      />

      <ConfirmDialog
        open={!!deletingU}
        title="Delete admin user?"
        message={
          deletingU?.id === me?.id
            ? "This is the account you are signed in with. Deleting it will sign you out immediately."
            : `This permanently removes ${deletingU?.username ?? ""} and revokes their access.`
        }
        busy={busy}
        onConfirm={() => void removeU()}
        onClose={() => setDeletingU(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
