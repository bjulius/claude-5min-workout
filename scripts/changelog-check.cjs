#!/usr/bin/env node
// SessionStart nudge: tell the user when Claude Code releases have shipped since
// they last caught up, then get out of the way.
//
// Runs at most once per calendar day — the second and later sessions in a day exit
// immediately without touching the network. No LLM calls. Fails silent on any error
// (offline, GitHub down, proxy) and never blocks session start.
//
// It checks the release feed rather than nudging purely on elapsed time, because a
// time-only nudge at daily cadence fires every day whether or not anything shipped:
// the last-check date only advances when the user actually runs the skill. Counting
// real releases means silence is meaningful.
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

const FEED = "https://github.com/anthropics/claude-code/releases.atom";
const FETCH_TIMEOUT_MS = 3000;

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const STATE_FILE = path.join(CLAUDE_DIR, "changelog-last-check.txt");
const RUN_MARKER = path.join(CLAUDE_DIR, ".changelog-nudge-last-run");

// Local calendar date, matching what the skill itself writes. toISOString() would
// record the UTC date and disagree with the skill by a day each evening.
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

// Pull {title, date} out of each <entry> in the atom feed. Deliberately a plain
// regex scan rather than an XML dependency — the shape here is stable and this has
// to stay fast enough to run before a session starts.
function parseEntries(xml) {
  return xml
    .split("<entry")
    .slice(1)
    .map((chunk) => {
      const updated = chunk.match(/<updated>([^<]+)<\/updated>/);
      const title = chunk.match(/<title>([^<]*)<\/title>/);
      if (!updated) return null;
      return { date: updated[1].slice(0, 10), title: title ? title[1].trim() : "" };
    })
    .filter(Boolean);
}

async function main() {
  const lastCheck = readDate(STATE_FILE);

  // No state yet: start the clock instead of nudging about the entire release history.
  if (!lastCheck) {
    fs.writeFileSync(STATE_FILE, today());
    return;
  }

  // Once per day, regardless of how many sessions get started.
  if (readDate(RUN_MARKER) === today()) return;
  fs.writeFileSync(RUN_MARKER, today());

  const xml = await fetchFeed();
  if (!xml) return;

  const fresh = parseEntries(xml).filter((e) => e.date > lastCheck);
  if (!fresh.length) return;

  const names = fresh.slice(0, 3).map((e) => e.title).filter(Boolean);
  const detail = names.length
    ? ` (${names.join(", ")}${fresh.length > names.length ? ", …" : ""})`
    : "";
  const plural = fresh.length === 1 ? "release" : "releases";

  console.log(
    `${fresh.length} new Claude Code ${plural} since ${lastCheck}${detail} — ask "what's new in Claude Code" for a summary.`
  );
}

main().catch(() => {}).finally(() => process.exit(0));
