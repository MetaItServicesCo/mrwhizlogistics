"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api, ApiError } from "@/lib/api";
import {
  CTA_DEFINITIONS,
  CTA_SETTING_KEY,
  parseCtaOverrides,
  isSafeLinkTemplate,
  resolveCta,
  type CtaDefinition,
  type CtaOverride,
  type CtaOverrides,
} from "@/lib/cta";
import type { SiteSetting } from "@/lib/types";
import { Field, LIME, Panel } from "@/components/admin/ui";

function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

/** What an empty link field means for this button. */
function linkPlaceholder(def: CtaDefinition): string {
  if (def.kind === "quote") return "Empty = opens the quote form";
  if (def.kind === "auto") return "Empty = links to the service on screen";
  return def.href;
}

/** Keep only what differs from the built-in default. */
function compact(draft: CtaOverrides): CtaOverrides {
  const out: CtaOverrides = {};
  for (const def of CTA_DEFINITIONS) {
    const o = draft[def.id];
    if (!o) continue;
    const label = (o.label ?? "").trim();
    const href = (o.href ?? "").trim();
    const entry: CtaOverride = {};
    if (label && label !== def.label) entry.label = label;
    if (href && href !== def.href) entry.href = href;
    if (o.hidden) entry.hidden = true;
    if (Object.keys(entry).length) out[def.id] = entry;
  }
  return out;
}

/** Links may use {phone}/{tel}/{slug}; check the filled-in result is safe. */
function linkError(value: string): string | null {
  if (!value.trim() || isSafeLinkTemplate(value)) return null;
  return "Use a page path like /contact, a full https:// address, tel: or mailto:.";
}

export default function CtaSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteSetting[];
  onSaved: (message: string) => void;
}) {
  const row = settings.find((s) => s.key === CTA_SETTING_KEY);
  const phone = settings.find((s) => s.key === "phone")?.value || "";
  const saved = useMemo(() => parseCtaOverrides(row?.value), [row?.value]);

  const [draft, setDraft] = useState<CtaOverrides>(saved);
  // Follow the server copy whenever it (re)loads, e.g. right after a save.
  const savedKey = JSON.stringify(saved);
  const [base, setBase] = useState(savedKey);
  if (base !== savedKey) {
    setBase(savedKey);
    setDraft(saved);
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(compact(draft)) !== JSON.stringify(compact(saved));
  const errors = useMemo(
    () =>
      Object.fromEntries(
        CTA_DEFINITIONS.map((d) => [d.id, linkError(draft[d.id]?.href ?? "")]),
      ) as Record<string, string | null>,
    [draft],
  );
  const hasErrors = Object.values(errors).some(Boolean);
  const changedCount = Object.keys(compact(draft)).length;

  const groups = useMemo(() => {
    const m = new Map<string, CtaDefinition[]>();
    for (const d of CTA_DEFINITIONS) m.set(d.group, [...(m.get(d.group) ?? []), d]);
    return [...m.entries()];
  }, []);

  const update = (id: string, patch: CtaOverride) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const reset = (id: string) =>
    setDraft((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const value = JSON.stringify(compact(draft));
      if (row) await api.patch(`/api/settings/${row.id}`, { value });
      else
        await api.post("/api/settings", {
          key: CTA_SETTING_KEY,
          value,
          label: "Website buttons (managed in Settings -> Buttons)",
        });
      onSaved("Buttons saved. They are live on the website now.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const saveBar = (
    <Box
      sx={{
        position: "sticky",
        bottom: 12,
        zIndex: 5,
        mt: 3,
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
      <Typography sx={{ flex: 1, minWidth: 180, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
        {dirty
          ? "You have unsaved changes."
          : changedCount
            ? `${changedCount} button${changedCount === 1 ? "" : "s"} customised.`
            : "All buttons use their original text and links."}
      </Typography>
      <Button
        onClick={() => setDraft(saved)}
        disabled={!dirty || saving}
        sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, borderRadius: "999px" }}
      >
        Discard changes
      </Button>
      <Button
        onClick={() => void save()}
        disabled={!dirty || saving || hasErrors}
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
        {saving ? "Saving…" : "Save buttons"}
      </Button>
    </Box>
  );

  return (
    <Box>
      <Panel sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>
          Website buttons
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          Change the text or destination of any call-to-action button, or hide
          it. Leave a field empty to keep the original. Use{" "}
          <Box component="code" sx={{ color: LIME }}>{"{phone}"}</Box> for the
          company phone and{" "}
          <Box component="code" sx={{ color: LIME }}>{"{tel}"}</Box> for a
          tap-to-call link — both follow the phone number in Site settings.
        </Typography>
      </Panel>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {groups.map(([group, defs]) => (
          <Panel key={group} sx={{ p: { xs: 2, md: 3 } }}>
            <Typography component="h3" sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 2 }}>
              {group}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {defs.map((def) => {
                const o = draft[def.id] ?? {};
                const custom = Boolean(compact({ [def.id]: o })[def.id]);
                const preview = resolveCta(def.id, draft, { phone, slug: "example" });
                return (
                  <Box
                    key={def.id}
                    data-cta={def.id}
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: custom ? `${LIME}44` : "rgba(255,255,255,0.08)",
                      bgcolor: o.hidden ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
                      <Typography sx={{ flex: 1, minWidth: 200, fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
                        {def.location}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "999px",
                          fontSize: 12,
                          fontWeight: 800,
                          bgcolor: o.hidden ? "rgba(255,255,255,0.06)" : LIME,
                          color: o.hidden ? "rgba(255,255,255,0.4)" : "#0a0a0a",
                          textDecoration: o.hidden ? "line-through" : "none",
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title="Preview"
                      >
                        {preview.label || "—"}
                      </Box>
                      <Box component="label" sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>Show</Typography>
                        <Switch
                          size="small"
                          checked={!o.hidden}
                          onChange={(e) => update(def.id, { hidden: !e.target.checked })}
                          slotProps={{ input: { "aria-label": `Show ${def.location}` } }}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: LIME },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME },
                          }}
                        />
                      </Box>
                      <Button
                        size="small"
                        onClick={() => reset(def.id)}
                        disabled={!custom}
                        startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
                        sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", fontWeight: 700 }}
                      >
                        Reset
                      </Button>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" }, gap: 1.5 }}>
                      <Field
                        size="small"
                        label="Button text"
                        value={o.label ?? ""}
                        placeholder={def.label}
                        onChange={(e) => update(def.id, { label: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <Field
                        size="small"
                        label="Link"
                        value={o.href ?? ""}
                        placeholder={linkPlaceholder(def)}
                        onChange={(e) => update(def.id, { href: e.target.value })}
                        error={Boolean(errors[def.id])}
                        helperText={
                          errors[def.id] ||
                          (preview.href ? (
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                              Goes to {preview.href}
                              {preview.href.startsWith("/") && !preview.href.includes("example") && (
                                <Box
                                  component="a"
                                  href={preview.href}
                                  target="_blank"
                                  rel="noopener"
                                  aria-label={`Open ${preview.href}`}
                                  sx={{ color: LIME, display: "inline-flex" }}
                                >
                                  <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                                </Box>
                              )}
                            </Box>
                          ) : def.kind === "quote" ? (
                            "Opens the quote form"
                          ) : (
                            "Links to the service on screen"
                          ))
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Panel>
        ))}
      </Box>

      {saveBar}
    </Box>
  );
}
