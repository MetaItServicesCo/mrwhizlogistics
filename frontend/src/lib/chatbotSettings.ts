/**
 * AI assistant settings, edited in Dashboard -> Chatbot -> Settings and stored
 * as one site setting (JSON). The chatbot service reads the same key
 * (chatbot/app/site.py), so both sides share these defaults.
 */

export const CHATBOT_SETTINGS_KEY = "chatbot_settings";

export interface ProactiveSettings {
  enabled: boolean;
  /** Seconds of active time on the site before the invite appears. */
  delay_seconds: number;
  /** {service} becomes "a hot shot truck", "a box truck"... from the page. */
  message: string;
  /** "open" the chat window (desktop; phones get the bubble) or a "bubble" by the chat button. */
  mode: "bubble" | "open";
}

export interface ChatbotSettings {
  enabled: boolean;
  greeting: string;
  quick_prompts: string[];
  /** Short facts the assistant must always know (also indexed as knowledge). */
  facts: string[];
  /** Transcripts older than this are deleted automatically. */
  retention_days: number;
  proactive: ProactiveSettings;
}

export const PROACTIVE_DEFAULTS: ProactiveSettings = {
  enabled: true,
  delay_seconds: 100,
  message:
    "Hi there! If you're weighing up {service} for a shipment, I'm happy to help you figure out what fits, no pressure. What are you looking to move?",
  mode: "open",
};

export const CHATBOT_DEFAULTS: ChatbotSettings = {
  enabled: true,
  greeting:
    "Hi! I'm the Mr. Whiz Logistics assistant. Ask me about hot shot, box truck or semi truck freight, or tell me what you need moved and I'll get a dispatcher to call you.",
  quick_prompts: ["I need a shipping quote", "What services do you offer?", "Do you deliver nationwide?", "Call me back"],
  facts: [],
  retention_days: 90,
  proactive: PROACTIVE_DEFAULTS,
};

export const LIMITS = { greeting: 500, prompt: 80, prompts: 6, fact: 600, facts: 50, minDays: 7, maxDays: 3650, minDelay: 5, maxDelay: 600, invite: 400 };

const strings = (v: unknown, max: number, count: number): string[] | null =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim().slice(0, max)).slice(0, count) : null;

export function parseChatbotSettings(raw: string | null | undefined): ChatbotSettings {
  let stored: Record<string, unknown> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) stored = parsed;
  } catch {
    /* fall back to defaults */
  }
  const prompts = strings(stored.quick_prompts, LIMITS.prompt, LIMITS.prompts);
  const facts = strings(stored.facts, LIMITS.fact, LIMITS.facts);
  const days = stored.retention_days;
  const pro = (stored.proactive && typeof stored.proactive === "object" ? stored.proactive : {}) as Record<string, unknown>;
  const delay = pro.delay_seconds;
  return {
    enabled: typeof stored.enabled === "boolean" ? stored.enabled : CHATBOT_DEFAULTS.enabled,
    greeting:
      typeof stored.greeting === "string" && stored.greeting.trim()
        ? stored.greeting.trim().slice(0, LIMITS.greeting)
        : CHATBOT_DEFAULTS.greeting,
    quick_prompts: prompts && prompts.length ? prompts : CHATBOT_DEFAULTS.quick_prompts,
    facts: facts ?? [],
    retention_days:
      typeof days === "number" && Number.isInteger(days) && days >= LIMITS.minDays && days <= LIMITS.maxDays
        ? days
        : CHATBOT_DEFAULTS.retention_days,
    proactive: {
      enabled: typeof pro.enabled === "boolean" ? pro.enabled : PROACTIVE_DEFAULTS.enabled,
      delay_seconds:
        typeof delay === "number" && Number.isInteger(delay) && delay >= LIMITS.minDelay && delay <= LIMITS.maxDelay
          ? delay
          : PROACTIVE_DEFAULTS.delay_seconds,
      message:
        typeof pro.message === "string" && pro.message.trim() ? pro.message.trim().slice(0, LIMITS.invite) : PROACTIVE_DEFAULTS.message,
      mode: pro.mode === "bubble" ? "bubble" : "open",
    },
  };
}
