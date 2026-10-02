# Mr. Whiz AI chat assistant

A separate service that powers the website chat. It answers questions from the
live website, and turns "I need a truck / a quote / a person" into a call-back
lead that dispatch receives instantly.

- **Stack:** FastAPI · LangGraph (Postgres checkpointer) · Groq via LangChain ·
  local `bge-small` embeddings (fastembed) · hybrid vector + BM25 retrieval
- **Talks to:** the backend (leads, settings) and the website (knowledge crawl),
  over the Docker network. Stores its own data in the `chatbot` schema of the
  site's Postgres.
- **Managed in:** Dashboard → AI Assistant (analytics, transcripts, knowledge,
  settings). Chat leads appear in Leads → Quote Requests marked **CALL NOW**.

## How a message flows

```
widget ──SSE──▶ /chat-api/chat
                 │  rate limits (per session + per IP, in Postgres), one turn at a time per session
                 ▼
  guard_input ──(injection/abuse)──────────────────────────────┐
      │                                                        │
  router (orchestrator: small model, structured output)        │
      ├─▶ knowledge     hybrid search → answer from pages,     │
      │                 source links, output guard             │
      ├─▶ lead          extract → validate (plain code) →      │
      │                 confirm → POST /api/internal/chat-leads│
      └─▶ conversation  small talk / off-topic                 │
                         ▼                                     ▼
                      finalize → saved transcript + checkpointed state
```

**Knowledge agent**: answers only from retrieved website text (plus company
facts and the "facts" list in Dashboard → AI Assistant → Settings). Below the
confidence threshold it says it doesn't know and offers a call back.

**Lead agent ("booking")**: a booking means *a dispatcher calls the visitor
now*. Required: name + a valid phone (libphonenumber). The model only extracts
what the visitor said and phrases the next question; code decides what's
missing, validates, asks for confirmation, and submits once. Route, freight
and date are optional and can be added after submission (the lead is updated).
Questions mid-flow are answered and the flow resumes.

**Guards**
- Input: length cap, control characters, prompt-injection markers.
- Output: any price, per-mile rate, delivery-time promise or "your load is
  booked" that isn't in the retrieved text is replaced with a safe reply.
- The model has no tools beyond search and the lead flow, so a manipulated
  prompt can't read data or act on anything else.

**Resilience**
- Groq calls retry and fall back to a second model.
- If every model call fails, routing and lead extraction fall back to rules.
  A visitor can still leave their number during a model outage.
- Backend lead creation is retried and idempotent per session.

## Voice (on visitor request only)

- **Voice messages:** the visitor taps the mic; the widget records (60 s
  max) and `POST /chat-api/voice/transcribe` turns it into text with Groq
  Whisper (`whisper-large-v3-turbo`). Works in every modern browser,
  including iPhone Safari.
- **Read aloud:** tapping *Listen* on a reply, or switching on *Voice
  replies* in the chat header (off by default), plays it with Groq Orpheus
  (`canopylabs/orpheus-v1-english`, voice chosen in the dashboard). The API
  reads at most 200 characters per request, so the widget sends a reply
  sentence by sentence and prefetches the next one while the current one
  plays. Falls back to the browser's voice if Groq voice is unavailable.
- **Limits:** 20 voice messages and ~6,000 read-aloud characters per
  visitor per 10 minutes; recordings up to 5 MB. Nothing is stored.
- If your Groq project restricts models, allow the two voice models in the
  Groq console (Orpheus may ask you to accept its terms once).

## Endpoints (all under `/chat-api`)

| Method | Path | Who |
| --- | --- | --- |
| POST | `/chat` | Visitor: one message, SSE stream (`session`, `token`, `replace`, `sources`, `lead`, `done`, `error`) |
| GET | `/sessions/{id}` | Visitor: restore a conversation |
| GET | `/config` | Visitor: greeting, quick prompts, on/off |
| GET | `/health` | Health check |
| GET | `/admin/stats`, `/admin/conversations`, `/admin/conversations/{id}` | Dashboard (backend JWT) |
| DELETE | `/admin/conversations/{id}` | Dashboard |
| GET/POST | `/admin/knowledge`, `/admin/knowledge/reindex`, `/admin/knowledge/search` | Dashboard |

## Configuration

See `.env.example`. In production every value comes from the root `.env` via
`docker-compose.prod.yml` (`GROQ_API_KEY`, `CHATBOT_SERVICE_TOKEN`, shared
`SECRET_KEY`, …). Moving off Groq later only needs another `ChatLLM`
implementation in `app/agent/llm.py`.

**Model selection.** Defaults: `openai/gpt-oss-120b` for answers,
`openai/gpt-oss-20b` for routing/extraction (both on every Groq tier; the
Llama models are Enterprise-only). At startup the service lists the models
the key can use and takes, per role, the configured model or the next
available one from the preference list in `app/agent/models.py`. If Groq
retires a model later ("model not found"), it re-resolves automatically.
Dashboard → AI Assistant → Overview shows the models in use and why.

## Develop and test

```bash
cd chatbot
python -m venv venv && venv/Scripts/pip install -r requirements-dev.txt   # Windows
cp .env.example .env            # set DATABASE_URL, SECRET_KEY, SERVICE_TOKEN; LLM_PROVIDER=fake works offline
python run_local.py 8030        # Windows-safe dev server (selector event loop)
pytest                          # 37 tests: rules, guards, chunking, retrieval, agent graph, HTTP + Postgres
```

The frontend uses `NEXT_PUBLIC_CHAT_API_URL=http://127.0.0.1:8030` locally;
in production it calls `/chat-api` on its own origin (nginx).

### Behavioral evals (real model)

```bash
LLM_PROVIDER=groq GROQ_API_KEY=... python -m evals.run_evals --min-pass 0.9
```

`evals/cases.json` has 36 conversations covering knowledge answers, refusing to
invent prices or transit times, the full call-back flow (corrections,
mid-flow questions, Spanish), hand-off, off-topic and prompt injection. Run it
after any prompt or model change. It writes a per-reply report for review.

## Operations

- **Knowledge refresh:** on startup if empty, then every 30 min (incremental,
  by content hash). Dashboard → AI Assistant → Knowledge → "Re-read website
  now" for immediate updates.
- **Retention:** transcripts are deleted after the days set in the dashboard
  (default 90). Leads remain in Quote Requests.
- **Scaling:** stateless workers. Locks, limits and state live in Postgres,
  so `--workers` or more containers can be added. Watch Groq rate limits:
  `LLM_MAX_CONCURRENCY` caps concurrent calls per worker.
- **Tracing (optional):** set `LANGSMITH_TRACING=true` and
  `LANGSMITH_API_KEY` to trace every model call.
