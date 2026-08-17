#!/usr/bin/env node
// SessionStart nudge: tell the user when Claude Code releases have shipped since
// they last caught up, then get out of the way.
//
// Runs at most once per calendar day — the second and later sessions in a day exit
// immediately without touching the network. No LLM calls. Fails silent on any error
// (offline, GitHub down, proxy) and never blocks session start.
//
// State is the last release TAG the user caught up on ("v2.1.233"), not a date.
// Dates lose releases: Claude Code ships more than once on some days, so a
// date-granular "newer than last check" filter permanently hides anything published
// later on a day the user already checked — silently, which is the worst way for a
// catch-up tool to fail. Tags also sidestep the local-vs-UTC skew a date comparison
// has to reason about, and make a same-day re-check correct instead of empty.
//
// Cadence is the user's choice, set during /claude-5min-workout:setup:
//   nudge (default) — print one line and let them pull the summary when ready
//   auto            — ask Claude to run the changelog skill and summarize now
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

const FEED = "https://github.com/anthropics/claude-code/releases.atom";
const FETCH_TIMEOUT_MS = 3000;

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const STATE_FILE = path.join(CLAUDE_DIR, "changelog-last-check.txt");
const CADENCE_FILE = path.join(CLAUDE_DIR, "changelog-cadence.txt");
const RUN_MARKER = path.join(CLAUDE_DIR, ".changelog-nudge-last-run");

// Local calendar date. Used only for the once-a-day run marker, where "has this
// already fired today" is a question about the user's day, not about UTC.
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const readDate = (file) => {
  try {
    const raw = fs.readFileSync(file, "utf8").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
};

// Returns {tag} for current state, {date} for pre-0.3 state, or null if absent
// or unrecognized. The date form is migrated to a tag the next time the skill runs.
const readState = () => {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { date: raw };
    if (/^v?\d+\.\d+\.\d+/.test(raw)) return { tag: raw };
    return null;
  } catch {
    return null;
  }
};

const readCadence = () => {
  try {
    return fs.readFileSync(CADENCE_FILE, "utf8").trim() === "auto" ? "auto" : "nudge";
  } catch {
    return "nudge";
  }
};

function fetchFeed() {
  return new Promise((resolve) => {
    const req = https.get(
      FEED,
      { headers: { "User-Agent": "claude-5min-workout-changelog-check" } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(null);
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      }
    );
    req.setTimeout(FETCH_TIMEOUT_MS, () => req.destroy());
    req.on("error", () => resolve(null));
  });
}

// Pull {tag, date} out of each <entry> in the atom feed, newest first. Deliberately
// a plain regex scan rather than an XML dependency — the shape here is stable and
// this has to stay fast enough to run before a session starts.
function parseEntries(xml) {
  return xml
    .split("<entry")
    .slice(1)
    .map((chunk) => {
      const updated = chunk.match(/<updated>([^<]+)<\/updated>/);
      const title = chunk.match(/<title>([^<]*)<\/title>/);
      if (!updated) return null;
      return { date: updated[1].slice(0, 10), tag: title ? title[1].trim() : "" };
    })
    .filter(Boolean);
}

async function main() {
  // Once per day, regardless of how many sessions get started.
  if (readDate(RUN_MARKER) === today()) return;

  const xml = await fetchFeed();
  if (!xml) return;

  // Mark the day spent only once the feed actually came back. Writing the marker
  // before the fetch would let a single offline session burn the day's check and
  // stay silent until tomorrow — the failure a catch-up tool can least afford.
  fs.writeFileSync(RUN_MARKER, today());

  const entries = parseEntries(xml);
  if (!entries.length) return;

  // No state yet: start the clock at the newest release instead of nudging about
  // the entire history. Silent on purpose — a fresh install should say nothing.
  const state = readState();
  if (!state) {
    fs.writeFileSync(STATE_FILE, entries[0].tag);
    return;
  }

  // The feed only ever returns its most recent window (10 entries today), so a user
  // further behind than that shows up as "not in the feed at all". Report the count
  // as "N+" rather than pretending the window is the whole story.
  let fresh;
  let capped;
  if (state.tag) {
    const idx = entries.findIndex((e) => e.tag === state.tag);
    capped = idx === -1;
    fresh = capped ? entries : entries.slice(0, idx);
  } else {
    // Pre-0.3 date state. Inclusive of the last-check day: re-reporting one already
    // seen release once, at migration, beats silently dropping a same-day one.
    fresh = entries.filter((e) => e.date >= state.date);
    capped = fresh.length === entries.length;
  }
  if (!fresh.length) return;

  const count = capped ? `${fresh.length}+` : `${fresh.length}`;
  const plural = !capped && fresh.length === 1 ? "release" : "releases";
  const names = fresh.slice(0, 3).map((e) => e.tag).filter(Boolean);
  const detail = names.length
    ? ` (${names.join(", ")}${fresh.length > names.length ? ", …" : ""})`
    : "";
  const since = state.tag ? `since ${state.tag}` : `since ${state.date}`;

  if (readCadence() === "auto") {
    console.log(
      `${count} new Claude Code ${plural} ${since}${detail}. Use the changelog-skill now to summarize them for the user, then carry on with whatever they asked for.`
    );
  } else {
    console.log(
      `${count} new Claude Code ${plural} ${since}${detail} — ask "what's new in Claude Code" for a summary.`
    );
  }
}

main().catch(() => {}).finally(() => process.exit(0));
