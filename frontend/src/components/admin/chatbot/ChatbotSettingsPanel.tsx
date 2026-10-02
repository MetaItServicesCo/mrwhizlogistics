"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { api } from "@/lib/api";
import { chatAdmin } from "@/lib/chatClient";
import {
  CHATBOT_DEFAULTS,
  CHATBOT_SETTINGS_KEY,
  LIMITS,
  PROACTIVE_DEFAULTS,
  parseChatbotSettings,
  type ChatbotSettings,
  type ProactiveSettings,
} from "@/lib/chatbotSettings";
import { errorMessage, useResource } from "@/lib/useResource";
import type { SiteSetting } from "@/lib/types";
import { ErrorState, Field, LIME, LoadingState, Panel, Toast } from "@/components/admin/ui";

const shrink = { inputLabel: { shrink: true } };

function ListEditor({
  label,
  items,
  max,
  maxChars,
  placeholder,
  onChange,
  multiline,
}: {
  label: string;
  items: string[];
  max: number;
  maxChars: number;
  placeholder: string;
  onChange: (items: string[]) => void;
  multiline?: boolean;
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{label}</Typography>
        <Button size="small" startIcon={<AddRoundedIcon />} disabled={items.length >= max} onClick={() => onChange([...items, ""])} sx={{ color: LIME, textTransform: "none", fontWeight: 700 }}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <Field
              size="small"
              value={item}
              placeholder={placeholder}
              multiline={multiline}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              error={item.length > maxChars}
              helperText={item.length > maxChars ? `Keep it under ${maxChars} characters (${item.length}).` : undefined}
              slotProps={{ htmlInput: { "aria-label": `${label} ${i + 1}` } }}
            />
            <IconButton aria-label={`Remove ${label.toLowerCase()} ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))} sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#ff8a8a" } }}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Box>
        ))}
        {items.length === 0 && <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>None.</Typography>}
      </Box>
    </Box>
  );
}

export default function ChatbotSettingsPanel() {
  const settings = useResource<SiteSetting>("/api/settings");
  const row = settings.items.find((s) => s.key === CHATBOT_SETTINGS_KEY);
  const saved = useMemo(() => parseChatbotSettings(row?.value), [row?.value]);
  const savedKey = JSON.stringify(saved);
  const [draft, setDraft] = useState<ChatbotSettings>(saved);
  const [base, setBase] = useState(savedKey);
  if (base !== savedKey) {
    setBase(savedKey);
    setDraft(saved);
  }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== savedKey;
  const set = (patch: Partial<ChatbotSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const problem =
    draft.greeting.length > LIMITS.greeting
      ? `The greeting must be ${LIMITS.greeting} characters or fewer.`
      : draft.quick_prompts.some((p) => p.length > LIMITS.prompt)
        ? `Quick options must be ${LIMITS.prompt} characters or fewer.`
        : draft.facts.some((f) => f.length > LIMITS.fact)
          ? `Each fact must be ${LIMITS.fact} characters or fewer.`
          : !Number.isInteger(draft.retention_days) || draft.retention_days < LIMITS.minDays || draft.retention_days > LIMITS.maxDays
            ? `Keep transcripts between ${LIMITS.minDays} and ${LIMITS.maxDays} days.`
            : !Number.isInteger(draft.proactive.delay_seconds) ||
                draft.proactive.delay_seconds < LIMITS.minDelay ||
                draft.proactive.delay_seconds > LIMITS.maxDelay
              ? `The invite delay must be between ${LIMITS.minDelay} and ${LIMITS.maxDelay} seconds.`
              : draft.proactive.message.length > LIMITS.invite
                ? `The invite message must be ${LIMITS.invite} characters or fewer.`
                : null;
  const setPro = (patch: Partial<ProactiveSettings>) => setDraft((d) => ({ ...d, proactive: { ...d.proactive, ...patch } }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const clean: ChatbotSettings = {
      enabled: draft.enabled,
      greeting: draft.greeting.trim() || CHATBOT_DEFAULTS.greeting,
      quick_prompts: draft.quick_prompts.map((p) => p.trim()).filter(Boolean),
      facts: draft.facts.map((f) => f.trim()).filter(Boolean),
      retention_days: draft.retention_days,
      proactive: {
        ...draft.proactive,
        message: draft.proactive.message.trim() || PROACTIVE_DEFAULTS.message,
      },
    };
    const factsChanged = JSON.stringify(clean.facts) !== JSON.stringify(saved.facts);
    try {
      const value = JSON.stringify(clean);
      if (row) await api.patch(`/api/settings/${row.id}`, { value });
      else await api.post("/api/settings", { key: CHATBOT_SETTINGS_KEY, value, label: "AI assistant settings (managed in Chatbot -> Settings)" });
      await settings.reload();
      let message = "Assistant settings saved. They apply on the website within a minute.";
      if (factsChanged) {
        try {
          await chatAdmin("/knowledge/reindex", { method: "POST" });
          message += " The facts are being added to its knowledge now.";
        } catch {
          message += " Use Knowledge → “Re-read website now” to apply the facts (the assistant service didn't respond).";
        }
      }
      setToast(message);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (settings.loading && !settings.items.length) return <LoadingState label="Loading settings…" />;
  if (settings.error && !settings.items.length) return <ErrorState message={settings.error} onRetry={settings.reload} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel sx={{ p: { xs: 2, md: 3 } }}>
        <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
          <Box sx={{ flex: 1 }}>
            <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
              Assistant on the website
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {draft.enabled ? "Visitors see the chat button on every page." : "The chat button is hidden from the website."}
            </Typography>
          </Box>
          <Switch
            checked={draft.enabled}
            onChange={(e) => set({ enabled: e.target.checked })}
            slotProps={{ input: { "aria-label": "Assistant on the website" } }}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: LIME }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME } }}
          />
        </Box>
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            Conversation start
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>What visitors see when they open the chat.</Typography>
        </Box>
        <Field
          label="Greeting"
          value={draft.greeting}
          placeholder={CHATBOT_DEFAULTS.greeting}
          onChange={(e) => set({ greeting: e.target.value })}
          multiline
          minRows={2}
          helperText={`${draft.greeting.trim().length}/${LIMITS.greeting}`}
          error={draft.greeting.length > LIMITS.greeting}
          slotProps={shrink}
        />
        <ListEditor
          label="Quick options"
          items={draft.quick_prompts}
          max={LIMITS.prompts}
          maxChars={LIMITS.prompt}
          placeholder="e.g. I need a shipping quote"
          onChange={(quick_prompts) => set({ quick_prompts })}
        />
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            Facts the assistant must know
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Short statements for things your pages don&apos;t say, e.g. &quot;We don&apos;t ship hazmat.&quot; or &quot;Minimum hot shot load is 500 lbs.&quot; Never put prices here unless you want the assistant to quote them.
          </Typography>
        </Box>
        <ListEditor
          label="Facts"
          items={draft.facts}
          max={LIMITS.facts}
          maxChars={LIMITS.fact}
          placeholder="One fact per line"
          multiline
          onChange={(facts) => set({ facts })}
        />
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
          <Box sx={{ flex: 1 }}>
            <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: "#fff", mb: 0.5 }}>
              Invite visitors to talk
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              After a visitor has been active on the site for a while without chatting, the assistant offers a call back.
              Once per visit; not again for 24 hours after &quot;Not now&quot;, or for 30 days after they&apos;ve left their number.
            </Typography>
          </Box>
          <Switch
            checked={draft.proactive.enabled}
            onChange={(e) => setPro({ enabled: e.target.checked })}
            slotProps={{ input: { "aria-label": "Invite visitors to talk" } }}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: LIME }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LIME } }}
          />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "200px 1fr" }, gap: 2, opacity: draft.proactive.enabled ? 1 : 0.55 }}>
          <Field
            type="number"
            label="Show after (seconds)"
            value={draft.proactive.delay_seconds}
            onChange={(e) => setPro({ delay_seconds: Number(e.target.value) })}
            helperText="Active time on the site, across pages."
            slotProps={{ ...shrink, htmlInput: { min: LIMITS.minDelay, max: LIMITS.maxDelay } }}
          />
          <Box>
            <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", mb: 0.8 }}>How it appears</Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={draft.proactive.mode}
              onChange={(_, v) => v && setPro({ mode: v })}
              aria-label="How the invite appears"
              sx={{ "& .MuiToggleButton-root": { color: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.14)", textTransform: "none", px: 2 }, "& .Mui-selected": { color: "#0a0a0a !important", bgcolor: `${LIME} !important` } }}
            >
              <ToggleButton value="open">Open the chat window</ToggleButton>
              <ToggleButton value="bubble">Message bubble</ToggleButton>
            </ToggleButtonGroup>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)", mt: 0.8 }}>
              Phones always get the bubble: full-screen pop-ups annoy visitors and Google penalises them.
            </Typography>
          </Box>
        </Box>
        <Field
          label="Invite message"
          value={draft.proactive.message}
          placeholder={PROACTIVE_DEFAULTS.message}
          onChange={(e) => setPro({ message: e.target.value })}
          multiline
          minRows={2}
          error={draft.proactive.message.length > LIMITS.invite}
          helperText="{service} becomes “a hot shot truck”, “a box truck”, “a semi truck”, “a trailer rental” or “a truck” depending on the page. End with a question so visitors can simply reply with their name and number."
          slotProps={shrink}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            href="/?assistant_invite=1"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ color: LIME, border: `1px solid ${LIME}55`, borderRadius: "999px", textTransform: "none", fontWeight: 700, px: 2 }}
          >
            Preview the invite
          </Button>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Opens the site and shows the invite after 2 seconds, ignoring the once-per-visit rules. Uses the saved settings.
          </Typography>
        </Box>
      </Panel>

      <Panel sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: "#fff", mb: 0.5 }}>
            Privacy
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Chat transcripts contain names and phone numbers. They are deleted automatically after this many days; leads stay in Quote Requests.
          </Typography>
        </Box>
        <Box sx={{ maxWidth: 240 }}>
          <Field
            type="number"
            label="Keep transcripts (days)"
            value={draft.retention_days}
            onChange={(e) => set({ retention_days: Number(e.target.value) })}
            slotProps={{ ...shrink, htmlInput: { min: LIMITS.minDays, max: LIMITS.maxDays } }}
          />
        </Box>
      </Panel>

      {(error || problem) && (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error || problem}
        </Alert>
      )}

      <Box sx={{ position: "sticky", bottom: 12, zIndex: 5, p: 1.5, pl: 2.5, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", borderRadius: "16px", bgcolor: "rgba(20,21,20,0.95)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography sx={{ flex: 1, minWidth: 160, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{dirty ? "You have unsaved changes." : "All changes saved."}</Typography>
        <Button onClick={() => setDraft(saved)} disabled={!dirty || saving} sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", fontWeight: 700 }}>
          Discard changes
        </Button>
        <Button
          onClick={() => void save()}
          disabled={!dirty || saving || Boolean(problem)}
          startIcon={saving ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : undefined}
          sx={{ bgcolor: LIME, color: "#0a0a0a", fontWeight: 800, textTransform: "none", borderRadius: "999px", px: 3, "&:hover": { bgcolor: "#b5e600" }, "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" } }}
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </Box>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Box>
  );
}
