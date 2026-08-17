# Claude 5-Minute Workout

A five-minute tune-up for any Claude Code setup. One command walks you through five opt-in upgrades — your existing `CLAUDE.md` is backed up before anything is touched.

## What's in the workout

1. **Karpathy coding rules** — behavioral guidelines that reduce common LLM coding mistakes: think before coding, simplicity first, surgical changes, goal-driven execution. Merged into your global `~/.claude/CLAUDE.md` (deduplicated against whatever you already have).
2. **Self-learning loop (Boris Cherny)** — a rule that makes Claude record a one-line lesson whenever you correct it, plus the maintenance pieces that keep the list from rotting:
   - a silent session-start hook that nudges you when the lessons list passes 15 entries or goes 30 days unpruned
   - a `/prune-lessons` skill that finds duplicates, contradictions, and stale entries, and applies fixes only after you approve them
3. **Everything file search** — bundled skill for instant local file search on Windows via the [Everything](https://www.voidtools.com/) search engine (`es.exe` included; you just need the free Everything app running).
4. **Changelog checker** — stop missing what shipped. Claude Code releases move fast, and the only way to keep up is to remember to go look:
   - a skill that fetches the official releases, filters to what's new since your last check, and calls out security fixes, breaking changes, and major features
   - a silent session-start hook that nudges you once you're more than 14 days behind
   - state lives in `~/.claude/changelog-last-check.txt`, so the date follows you between projects instead of resetting in every repo
5. **claude-hud status line** — installs [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud), a heads-up status line showing model, context usage, and session info.

## Install

```
/plugin marketplace add <path-or-github-repo-of-this-plugin>
/plugin install claude-5min-workout
```

Then start the workout:

```
/claude-5min-workout:setup
```

Pick any combination of the five items. Everything is reversible — the setup command reports every change it makes and how to undo it.

## Layout

```
.claude-plugin/plugin.json      plugin manifest
.claude-plugin/marketplace.json lets this repo double as a one-plugin marketplace
commands/setup.md               the /claude-5min-workout:setup command
hooks/hooks.json                SessionStart nudges (both silent unless needed)
scripts/lessons-check.cjs       lessons nudge (no LLM, ~50ms, never blocks startup)
scripts/changelog-check.cjs     changelog nudge (no LLM, no network, never blocks startup)
skills/prune-lessons/           interactive lessons curation skill
skills/everything-search/       Windows file search skill (es.exe bundled)
skills/changelog-skill/         Claude Code release summarizer
assets/karpathy-rules.md        content merged by setup option 1
assets/self-learning.md         content appended by setup option 2
```
