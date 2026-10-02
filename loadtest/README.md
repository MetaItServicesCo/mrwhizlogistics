# Load testing (production, with safeguards)

`k6/visitor_journey.js` simulates real visitors: page views (with an asset
fetch), 15% of them chatting (half via the proactive invite), including
call-back flows. It ramps up in steps and **aborts automatically** when the
error rate passes 5% or p95 latency passes 5 s (pages) / 10 s (chat turns),
protecting the server and the other sites hosted on it.

## Safeguards

Chat requests carry `X-Load-Test: <CHATBOT_LOADTEST_TOKEN>`. For those the
chatbot:

- uses its offline model: **no Groq calls or quota**;
- never sends leads to the backend: **no Quote Requests, no dispatch emails**;
- skips per-IP limits (all load comes from a few machines);
- keeps the conversations **out of the dashboard**; purge them afterwards.

k6 doesn't run JavaScript, so **GA4 and Clarity don't record this traffic**.
Page views do hit the real website and backend (that is what we measure).

## Run

1. On the server, add a token to `.env` and recreate the chatbot:
   ```bash
   echo "CHATBOT_LOADTEST_TOKEN=$(openssl rand -hex 24)" >> .env
   docker compose -f docker-compose.prod.yml -f docker-compose.host.yml up -d chatbot
   ```
2. Install k6 (`winget install GrafanaLabs.k6`, `brew install k6`, or the
   Docker image `grafana/k6`).
3. Smoke test (10 users, 1 minute):
   ```bash
   k6 run -e BASE_URL=https://mrwhizlogistics.com -e LOADTEST_TOKEN=<token> -e PROFILE=smoke loadtest/k6/visitor_journey.js
   ```
4. Find the breaking point (50 → 100 → 250 → 500 → 1k → 2.5k → 5k users,
   4 minutes per step):
   ```bash
   k6 run -e BASE_URL=https://mrwhizlogistics.com -e LOADTEST_TOKEN=<token> -e PROFILE=breakpoint -e MAX_VUS=5000 loadtest/k6/visitor_journey.js
   ```
   While it runs, watch the server: `docker stats` and `uptime`.
5. Clean up:
   ```bash
   curl -X POST -H "X-Load-Test: <token>" https://mrwhizlogistics.com/chat-api/loadtest/purge
   ```
   then remove `CHATBOT_LOADTEST_TOKEN` from `.env` and recreate the chatbot.

Results are saved in `loadtest/results/` (JSON) with a summary printed at
the end.

## Going beyond one machine

One generator drives roughly 5–10k virtual users. For more, run the same
script from several machines at once (each with `MAX_VUS` set to its share),
or use k6 Cloud. A single application server will saturate long before
100k simultaneous users; the breakpoint run shows where and why.
