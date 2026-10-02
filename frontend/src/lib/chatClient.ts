/**
 * Client for the AI chat assistant service (chatbot/, served at /chat-api).
 *
 * In production nginx routes /chat-api on the site's own origin to the
 * chatbot container, so the default base is "". Locally set
 * NEXT_PUBLIC_CHAT_API_URL (e.g. http://127.0.0.1:8030).
 */

import { getToken } from "@/lib/api";

export const CHAT_API_URL = (process.env.NEXT_PUBLIC_CHAT_API_URL || "").replace(/\/$/, "");

const SESSION_KEY = "mrwhiz_chat_session";

export interface ChatSource {
  url: string;
  title: string;
}

export interface LeadSummaryItem {
  label: string;
  value: string;
}

export type ChatEvent =
  | { type: "session"; session_id: string }
  | { type: "token"; text: string }
  | { type: "replace"; text: string }
  | { type: "sources"; sources: ChatSource[] }
  | { type: "lead"; status: "confirming"; summary: LeadSummaryItem[] }
  | { type: "lead"; status: "submitted"; lead_id: number }
  | { type: "done"; reply: string; suggestions: string[]; sources: ChatSource[]; lead_stage: string }
  | { type: "error"; message: string };

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
  suggestions: string[];
  created_at: string;
}

export class ChatHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function loadSessionId(): string | null {
  try {
    const id = window.localStorage.getItem(SESSION_KEY);
    return id && /^[a-f0-9]{32}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function saveSessionId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: the chat still works, it just won't survive a reload */
  }
}

async function errorText(resp: Response): Promise<string> {
  try {
    const body = await resp.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    /* not JSON */
  }
  return resp.status === 429
    ? "You're sending messages very quickly. Please wait a moment."
    : "The assistant is unavailable right now.";
}

/** Sends one message and calls `onEvent` for each streamed event. */
export async function streamChat(
  params: { message: string; sessionId: string | null; pageUrl?: string; signal?: AbortSignal },
  onEvent: (event: ChatEvent) => void,
): Promise<void> {
  const resp = await fetch(`${CHAT_API_URL}/chat-api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ message: params.message, session_id: params.sessionId, page_url: params.pageUrl }),
    signal: params.signal,
  });
  if (!resp.ok || !resp.body) throw new ChatHttpError(await errorText(resp), resp.status);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) event = line.slice(7).trim();
        else if (line.startsWith("data: ")) data += line.slice(6);
      }
      if (!data) continue;
      try {
        onEvent({ type: event, ...JSON.parse(data) } as ChatEvent);
      } catch {
        /* ignore a malformed event rather than breaking the conversation */
      }
    }
  }
}

/** The stored conversation for a session (null if it no longer exists). */
export async function restoreSession(sessionId: string): Promise<{ messages: StoredMessage[]; lead_stage: string } | null> {
  const resp = await fetch(`${CHAT_API_URL}/chat-api/sessions/${sessionId}`);
  if (resp.status === 404) return null;
  if (!resp.ok) throw new ChatHttpError(await errorText(resp), resp.status);
  return resp.json();
}

export interface Invite {
  message: string;
  suggestions: string[];
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${CHAT_API_URL}/chat-api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new ChatHttpError(await errorText(resp), resp.status);
  return resp.json();
}

/** The proactive invite for this page (counts one impression). */
export const fetchInvite = (pageUrl: string) => postJson<Invite>("/proactive/invite", { page_url: pageUrl });

/** The visitor engaged with the invite: a conversation already in the lead flow. */
export const startProactive = (pageUrl: string) =>
  postJson<Invite & { session_id: string }>("/proactive/start", { page_url: pageUrl });

/** Speech-to-text for a recorded voice message (Groq Whisper on the server). */
export async function transcribeAudio(audio: Blob): Promise<string> {
  const ext = audio.type.includes("mp4") ? "mp4" : audio.type.includes("ogg") ? "ogg" : "webm";
  const form = new FormData();
  form.append("audio", audio, `voice.${ext}`);
  const resp = await fetch(`${CHAT_API_URL}/chat-api/voice/transcribe`, { method: "POST", body: form });
  if (!resp.ok) throw new ChatHttpError(await errorText(resp), resp.status);
  return (await resp.json()).text || "";
}

/** Read-aloud audio (WAV) for up to 200 characters of a reply (Groq Orpheus). */
export async function fetchSpeech(text: string): Promise<Blob> {
  const resp = await fetch(`${CHAT_API_URL}/chat-api/voice/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new ChatHttpError(await errorText(resp), resp.status);
  return resp.blob();
}

/** Authenticated dashboard calls to the chatbot service's admin API. */
export async function chatAdmin<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const resp = await fetch(`${CHAT_API_URL}/chat-api/admin${path}`, {
    ...init,
    headers: { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!resp.ok) throw new ChatHttpError(await errorText(resp), resp.status);
  return (resp.status === 204 ? undefined : await resp.json()) as T;
}
