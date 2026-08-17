# Installing the Claude 5-Minute Workout

A guided, reversible tune-up for your Claude Code setup. Takes about five minutes, and it backs up your existing configuration before touching anything.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) installed (any recent version)
- Windows users who want the file-search upgrade: the free [Everything](https://www.voidtools.com/downloads/) app (the plugin bundles everything else)

## Install (from GitHub)

Open Claude Code anywhere and run these two commands:

```
/plugin marketplace add bjulius/claude-5min-workout
/plugin install claude-5min-workout
```

Restart Claude Code (or start a new session) so the plugin loads.

## Run the workout

```
/claude-5min-workout:setup
```

You'll be asked which upgrades you want — pick any combination:

| Option | What it does |
|---|---|
| Karpathy coding rules | Adds proven anti-overengineering guidelines to your global CLAUDE.md |
| Self-learning loop | Claude records a one-line lesson whenever you correct it, with a nudge hook + `/prune-lessons` skill to keep the list curated |
| Everything file search | Instant local file search on Windows (skill bundled, es.exe included) |
| Changelog checker | Summarizes what shipped in Claude Code since you last looked, with a once-a-day session-start nudge when you fall behind |
| claude-hud status line | Heads-up display of model, context usage, and session info |

Your `~/.claude/CLAUDE.md` is backed up to a timestamped copy **before** any change, and the setup ends with a file-by-file report of what changed and how to undo it.

## Uninstall

```
/plugin uninstall claude-5min-workout
```

CLAUDE.md changes survive uninstall (they're your file) — restore from the timestamped backup if you want them gone too.
