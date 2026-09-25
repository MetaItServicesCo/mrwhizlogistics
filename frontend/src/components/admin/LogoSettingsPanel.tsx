"use client";

import { useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api, ApiError } from "@/lib/api";
import {
  DEFAULT_LOGO_SETTINGS,
  LOGO_SCALE_DEFAULT,
  LOGO_SCALE_KEY,
  LOGO_SCALE_MAX,
  LOGO_SCALE_MIN,
  LOGO_URL_KEY,
  logoFromSettings,
  type LogoSettings,
} from "@/lib/branding";
import { publishSiteLogo } from "@/lib/useSiteLogo";
import type { SiteSetting } from "@/lib/types";
import SiteLogo from "@/components/common/SiteLogo";
import { BORDER, LIME, Panel } from "@/components/admin/ui";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

/** A dark stand-in for the public navbar pill, so the preview is to scale. */
function NavPreview({ logo, viewport }: { logo: LogoSettings; viewport: "desktop" | "mobile" }) {
  const desktop = viewport === "desktop";
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: "14px",
        background: "radial-gradient(circle at 20% 0%, #26301a 0%, #0b0c0b 60%)",
        border: BORDER,
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2.5,
          py: 0.8,
          minHeight: desktop ? 110 : 56,
          width: desktop ? "max(100%, 720px)" : 340,
          boxSizing: "border-box",
          maxWidth: desktop ? undefined : "100%",
          borderRadius: "999px",
          bgcolor: "rgba(18,17,17,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <SiteLogo url={logo.url} scale={logo.scale} viewport={viewport} />
        </Box>
        {desktop ? (
          <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0, whiteSpace: "nowrap" }}>
            {["Hot Shot", "Box Truck", "Semi Truck", "Blog"].map((l) => (
              <Typography key={l} sx={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
                {l}
              </Typography>
            ))}
            <Box sx={{ px: 2.2, py: 1, borderRadius: "999px", bgcolor: LIME, color: "#0a0a0a", fontSize: 13, fontWeight: 800 }}>
              Call us
            </Box>
          </Box>
        ) : (
          <Box sx={{ width: 22, height: 14, borderTop: "2px solid #fff", borderBottom: "2px solid #fff", position: "relative", "&::after": { content: '""', position: "absolute", left: 0, right: 0, top: 4, borderTop: "2px solid #fff" } }} />
        )}
      </Box>
    </Box>
  );
}

export default function LogoSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteSetting[];
  /** Called after a successful save with a message for the page toast. */
  onSaved: (message: string) => void;
}) {
  const saved = useMemo(
    () => logoFromSettings(Object.fromEntries(settings.map((s) => [s.key, s.value]))),
    [settings],
  );
  const [draft, setDraft] = useState<LogoSettings>(saved);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Follow the server copy whenever it (re)loads, e.g. right after a save.
  const [base, setBase] = useState(saved);
  if (base !== saved) {
    setBase(saved);
    setDraft(saved);
  }

  const dirty = draft.url !== saved.url || draft.scale !== saved.scale;
  const isDefault = draft.url === "" && draft.scale === LOGO_SCALE_DEFAULT;

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 10 MB. Please use a smaller file.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await api.post<{ url: string }>("/api/uploads/image", fd);
      setDraft((d) => ({ ...d, url }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** PATCH the row if it exists, otherwise create it (fresh databases). */
  const upsert = (key: string, value: string, label: string) => {
    const row = settings.find((s) => s.key === key);
    return row
      ? api.patch(`/api/settings/${row.id}`, { value })
      : api.post("/api/settings", { key, value, label });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await upsert(LOGO_URL_KEY, draft.url, "Site logo image (empty = default logo)");
      await upsert(LOGO_SCALE_KEY, String(draft.scale), "Header logo size, % of default");
      publishSiteLogo(draft);
      onSaved("Logo saved. It is live on the website now.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const busy = uploading || saving;

  return (
    <Panel sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: 3, lg: 4 } }}>
        {/* ---------------------------- controls ---------------------------- */}
        <Box sx={{ width: { lg: 320 }, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            Website logo
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", mb: 2.5 }}>
            Shown in the website header, the mobile menu and this dashboard.
          </Typography>

          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", mb: 1 }}>
            Logo image
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#fff", mb: 1.5, wordBreak: "break-all" }}>
            {draft.url ? draft.url.split("/").pop() : "Default Mr. Whiz logo"}
          </Typography>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              startIcon={uploading ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <CloudUploadRoundedIcon />}
              disableElevation
              variant="contained"
              sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "999px", px: 2.2, "&:hover": { bgcolor: "#b5e600" } }}
            >
              {uploading ? "Uploading…" : "Upload new logo"}
            </Button>
            <Button
              onClick={() => setDraft(DEFAULT_LOGO_SETTINGS)}
              disabled={busy || isDefault}
              startIcon={<RestartAltRoundedIcon />}
              sx={{ color: "rgba(255,255,255,0.75)", textTransform: "none", fontWeight: 700, borderRadius: "999px", px: 2, border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Use default
            </Button>
          </Box>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", mb: 3 }}>
            PNG, JPG or WebP up to 10 MB. A transparent PNG with little empty
            space around the artwork looks best on the dark header.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
              Logo size
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: LIME }}>{draft.scale}%</Typography>
          </Box>
          <Slider
            value={draft.scale}
            min={LOGO_SCALE_MIN}
            max={LOGO_SCALE_MAX}
            step={5}
            marks={[{ value: LOGO_SCALE_DEFAULT, label: "Default" }]}
            onChange={(_, v) => setDraft((d) => ({ ...d, scale: v as number }))}
            disabled={busy}
            aria-label="Logo size"
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}%`}
            sx={{
              color: LIME,
              "& .MuiSlider-markLabel": { color: "rgba(255,255,255,0.45)", fontSize: 11.5 },
              "& .MuiSlider-mark": { bgcolor: "rgba(255,255,255,0.5)", height: 10, width: 2 },
            }}
          />
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", mt: 1.5 }}>
            On phones the logo grows at most to 130% so the menu button keeps room.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2.5, borderRadius: "12px" }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button
              onClick={() => void save()}
              disabled={!dirty || busy}
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
              {saving ? "Saving…" : "Save logo"}
            </Button>
            <Button
              onClick={() => setDraft(saved)}
              disabled={!dirty || busy}
              sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, borderRadius: "999px" }}
            >
              Discard changes
            </Button>
          </Box>
        </Box>

        {/* ---------------------------- previews ---------------------------- */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
              Preview · desktop
            </Typography>
            {dirty && (
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: LIME }}>Unsaved changes</Typography>
            )}
          </Box>
          <NavPreview logo={draft} viewport="desktop" />

          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", mt: 3, mb: 1 }}>
            Preview · mobile
          </Typography>
          <NavPreview logo={draft} viewport="mobile" />

          <Button
            href="/"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ mt: 2, color: LIME, textTransform: "none", fontWeight: 700, px: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
          >
            Check it on the live site
          </Button>
        </Box>
      </Box>
    </Panel>
  );
}
