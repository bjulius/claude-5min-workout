---
description: Five-minute Claude Code tune-up — back up CLAUDE.md, then pick which upgrades to apply (Karpathy rules, self-learning loop, Everything search, changelog checker, claude-hud status line).
---

# Claude 5-Minute Workout — Setup

Walk the user through a short, safe tune-up of their Claude Code setup. Everything is opt-in and reversible. Follow these steps exactly.

## Step 1 — Back up CLAUDE.md (always, before anything else)

The user's global memory file is `~/.claude/CLAUDE.md`.

- If it exists, copy it to `~/.claude/CLAUDE.md.backup-<YYYYMMDD-HHMMSS>` before touching anything, and tell the user where the backup is.
- If it doesn't exist, tell the user you'll be creating one fresh (no backup needed).

## Step 2 — Ask what to apply

Use AskUserQuestion with ONE multiSelect question offering these five options (all selectable; briefly describe each):

1. **Karpathy coding rules** — behavioral guidelines that reduce common LLM coding mistakes (think before coding, simplicity first, surgical changes, goal-driven execution). Added to the global CLAUDE.md.
2. **Self-learning loop (Boris Cherny)** — Claude records a one-line lesson in CLAUDE.md whenever the user corrects it. Comes with a session-start nudge and a `/prune-lessons` skill (both already active via this plugin) that keep the lessons list curated over time.
3. **Everything file search** — a skill for instant local file search on Windows using the Everything search engine (bundled with this plugin; needs the free Everything app installed).
4. **Changelog checker** — a skill that summarizes what shipped in Claude Code since you last looked, plus a session-start nudge (both bundled with this plugin) so you find out without having to remember to ask.
5. **claude-hud status line** — a heads-up status line showing model, context usage, and session info at the bottom of the terminal (separate plugin by jarrodwatts).

## Step 3 — Apply the selected items

### If "Karpathy coding rules" selected

Read `${CLAUDE_PLUGIN_ROOT}/assets/karpathy-rules.md`. Merge its sections into `~/.claude/CLAUDE.md`:

- If the file already has semantically equivalent rules (e.g. its own scope-control or simplicity sections), MERGE rather than duplicate — fold the new bullets into the existing sections and say what you deduplicated.
- If the file is empty/new, add the content under a `## Core Rules` heading.
- Never delete existing user content; only add or merge.

### If "Self-learning loop" selected

Read `${CLAUDE_PLUGIN_ROOT}/assets/self-learning.md`. Append its `### Self-Learning` and `### Lessons` sections to `~/.claude/CLAUDE.md` (skip if a `### Lessons` heading already exists — tell the user it's already set up).

Then explain the two supporting pieces that ship with this plugin and are already active:
- A SessionStart hook that silently counts lessons and nudges only when the list exceeds 15 entries or hasn't been pruned in 30 days. It does nothing until a `### Lessons` section exists.
- The `/prune-lessons` skill for interactive, approval-gated curation.

### If "Everything file search" selected

The skill is bundled with this plugin — nothing to install in Claude Code. Verify the prerequisite instead:

- Check whether the Everything app is running/installed (try `"${CLAUDE_PLUGIN_ROOT}/skills/everything-search/es.exe" -n 1 test` via Bash; an IPC error means the Everything app isn't running).
- If missing, point the user to https://www.voidtools.com/downloads/ (install the app, let it build its index once).
- Tell the user the skill activates automatically when they ask Claude to find local files.
- This is Windows-only; on macOS/Linux, say so and skip.

### If "Changelog checker" selected

Both pieces are bundled with this plugin and already active — there is nothing to install. Explain them and confirm the starting state:

- The skill activates when the user asks "what's new in Claude Code" or "check the changelog". It fetches https://github.com/anthropics/claude-code/releases, reports only what shipped since their last check, and highlights security fixes, breaking changes, and major features.
- A SessionStart hook checks the release feed at most once a day and prints one line naming how many releases they're behind. It stays silent when nothing has shipped, when the machine is offline, and on every session after the first each day. It never blocks startup and makes no LLM calls.
- Both share one state file: `~/.claude/changelog-last-check.txt`. It's deliberately user-global, so the date survives moving between projects. On a machine with no state file yet, the hook seeds it with today's date and says nothing rather than dumping the entire release history.
- Reading the summary is what resets the clock, so the nudge keeps reporting until they actually catch up. It counts real releases rather than elapsed days, so silence genuinely means nothing shipped.

### If "claude-hud status line" selected

Run these via Bash (the plugin CLI), reporting output honestly:

```
claude plugin marketplace add jarrodwatts/claude-hud
claude plugin install claude-hud@claude-hud
```

If the CLI commands are unavailable in the installed version, instead tell the user to run `/plugin marketplace add jarrodwatts/claude-hud` then `/plugin install claude-hud` themselves.

Finally, tell the user to run `/claude-hud:setup` (a slash command only they can invoke) to wire it up as their status line, after restarting the session so the new plugin loads.

## Step 4 — Report

List exactly what changed, file by file, including the backup path, and how to undo each item:
- CLAUDE.md changes: restore from the backup created in Step 1.
- claude-hud: `/plugin uninstall claude-hud`.
- This plugin's hooks and skills: disable the plugin.
- Changelog state: delete `~/.claude/changelog-last-check.txt` (the only file this plugin writes outside itself).

Keep the report tight and beginner-friendly — define jargon (skill, hook, plugin, status line) in passing.
