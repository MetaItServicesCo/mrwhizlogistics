"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

import {
  ChatHttpError,
  fetchInvite,
  loadSessionId,
  restoreSession,
  saveSessionId,
  startProactive,
  streamChat,
  type ChatSource,
  type Invite,
  type LeadSummaryItem,
} from "@/lib/chatClient";
import type { ProactiveSettings } from "@/lib/chatbotSettings";

const LIME = "#c8ff00";
const DARK = "#0a0a0a";
const PANEL = "#0d100c";
const MESSAGE = "#16181a";

const EASE = [0.22, 1, 0.36, 1] as const;

type Msg = {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
  /** Pages the answer is based on. */
  sources?: ChatSource[];
  /** Callback details awaiting the visitor's confirmation. */
  leadSummary?: LeadSummaryItem[];
  /** Dispatch has the callback request. */
  leadSubmitted?: boolean;
  /** Still receiving tokens. */
  streaming?: boolean;
  error?: boolean;
};

export interface ChatWidgetConfig {
  enabled: boolean;
  greeting: string;
  quickPrompts: string[];
  phone?: string;
  /** Proactive invite (Dashboard -> AI Assistant -> Settings). */
  proactive?: ProactiveSettings;
}

// ---- Proactive invite bookkeeping (browser storage, never blocks the chat)
const ACTIVE_MS_KEY = "mrwhiz_chat_active_ms"; // session: active time on site
const INVITE_SHOWN_KEY = "mrwhiz_chat_invite_shown"; // session: once per visit
const INVITE_DISMISSED_KEY = "mrwhiz_chat_invite_dismissed"; // local: 24h quiet period
const LEAD_DONE_KEY = "mrwhiz_chat_lead_done"; // local: when they last left a lead
const CHAT_USED_KEY = "mrwhiz_chat_used"; // session: they chatted during this visit
const DISMISS_FOR_MS = 24 * 60 * 60 * 1000;
const AFTER_LEAD_MS = 30 * 24 * 60 * 60 * 1000;
// ?assistant_invite=1 shows the invite after 2s, ignoring the caps (for checking it).
const FORCE_PARAM = "assistant_invite";

const within = (stamp: string | null, ms: number) => {
  const t = Number(stamp || 0);
  return t > 1 && Date.now() - t < ms;
};

const store = {
  get(area: "local" | "session", key: string): string | null {
    try {
      return (area === "local" ? window.localStorage : window.sessionStorage).getItem(key);
    } catch {
      return null;
    }
  },
  set(area: "local" | "session", key: string, value: string) {
    try {
      (area === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
    } catch {
      /* private mode: the invite may show again, nothing breaks */
    }
  },
};

const forcedInvite = () => new URLSearchParams(window.location.search).get(FORCE_PARAM) === "1";

/**
 * Invite unless the visitor already chatted during this visit, saw the
 * invite this visit, said "Not now" in the last 24h, or left a lead in the
 * last 30 days. A chat from an earlier visit doesn't block it.
 */
function inviteEligible(): boolean {
  if (window.location.pathname.startsWith("/dashboard")) return false;
  if (store.get("session", INVITE_SHOWN_KEY) || store.get("session", CHAT_USED_KEY)) return false;
  // "1" was the pre-timestamp marker: treat it as a lead within the window.
  const lead = store.get("local", LEAD_DONE_KEY);
  if (lead === "1" || within(lead, AFTER_LEAD_MS)) return false;
  return !within(store.get("local", INVITE_DISMISSED_KEY), DISMISS_FOR_MS);
}

type SpeechRecognitionEventLike = Event & {
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
  message?: string;
};

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const now = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const DEFAULT_CONFIG: ChatWidgetConfig = {
  enabled: true,
  greeting:
    "Hi! I'm the Mr. Whiz Logistics assistant. Ask me about hot shot, box truck or semi truck freight, or tell me what you need moved and I'll get a dispatcher to call you.",
  quickPrompts: ["I need a shipping quote", "What services do you offer?", "Do you deliver nationwide?", "Call me back"],
};

const noopSubscribe = () => () => {};

const welcomeMessage = (greeting: string): Msg => ({ id: "welcome", from: "bot", text: greeting, time: now() });

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? now() : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/** Phone numbers and links in replies become tappable. */
const LINKIFY = /(https?:\/\/[^\s)]+|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b)/g;

function RichText({ text, dark }: { text: string; dark?: boolean }) {
  const parts = text.split(LINKIFY);
  const linkSx = { color: dark ? DARK : LIME, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "2px" };
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        if (part.startsWith("http"))
          return (
            <Box key={i} component="a" href={part} target="_blank" rel="noopener" sx={linkSx}>
              {part}
            </Box>
          );
        const digits = part.replace(/[^\d+]/g, "");
        return (
          <Box key={i} component="a" href={`tel:${digits.length === 10 ? `+1${digits}` : digits}`} sx={linkSx}>
            {part}
          </Box>
        );
      })}
    </>
  );
}

export default function ChatWidget({ config = DEFAULT_CONFIG }: { config?: ChatWidgetConfig }) {
  const reduce = useReducedMotion() ?? false;

  // ============================================================
  // MAIN STATES
  // ============================================================

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Msg[]>(() => [welcomeMessage(config.greeting)]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  // Follow-up buttons offered with the latest reply ("Yes, call me", ...).
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const restoredRef = useRef(false);
  // Proactive invite: fetched after the visitor has been active a while.
  const [invite, setInvite] = useState<Invite | null>(null);
  const [inviteVisible, setInviteVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  // ============================================================
  // VOICE STATES
  // ============================================================

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // Browser speech recognition (false during server render).
  const voiceSupported = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    () => false,
  );

  // IMPORTANT:
  // This is ONLY for manual AI voice playback.
  // It does NOT automatically speak AI responses.
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [interimText, setInterimText] = useState("");

  // ============================================================
  // UI STATES
  // ============================================================

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  // ============================================================
  // REFS
  // ============================================================

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // ============================================================
  // RESTORE THE PREVIOUS CONVERSATION (first open)
  // ============================================================

  useEffect(() => {
    if (!open || restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadSessionId();
    if (!saved) return;
    restoreSession(saved)
      .then((data) => {
        if (!data || !data.messages.length) {
          saveSessionId(null);
          return;
        }
        setSessionId(saved);
        setMessages([
          welcomeMessage(config.greeting),
          ...data.messages.map((m, i) => ({
            id: `restored-${i}`,
            from: m.role === "user" ? ("user" as const) : ("bot" as const),
            text: m.content,
            time: fmtTime(m.created_at),
            sources: m.sources,
            leadSubmitted: m.role === "assistant" && data.lead_stage === "submitted" && i === data.messages.length - 1,
          })),
        ]);
        const last = data.messages[data.messages.length - 1];
        setSuggestions(last?.role === "assistant" ? last.suggestions || [] : []);
      })
      .catch(() => {
        /* offline or unavailable: start fresh, keep the id for a later retry */
      });
  }, [open, config.greeting]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // ============================================================
  // PROACTIVE INVITE: after N seconds of active time on the site
  // (counted across pages, paused while the tab is hidden), the lead
  // agent offers a call back. Once per visit; quiet for 24h after
  // "Not now"; never again after a lead.
  // ============================================================

  const openWithInvite = useCallback((inv: Invite) => {
    // The invite is a fresh conversation: don't restore an older chat over it.
    restoredRef.current = true;
    setMessages([{ id: "invite", from: "bot", text: inv.message, time: now() }]);
    setSuggestions(inv.suggestions);
    setShowQuickPrompts(false);
    setInviteVisible(false);
    setOpen(true);
  }, []);

  const dismissInvite = useCallback(() => {
    store.set("local", INVITE_DISMISSED_KEY, String(Date.now()));
    setInviteVisible(false);
    setInvite(null);
  }, []);

  useEffect(() => {
    const pro = config.proactive;
    const force = forcedInvite();
    if (!pro?.enabled || open || invite || !(force || inviteEligible())) return;
    let active = force ? 0 : Number(store.get("session", ACTIVE_MS_KEY) || 0);
    const delayMs = force ? 2000 : pro.delay_seconds * 1000;
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      active += 1000;
      // Saved every second so full page loads keep the visitor's time.
      if (!force) store.set("session", ACTIVE_MS_KEY, String(active));
      if (active < delayMs) return;
      window.clearInterval(tick);
      if (!force && !inviteEligible()) return;
      fetchInvite(window.location.pathname)
        .then((inv) => {
          store.set("session", INVITE_SHOWN_KEY, "1");
          setInvite(inv);
          // Phones always get the bubble (no full-screen interruption).
          if (pro.mode === "open" && window.matchMedia("(min-width: 900px)").matches) openWithInvite(inv);
          else setInviteVisible(true);
        })
        .catch(() => {
          /* invites off or service unavailable: stay quiet */
        });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [config.proactive, open, invite, openWithInvite]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, listening, interimText]);

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();

      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // ============================================================
  // STOP SPEAKING
  // ============================================================

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;

    window.speechSynthesis?.cancel();

    setSpeaking(false);
  }, []);

  // ============================================================
  // MANUAL TEXT TO SPEECH
  //
  // IMPORTANT:
  // AI NEVER CALLS THIS AUTOMATICALLY.
  // User has to click speaker icon.
  // ============================================================

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;

      if (typeof window === "undefined") return;

      if (!("speechSynthesis" in window)) return;

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      // English voice for trucking assistant
      utterance.lang = "en-US";

      utterance.onstart = () => {
        setSpeaking(true);
      };

      utterance.onend = () => {
        setSpeaking(false);
      };

      utterance.onerror = () => {
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, stopSpeaking],
  );

  // ============================================================
  // STOP LISTENING
  // ============================================================

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }

    setListening(false);
    setInterimText("");
  }, []);

  // ============================================================
  // SEND TO AI (streams the reply from the chatbot service)
  // ============================================================

  const updateMessage = useCallback((id: string, patch: Partial<Msg> | ((m: Msg) => Partial<Msg>)) => {
    setMessages((current) =>
      current.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)),
    );
  }, []);

  const sendToAI = useCallback(
    async (userMessage: string, sessionOverride?: string) => {
      const botId = createId();
      setMessages((current) => [...current, { id: botId, from: "bot", text: "", time: now(), streaming: true }]);
      const controller = new AbortController();
      abortRef.current = controller;
      let received = false;
      try {
        await streamChat(
          {
            message: userMessage,
            sessionId: sessionOverride ?? sessionId,
            pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
            signal: controller.signal,
          },
          (event) => {
            switch (event.type) {
              case "session":
                setSessionId(event.session_id);
                saveSessionId(event.session_id);
                break;
              case "token":
                received = true;
                setTyping(false);
                updateMessage(botId, (m) => ({ text: m.text + event.text }));
                break;
              case "replace":
                received = true;
                updateMessage(botId, { text: event.text });
                break;
              case "sources":
                updateMessage(botId, { sources: event.sources });
                break;
              case "lead":
                if (event.status === "confirming") updateMessage(botId, { leadSummary: event.summary });
                else {
                  updateMessage(botId, { leadSubmitted: true, leadSummary: undefined });
                  store.set("local", LEAD_DONE_KEY, String(Date.now()));
                }
                break;
              case "done":
                updateMessage(botId, { text: event.reply, sources: event.sources, streaming: false });
                setSuggestions(event.suggestions || []);
                break;
              case "error":
                updateMessage(botId, (m) => ({ text: m.text ? `${m.text}\n\n${event.message}` : event.message, error: true, streaming: false }));
                break;
            }
          },
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        const phone = config.phone || "(469) 767 8853";
        const text =
          error instanceof ChatHttpError
            ? error.message
            : `Sorry, I couldn't reach the assistant. Please try again or call dispatch at ${phone}.`;
        updateMessage(botId, { text: received ? undefined : text, error: true, streaming: false });
      } finally {
        updateMessage(botId, { streaming: false });
        setTyping(false);
      }
    },
    [sessionId, updateMessage, config.phone],
  );

  // ============================================================
  // ADD MESSAGE
  // ============================================================

  const addMessage = useCallback((from: "bot" | "user", text: string) => {
    setMessages((current) => [
      ...current,
      {
        id: createId(),
        from,
        text,
        time: now(),
      },
    ]);
  }, []);

  // ============================================================
  // SEND MESSAGE
  //
  // BOTH:
  // 1. TEXT INPUT
  // 2. VOICE INPUT
  //
  // END RESULT = NORMAL CHAT MESSAGE
  // ============================================================

  const send = useCallback(
    async (voiceMessage?: string) => {
      const text = (voiceMessage ?? input).trim();

      if (!text || typing) return;

      // Stop microphone if active
      stopListening();

      // Stop any currently playing voice
      stopSpeaking();

      // User message
      addMessage("user", text);

      // Clear input
      setInput("");
      setInterimText("");

      // Chatting this visit: no proactive invite on later pages.
      store.set("session", CHAT_USED_KEY, "1");

      // AI thinking (until the first token arrives)
      setTyping(true);
      setSuggestions([]);
      setShowQuickPrompts(false);

      // Replying to the invite: open the conversation the lead agent seeded.
      let sessionForTurn: string | undefined;
      // Any pending invite starts its own conversation, even if an older chat exists.
      if (invite) {
        try {
          const started = await startProactive(window.location.pathname);
          sessionForTurn = started.session_id;
          setSessionId(started.session_id);
          saveSessionId(started.session_id);
        } catch {
          /* fall back to a normal conversation */
        }
        setInvite(null);
      }

      // Replies are text only: voice playback stays manual (speaker icon).
      await sendToAI(text, sessionForTurn);
    },
    [input, typing, stopListening, stopSpeaking, addMessage, sendToAI, invite],
  );

  // ============================================================
  // START VOICE RECOGNITION
  //
  // USER CLICKS MIC
  // ↓
  // SPEAKS
  // ↓
  // TRANSCRIPT
  // ↓
  // AUTOMATICALLY SENDS TO AI
  // ============================================================

  const startListening = () => {
    if (typeof window === "undefined") return;

    if (typing) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );

      return;
    }

    // Stop old recognition
    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }

    // Stop AI speech if playing
    stopSpeaking();

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setInterimText("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let temporaryTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];

        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          temporaryTranscript += transcript;
        }
      }

      // Show live speech
      if (temporaryTranscript) {
        setInterimText(temporaryTranscript);
      }

      // FINAL SPEECH
      if (finalTranscript.trim()) {
        const finalText = finalTranscript.trim();

        setInterimText(finalText);

        /*
        IMPORTANT:

        Voice is NOT inserted into chat as a fake message.

        It becomes a normal user message through send().
        */

        setTimeout(() => {
          setInterimText("");
          setListening(false);

          send(finalText);
        }, 150);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setListening(false);
      setInterimText("");

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser settings.",
        );
      }

      if (event.error === "no-speech") {
        console.log("No speech detected.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start microphone:", error);

      setListening(false);
      setInterimText("");
    }
  };

  // ============================================================
  // TOGGLE MICROPHONE
  // ============================================================

  const toggleListening = () => {
    if (listening) {
      stopListening();
      return;
    }

    startListening();
  };

  // ============================================================
  // NEW CHAT (forgets the session; the old one stays in the dashboard)
  // ============================================================

  const newChat = () => {
    abortRef.current?.abort();
    stopListening();
    stopSpeaking();

    saveSessionId(null);
    setSessionId(null);
    setInvite(null);
    setMessages([welcomeMessage(config.greeting)]);
    setSuggestions([]);
    setShowQuickPrompts(true);
    setInput("");
    setInterimText("");
    setTyping(false);
  };

  // ============================================================
  // COPY MESSAGE
  // ============================================================

  const copyMessage = async (message: Msg) => {
    try {
      await navigator.clipboard.writeText(message.text);

      setCopiedId(message.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ============================================================
  // QUICK PROMPT
  // ============================================================

  const sendQuickPrompt = (text: string) => {
    if (typing) return;

    setShowQuickPrompts(false);

    send(text);
  };

  // ============================================================
  // KEYBOARD
  // ============================================================

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      send();
    }
  };

  // ============================================================
  // VOICE TOGGLE
  //
  // ONLY CONTROLS MANUAL SPEAKER BUTTON
  // ============================================================

  const toggleVoiceEnabled = () => {
    setVoiceEnabled((current) => {
      const next = !current;

      if (!next) {
        stopSpeaking();
      }

      return next;
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!config.enabled) return null;

  return (
    <>
      {/* ========================================================
          PROACTIVE INVITE BUBBLE
      ======================================================== */}

      <AnimatePresence>
        {inviteVisible && invite && !open && (
          <Box
            key="invite"
            component={motion.div}
            role="dialog"
            aria-label="Message from the Mr. Whiz assistant"
            aria-live="polite"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            sx={{
              position: "fixed",
              right: { xs: 16, md: 28 },
              bottom: { xs: 92, md: 106 },
              zIndex: 1500,
              width: { xs: "calc(100vw - 32px)", sm: 330 },
              maxWidth: 330,
              p: 2,
              pt: 1.6,
              borderRadius: "18px 18px 6px 18px",
              bgcolor: PANEL,
              border: `1px solid ${LIME}55`,
              boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
              color: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "9px",
                  bgcolor: LIME,
                  color: DARK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LocalShippingRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ flex: 1, fontSize: 12.5, fontWeight: 800, color: LIME }}>Mr. Whiz dispatch</Typography>
              <IconButton
                size="small"
                aria-label="Dismiss message"
                onClick={dismissInvite}
                sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() => openWithInvite(invite)}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                fontSize: 14,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.92)",
                mb: 1.5,
                "&:focus-visible": { outline: `2px solid ${LIME}`, outlineOffset: 2, borderRadius: "6px" },
              }}
            >
              {invite.message}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => {
                  openWithInvite(invite);
                  void send(invite.suggestions[0] || "Yes, call me");
                }}
                startIcon={<PhoneInTalkRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  flex: 1,
                  bgcolor: LIME,
                  color: DARK,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#d4ff33" },
                }}
              >
                {invite.suggestions[0] || "Yes, call me"}
              </Button>
              <Button
                onClick={dismissInvite}
                sx={{ color: "rgba(255,255,255,0.65)", textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              >
                Not now
              </Button>
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* ========================================================
          FLOATING AI BUTTON
      ======================================================== */}

      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 20, md: 28 },
          right: { xs: 20, md: 28 },
          zIndex: 1500,
        }}
      >
        {/* Pulse */}
        {!open && !reduce && (
          <Box
            aria-hidden
            component={motion.span}
            animate={{
              scale: [1, 1.65, 1],
              opacity: [0.45, 0, 0.45],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: LIME,
            }}
          />
        )}

        {/* Button */}
        <Box
          component={motion.button}
          onClick={() => (!open && invite ? openWithInvite(invite) : setOpen((value) => !value))}
          aria-label={open ? "Close AI assistant" : "Open AI assistant"}
          whileHover={reduce ? undefined : { scale: 1.08 }}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          sx={{
            position: "relative",
            width: { xs: 58, md: 64 },
            height: { xs: 58, md: 64 },
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            bgcolor: LIME,
            color: DARK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 34px rgba(200,255,0,0.4)",
            "& svg": {
              fontSize: 28,
            },
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "chat"}
              initial={{
                rotate: -90,
                opacity: 0,
              }}
              animate={{
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                rotate: 90,
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              style={{
                display: "flex",
              }}
            >
              {open ? <CloseRoundedIcon /> : <ChatBubbleRoundedIcon />}
            </motion.span>
          </AnimatePresence>
        </Box>

        {/* AI Badge */}
        {!open && (
          <Box
            sx={{
              position: "absolute",
              top: -4,
              right: -4,
              px: 0.8,
              py: 0.2,
              borderRadius: "999px",
              bgcolor: DARK,
              border: `1.5px solid ${LIME}`,
              zIndex: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 900,
                color: LIME,
                letterSpacing: 0.5,
              }}
            >
              AI
            </Typography>
          </Box>
        )}
      </Box>

      {/* ========================================================
          AI PANEL
      ======================================================== */}

      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 30,
                    scale: 0.92,
                  }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.95,
                  }
            }
            transition={{
              duration: 0.32,
              ease: EASE,
            }}
            sx={{
              position: "fixed",
              zIndex: 1500,

              bottom: {
                xs: 0,
                md: 104,
              },

              right: {
                xs: 0,
                md: 28,
              },

              width: {
                xs: "100%",
                md: 420,
              },

              height: {
                xs: "100%",
                sm: "auto",
              },

              maxHeight: {
                xs: "100%",
                md: "min(720px, 88vh)",
              },

              display: "flex",
              flexDirection: "column",
              overflow: "hidden",

              borderRadius: {
                xs: 0,
                md: "24px",
              },

              bgcolor: PANEL,

              border: "1px solid rgba(255,255,255,0.1)",

              boxShadow: "0 30px 100px rgba(0,0,0,0.65)",

              backdropFilter: "blur(20px)",
            }}
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                px: 2.3,
                py: 2,
                background: `linear-gradient(
                  135deg,
                  ${LIME},
                  #8bbd00
                )`,
                color: DARK,
              }}
            >
              {/* Decorative circle */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: -70,
                  right: -30,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.13)",
                }}
              />

              {/* Decorative circle */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  bottom: -90,
                  left: "35%",
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.06)",
                }}
              />

              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                }}
              >
                {/* Truck icon */}
                <Box
                  sx={{
                    position: "relative",
                    width: 46,
                    height: 46,
                    borderRadius: "13px",
                    bgcolor: "rgba(0,0,0,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <LocalShippingRoundedIcon
                    sx={{
                      fontSize: 25,
                    }}
                  />

                  {/* Online indicator */}
                  <Box
                    component={motion.span}
                    animate={
                      reduce
                        ? {}
                        : {
                            scale: [1, 0.7, 1],
                          }
                    }
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                    }}
                    sx={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#10c53b",
                      border: `2px solid ${DARK}`,
                    }}
                  />
                </Box>

                {/* Title */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 16,
                      lineHeight: 1.1,
                    }}
                  >
                    Mr. Whiz Logistics AI Assistant
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.4,
                    }}
                  >
                    <AutoAwesomeRoundedIcon
                      sx={{
                        fontSize: 12,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        opacity: 0.75,
                      }}
                    >
                      AI · Text & Voice Ready
                    </Typography>
                  </Box>
                </Box>

                {/* Voice playback toggle */}
                {voiceSupported && (
                  <Tooltip
                    title={
                      voiceEnabled ? "Voice playback ON" : "Voice playback OFF"
                    }
                  >
                    <IconButton
                      onClick={toggleVoiceEnabled}
                      aria-label={
                        voiceEnabled
                          ? "Disable voice playback"
                          : "Enable voice playback"
                      }
                      size="small"
                      sx={{
                        color: DARK,
                        bgcolor: "rgba(0,0,0,0.08)",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      {voiceEnabled ? (
                        <VolumeUpRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      ) : (
                        <VolumeOffRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Close */}
                <IconButton
                  onClick={() => {
                    stopListening();
                    stopSpeaking();
                    setOpen(false);
                  }}
                  aria-label="Close assistant"
                  size="small"
                  sx={{
                    color: DARK,
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Box>
            </Box>

            {
              <>
                {/* ==================================================
                    CHAT TOOLBAR
                ================================================== */}

                <Box
                  sx={{
                    px: 1.5,
                    py: 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    bgcolor: "rgba(255,255,255,0.015)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    AI assistant · answers from our website
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                    }}
                  >
                    <Tooltip title="Start a new chat">
                      <IconButton
                        onClick={newChat}
                        aria-label="Start a new chat"
                        size="small"
                        sx={{
                          color: "rgba(255,255,255,0.45)",
                          "&:hover": {
                            color: LIME,
                          },
                        }}
                      >
                        <RestartAltRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* ==================================================
                    MESSAGES
                ================================================== */}

                <Box
                  ref={scrollRef}
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 2,
                    py: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.7,

                    "&::-webkit-scrollbar": {
                      width: 5,
                    },

                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },

                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(200,255,0,0.18)",
                      borderRadius: 999,
                    },
                  }}
                >
                  {/* Messages */}
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      component={motion.div}
                      initial={{
                        opacity: 0,
                        y: 12,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: EASE,
                      }}
                      sx={{
                        alignSelf:
                          message.from === "user" ? "flex-end" : "flex-start",
                        maxWidth: {
                          xs: "88%",
                          sm: "84%",
                        },
                      }}
                    >
                      {/* Message bubble */}
                      {!(message.streaming && !message.text) && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1.35,
                          fontSize: 14,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",

                          ...(message.from === "user"
                            ? {
                                bgcolor: LIME,
                                color: DARK,
                                borderRadius: "16px 16px 4px 16px",
                                fontWeight: 500,
                              }
                            : {
                                bgcolor: MESSAGE,
                                color: "rgba(255,255,255,0.9)",
                                borderRadius: "4px 16px 16px 16px",
                                border: "1px solid rgba(255,255,255,0.04)",
                              }),
                        }}
                      >
                        <RichText text={message.text} dark={message.from === "user"} />
                        {message.streaming && (
                          <Box
                            component="span"
                            aria-hidden
                            sx={{ display: "inline-block", width: 7, height: 14, ml: 0.4, mb: "-2px", bgcolor: LIME, opacity: 0.7, borderRadius: "2px" }}
                          />
                        )}
                      </Box>
                      )}

                      {/* Sources the answer is based on */}
                      {message.from === "bot" && !message.streaming && message.sources && message.sources.length > 0 && (
                        <Box sx={{ mt: 0.8, display: "flex", flexDirection: "column", gap: 0.4 }}>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: "rgba(255,255,255,0.35)", px: 0.5 }}>
                            SOURCES
                          </Typography>
                          {message.sources.map((src) => (
                            <Box
                              key={src.url}
                              component="a"
                              href={src.url}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.6,
                                px: 1,
                                py: 0.5,
                                borderRadius: "8px",
                                bgcolor: "rgba(200,255,0,0.06)",
                                border: "1px solid rgba(200,255,0,0.14)",
                                color: "rgba(255,255,255,0.75)",
                                fontSize: 11.5,
                                textDecoration: "none",
                                "&:hover": { color: "#fff", borderColor: `${LIME}66` },
                              }}
                            >
                              <LinkRoundedIcon sx={{ fontSize: 14, color: LIME }} />
                              <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {src.title}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Callback details to confirm */}
                      {message.leadSummary && message.leadSummary.length > 0 && (
                        <Box
                          sx={{
                            mt: 0.8,
                            p: 1.4,
                            borderRadius: "12px",
                            bgcolor: "rgba(200,255,0,0.06)",
                            border: `1px solid ${LIME}44`,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
                            <PhoneInTalkRoundedIcon sx={{ fontSize: 16, color: LIME }} />
                            <Typography sx={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, color: LIME }}>
                              CALL BACK DETAILS
                            </Typography>
                          </Box>
                          {message.leadSummary.map((row) => (
                            <Box key={row.label} sx={{ display: "flex", gap: 1, fontSize: 12.5, lineHeight: 1.7 }}>
                              <Box component="span" sx={{ color: "rgba(255,255,255,0.5)", minWidth: 78 }}>
                                {row.label}
                              </Box>
                              <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>
                                {row.value}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Dispatch has it */}
                      {message.leadSubmitted && (
                        <Box
                          role="status"
                          sx={{
                            mt: 0.8,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.7,
                            px: 1.2,
                            py: 0.6,
                            borderRadius: "999px",
                            bgcolor: `${LIME}1f`,
                            color: LIME,
                            fontSize: 11.5,
                            fontWeight: 800,
                          }}
                        >
                          <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                          Dispatch notified: expect a call shortly
                        </Box>
                      )}

                      {/* Time + actions */}
                      {!message.streaming && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            message.from === "user" ? "flex-end" : "flex-start",
                          gap: 0.3,
                          mt: 0.25,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 9.5,
                            color: "rgba(255,255,255,0.3)",
                            px: 0.5,
                          }}
                        >
                          {message.time}
                        </Typography>

                        {/* Copy */}
                        <Tooltip
                          title={copiedId === message.id ? "Copied" : "Copy"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => copyMessage(message)}
                            sx={{
                              width: 26,
                              height: 26,
                              color:
                                copiedId === message.id
                                  ? LIME
                                  : "rgba(255,255,255,0.3)",
                            }}
                          >
                            <ContentCopyRoundedIcon
                              sx={{
                                fontSize: 14,
                              }}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* Manual bot voice */}
                        {message.from === "bot" &&
                          voiceSupported &&
                          voiceEnabled && (
                            <Tooltip title={speaking ? "Stop voice" : "Listen"}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (speaking) {
                                    stopSpeaking();
                                  } else {
                                    speak(message.text);
                                  }
                                }}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  color: speaking
                                    ? LIME
                                    : "rgba(255,255,255,0.35)",
                                }}
                              >
                                {speaking ? (
                                  <VolumeOffRoundedIcon
                                    sx={{
                                      fontSize: 15,
                                    }}
                                  />
                                ) : (
                                  <VolumeUpRoundedIcon
                                    sx={{
                                      fontSize: 15,
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                      </Box>
                      )}
                    </Box>
                  ))}

                  {/* ==================================================
                      QUICK PROMPTS
                  ================================================== */}

                  {/* Follow-up options offered with the latest reply */}
                  {suggestions.length > 0 && !typing && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, alignSelf: "flex-start" }}>
                      {suggestions.map((option) => (
                        <Chip
                          key={option}
                          label={option}
                          onClick={() => sendQuickPrompt(option)}
                          sx={{
                            height: 32,
                            color: DARK,
                            bgcolor: LIME,
                            fontWeight: 800,
                            borderRadius: "10px",
                            fontSize: 12,
                            "&:hover": { bgcolor: "#d4ff33" },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {showQuickPrompts && messages.length <= 1 && !typing && (
                    <Box
                      component={motion.div}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.35)",
                          mb: 1,
                          px: 0.5,
                        }}
                      >
                        QUICK OPTIONS
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.8,
                        }}
                      >
                        {config.quickPrompts.map((prompt) => (
                          <Chip
                            key={prompt}
                            label={prompt}
                            onClick={() => sendQuickPrompt(prompt)}
                            sx={{
                              height: 32,
                              color: "rgba(255,255,255,0.72)",
                              bgcolor: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(200,255,0,0.16)",
                              borderRadius: "10px",
                              fontSize: 11,
                              "&:hover": {
                                bgcolor: "rgba(200,255,0,0.1)",
                                borderColor: `${LIME}55`,
                                color: "#fff",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* ==================================================
                      VOICE LISTENING
                  ================================================== */}

                  {listening && (
                    <Box
                      component={motion.div}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      sx={{
                        alignSelf: "flex-end",
                        maxWidth: "88%",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.4,
                          borderRadius: "16px 16px 4px 16px",
                          bgcolor: "rgba(200,255,0,0.1)",
                          border: `1px solid ${LIME}44`,
                        }}
                      >
                        {/* listening header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mb: 0.7,
                          }}
                        >
                          <Box
                            component={motion.span}
                            animate={
                              reduce
                                ? {}
                                : {
                                    scale: [1, 1.35, 1],
                                    opacity: [0.6, 1, 0.6],
                                  }
                            }
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                            }}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: LIME,
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: 10.5,
                              fontWeight: 900,
                              color: LIME,
                              letterSpacing: 1,
                            }}
                          >
                            LISTENING
                          </Typography>

                          <GraphicEqRoundedIcon
                            sx={{
                              fontSize: 16,
                              color: LIME,
                            }}
                          />
                        </Box>

                        {/* live transcript */}
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.72)",
                            lineHeight: 1.5,
                          }}
                        >
                          {interimText || "Speak your message..."}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* ==================================================
                      AI THINKING
                  ================================================== */}

                  {typing && (
                    <Box
                      component={motion.div}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: MESSAGE,
                        borderRadius: "4px 16px 16px 16px",
                        px: 2,
                        py: 1.3,
                        display: "flex",
                        gap: 0.7,
                        alignItems: "center",
                      }}
                    >
                      {[0, 1, 2].map((index) => (
                        <Box
                          key={index}
                          component={motion.span}
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.35, 1, 0.35],
                          }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: index * 0.15,
                          }}
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: LIME,
                          }}
                        />
                      ))}

                      <Typography
                        sx={{
                          ml: 0.4,
                          fontSize: 10.5,
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        AI is thinking...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* ==================================================
                    AI SPEAKING BAR
                ================================================== */}

                {speaking && (
                  <Box
                    component={motion.div}
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      bgcolor: "rgba(200,255,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.8,
                    }}
                  >
                    <GraphicEqRoundedIcon
                      sx={{
                        color: LIME,
                        fontSize: 17,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 10.5,
                        color: LIME,
                        fontWeight: 800,
                      }}
                    >
                      AI is speaking
                    </Typography>

                    <Button
                      onClick={stopSpeaking}
                      size="small"
                      sx={{
                        minWidth: 0,
                        px: 1,
                        py: 0.1,
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 10,
                        textTransform: "none",
                      }}
                    >
                      Stop
                    </Button>
                  </Box>
                )}

                <Divider
                  sx={{
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                />

                {/* ==================================================
                    INPUT AREA
                ================================================== */}

                <Box
                  sx={{
                    p: 1.4,
                    display: "flex",
                    gap: 0.7,
                    alignItems: "flex-end",
                    bgcolor: "rgba(0,0,0,0.12)",
                  }}
                >
                  {/* MICROPHONE */}
                  {voiceSupported && (
                    <Box
                      sx={{
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      {/* Pulse */}
                      {listening && !reduce && (
                        <Box
                          component={motion.span}
                          animate={{
                            scale: [1, 1.45, 1],
                            opacity: [0.45, 0, 0.45],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                          }}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            bgcolor: LIME,
                          }}
                        />
                      )}

                      <Tooltip
                        title={
                          listening ? "Stop listening" : "Speak your message"
                        }
                      >
                        <IconButton
                          onClick={toggleListening}
                          disabled={typing}
                          aria-label={
                            listening ? "Stop voice input" : "Start voice input"
                          }
                          sx={{
                            position: "relative",
                            width: 44,
                            height: 44,
                            bgcolor: listening
                              ? LIME
                              : "rgba(255,255,255,0.06)",
                            color: listening ? DARK : LIME,
                            border: `1px solid ${
                              listening ? LIME : "rgba(200,255,0,0.25)"
                            }`,
                            "&:hover": {
                              bgcolor: listening
                                ? "#d4ff33"
                                : "rgba(200,255,0,0.1)",
                            },
                            "&.Mui-disabled": {
                              opacity: 0.35,
                            },
                          }}
                        >
                          {listening ? (
                            <StopRoundedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                          ) : (
                            <MicRoundedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  {/* TEXT INPUT */}
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    size="small"
                    placeholder={
                      listening ? "Listening..." : "Type your message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={listening}
                    sx={{
                      ...fieldSx,

                      "& .MuiInputBase-root": {
                        alignItems: "flex-end",
                      },
                    }}
                  />

                  {/* SEND */}
                  <Tooltip title="Send message">
                    <span>
                      <IconButton
                        onClick={() => send()}
                        disabled={!input.trim() || typing || listening}
                        aria-label="Send message"
                        sx={{
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                          bgcolor:
                            input.trim() && !typing && !listening
                              ? LIME
                              : "rgba(255,255,255,0.06)",
                          color:
                            input.trim() && !typing && !listening
                              ? DARK
                              : "rgba(255,255,255,0.3)",
                          "&:hover": {
                            bgcolor: LIME,
                            color: DARK,
                          },
                        }}
                      >
                        <SendRoundedIcon
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <Box
                  sx={{
                    pb: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  {voiceSupported ? (
                    <>
                      <MicRoundedIcon
                        sx={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.25)",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 9.5,
                          color: "rgba(255,255,255,0.25)",
                          textAlign: "center",
                        }}
                      >
                        Tap the microphone to speak
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        color: "rgba(255,255,255,0.25)",
                        textAlign: "center",
                      }}
                    >
                      Voice input is not available in this browser
                    </Typography>
                  )}
                </Box>
              </>
            }
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}

// ================================================================
// TEXT FIELD STYLE
// ================================================================

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.04)",
    fontSize: 14,

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.14)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.28)",
    },

    "&.Mui-focused fieldset": {
      borderColor: LIME,
      borderWidth: 1,
    },

    "&.Mui-disabled": {
      opacity: 0.65,
    },
  },

  "& input::placeholder": {
    color: "rgba(255,255,255,0.4)",
    opacity: 1,
  },

  "& textarea::placeholder": {
    color: "rgba(255,255,255,0.4)",
    opacity: 1,
  },
} as const;
