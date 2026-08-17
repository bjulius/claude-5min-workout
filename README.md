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
   - a session-start hook that checks the release feed once a day and tells you how many releases you're behind — silent when there's nothing new, when you're offline, and on every session after the first each day
   - your choice of cadence: a one-line nudge you pull the summary from (default), or an automatic summary at the first session of the day
   - state is the release tag you last caught up on, in `~/.claude/changelog-last-check.txt`, so it follows you between projects instead of resetting in every repo — and because it's a tag rather than a date, releases that ship later on a day you already checked don't get silently skipped
5. **claude-hud status line** — installs [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud), a heads-up status line showing model, context usage, and session info.

## Install

```
/plugin marketplace add bjulius/claude-5min-workout
/plugin install claude-5min-workout
```

Restart Claude Code so the plugin loads, then start the workout:

```
/claude-5min-workout:setup
```

Pick any combination of the five items. Everything is reversible — the setup command reports every change it makes and how to undo it.

## For beginners: what all these words mean

This workout touches five different ways of extending Claude Code, and the docs tend to assume you already know the vocabulary. Here's the short version.

### The one distinction that matters most

**Hooks always run. Skills only run when Claude decides they're relevant.**

A hook is a plain command executed by Claude Code itself, on a fixed event, every single time. Claude has no say in it. A skill is a document Claude chooses to open when the work looks like it needs it — reliable in practice, but a judgment call, not a guarantee.

So when you want something to happen *without fail* — a check, a log, a block — reach for a hook. When you want Claude to *know how* to do something well once the topic comes up, write a skill. Asking Claude to "always remember to X" is the option that works least reliably of the three; a hook is how you actually enforce it.

### The pieces

**`CLAUDE.md`** — a plain Markdown file of standing instructions, loaded into context at the start of every session. `~/.claude/CLAUDE.md` applies everywhere; a `CLAUDE.md` in a project applies to that project. This is where preferences live ("never use pie charts", "commit like this"). Options 1 and 2 of this workout write here.

**Skill** — a folder with a `SKILL.md` inside. The frontmatter carries a `name` and a `description`, and that description is the *entire* basis on which Claude decides whether to open it, so it should read like a list of trigger phrases, not a summary. Everything below the frontmatter is instructions Claude follows once loaded. Skills keep context small: only the description is always in context, and the body loads on demand. Bigger skills push detail into a `references/` subfolder that only gets read when needed — the changelog and Everything skills here both do that.

**Slash command** — a skill you invoke by name, like `/prune-lessons`. Recent Claude Code versions merged commands and skills into one concept, so the difference is now just *who* triggers it: you, or Claude.

**Hook** — a command wired to an event in `settings.json` or a plugin's `hooks.json`. Useful events: `SessionStart`, `UserPromptSubmit`, `PreToolUse` and `PostToolUse` (which can inspect and even block a tool call), and `Stop`. Whatever the command prints on stdout is shown to you or fed to Claude. Both nudges in this plugin are `SessionStart` hooks, written to stay silent unless they have something worth saying — a chatty hook is one you'll soon stop reading. Hooks are ordinary programs, so they're deterministic and fast, and they cost no tokens.

**Plugin** — one folder bundling any of the above, described by `.claude-plugin/plugin.json`. Installing a plugin activates its skills, commands, and hooks together; disabling it removes them cleanly. That's what this repo is.

**Marketplace** — a repo listing installable plugins. `/plugin marketplace add <repo>` registers a source, then `/plugin install <name>` installs from it. A repo can list only itself, which is what `marketplace.json` here does.

**MCP server** — Model Context Protocol: a separate program exposing *tools* (actions Claude can call) and *resources* (data it can read). Skills teach Claude how to use what it already has; MCP servers give it genuinely new abilities, usually access to an outside system like a database, an issue tracker, or a browser. This plugin ships no MCP servers.

**Subagent** — a helper Claude spawns with its own fresh context, to keep a large search or a long side-quest from crowding the main conversation. It reports back a conclusion instead of everything it read.

**Status line** — the bar at the bottom of the terminal. Claude Code runs a command you specify and displays its output, refreshed periodically. Option 5 installs one that shows model, context usage, and session cost.

### Where things live

```
~/.claude/CLAUDE.md          your global standing instructions
~/.claude/settings.json      hooks, permissions, plugins, status line
~/.claude/skills/            personal skills, one folder each
~/.claude/plugins/           installed plugins (managed for you)
<project>/.claude/           the same ideas, scoped to one project
```

Project settings override global ones, and `settings.local.json` is the untracked variant for things you don't want to commit.

## Layout

```
.claude-plugin/plugin.json      plugin manifest
.claude-plugin/marketplace.json lets this repo double as a one-plugin marketplace
commands/setup.md               the /claude-5min-workout:setup command
hooks/hooks.json                SessionStart nudges (both silent unless needed)
scripts/lessons-check.cjs       lessons nudge (no LLM, ~50ms, never blocks startup)
scripts/changelog-check.cjs     changelog nudge (no LLM, one feed check per day, fails silent)
skills/prune-lessons/           interactive lessons curation skill
skills/everything-search/       Windows file search skill (es.exe bundled)
skills/changelog-skill/         Claude Code release summarizer
assets/karpathy-rules.md        content merged by setup option 1
assets/self-learning.md         content appended by setup option 2
```

## Compatibility

Four of the five upgrades work anywhere Claude Code runs. **Everything file search is Windows-only** — it depends on the [Everything](https://www.voidtools.com/) search engine, which has no macOS or Linux equivalent. The setup command detects this and skips that option on other platforms.

## License

MIT — see [LICENSE](LICENSE).

The MIT license covers the plugin's own code. `skills/everything-search/es.exe` is the Everything command-line tool, redistributed unmodified from [voidtools](https://www.voidtools.com/) and covered by their license, not this one. It is bundled so the search skill works without a separate download; if your security tooling flags a committed `.exe`, that's what it is, and you can delete it and put your own `es.exe` on `PATH` instead.
