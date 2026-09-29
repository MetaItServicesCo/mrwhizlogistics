"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { api } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/useResource";
import { ABOUT_PAGE_KEY, DEFAULT_ABOUT, aboutDraftFrom, aboutOverrides, type AboutContent } from "@/lib/aboutPage";
import type { SiteSetting } from "@/lib/types";
import { ErrorState, Field, LIME, LoadingState, PageHeader, Panel, Toast } from "@/components/admin/ui";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { ALT_TEXT_MAX } from "@/components/admin/AltTextField";

type Section = keyof AboutContent;

const MAX_CARDS = 6;
const MAX_SKILLS = 8;
const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const shrink = { inputLabel: { shrink: true } };
const grid = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 } as const;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Dashboard -> Pages -> About Us: every piece of text and both photos on
 * /about, with a switch per section. Team members are managed in Teams and
 * the CTA buttons in Settings -> Buttons.
 */
export default function AboutPageEditor() {
  const settings = useResource<SiteSetting>("/api/settings");
  const row = settings.items.find((s) => s.key === ABOUT_PAGE_KEY);
  const saved = useMemo(() => aboutDraftFrom(row?.value), [row?.value]);
  const savedKey = JSON.stringify(saved);

  const [draft, setDraft] = useState<AboutContent>(saved);
  const [base, setBase] = useState(savedKey);
  if (base !== savedKey) {
    setBase(savedKey);
    setDraft(saved);
  }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== savedKey;

  const set = <S extends Section>(section: S, patch: Partial<AboutContent[S]>) =>
    setDraft((d) => ({ ...d, [section]: { ...d[section], ...patch } }));
  const reset = (section: Section) => setDraft((d) => ({ ...d, [section]: clone(DEFAULT_ABOUT[section]) }));

  const problems = [
    ...(["backImage", "frontImage"] as const)
      .filter((k) => draft.intro[k].alt.trim().length > ALT_TEXT_MAX)
      .map(() => `Image alt text must be ${ALT_TEXT_MAX} characters or fewer.`),
    ...(draft.seo.metaTitle.trim().length > 120 ? ["The meta title is far too long (keep it under 60 characters)."] : []),
    ...(draft.seo.metaDescription.trim().length > 320 ? ["The meta description is far too long (keep it under 160 characters)."] : []),
  ];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const value = JSON.stringify(aboutOverrides(draft));
      if (row) await api.patch(`/api/settings/${row.id}`, { value });
      else await api.post("/api/settings", { key: ABOUT_PAGE_KEY, value, label: "About page content (managed in Pages -> About Us)" });
      await settings.reload();
      setToast("About page saved. It is live on the website now.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (settings.loading && !settings.items.length) return <LoadingState label="Loading About page…" />;
  if (settings.error && !settings.items.length) return <ErrorState message={settings.error} onRetry={settings.reload} />;

  const text = <S extends Section>(section: S, key: keyof AboutContent[S] & string, label: string, multiline = false) => (
    <Field
      label={label}
      value={draft[section][key] as unknown as string}
      placeholder={DEFAULT_ABOUT[section][key] as unknown as string}
      onChange={(e) => set(section, { [key]: e.target.value } as unknown as Partial<AboutContent[S]>)}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      slotProps={shrink}
    />
  );

  const intro = draft.intro;
  const fleet = draft.fleet;
  const introAltFallback = `the section heading (“${`${intro.heading} ${intro.highlight}`.trim()}”)`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="About Us page"
        subtitle="Edit the text and photos on the About page. An empty field shows the original wording (in grey)."
      >
        <Button href="/about" target="_blank" rel="noopener" endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />} sx={{ color: LIME, textTransform: "none", fontWeight: 700 }}>
          View page
        </Button>
      </PageHeader>

      <SectionPanel title="Banner" sub="The large title at the top of the page." onReset={() => reset("hero")}>
        <Box sx={grid}>
          {text("hero", "title", "Page title (H1)")}
          {text("hero", "badge", "Small label above the title")}
        </Box>
      </SectionPanel>

      <SectionPanel
        title="Our Company"
        sub="Introduction with two photos and two feature boxes."
        visible={intro.visible}
        onVisible={(visible) => set("intro", { visible })}
        onReset={() => reset("intro")}
      >
        <Box sx={grid}>
          {text("intro", "eyebrow", "Small label")}
          {text("intro", "badge", "Rotating badge text")}
          {text("intro", "heading", "Heading")}
          {text("intro", "highlight", "Heading highlight (in green)")}
        </Box>
        <Box sx={{ mt: 2 }}>{text("intro", "text", "Paragraph", true)}</Box>
        <Box sx={{ ...grid, mt: 2 }}>
          {intro.features.map((f, i) => (
            <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Feature box {i + 1}</Typography>
              <Field
                size="small"
                label="Title"
                value={f.title}
                placeholder={DEFAULT_ABOUT.intro.features[i].title}
                onChange={(e) => set("intro", { features: intro.features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
                slotProps={shrink}
              />
              <Field
                size="small"
                label="Description"
                value={f.desc}
                placeholder={DEFAULT_ABOUT.intro.features[i].desc}
                onChange={(e) => set("intro", { features: intro.features.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })}
                multiline
                minRows={2}
                slotProps={shrink}
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ ...grid, mt: 3 }}>
          <ImageUploadField
            label="Large photo"
            value={intro.backImage}
            defaultValue={DEFAULT_ABOUT.intro.backImage}
            onChange={(backImage) => set("intro", { backImage })}
            altFallback={introAltFallback}
          />
          <ImageUploadField
            label="Small photo"
            value={intro.frontImage}
            defaultValue={DEFAULT_ABOUT.intro.frontImage}
            onChange={(frontImage) => set("intro", { frontImage })}
            altFallback={introAltFallback}
          />
        </Box>
      </SectionPanel>

      <SectionPanel
        title="Fleet & Expertise"
        sub="Fleet cards on the left, experience and skill bars on the right."
        visible={fleet.visible}
        onVisible={(visible) => set("fleet", { visible })}
        onReset={() => reset("fleet")}
      >
        <Box sx={grid}>
          {text("fleet", "fleetHeading", "Fleet heading")}
          {text("fleet", "expertiseHeading", "Expertise heading")}
          {text("fleet", "experienceHighlight", "Experience (in green), e.g. “10 years”")}
          {text("fleet", "experienceText", "Experience text")}
        </Box>

        <ListHeading
          label="Fleet cards"
          disabled={fleet.cards.length >= MAX_CARDS}
          onAdd={() => set("fleet", { cards: [...fleet.cards, { tag: "", title: "", desc: "" }] })}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {fleet.cards.map((c, i) => {
            const update = (patch: Partial<typeof c>) => set("fleet", { cards: fleet.cards.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "180px 1fr 2fr auto" }, gap: 1.5, alignItems: "start" }}>
                <Field size="small" label="Tag" value={c.tag} placeholder="01 // EXPEDITED" onChange={(e) => update({ tag: e.target.value })} slotProps={shrink} />
                <Field size="small" label="Title" value={c.title} onChange={(e) => update({ title: e.target.value })} slotProps={shrink} />
                <Field size="small" label="Description" value={c.desc} onChange={(e) => update({ desc: e.target.value })} multiline slotProps={shrink} />
                <IconButton
                  aria-label={`Remove fleet card ${i + 1}`}
                  disabled={fleet.cards.length <= 1}
                  onClick={() => set("fleet", { cards: fleet.cards.filter((_, j) => j !== i) })}
                  sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff8a8a" } }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Box>
            );
          })}
        </Box>

        <ListHeading
          label="Skill bars"
          disabled={fleet.skills.length >= MAX_SKILLS}
          onAdd={() => set("fleet", { skills: [...fleet.skills, { name: "", progress: 50 }] })}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {fleet.skills.map((s, i) => {
            const update = (patch: Partial<typeof s>) => set("fleet", { skills: fleet.skills.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 110px auto", md: "1fr 140px auto" }, gap: 1.5, alignItems: "start" }}>
                <Field size="small" label="Skill" value={s.name} onChange={(e) => update({ name: e.target.value })} slotProps={shrink} />
                <Field
                  size="small"
                  type="number"
                  label="Level (%)"
                  value={s.progress}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    update({ progress: Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0 });
                  }}
                  slotProps={{ ...shrink, htmlInput: { min: 0, max: 100, step: 5 } }}
                />
                <IconButton
                  aria-label={`Remove skill ${i + 1}`}
                  disabled={fleet.skills.length <= 1}
                  onClick={() => set("fleet", { skills: fleet.skills.filter((_, j) => j !== i) })}
                  sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff8a8a" } }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Box>
            );
          })}
        </Box>
        <Typography sx={{ mt: 1.5, fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
          Cards or skills left completely empty are ignored.
        </Typography>
      </SectionPanel>

      <SectionPanel
        title="Team"
        sub="Section heading. The people themselves are managed in Teams."
        visible={draft.team.visible}
        onVisible={(visible) => set("team", { visible })}
        onReset={() => reset("team")}
      >
        <Box sx={grid}>
          {text("team", "eyebrow", "Small label")}
          {text("team", "heading", "Heading")}
        </Box>
        <Button href="/dashboard/teams" sx={{ mt: 1.5, color: LIME, textTransform: "none", fontWeight: 700, px: 0 }}>
          Manage team members →
        </Button>
      </SectionPanel>

      <SectionPanel
        title="Call to action"
        sub="The closing banner. Its buttons are edited in Settings → Buttons."
        visible={draft.cta.visible}
        onVisible={(visible) => set("cta", { visible })}
        onReset={() => reset("cta")}
      >
        <Box sx={grid}>
          {text("cta", "eyebrow", "Small label")}
          {text("cta", "heading", "Heading")}
        </Box>
        <Box sx={{ mt: 2 }}>{text("cta", "text", "Text", true)}</Box>
        <Button href="/dashboard/settings?tab=buttons" sx={{ mt: 1.5, color: LIME, textTransform: "none", fontWeight: 700, px: 0 }}>
          Edit the buttons →
        </Button>
      </SectionPanel>

      <SectionPanel title="SEO" sub="How the page appears in Google results and when shared." onReset={() => reset("seo")}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Field
            label="Meta title"
            value={draft.seo.metaTitle}
            placeholder="About Us: Trusted Trucking Partner | Mr. Whiz Logistics"
            onChange={(e) => set("seo", { metaTitle: e.target.value })}
            helperText={counter(draft.seo.metaTitle, META_TITLE_MAX, "Used exactly as written. Empty = “About Us: Trusted Trucking Partner” + the site name.")}
            slotProps={shrink}
          />
          <Field
            label="Meta description"
            value={draft.seo.metaDescription}
            placeholder={DEFAULT_ABOUT.seo.metaDescription}
            onChange={(e) => set("seo", { metaDescription: e.target.value })}
            helperText={counter(draft.seo.metaDescription, META_DESC_MAX, "Empty = the original description.")}
            multiline
            minRows={2}
            slotProps={shrink}
          />
        </Box>
      </SectionPanel>

      {(error || problems.length > 0) && (
        <Alert severity="error" sx={{ borderRadius: "12px" }} onClose={error ? () => setError(null) : undefined}>
          {error || problems[0]}
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
        <Typography sx={{ flex: 1, minWidth: 160, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </Typography>
        <Button onClick={() => setDraft(saved)} disabled={!dirty || saving} sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700, borderRadius: "999px" }}>
          Discard changes
        </Button>
        <Button
          onClick={() => void save()}
          disabled={!dirty || saving || problems.length > 0}
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
          {saving ? "Saving…" : "Save About page"}
        </Button>
      </Box>

      <Toast
        message={toast}
        onClose={() => setToast(null)}
        action={
          <Button href="/about" target="_blank" rel="noopener" size="small" sx={{ color: "inherit", fontWeight: 700, textTransform: "none" }}>
            View live
          </Button>
        }
      />
    </Box>
  );
}

function counter(value: string, max: number, hint: string) {
  const n = value.trim().length;
  return n ? `${n}/${max} characters${n > max ? " — Google will likely cut this off" : ""}` : hint;
}

function SectionPanel({
  title,
  sub,
  visible,
  onVisible,
  onReset,
  children,
}: {
  title: string;
  sub: string;
  visible?: boolean;
  onVisible?: (visible: boolean) => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const hidden = visible === false;
  return (
    <Panel sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>{sub}</Typography>
        </Box>
        {onVisible && (
          <Box component="label" sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Show on page</Typography>
            <Switch
              checked={!hidden}
              onChange={(e) => onVisible(e.target.checked)}
              slotProps={{ input: { "aria-label": `Show ${title} section` } }}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: LIME },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME },
              }}
            />
          </Box>
        )}
        <Button
          size="small"
          onClick={onReset}
          startIcon={<RestartAltRoundedIcon />}
          sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", fontWeight: 700 }}
        >
          Reset to original
        </Button>
      </Box>
      {hidden && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: "12px", color: "rgba(255,255,255,0.75)" }}>
          This section is hidden on the website.
        </Alert>
      )}
      <Box sx={{ opacity: hidden ? 0.55 : 1 }}>{children}</Box>
    </Panel>
  );
}

function ListHeading({ label, disabled, onAdd }: { label: string; disabled: boolean; onAdd: () => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 3, mb: 1.5 }}>
      <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{label}</Typography>
      <Button size="small" onClick={onAdd} disabled={disabled} startIcon={<AddRoundedIcon />} sx={{ color: LIME, textTransform: "none", fontWeight: 700 }}>
        Add
      </Button>
    </Box>
  );
}
