"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api, ApiError } from "@/lib/api";
import {
  ADDRESS_KEY,
  CONTACT_PAGE_KEY,
  CONTACT_TEXT_FIELDS,
  DEFAULT_ADDRESS,
  DEFAULT_CONTACT_TEXT,
  DEFAULT_EMAIL,
  DEFAULT_PHONE,
  DEFAULT_WORKING_HOURS,
  WORKING_HOURS_KEY,
  parseContactText,
  type ContactPageText,
} from "@/lib/contactPage";
import type { SiteSetting } from "@/lib/types";
import { Field, LIME, Panel } from "@/components/admin/ui";

type TextKey = (typeof CONTACT_TEXT_FIELDS)[number]["key"];

interface Draft {
  address: string;
  phone: string;
  email: string;
  hours: string;
  text: Record<TextKey, string>;
  services: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

function fromSettings(settings: SiteSetting[]): Draft {
  const get = (k: string) => settings.find((s) => s.key === k)?.value ?? "";
  const saved = parseContactText(get(CONTACT_PAGE_KEY));
  return {
    address: get(ADDRESS_KEY),
    phone: get("phone"),
    email: get("email"),
    hours: get(WORKING_HOURS_KEY),
    text: Object.fromEntries(CONTACT_TEXT_FIELDS.map((f) => [f.key, saved[f.key] ?? ""])) as Record<TextKey, string>,
    services: (saved.services ?? []).join("\n"),
  };
}

export default function ContactPageSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteSetting[];
  onSaved: (message: string) => void;
}) {
  const saved = useMemo(() => fromSettings(settings), [settings]);
  const savedKey = JSON.stringify(saved);
  const [draft, setDraft] = useState<Draft>(saved);
  const [base, setBase] = useState(savedKey);
  if (base !== savedKey) {
    setBase(savedKey);
    setDraft(saved);
  }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== savedKey;
  const emailError = draft.email.trim() && !EMAIL_RE.test(draft.email.trim()) ? "Enter a valid email address." : null;
  const phoneError = draft.phone.trim() && draft.phone.replace(/\D/g, "").length < 10 ? "Enter a full phone number." : null;
  const invalid = Boolean(emailError || phoneError);

  const setField = (k: "address" | "phone" | "email" | "hours" | "services") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));
  const setText = (k: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, text: { ...d.text, [k]: e.target.value } }));

  /** PATCH the row if it exists, otherwise create it. */
  const upsert = (key: string, value: string, label: string) => {
    const row = settings.find((s) => s.key === key);
    return row ? api.patch(`/api/settings/${row.id}`, { value }) : api.post("/api/settings", { key, value, label });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const text: Partial<ContactPageText> = {};
      for (const f of CONTACT_TEXT_FIELDS) {
        const v = draft.text[f.key].trim();
        if (v && v !== DEFAULT_CONTACT_TEXT[f.key]) text[f.key] = v;
      }
      const services = draft.services.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (services.length && services.join("|") !== DEFAULT_CONTACT_TEXT.services.join("|")) text.services = services;

      const changed = (k: keyof Draft) => draft[k] !== saved[k];
      if (changed("address")) await upsert(ADDRESS_KEY, draft.address.trim(), "Company address (one line per row)");
      if (changed("phone")) await upsert("phone", draft.phone.trim(), "Primary phone");
      if (changed("email")) await upsert("email", draft.email.trim(), "Dispatch email");
      if (changed("hours")) await upsert(WORKING_HOURS_KEY, draft.hours.trim(), "Working hours");
      if (JSON.stringify(draft.text) !== JSON.stringify(saved.text) || draft.services !== saved.services)
        await upsert(CONTACT_PAGE_KEY, JSON.stringify(text), "Contact page text (managed in Settings -> Contact page)");
      onSaved("Contact page saved. It is live on the website now.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const heading = (title: string, sub: string) => (
    <Box sx={{ mb: 2.5 }}>
      <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>{sub}</Typography>
    </Box>
  );
  const grid = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 } as const;
  const shrink = { inputLabel: { shrink: true } };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        {heading(
          "Company details",
          "Shown on the Contact page. The phone also drives the header and every call button, the email the footer, and the address the footer and the map.",
        )}
        <Box sx={grid}>
          <Field
            label="Address"
            value={draft.address}
            placeholder={DEFAULT_ADDRESS}
            onChange={setField("address")}
            multiline
            minRows={3}
            helperText="One line per row. Also used for the map and directions."
            slotProps={shrink}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Field label="Phone" value={draft.phone} placeholder={DEFAULT_PHONE} onChange={setField("phone")} error={Boolean(phoneError)} helperText={phoneError || "Shown exactly as typed; dialled as a US number."} slotProps={shrink} />
            <Field label="Email" value={draft.email} placeholder={DEFAULT_EMAIL} onChange={setField("email")} error={Boolean(emailError)} helperText={emailError || " "} slotProps={shrink} />
          </Box>
          <Field label="Working hours" value={draft.hours} placeholder={DEFAULT_WORKING_HOURS} onChange={setField("hours")} slotProps={shrink} />
        </Box>
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        {heading("Page text", "Leave a field empty to keep the original wording shown in grey. In the message, {name} becomes the visitor's first name.")}
        <Box sx={grid}>
          {CONTACT_TEXT_FIELDS.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              value={draft.text[f.key]}
              placeholder={DEFAULT_CONTACT_TEXT[f.key]}
              onChange={setText(f.key)}
              multiline={f.multiline}
              slotProps={shrink}
            />
          ))}
        </Box>
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        {heading("“Service Needed” options", "The choices in the quote form's dropdown, one per line. Empty = the original list.")}
        <Field
          label="Options"
          value={draft.services}
          placeholder={DEFAULT_CONTACT_TEXT.services.join("\n")}
          onChange={setField("services")}
          multiline
          minRows={5}
          slotProps={shrink}
        />
      </Panel>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "12px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          position: "sticky",
          bottom: 12,
          zIndex: 5,
          p: 1.5,
          pl: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          borderRadius: "16px",
          bgcolor: "rgba(20,21,20,0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Button href="/contact" target="_blank" rel="noopener" endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />} sx={{ color: LIME, textTransform: "none", fontWeight: 700 }}>
          View Contact page
        </Button>
        <Typography sx={{ flex: 1, minWidth: 160, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
          {dirty ? "You have unsaved changes." : " "}
        </Typography>
        <Button onClick={() => setDraft(saved)} disabled={!dirty || saving} sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, borderRadius: "999px" }}>
          Discard changes
        </Button>
        <Button
          onClick={() => void save()}
          disabled={!dirty || saving || invalid}
          variant="contained"
          disableElevation
          startIcon={saving ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : undefined}
          sx={{
            bgcolor: LIME,
            color: "#0a0a0a",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "999px",
            px: 3,
            "&:hover": { bgcolor: "#b5e600" },
            "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" },
          }}
        >
          {saving ? "Saving…" : "Save contact page"}
        </Button>
      </Box>
    </Box>
  );
}
