// Production load test: realistic visitors browsing and chatting.
//
//   k6 run -e BASE_URL=https://mrwhizlogistics.com -e LOADTEST_TOKEN=... -e PROFILE=smoke loadtest/k6/visitor_journey.js
//
// PROFILE: smoke (10 users, 1 min) | breakpoint (step up until it breaks) | spike (fast ramp)
// MAX_VUS caps the breakpoint/spike profiles (default 5000: about what one
// generator machine can drive; run several generators for more).
//
// Safety: chat requests carry X-Load-Test, so the chatbot uses its offline
// model (no Groq quota), never creates leads or dispatch emails, and keeps
// these conversations out of the dashboard (purge them afterwards). The run
// aborts automatically when errors or latency cross the thresholds below.
// k6 does not execute JavaScript, so GA4/Clarity do not record this traffic.

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE = (__ENV.BASE_URL || "https://mrwhizlogistics.com").replace(/\/$/, "");
// Chat API origin; same as BASE_URL in production (nginx routes /chat-api).
const CHAT = (__ENV.CHAT_URL || BASE).replace(/\/$/, "");
const TOKEN = __ENV.LOADTEST_TOKEN || "";
const PROFILE = __ENV.PROFILE || "smoke";
const MAX_VUS = Number(__ENV.MAX_VUS || 5000);
const CHAT_SHARE = Number(__ENV.CHAT_SHARE || 0.15); // share of visitors who chat

if (!TOKEN) throw new Error("LOADTEST_TOKEN is required (chat traffic must be marked as synthetic).");

const PAGES = [
  "/", "/", "/", // the homepage gets the most traffic
  "/hot-shot", "/box-truck", "/semi-truck", "/rentals", "/blog", "/about", "/contact",
  "/hot-shot/20-feet-flat-bed", "/hot-shot/24-feet-enclosed-trailer",
  "/box-truck/26-feet-box-truck", "/semi-truck/reefer-trailer", "/semi-truck/flat-bed",
  "/rentals/16-feet-dump-trailer", "/blog/hot-shot-vs-ltl-freight", "/blog/choosing-the-right-trailer",
];

const pageDuration = new Trend("page_duration", true);
const chatTurnDuration = new Trend("chat_turn_duration", true);
const chatFailed = new Rate("chat_failed");
const leadsSimulated = new Counter("leads_simulated");

function steps(maxVus) {
  // Hold each level long enough to see whether the system copes.
  const levels = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].filter((v) => v <= maxVus);
  const out = [];
  for (const level of levels) {
    out.push({ duration: "1m", target: level });
    out.push({ duration: "3m", target: level });
  }
  out.push({ duration: "1m", target: 0 });
  return out;
}

const PROFILES = {
  smoke: { executor: "constant-vus", vus: 10, duration: "1m" },
  breakpoint: { executor: "ramping-vus", startVUs: 0, stages: steps(MAX_VUS), gracefulRampDown: "30s" },
  spike: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "30s", target: Math.min(100, MAX_VUS) },
      { duration: "1m", target: MAX_VUS },
      { duration: "3m", target: MAX_VUS },
      { duration: "1m", target: 0 },
    ],
  },
};

export const options = {
  scenarios: { visitors: PROFILES[PROFILE] },
  thresholds: {
    // Abort (protecting the server and the other sites on it) when it breaks.
    http_req_failed: [{ threshold: "rate<0.05", abortOnFail: true, delayAbortEval: "1m" }],
    "page_duration": [{ threshold: "p(95)<5000", abortOnFail: true, delayAbortEval: "1m" }],
    "chat_turn_duration": [{ threshold: "p(95)<10000", abortOnFail: true, delayAbortEval: "1m" }],
    chat_failed: [{ threshold: "rate<0.05", abortOnFail: true, delayAbortEval: "1m" }],
  },
  discardResponseBodies: false,
  userAgent: "MrWhizLoadTest/1.0 (+k6)",
  insecureSkipTLSVerify: false,
  summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const chatHeaders = { "Content-Type": "application/json", "X-Load-Test": TOKEN };
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const think = (min, max) => sleep(min + Math.random() * (max - min));

function viewPage(path) {
  const res = http.get(`${BASE}${path}`, { tags: { kind: "page", name: "page" } });
  pageDuration.add(res.timings.duration);
  check(res, { "page 200": (r) => r.status === 200 });
  // Browsers also fetch the page's JS/CSS: take one asset, as a cache-cold visitor would.
  const asset = res.body && res.body.match(/\/_next\/static\/[^"']+\.(?:js|css)/);
  if (asset) http.get(`${BASE}${asset[0]}`, { tags: { kind: "asset", name: "asset" } });
}

function chatTurn(sessionId, message, page) {
  const res = http.post(
    `${CHAT}/chat-api/chat`,
    JSON.stringify({ message, session_id: sessionId, page_url: page }),
    { headers: chatHeaders, tags: { kind: "chat", name: "chat" }, timeout: "60s" },
  );
  chatTurnDuration.add(res.timings.duration);
  const ok = res.status === 200 && typeof res.body === "string" && res.body.includes("event: done");
  chatFailed.add(!ok);
  check(res, { "chat turn completed": () => ok });
  const sid = ok ? (res.body.match(/"session_id": "([a-f0-9]{32})"/) || [])[1] : null;
  return { ok, sessionId: sid || sessionId, body: res.body || "" };
}

function chat(page) {
  // Half start from the proactive invite, half open the chat themselves.
  let sessionId = null;
  if (Math.random() < 0.5) {
    const start = http.post(`${CHAT}/chat-api/proactive/start`, JSON.stringify({ page_url: page }), {
      headers: chatHeaders,
      tags: { kind: "chat", name: "proactive_start" },
    });
    chatFailed.add(start.status !== 200);
    if (start.status === 200) sessionId = start.json("session_id");
    think(3, 8);
  }
  const script = pick([
    ["I have a load to move", "About 4 pallets of floor tiles", "From Dallas to Austin."],
    ["Do you have reefer trailers?", "Do you deliver nationwide?"],
    ["How are you?", "What services do you offer?"],
    ["Can someone call me back? I'm Load Tester", "469 767 2211", "yes"],
  ]);
  for (const message of script) {
    const turn = chatTurn(sessionId, message, page);
    if (!turn.ok) return;
    sessionId = turn.sessionId;
    if (message === "yes" && turn.body.includes("submitted")) leadsSimulated.add(1);
    think(4, 10);
  }
}

export default function () {
  const landing = pick(PAGES);
  group("browse", () => {
    viewPage(landing);
    think(3, 10);
    if (Math.random() < 0.4) {
      viewPage(pick(PAGES));
      think(3, 10);
    }
  });
  if (Math.random() < CHAT_SHARE) group("chat", () => chat(landing));
  think(5, 15);
}

export function handleSummary(data) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return {
    [`loadtest/results/${PROFILE}-${stamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const m = data.metrics;
  const v = (name, stat) => (m[name] && m[name].values[stat] !== undefined ? m[name].values[stat] : NaN);
  const ms = (x) => (Number.isFinite(x) ? `${Math.round(x)} ms` : "n/a");
  const pct = (x) => (Number.isFinite(x) ? `${(x * 100).toFixed(2)}%` : "n/a");
  return [
    "",
    `Profile: ${PROFILE}   Target: ${BASE}`,
    `Peak virtual users:     ${v("vus_max", "max")}`,
    `HTTP requests:          ${v("http_reqs", "count")} (${v("http_reqs", "rate").toFixed(1)}/s)`,
    `HTTP errors:            ${pct(v("http_req_failed", "rate"))}`,
    `Page load p50 / p95:    ${ms(v("page_duration", "med"))} / ${ms(v("page_duration", "p(95)"))}`,
    `Chat turn p50 / p95:    ${ms(v("chat_turn_duration", "med"))} / ${ms(v("chat_turn_duration", "p(95)"))}`,
    `Chat failures:          ${pct(v("chat_failed", "rate"))}`,
    `Leads simulated:        ${v("leads_simulated", "count") || 0} (none sent to dispatch)`,
    "",
  ].join("\n");
}
