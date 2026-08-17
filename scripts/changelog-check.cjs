#!/usr/bin/env node
// SessionStart nudge: suggest the changelog-skill when it's been a while since the
// user last caught up on Claude Code releases. Deterministic and fast — no LLM calls,
// no network. Shares its state file with the skill itself, so running the skill
// resets this clock. Silent until the threshold is crossed.
const fs = require("fs");
const os = require("os");
const path = require("path");

// Claude Code ships often enough that two weeks is usually several releases behind.
const MAX_AGE_DAYS = 14;

// Local calendar date, matching what the skill itself writes. Using toISOString()
// here would record the UTC date and disagree with the skill by a day each evening.
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

try {
  const stateFile = path.join(os.homedir(), ".claude", "changelog-last-check.txt");

  // Start the clock on first run rather than nudging immediately.
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, today());
    process.exit(0);
  }

  const raw = fs.readFileSync(stateFile, "utf8").trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? Date.parse(raw) : NaN;

  // Unreadable or corrupted state — reset it instead of nagging on bad data.
  if (Number.isNaN(parsed)) {
    fs.writeFileSync(stateFile, today());
    process.exit(0);
  }

  // Compare whole calendar days: both sides parse as UTC midnight, so the result
  // is a stable integer rather than drifting with the time of day the session starts.
  const ageDays = Math.round((Date.parse(today()) - parsed) / 86400000);

  if (ageDays > MAX_AGE_DAYS) {
    console.log(
      `Last Claude Code changelog check was ${ageDays} days ago — ask "what's new in Claude Code" to catch up.`
    );
  }
} catch (e) {
  // Never block session start over a nudge.
}
process.exit(0);
