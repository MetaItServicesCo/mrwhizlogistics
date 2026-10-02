"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { LIME, PageHeader } from "@/components/admin/ui";
import ChatbotOverview from "@/components/admin/chatbot/ChatbotOverview";
import ChatbotConversations from "@/components/admin/chatbot/ChatbotConversations";
import ChatbotKnowledge from "@/components/admin/chatbot/ChatbotKnowledge";
import ChatbotSettingsPanel from "@/components/admin/chatbot/ChatbotSettingsPanel";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "conversations", label: "Conversations" },
  { value: "knowledge", label: "Knowledge" },
  { value: "settings", label: "Settings" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

/**
 * Dashboard -> Chatbot: the AI assistant's analytics, transcripts, knowledge
 * base and settings. ?tab=… selects a tab; ?conversation=<id> opens a transcript
 * (linked from chat leads in Quote Requests).
 */
function ChatbotPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const conversation = params.get("conversation");
  const requested = params.get("tab") as TabValue | null;
  const tab: TabValue = conversation ? "conversations" : TABS.some((t) => t.value === requested) ? requested! : "overview";

  const navigate = useCallback(
    (next: Record<string, string | null>) => {
      const q = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === null) q.delete(k);
        else q.set(k, v);
      }
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const openConversation = useCallback(
    (id: string | null) => navigate({ tab: "conversations", conversation: id }),
    [navigate],
  );

  return (
    <Box>
      <PageHeader
        title="AI Assistant"
        subtitle="The website chat assistant: answers questions from your pages and gets dispatch to call visitors back."
      />
      <Tabs
        value={tab}
        onChange={(_, v: TabValue) => navigate({ tab: v, conversation: null })}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          "& .MuiTab-root": { color: "rgba(255,255,255,0.6)", textTransform: "none", fontWeight: 700, fontSize: 14 },
          "& .Mui-selected": { color: `${LIME} !important` },
          "& .MuiTabs-indicator": { bgcolor: LIME },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {tab === "overview" && <ChatbotOverview onOpenConversation={(id) => openConversation(id)} />}
      {tab === "conversations" && <ChatbotConversations openId={conversation} onOpen={openConversation} />}
      {tab === "knowledge" && <ChatbotKnowledge />}
      {tab === "settings" && <ChatbotSettingsPanel />}
    </Box>
  );
}

// useSearchParams needs a Suspense boundary on a statically built page.
export default function ChatbotPageWithParams() {
  return (
    <Suspense fallback={null}>
      <ChatbotPage />
    </Suspense>
  );
}
