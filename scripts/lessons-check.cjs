#!/usr/bin/env node
// SessionStart nudge: suggest /prune-lessons when the Lessons list in the
// global CLAUDE.md grows past a threshold or hasn't been pruned in 30 days.
// Deterministic and fast — no LLM calls. Completely silent when the user has
// no "### Lessons" section or nothing needs attention.
const fs = require("fs");
const os = require("os");
const path = require("path");

const THRESHOLD = 15;
const MAX_AGE_DAYS = 30;

try {
  const claudeMd = path.join(os.homedir(), ".claude", "CLAUDE.md");
  const markerDir = path.join(os.homedir(), ".claude", "hooks");
  const marker = path.join(markerDir, ".lessons-last-pruned");

  const text = fs.readFileSync(claudeMd, "utf8");
  const m = text.match(/^###\s+Lessons\s*$/im);
  if (!m) process.exit(0);

  const after = text.slice(m.index + m[0].length);
  const nextHeading = after.search(/^#{1,6}\s/m);
  const section = nextHeading === -1 ? after : after.slice(0, nextHeading);
  const count = section
    .split("\n")
    .filter((l) => /^\s*[-*]\s+\S/.test(l)).length;

  // Start the 30-day clock on first run.
  if (!fs.existsSync(marker)) {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(marker, new Date().toISOString());
  }

  const ageDays = (Date.now() - fs.statSync(marker).mtimeMs) / 86400000;

  if (count >= THRESHOLD) {
    console.log(
      `Lessons list in global CLAUDE.md has ${count} entries (threshold ${THRESHOLD}) — consider running /prune-lessons.`
    );
  } else if (count > 0 && ageDays > MAX_AGE_DAYS) {
    console.log(
      `Lessons list in global CLAUDE.md hasn't been pruned in ${Math.round(ageDays)} days — consider running /prune-lessons.`
    );
  }
} catch (e) {
  // Never block session start over a nudge.
}
process.exit(0);
