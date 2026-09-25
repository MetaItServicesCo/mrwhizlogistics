"use client";

import { useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api, ApiError } from "@/lib/api";
import {
  DEFAULT_FOOTER_LOGO_SETTINGS,
  DEFAULT_LOGO_SETTINGS,
  FOOTER_LOGO_SCALE_KEY,
  FOOTER_LOGO_URL_KEY,
  FOOTER_SHOW_NAME_KEY,
  LOGO_SCALE_DEFAULT,
  LOGO_SCALE_KEY,
  LOGO_SCALE_MAX,
  LOGO_SCALE_MIN,
  LOGO_URL_KEY,
  footerLogoFromSettings,
  logoFromSettings,
  type FooterLogoSettings,
  type LogoSettings,
} from "@/lib/branding";
import { publishSiteLogo } from "@/lib/useSiteLogo";
import type { SiteSetting } from "@/lib/types";
import SiteLogo from "@/components/common/SiteLogo";
import { BORDER, LIME, Panel } from "@/components/admin/ui";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  settings: SiteSetting[];
  /** Called after a successful save with a message for the page toast. */
  onSaved: (message: string) => void;
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

function errorMessage(e: unknown) {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Something went wrong.";
}

function settingsRecord(settings: SiteSetting[]) {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

/** Upload a logo image and return its /uploads path. Throws a friendly message. */
async function uploadLogo(file: File): Promise<string> {
  if (!ACCEPT.split(",").includes(file.type)) throw new Error("Please choose a PNG, JPG or WebP image.");
  if (file.size > MAX_BYTES) throw new Error("That image is larger than 10 MB. Please use a smaller file.");
  const fd = new FormData();
  fd.append("file", file);
  const { url } = await api.post<{ url: string }>("/api/uploads/image", fd);
  return url;
}

/** PATCH the row if it exists, otherwise create it (fresh databases). */
function upsertSetting(settings: SiteSetting[], key: string, value: string, label: string) {
  const row = settings.find((s) => s.key === key);
  return row
    ? api.patch(`/api/settings/${row.id}`, { value })
    : api.post("/api/settings", { key, value, label });
}

/**
 * Draft state that resets when this section's saved values change (e.g. right
 * after its own save). Compared by value, so saving the other section - which
 * reloads every setting - doesn't throw away edits in progress here.
 */
function useDraft<T>(saved: T) {
  const [draft, setDraft] = useState<T>(saved);
  const key = JSON.stringify(saved);
  const [base, setBase] = useState(key);
  if (base !== key) {
    setBase(key);
    setDraft(saved);
  }
  return [draft, setDraft] as const;
}

const labelSx = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.6,
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
} as const;

const hintSx = { fontSize: 12, color: "rgba(255,255,255,0.4)" } as const;

const primaryBtnSx = {
  bgcolor: LIME,
  color: "#0a0a0a",
  fontWeight: 800,
  textTransform: "none",
  borderRadius: "999px",
  "&:hover": { bgcolor: "#b5e600" },
  "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" },
} as const;

const outlineBtnSx = {
  color: "rgba(255,255,255,0.75)",
  textTransform: "none",
  fontWeight: 700,
  borderRadius: "999px",
  px: 2,
  border: "1px solid rgba(255,255,255,0.15)",
} as const;

/** Section header + two-column layout: controls left, previews right. */
function Section({
  title,
  subtitle,
  controls,
  previews,
}: {
  title: string;
  subtitle: string;
  controls: React.ReactNode;
  previews: React.ReactNode;
}) {
  return (
    <Panel sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: 3, lg: 4 } }}>
        <Box sx={{ width: { lg: 320 }, flexShrink: 0 }}>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", mb: 2.5 }}>{subtitle}</Typography>
          {controls}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>{previews}</Box>
      </Box>
    </Panel>
  );
}

function ImageControls({
  current,
  uploadLabel,
  resetLabel,
  resetDisabled,
  busy,
  uploading,
  onUpload,
  onReset,
}: {
  current: string;
  uploadLabel: string;
  resetLabel: string;
  resetDisabled: boolean;
  busy: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onReset: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Typography sx={{ ...labelSx, mb: 1 }}>Logo image</Typography>
      <Typography sx={{ fontSize: 13.5, color: "#fff", mb: 1.5, wordBreak: "break-all" }}>{current}</Typography>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          startIcon={uploading ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <CloudUploadRoundedIcon />}
          disableElevation
          variant="contained"
          sx={{ ...primaryBtnSx, px: 2.2 }}
        >
          {uploading ? "Uploading…" : uploadLabel}
        </Button>
        <Button onClick={onReset} disabled={busy || resetDisabled} startIcon={<RestartAltRoundedIcon />} sx={outlineBtnSx}>
          {resetLabel}
        </Button>
      </Box>
      <Typography sx={{ ...hintSx, mb: 3 }}>
        PNG, JPG or WebP up to 10 MB. A transparent PNG with little empty space
        around the artwork looks best on the dark background.
      </Typography>
    </>
  );
}

function SizeSlider({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
        <Typography sx={labelSx}>Logo size</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: LIME }}>{value}%</Typography>
      </Box>
      <Slider
        value={value}
        min={LOGO_SCALE_MIN}
        max={LOGO_SCALE_MAX}
        step={5}
        marks={[{ value: LOGO_SCALE_DEFAULT, label: "Default" }]}
        onChange={(_, v) => onChange(v as number)}
        disabled={disabled}
        aria-label={label}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `${v}%`}
        sx={{
          color: LIME,
          "& .MuiSlider-markLabel": { color: "rgba(255,255,255,0.45)", fontSize: 11.5 },
          "& .MuiSlider-mark": { bgcolor: "rgba(255,255,255,0.5)", height: 10, width: 2 },
        }}
      />
    </>
  );
}

function SaveBar({
  error,
  onDismissError,
  dirty,
  busy,
  saving,
  saveLabel,
  onSave,
  onDiscard,
}: {
  error: string | null;
  onDismissError: () => void;
  dirty: boolean;
  busy: boolean;
  saving: boolean;
  saveLabel: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mt: 2.5, borderRadius: "12px" }} onClose={onDismissError}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
        <Button
          onClick={onSave}
          disabled={!dirty || busy}
          variant="contained"
          disableElevation
          startIcon={saving ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : undefined}
          sx={{ ...primaryBtnSx, px: 3 }}
        >
          {saving ? "Saving…" : saveLabel}
        </Button>
        <Button
          onClick={onDiscard}
          disabled={!dirty || busy}
          sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, borderRadius: "999px" }}
        >
          Discard changes
        </Button>
      </Box>
    </>
  );
}

function PreviewLabel({ children, dirty }: { children: React.ReactNode; dirty?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
      <Typography sx={labelSx}>{children}</Typography>
      {dirty && <Typography sx={{ fontSize: 12, fontWeight: 700, color: LIME }}>Unsaved changes</Typography>}
    </Box>
  );
}

function LiveSiteLink() {
  return (
    <Button
      href="/"
      target="_blank"
      rel="noopener"
      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
      sx={{ mt: 2, color: LIME, textTransform: "none", fontWeight: 700, px: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
    >
      Check it on the live site
    </Button>
  );
}

/** Upload / save state shared by both sections. */
function useLogoEditor() {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, apply: (url: string) => void) => {
    setError(null);
    setUploading(true);
    try {
      apply(await uploadLogo(file));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const save = async (work: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return { uploading, saving, error, setError, upload, save, busy: uploading || saving };
}

/* ------------------------------------------------------------------ */
/* Header logo                                                          */
/* ------------------------------------------------------------------ */

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

function HeaderLogoSection({ settings, onSaved }: Props) {
  const saved = useMemo(() => logoFromSettings(settingsRecord(settings)), [settings]);
  const [draft, setDraft] = useDraft<LogoSettings>(saved);
  const ed = useLogoEditor();

  const dirty = draft.url !== saved.url || draft.scale !== saved.scale;
  const isDefault = draft.url === "" && draft.scale === LOGO_SCALE_DEFAULT;

  const save = () =>
    ed.save(async () => {
      await upsertSetting(settings, LOGO_URL_KEY, draft.url, "Site logo image (empty = default logo)");
      await upsertSetting(settings, LOGO_SCALE_KEY, String(draft.scale), "Header logo size, % of default");
      publishSiteLogo(draft);
      onSaved("Header logo saved. It is live on the website now.");
    });

  return (
    <Section
      title="Header logo"
      subtitle="Shown in the website header, the mobile menu and this dashboard. The footer uses it too unless you give the footer its own logo below."
      controls={
        <>
          <ImageControls
            current={draft.url ? draft.url.split("/").pop()! : "Default Mr. Whiz logo"}
            uploadLabel="Upload new logo"
            resetLabel="Use default"
            resetDisabled={isDefault}
            busy={ed.busy}
            uploading={ed.uploading}
            onUpload={(f) => void ed.upload(f, (url) => setDraft((d) => ({ ...d, url })))}
            onReset={() => setDraft(DEFAULT_LOGO_SETTINGS)}
          />
          <SizeSlider
            label="Header logo size"
            value={draft.scale}
            onChange={(scale) => setDraft((d) => ({ ...d, scale }))}
            disabled={ed.busy}
          />
          <Typography sx={{ ...hintSx, mt: 1.5 }}>
            On phones the logo grows at most to 130% so the menu button keeps room.
          </Typography>
          <SaveBar
            error={ed.error}
            onDismissError={() => ed.setError(null)}
            dirty={dirty}
            busy={ed.busy}
            saving={ed.saving}
            saveLabel="Save header logo"
            onSave={() => void save()}
            onDiscard={() => setDraft(saved)}
          />
        </>
      }
      previews={
        <>
          <PreviewLabel dirty={dirty}>Preview · desktop</PreviewLabel>
          <NavPreview logo={draft} viewport="desktop" />
          <Box sx={{ mt: 3 }}>
            <PreviewLabel>Preview · mobile</PreviewLabel>
          </Box>
          <NavPreview logo={draft} viewport="mobile" />
          <LiveSiteLink />
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Footer logo                                                          */
/* ------------------------------------------------------------------ */

/** A stand-in for the footer's first column: logo, then contact lines. */
function FooterPreview({
  url,
  footer,
  companyName,
  viewport,
}: {
  url: string;
  footer: FooterLogoSettings;
  companyName: string;
  viewport: "desktop" | "mobile";
}) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "14px",
        bgcolor: "#050505",
        border: BORDER,
        width: viewport === "mobile" ? 340 : "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", maxWidth: "100%", mb: 2.5 }}>
        <SiteLogo slot="footer" url={url} scale={footer.scale} viewport={viewport} alt={companyName} />
        {footer.showName && (
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: viewport === "mobile" ? 20 : 21, letterSpacing: "-0.5px" }}>
            {companyName}
          </Typography>
        )}
      </Box>
      <Box sx={{ height: 12, width: "55%", borderRadius: 1, bgcolor: "rgba(255,255,255,0.18)", mb: 1 }} />
      <Box sx={{ height: 10, width: "35%", borderRadius: 1, bgcolor: "rgba(255,255,255,0.1)" }} />
    </Box>
  );
}

function FooterLogoSection({ settings, onSaved }: Props) {
  const record = useMemo(() => settingsRecord(settings), [settings]);
  const header = useMemo(() => logoFromSettings(record), [record]);
  const saved = useMemo(() => footerLogoFromSettings(record), [record]);
  const companyName = (record.company_name || "").trim() || "Mr. Whiz Logistics";
  const [draft, setDraft] = useDraft<FooterLogoSettings>(saved);
  const ed = useLogoEditor();

  const dirty = draft.url !== saved.url || draft.scale !== saved.scale || draft.showName !== saved.showName;
  const isDefault =
    draft.url === "" && draft.scale === LOGO_SCALE_DEFAULT && draft.showName === DEFAULT_FOOTER_LOGO_SETTINGS.showName;
  const effectiveUrl = draft.url || header.url;

  const save = () =>
    ed.save(async () => {
      await upsertSetting(settings, FOOTER_LOGO_URL_KEY, draft.url, "Footer logo image (empty = same as header logo)");
      await upsertSetting(settings, FOOTER_LOGO_SCALE_KEY, String(draft.scale), "Footer logo size, % of default");
      await upsertSetting(settings, FOOTER_SHOW_NAME_KEY, String(draft.showName), "Show company name next to footer logo");
      onSaved("Footer logo saved. It is live on the website now.");
    });

  return (
    <Section
      title="Footer logo"
      subtitle="Shown at the top of the website footer. By default it is the same image as the header logo."
      controls={
        <>
          <ImageControls
            current={draft.url ? draft.url.split("/").pop()! : "Same as header logo"}
            uploadLabel="Upload footer logo"
            resetLabel="Use header logo"
            resetDisabled={!draft.url}
            busy={ed.busy}
            uploading={ed.uploading}
            onUpload={(f) => void ed.upload(f, (url) => setDraft((d) => ({ ...d, url })))}
            onReset={() => setDraft((d) => ({ ...d, url: "" }))}
          />
          <SizeSlider
            label="Footer logo size"
            value={draft.scale}
            onChange={(scale) => setDraft((d) => ({ ...d, scale }))}
            disabled={ed.busy}
          />
          <Box
            component="label"
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mt: 2.5, cursor: "pointer" }}
          >
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>Show company name</Typography>
              <Typography sx={hintSx}>Text beside the logo, from the company_name setting.</Typography>
            </Box>
            <Switch
              checked={draft.showName}
              onChange={(e) => setDraft((d) => ({ ...d, showName: e.target.checked }))}
              disabled={ed.busy}
              slotProps={{ input: { "aria-label": "Show company name next to the footer logo" } }}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: LIME },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME },
              }}
            />
          </Box>
          <SaveBar
            error={ed.error}
            onDismissError={() => ed.setError(null)}
            dirty={dirty}
            busy={ed.busy}
            saving={ed.saving}
            saveLabel="Save footer logo"
            onSave={() => void save()}
            onDiscard={() => setDraft(saved)}
          />
          {!isDefault && !dirty && (
            <Button
              onClick={() => setDraft(DEFAULT_FOOTER_LOGO_SETTINGS)}
              disabled={ed.busy}
              sx={{ mt: 1, px: 0, color: "rgba(255,255,255,0.5)", textTransform: "none", fontWeight: 600, fontSize: 12.5 }}
            >
              Reset footer to defaults
            </Button>
          )}
        </>
      }
      previews={
        <>
          <PreviewLabel dirty={dirty}>Preview · desktop</PreviewLabel>
          <FooterPreview url={effectiveUrl} footer={draft} companyName={companyName} viewport="desktop" />
          <Box sx={{ mt: 3 }}>
            <PreviewLabel>Preview · mobile</PreviewLabel>
          </Box>
          <FooterPreview url={effectiveUrl} footer={draft} companyName={companyName} viewport="mobile" />
          <LiveSiteLink />
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */

export default function LogoSettingsPanel(props: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <HeaderLogoSection {...props} />
      <FooterLogoSection {...props} />
    </Box>
  );
}
