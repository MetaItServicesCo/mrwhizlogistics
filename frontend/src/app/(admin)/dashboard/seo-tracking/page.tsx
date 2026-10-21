"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { api } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/useResource";
import type { SiteSetting } from "@/lib/types";
import {
  LIMITS,
  SEO_TRACKING_KEY,
  normalizePath,
  parseSchemaJson,
  parseSeoTracking,
  validClarity,
  validGa4,
  validToken,
  verificationToken,
  type SeoTracking,
} from "@/lib/seoTracking";
import { ErrorState, Field, FormDialog, ACCENT, LoadingState, PageHeader, Panel, Toast } from "@/components/admin/ui";
import { ACCENT_HOVER } from "@/theme/brand";

type CardId = "verification" | "analytics" | "sitemap" | "robots" | "llms" | "schema";
const shrink = { inputLabel: { shrink: true } };
const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: ACCENT },
};
const toggleSx = {
  "& .MuiToggleButton-root": { color: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.14)", textTransform: "none", px: 2 },
  "& .Mui-selected": { color: "#081c31 !important", bgcolor: `${ACCENT} !important` },
};
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function Chip({ label, tone = "ok" }: { label: string; tone?: "ok" | "off" }) {
  return (
    <Box
      component="span"
      sx={{
        px: 1.2,
        py: 0.3,
        borderRadius: "999px",
        fontSize: 12,
        fontWeight: 800,
        ...(tone === "ok" ? { bgcolor: `${ACCENT}22`, color: ACCENT } : { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }),
      }}
    >
      {label}
    </Box>
  );
}

function SeoCard({
  icon,
  title,
  description,
  chips,
  link,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  chips: React.ReactNode;
  link?: string;
  onEdit: () => void;
}) {
  return (
    <Panel sx={{ p: { xs: 2.2, md: 3 }, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: `${ACCENT}14`,
            color: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: "#fff", mb: 0.6 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, mb: 1.6 }}>{description}</Typography>
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>{chips}</Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5, pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {link && (
          <Button
            href={link}
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", px: 0.5 }}
          >
            {link}
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onEdit}
          endIcon={<ChevronRightRoundedIcon />}
          aria-label={`Edit ${title}`}
          sx={{ bgcolor: ACCENT, color: "#081c31", fontWeight: 800, textTransform: "none", borderRadius: "10px", px: 2, "&:hover": { bgcolor: ACCENT_HOVER } }}
        >
          Edit
        </Button>
      </Box>
    </Panel>
  );
}

/**
 * Dashboard -> SEO & Tracking: verification, analytics, sitemap, robots.txt,
 * llms.txt and site-wide schema markup. Saved as one setting; live at once.
 */
export default function SeoTrackingPage() {
  const settings = useResource<SiteSetting>("/api/settings");
  const row = settings.items.find((s) => s.key === SEO_TRACKING_KEY);
  const saved = useMemo(() => parseSeoTracking(row?.value), [row?.value]);
  const [editing, setEditing] = useState<CardId | null>(null);
  const [draft, setDraft] = useState<SeoTracking>(saved);
  const [excludeText, setExcludeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sitemapCount, setSitemapCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/sitemap.xml")
      .then((r) => (r.ok ? r.text() : ""))
      .then((xml) => alive && setSitemapCount((xml.match(/<loc>/g) || []).length))
      .catch(() => alive && setSitemapCount(null));
    return () => {
      alive = false;
    };
  }, [row?.value]);

  const open = (id: CardId) => {
    setError(null);
    setDraft(clone(saved));
    setExcludeText(saved.sitemap.exclude.join("\n"));
    setEditing(id);
  };
  const set = <K extends keyof SeoTracking>(key: K, patch: Partial<SeoTracking[K]>) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  const problem = (): string | null => {
    const v = draft.verification;
    const a = draft.analytics;
    if (editing === "verification") {
      if (!validToken(verificationToken(v.google))) return "The Google code doesn't look right. Paste the code or the whole meta tag from Search Console.";
      if (!validToken(verificationToken(v.bing))) return "The Bing code doesn't look right. Paste the code or the whole meta tag from Bing Webmaster Tools.";
    }
    if (editing === "analytics") {
      if (!validGa4(a.ga4.trim().toUpperCase())) return "The Google Analytics ID should look like G-XXXXXXXXXX.";
      if (!validClarity(a.clarity.trim().toLowerCase())) return "The Clarity project ID should be the short code from Clarity (letters and numbers).";
    }
    if (editing === "robots" && draft.robots.mode === "custom") {
      if (!draft.robots.custom.trim()) return "Enter your robots.txt text, or switch back to Recommended.";
      if (draft.robots.custom.length > LIMITS.robots) return "robots.txt is too long.";
    }
    if (editing === "llms" && draft.llms.mode === "custom") {
      if (!draft.llms.custom.trim()) return "Enter your llms.txt text, or switch back to Recommended.";
      if (draft.llms.custom.length > LIMITS.llms) return "llms.txt is too long.";
    }
    if (editing === "schema") {
      for (const [i, b] of draft.schema.blocks.entries()) {
        const parsed = parseSchemaJson(b.json);
        if (parsed.error) return `Block ${i + 1}${b.name ? ` (${b.name})` : ""}: ${parsed.error}`;
        if (b.json.length > LIMITS.block) return `Block ${i + 1} is too long.`;
      }
    }
    return null;
  };

  const save = async () => {
    const issue = problem();
    if (issue) return setError(issue);
    const clean: SeoTracking = {
      ...draft,
      verification: { google: verificationToken(draft.verification.google), bing: verificationToken(draft.verification.bing) },
      analytics: { ga4: draft.analytics.ga4.trim().toUpperCase(), clarity: draft.analytics.clarity.trim().toLowerCase() },
      sitemap: {
        exclude: [...new Set(excludeText.split(/\r?\n/).map(normalizePath).filter(Boolean))].slice(0, LIMITS.exclude),
      },
      schema: {
        business: draft.schema.business,
        blocks: draft.schema.blocks
          .filter((b) => b.json.trim())
          .map((b) => ({ name: b.name.trim(), json: JSON.stringify(parseSchemaJson(b.json).value, null, 2) })),
      },
    };
    setBusy(true);
    setError(null);
    try {
      const value = JSON.stringify(clean);
      if (row) await api.patch(`/api/settings/${row.id}`, { value });
      else await api.post("/api/settings", { key: SEO_TRACKING_KEY, value, label: "SEO & Tracking (managed in Dashboard -> SEO & Tracking)" });
      await settings.reload();
      setEditing(null);
      setToast("Saved. It's live on the website now.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (settings.loading && !settings.items.length) return <LoadingState label="Loading SEO & Tracking…" />;
  if (settings.error && !settings.items.length) return <ErrorState message={settings.error} onRetry={settings.reload} />;

  const s = saved;
  const schemaCount = (s.schema.business ? 1 : 0) + s.schema.blocks.length;
  const titles: Record<CardId, string> = {
    verification: "Search engine verification",
    analytics: "Analytics & tracking",
    sitemap: "Sitemap (sitemap.xml)",
    robots: "robots.txt",
    llms: "llms.txt",
    schema: "Schema markup (JSON-LD)",
  };

  return (
    <Box>
      <PageHeader
        title="SEO & Tracking"
        subtitle="Everything search engines, analytics and AI assistants read from the website. Changes go live as soon as you save."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
        <SeoCard
          icon={<VerifiedRoundedIcon />}
          title={titles.verification}
          description="Proves to Google Search Console and Bing Webmaster Tools that you own the site."
          chips={
            <>
              <Chip label={s.verification.google ? "Google ✓" : "Google not set"} tone={s.verification.google ? "ok" : "off"} />
              <Chip label={s.verification.bing ? "Bing ✓" : "Bing not set"} tone={s.verification.bing ? "ok" : "off"} />
            </>
          }
          onEdit={() => open("verification")}
        />
        <SeoCard
          icon={<InsightsRoundedIcon />}
          title={titles.analytics}
          description="Google Analytics and Microsoft Clarity. They load on the public website only, never in the dashboard, so admin visits don't count as traffic."
          chips={
            <>
              <Chip label={s.analytics.ga4 ? `Analytics ${s.analytics.ga4}` : "Analytics off"} tone={s.analytics.ga4 ? "ok" : "off"} />
              <Chip label={s.analytics.clarity ? `Clarity ${s.analytics.clarity}` : "Clarity off"} tone={s.analytics.clarity ? "ok" : "off"} />
            </>
          }
          onEdit={() => open("analytics")}
        />
        <SeoCard
          icon={<MapRoundedIcon />}
          title={titles.sitemap}
          description="Generated automatically from your published pages, services, rentals and blog posts, so it is always up to date. Submit /sitemap.xml in Google Search Console."
          chips={
            <>
              <Chip label={sitemapCount === null ? "On" : `On · ${sitemapCount} addresses`} />
              {s.sitemap.exclude.length > 0 && <Chip label={`${s.sitemap.exclude.length} left out`} tone="off" />}
            </>
          }
          link="/sitemap.xml"
          onEdit={() => open("sitemap")}
        />
        <SeoCard
          icon={<DescriptionRoundedIcon />}
          title={titles.robots}
          description="Tells search engines what they may crawl. The recommended rules allow the whole website, keep the dashboard and login out, and point to the sitemap."
          chips={<Chip label={s.robots.mode === "custom" ? "Custom" : "Recommended"} tone={s.robots.mode === "custom" ? "off" : "ok"} />}
          link="/robots.txt"
          onEdit={() => open("robots")}
        />
        <SeoCard
          icon={<SmartToyRoundedIcon />}
          title={titles.llms}
          description="A plain-text guide to the site for AI assistants (ChatGPT, Claude, Perplexity…). The recommended version is built automatically from your company info, services, rentals and latest posts."
          chips={<Chip label={s.llms.mode === "custom" ? "Custom" : "Recommended"} tone={s.llms.mode === "custom" ? "off" : "ok"} />}
          link="/llms.txt"
          onEdit={() => open("llms")}
        />
        <SeoCard
          icon={<CodeRoundedIcon />}
          title={titles.schema}
          description="Structured data for search engines. Site-wide blocks go on every page; each blog post also has its own Schema markup box in its editor. Test with Google's Rich Results Test."
          chips={<Chip label={schemaCount ? `On · ${schemaCount} block${schemaCount === 1 ? "" : "s"}` : "Off"} tone={schemaCount ? "ok" : "off"} />}
          onEdit={() => open("schema")}
        />
      </Box>

      <FormDialog
        open={Boolean(editing)}
        title={editing ? titles[editing] : ""}
        busy={busy}
        error={error}
        submitLabel="Save"
        onSubmit={() => void save()}
        onClose={() => setEditing(null)}
        maxWidth={editing === "schema" || editing === "llms" || editing === "robots" ? "md" : "sm"}
      >
        {editing === "verification" && (
          <>
            <Field
              label="Google Search Console code"
              value={draft.verification.google}
              onChange={(e) => set("verification", { google: e.target.value })}
              helperText='Search Console → Settings → Ownership verification → HTML tag. Paste the code or the whole <meta name="google-site-verification" …> tag. Empty = no tag.'
              slotProps={shrink}
            />
            <Field
              label="Bing Webmaster Tools code"
              value={draft.verification.bing}
              onChange={(e) => set("verification", { bing: e.target.value })}
              helperText='Bing Webmaster Tools → Add site → HTML Meta Tag. Paste the code or the whole <meta name="msvalidate.01" …> tag.'
              slotProps={shrink}
            />
          </>
        )}

        {editing === "analytics" && (
          <>
            <Field
              label="Google Analytics 4 measurement ID"
              value={draft.analytics.ga4}
              onChange={(e) => set("analytics", { ga4: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              helperText="Google Analytics → Admin → Data streams → your web stream. Empty = Google Analytics off."
              slotProps={shrink}
            />
            <Field
              label="Microsoft Clarity project ID"
              value={draft.analytics.clarity}
              onChange={(e) => set("analytics", { clarity: e.target.value })}
              placeholder="e.g. ynwqxtrfx4"
              helperText="Clarity → Settings → Overview → Project ID. Empty = Clarity off."
              slotProps={shrink}
            />
          </>
        )}

        {editing === "sitemap" && (
          <>
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>
              The sitemap lists every published page, service, rental and blog post automatically. Drafts and pages with a
              canonical URL pointing to another site are never listed.
            </Typography>
            <Field
              label="Leave these addresses out"
              value={excludeText}
              onChange={(e) => setExcludeText(e.target.value)}
              multiline
              minRows={4}
              placeholder={"/blog/old-announcement\n/rentals/16-feet-utility-trailer"}
              helperText="One address per line (path or full URL). They stay on the website but aren't listed in the sitemap."
              slotProps={shrink}
            />
          </>
        )}

        {editing === "robots" && (
          <>
            <ToggleButtonGroup exclusive size="small" value={draft.robots.mode} onChange={(_, v) => v && set("robots", { mode: v })} sx={toggleSx}>
              <ToggleButton value="recommended">Recommended</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            {draft.robots.mode === "recommended" ? (
              <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>
                Allows the whole website, keeps the dashboard, login, register, API and backend docs out, and points to the
                sitemap. This is right for almost every site.
              </Typography>
            ) : (
              <Field
                label="robots.txt"
                value={draft.robots.custom}
                onChange={(e) => set("robots", { custom: e.target.value })}
                multiline
                minRows={10}
                placeholder={"User-Agent: *\nAllow: /\nDisallow: /dashboard\n\nSitemap: https://mrwhizlogistics.com/sitemap.xml"}
                helperText="Careful: a wrong rule (e.g. Disallow: /) can remove the whole site from Google."
                slotProps={{ ...shrink, htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
              />
            )}
          </>
        )}

        {editing === "llms" && (
          <>
            <ToggleButtonGroup exclusive size="small" value={draft.llms.mode} onChange={(_, v) => v && set("llms", { mode: v })} sx={toggleSx}>
              <ToggleButton value="recommended">Recommended</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            {draft.llms.mode === "recommended" ? (
              <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>
                Built automatically from your company details (Settings), services, rentals, policies and your 10 latest blog
                posts, so it stays current. Open /llms.txt to see it.
              </Typography>
            ) : (
              <Field
                label="llms.txt"
                value={draft.llms.custom}
                onChange={(e) => set("llms", { custom: e.target.value })}
                multiline
                minRows={12}
                placeholder={"# Mr. Whiz Logistics\n\n> Trucking and logistics in Dallas–Fort Worth…\n\n## Services\n- [Hot Shot](https://mrwhizlogistics.com/hot-shot): …"}
                helperText="Markdown, following llmstxt.org: a title, a short summary, then sections of links."
                slotProps={{ ...shrink, htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
              />
            )}
          </>
        )}

        {editing === "schema" && (
          <>
            <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: 14.5 }}>Business details (automatic)</Typography>
                <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
                  A LocalBusiness block built from your company name, logo, phone, email, address and hours in Settings.
                </Typography>
              </Box>
              <Switch checked={draft.schema.business} onChange={(e) => set("schema", { business: e.target.checked })} slotProps={{ input: { "aria-label": "Business details (automatic)" } }} sx={switchSx} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Your own blocks</Typography>
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                disabled={draft.schema.blocks.length >= LIMITS.blocks}
                onClick={() => set("schema", { blocks: [...draft.schema.blocks, { name: "", json: "" }] })}
                sx={{ color: ACCENT, textTransform: "none", fontWeight: 700 }}
              >
                Add block
              </Button>
            </Box>
            {draft.schema.blocks.length === 0 && (
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>None. Add one for e.g. a WebSite or Organization block with extra details.</Typography>
            )}
            {draft.schema.blocks.map((b, i) => {
              const parsed = b.json.trim() ? parseSchemaJson(b.json) : {};
              const update = (patch: Partial<typeof b>) =>
                set("schema", { blocks: draft.schema.blocks.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
              return (
                <Box key={i} sx={{ p: 1.5, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 1.2 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Field size="small" label={`Block ${i + 1} name (for you)`} value={b.name} onChange={(e) => update({ name: e.target.value })} slotProps={shrink} />
                    <IconButton aria-label={`Remove block ${i + 1}`} onClick={() => set("schema", { blocks: draft.schema.blocks.filter((_, j) => j !== i) })} sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff8a8a" } }}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Box>
                  <Field
                    label="JSON-LD"
                    value={b.json}
                    onChange={(e) => update({ json: e.target.value })}
                    multiline
                    minRows={6}
                    placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Mr. Whiz Logistics",\n  "url": "https://mrwhizlogistics.com"\n}'}
                    error={Boolean(parsed.error)}
                    helperText={parsed.error || "Without the <script> tag."}
                    slotProps={{ ...shrink, htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
                  />
                </Box>
              );
            })}
            <Button
              href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fmrwhizlogistics.com%2F"
              target="_blank"
              rel="noopener"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{ alignSelf: "flex-start", color: ACCENT, textTransform: "none", px: 0 }}
            >
              Test the homepage in Google&apos;s Rich Results Test
            </Button>
          </>
        )}
      </FormDialog>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
