// Synthetic visitors for internal analytics testing (GA4 / Clarity).
//
//   node synthetic_visits.mjs --visits 10000 --concurrency 50
//
// Real headless Chrome sessions load the live site, so analytics record them
// through the normal tracking tags. Every session is LABELLED so it can be
// identified, verified and excluded in reports:
//   utm_source=loadtest  utm_medium=synthetic  utm_campaign=<--campaign>
// In GA4: Reports -> Acquisition -> Traffic acquisition (Session source =
// loadtest), or Realtime filtered by source. Each session uses a fresh
// browser profile, so GA4 counts it as a new user.
//
// Images, video and fonts are skipped to save bandwidth; pages, scripts and
// the analytics tags load normally.

import { chromium } from "playwright-core";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, cur, i, all) => (cur.startsWith("--") ? [...pairs, [cur.slice(2), all[i + 1]]] : pairs), []),
);
const BASE = (args.base || "https://mrwhizlogistics.com").replace(/\/$/, "");
const VISITS = Number(args.visits || 20);
const CONCURRENCY = Number(args.concurrency || 10);
const CONTEXTS_PER_BROWSER = Number(args["per-browser"] || 10);
const CAMPAIGN = args.campaign || `internal-test-${new Date().toISOString().slice(0, 10)}`;
const CHROME = args.chrome || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SECOND_PAGE_SHARE = Number(args["second-page"] || 0.4);
// --quick: leave right after GA4 records the page view (a short visit), so
// far fewer parallel browsers reach a given number of users per minute.
const QUICK = "quick" in args;

const PAGES = [
  "/", "/", "/", "/hot-shot", "/box-truck", "/semi-truck", "/rentals", "/blog", "/about", "/contact",
  "/hot-shot/20-feet-flat-bed", "/box-truck/26-feet-box-truck", "/semi-truck/reefer-trailer",
  "/rentals/16-feet-dump-trailer", "/blog/hot-shot-vs-ltl-freight", "/blog/choosing-the-right-trailer",
];
const VIEWPORTS = [
  { width: 1920, height: 1080 }, { width: 1536, height: 864 }, { width: 1440, height: 900 },
  { width: 1366, height: 768 }, { width: 390, height: 844, mobile: true }, { width: 412, height: 915, mobile: true },
];
const ZONES = ["America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles"];
// A regular desktop/mobile Chrome identity, so analytics process the session
// (the UTM labels above are what mark it as synthetic).
const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const UA_MOBILE = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stats = { started: 0, done: 0, gaHits: 0, failed: 0, errors: new Map() };
const t0 = Date.now();

function noteError(err) {
  const key = String(err?.message || err).split("\n")[0].slice(0, 90);
  stats.errors.set(key, (stats.errors.get(key) || 0) + 1);
}

async function visit(browser) {
  const vp = pick(VIEWPORTS);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.mobile),
    userAgent: vp.mobile ? UA_MOBILE : UA_DESKTOP,
    locale: "en-US",
    timezoneId: pick(ZONES),
  });
  let gaHit = false;
  try {
    await context.route("**/*", (route) => {
      const type = route.request().resourceType();
      return ["image", "media", "font"].includes(type) ? route.abort() : route.continue();
    });
    const page = await context.newPage();
    page.on("request", (req) => {
      if (/google-analytics\.com\/(g|j)\/collect|analytics\.google\.com\/g\/collect/.test(req.url())) gaHit = true;
    });
    const landing = pick(PAGES);
    const url = `${BASE}${landing}?utm_source=loadtest&utm_medium=synthetic&utm_campaign=${encodeURIComponent(CAMPAIGN)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    // Wait for GA4's page_view hit (gtag loads after hydration).
    for (let i = 0; i < 30 && !gaHit; i++) await sleep(500);
    if (QUICK) {
      await sleep(800); // let the hit finish sending
      if (gaHit) stats.gaHits++;
      else noteError(new Error("No GA4 hit observed"));
      stats.done++;
      return;
    }
    await page.mouse.wheel(0, 600 + Math.random() * 1200);
    await sleep(2000 + Math.random() * 4000);
    if (Math.random() < SECOND_PAGE_SHARE) {
      await page.goto(`${BASE}${pick(PAGES)}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await sleep(2000 + Math.random() * 3000);
    }
    if (gaHit) stats.gaHits++;
    else noteError(new Error("No GA4 hit observed"));
    stats.done++;
  } catch (err) {
    stats.failed++;
    noteError(err);
  } finally {
    await context.close().catch(() => {});
  }
}

async function worker(browser) {
  while (stats.started < VISITS) {
    stats.started++;
    await visit(browser);
  }
}

function report(final = false) {
  const secs = (Date.now() - t0) / 1000;
  const rate = stats.done / Math.max(secs, 1);
  const eta = rate > 0 ? Math.round((VISITS - stats.done) / rate) : NaN;
  const line =
    `${final ? "DONE" : "...."} ${stats.done}/${VISITS} visits | GA4 hits ${stats.gaHits} | failed ${stats.failed} | ` +
    `${rate.toFixed(1)}/s | elapsed ${Math.round(secs)}s${final ? "" : ` | ETA ${Number.isFinite(eta) ? eta + "s" : "?"}`}`;
  console.log(line);
}

const browsers = await Promise.all(
  Array.from({ length: Math.ceil(CONCURRENCY / CONTEXTS_PER_BROWSER) }, () =>
    chromium.launch({ executablePath: CHROME, headless: true, args: ["--disable-dev-shm-usage", "--mute-audio"] }),
  ),
);
console.log(`Campaign "${CAMPAIGN}": ${VISITS} visits, ${CONCURRENCY} at a time, against ${BASE}`);
const ticker = setInterval(report, 10000);
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(browsers[i % browsers.length])));
clearInterval(ticker);
report(true);
if (stats.errors.size) {
  console.log("Issues:");
  for (const [msg, n] of [...stats.errors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${n} x ${msg}`);
}
await Promise.all(browsers.map((b) => b.close()));
