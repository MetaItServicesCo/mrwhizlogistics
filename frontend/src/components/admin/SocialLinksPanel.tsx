"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api, ApiError } from "@/lib/api";
import { SOCIAL_PLATFORMS, normaliseSocialUrl, type SocialPlatform } from "@/lib/socialLinks";
import type { SiteSetting } from "@/lib/types";
import SocialIcon from "@/components/common/SocialIcon";
import { Field, ACCENT, Panel } from "@/components/admin/ui";

type Props = {
  settings: SiteSetting[];
  /** Called after a successful save with a message for the page toast. */
  onSaved: (message: string) => void;
};

function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

const stored = (settings: SiteSetting[]) =>
  Object.fromEntries(
    SOCIAL_PLATFORMS.map((p) => {
      const v = (settings.find((s) => s.key === p.key)?.value || "").trim();
      return [p.key, v === "#" ? "" : v];
    }),
  ) as Record<string, string>;

/**
 * Settings -> Social media: the company's profiles. Each filled-in profile
 * shows as an icon in the website footer and is listed for search engines.
 */
export default function SocialLinksPanel({ settings, onSaved }: Props) {
  const saved = useMemo(() => stored(settings), [settings]);
  const savedKey = JSON.stringify(saved);
  const [base, setBase] = useState(savedKey);
  const [draft, setDraft] = useState<Record<string, string>>(saved);
  // Reset the form when the saved values change (after a save / reload).
  if (base !== savedKey) {
    setBase(savedKey);
    setDraft(saved);
  }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checked = useMemo(
    () => Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, normaliseSocialUrl(p, draft[p.key] || "")])),
    [draft],
  );
  const dirty = SOCIAL_PLATFORMS.some((p) => (draft[p.key] || "").trim() !== saved[p.key]);
  const hasErrors = SOCIAL_PLATFORMS.some((p) => checked[p.key].error);
  const live = SOCIAL_PLATFORMS.filter((p) => checked[p.key].url && !checked[p.key].error);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const p of SOCIAL_PLATFORMS) {
        const value = checked[p.key].url; // cleaned-up link ("" = hidden)
        if (value === saved[p.key]) continue;
        const row = settings.find((s) => s.key === p.key);
        if (row) await api.patch(`/api/settings/${row.id}`, { value });
        else await api.post("/api/settings", { key: p.key, value, label: `${p.label} profile URL (footer icon)` });
      }
      onSaved(
        live.length
          ? `Social media saved. ${live.length} icon${live.length === 1 ? " is" : "s are"} live in the footer now.`
          : "Social media saved. No icons are shown in the footer.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const row = (p: SocialPlatform) => {
    const { url, error: fieldError } = checked[p.key];
    const value = draft[p.key] || "";
    const cleaned = !fieldError && url && url !== value.trim();
    return (
      <Box
        key={p.key}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "180px minmax(0, 1fr) 44px" },
          gap: { xs: 1, md: 2 },
          alignItems: "start",
          py: 2,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pt: { md: 1 } }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: url && !fieldError ? p.color : "rgba(255,255,255,0.06)",
              color: "#fff",
              border: p.color === "#000000" && url && !fieldError ? "1px solid rgba(255,255,255,0.25)" : "none",
              flexShrink: 0,
            }}
          >
            <SocialIcon id={p.id} sx={{ fontSize: p.id === "x" ? 15 : 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#fff" }}>{p.label}</Typography>
        </Box>
        <Field
          size="small"
          label={`${p.label} link`}
          placeholder={p.placeholder}
          value={value}
          onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value }))}
          error={!!fieldError}
          helperText={
            fieldError ||
            (cleaned ? `Will be saved as ${url}` : !value.trim() ? "Empty — no icon in the footer." : p.hint || " ")
          }
          slotProps={{ htmlInput: { inputMode: "url", spellCheck: false, autoCapitalize: "off" } }}
        />
        <Tooltip title={url && !fieldError ? "Open to check the link" : ""}>
          <span>
            <IconButton
              component="a"
              href={url && !fieldError ? url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!url || !!fieldError}
              aria-label={`Open ${p.label} link`}
              sx={{ mt: { md: 0.5 }, color: "rgba(255,255,255,0.6)", "&:hover": { color: ACCENT } }}
            >
              <OpenInNewRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box>
      <Panel sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>
          Social media
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, mb: 2 }}>
          Paste the link to each of your company profiles. Every filled-in profile
          appears as an icon in the website footer and is shared with Google so it
          can connect the profiles to your business. Leave a field empty to hide
          that icon. You can also type <Box component="code" sx={{ color: ACCENT }}>@yourname</Box>{" "}
          for Instagram, X, YouTube and TikTok.
        </Typography>

        {SOCIAL_PLATFORMS.map(row)}

        {/* Footer preview */}
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: "14px",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: "#0e2f4d", textTransform: "uppercase" }}>
            Footer preview
          </Typography>
          {live.length ? (
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }} aria-label="Footer social icons preview">
              {live.map((p) => (
                <Box
                  key={p.key}
                  title={p.label}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(14,47,77,0.06)",
                    color: "#0e2f4d",
                  }}
                >
                  <SocialIcon id={p.id} sx={{ fontSize: p.id === "x" ? 16 : 18 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: "rgba(14,47,77,0.6)" }}>
              No profiles yet — the footer shows no social icons.
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5, flexWrap: "wrap" }}>
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
              bgcolor: ACCENT,
              color: "#081c31",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              "&:hover": { bgcolor: "#e66f00" },
              "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" },
            }}
          >
            {saving ? "Saving…" : "Save social media"}
          </Button>
        </Box>
      </Panel>
    </Box>
  );
}
