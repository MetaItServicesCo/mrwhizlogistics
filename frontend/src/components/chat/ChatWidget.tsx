"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

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
};

type Lead = {
  name: string;
  email: string;
  phone: string;
};

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

const WELCOME_TEXT = (name: string) =>
  `Hi ${name.split(" ")[0]}! 👋 I'm your Truckload AI Assistant. How can I help with your shipment today?`;

const QUICK_PROMPTS = [
  "I need a shipping quote",
  "I need a Hot Shot truck",
  "I need a Box Truck",
  "I need a Semi Truck",
];

export default function ChatWidget() {
  const reduce = useReducedMotion() ?? false;

  // ============================================================
  // MAIN STATES
  // ============================================================

  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);

  const [lead, setLead] = useState<Lead>({
    name: "",
    email: "",
    phone: "",
  });

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  // ============================================================
  // VOICE STATES
  // ============================================================

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

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
  // CHECK BROWSER VOICE SUPPORT
  // ============================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setVoiceSupported(Boolean(SpeechRecognition));
  }, []);

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
  // SEND TO AI
  //
  // FRONTEND PLACEHOLDER
  //
  // LATER:
  // /api/chat -> OpenAI
  // ============================================================

  const sendToAI = async (userMessage: string): Promise<string> => {
    /*
    ============================================================
    FUTURE OPENAI BACKEND
    ============================================================

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        lead,
        conversation: messages,
      }),
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();

    return data.reply;

    ============================================================
    */

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const lower = userMessage.toLowerCase();

    if (
      lower.includes("quote") ||
      lower.includes("price") ||
      lower.includes("rate")
    ) {
      return "Absolutely. I can help you with a shipping quote. Please share your pickup location, delivery location, freight type, approximate weight, and preferred pickup date.";
    }

    if (lower.includes("hot shot") || lower.includes("hotshot")) {
      return "Great. Our Hot Shot service is designed for time-sensitive and expedited freight. Please share your pickup location, delivery location, load size, and pickup date.";
    }

    if (lower.includes("box truck")) {
      return "We can help with Box Truck transportation. Please share the pickup and delivery locations, freight dimensions, approximate weight, and required pickup date.";
    }

    if (lower.includes("semi") || lower.includes("dry van")) {
      return "We can help with Semi Truck transportation, including Dry Van, Reefer, and Flatbed options. Please provide your pickup location, delivery location, freight type, weight, and pickup date.";
    }

    return "Thanks for the details. Our dispatch team can help arrange the right truck for your shipment. Could you share your pickup location, delivery location, freight type, approximate weight, and pickup date?";
  };

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

      // AI thinking
      setTyping(true);

      try {
        const reply = await sendToAI(text);

        setTyping(false);

        // AI reply is TEXT ONLY
        addMessage("bot", reply);

        /*
        IMPORTANT:

        DO NOT CALL speak(reply) HERE.

        AI response will NOT automatically become voice.

        User must click speaker icon.
        */
      } catch (error) {
        console.error("AI error:", error);

        setTyping(false);

        addMessage(
          "bot",
          "Sorry, something went wrong. Please try again or contact our dispatch team.",
        );
      }
    },
    [input, typing, stopListening, stopSpeaking, addMessage],
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
  // START CHAT
  // ============================================================

  const startChat = () => {
    if (!lead.name.trim()) return;

    if (!lead.email.includes("@")) return;

    setStarted(true);

    const welcome = WELCOME_TEXT(lead.name);

    setMessages([
      {
        id: createId(),
        from: "bot",
        text: welcome,
        time: now(),
      },
    ]);

    /*
    FUTURE:

    Save lead to backend

    fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lead),
    });
    */

    // NO speak() HERE.
    // Welcome message stays text.
  };

  // ============================================================
  // NEW CHAT
  // ============================================================

  const newChat = () => {
    stopListening();
    stopSpeaking();

    setStarted(false);
    setMessages([]);
    setInput("");
    setInterimText("");
    setTyping(false);
  };

  // ============================================================
  // CLEAR CURRENT CHAT
  // ============================================================

  const clearChat = () => {
    stopSpeaking();

    setMessages([]);
    setInput("");
    setInterimText("");

    if (started) {
      const welcome = WELCOME_TEXT(lead.name);

      setMessages([
        {
          id: createId(),
          from: "bot",
          text: welcome,
          time: now(),
        },
      ]);
    }
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

  return (
    <>
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
          onClick={() => setOpen((value) => !value)}
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
                    Mr.Whiz Logisttics AI Assistant
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
                {started && voiceSupported && (
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

            {/* ==================================================
                LEAD CAPTURE
            ================================================== */}

            {!started ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                  gap: 2,
                  overflowY: "auto",
                }}
              >
                {/* Intro */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.4,
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: "rgba(200,255,0,0.12)",
                      color: LIME,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <LocalShippingRoundedIcon
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      bgcolor: MESSAGE,
                      borderRadius: "4px 16px 16px 16px",
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.92)",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      Hi! 👋 I&apos;m your Truckload AI Assistant. Share your
                      details and I&apos;ll help you find the right
                      transportation solution.
                    </Typography>
                  </Box>
                </Box>

                {/* Form */}
                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Your name"
                    value={lead.name}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        name: e.target.value,
                      })
                    }
                    sx={fieldSx}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    placeholder="Email address"
                    value={lead.email}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        email: e.target.value,
                      })
                    }
                    sx={fieldSx}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Phone (optional)"
                    value={lead.phone}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        phone: e.target.value,
                      })
                    }
                    sx={fieldSx}
                  />

                  <Button
                    onClick={startChat}
                    disabled={!lead.name.trim() || !lead.email.includes("@")}
                    disableElevation
                    sx={{
                      mt: 0.5,
                      bgcolor: LIME,
                      color: DARK,
                      fontWeight: 900,
                      borderRadius: "12px",
                      py: 1.3,
                      textTransform: "none",
                      fontSize: 15,
                      "&:hover": {
                        bgcolor: "#d4ff33",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(200,255,0,0.18)",
                        color: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Start AI Assistant
                  </Button>

                  {voiceSupported && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 0.6,
                      }}
                    >
                      <MicRoundedIcon
                        sx={{
                          color: LIME,
                          fontSize: 15,
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 10.5,
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        Voice input available
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: 10.5,
                      color: "rgba(255,255,255,0.28)",
                    }}
                  >
                    Your information helps us assist you better.
                  </Typography>
                </Box>
              </Box>
            ) : (
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
                    AI shipment assistant
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                    }}
                  >
                    <Tooltip title="Clear conversation">
                      <IconButton
                        onClick={clearChat}
                        size="small"
                        sx={{
                          color: "rgba(255,255,255,0.45)",
                          "&:hover": {
                            color: LIME,
                          },
                        }}
                      >
                        <DeleteSweepRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="New chat">
                      <IconButton
                        onClick={newChat}
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
                      <Box
                        sx={{
                          px: 2,
                          py: 1.35,
                          fontSize: 14,
                          lineHeight: 1.6,

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
                        {message.text}
                      </Box>

                      {/* Time + actions */}
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
                    </Box>
                  ))}

                  {/* ==================================================
                      QUICK PROMPTS
                  ================================================== */}

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
                        {QUICK_PROMPTS.map((prompt) => (
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
            )}
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
