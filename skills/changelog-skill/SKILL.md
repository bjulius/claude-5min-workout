---
name: changelog-skill
description: Use when the user asks "what's new in Claude Code", "check the changelog", or wants to catch up on recent Claude Code CLI updates. Fetches official releases and summarizes significant changes.
---

# Claude Code Changelog Checker

Check the official Claude Code CLI changelog for updates since your last check.

## State File

Last-check state lives at `~/.claude/changelog-last-check.txt` — expand `~` to the
user's home directory and pass an absolute path to file tools.

The file holds **the release tag the user last caught up on**, e.g. `v2.1.233` — not
a date. Claude Code ships more than once on some days, so a date-granular "newer than
last check" filter permanently hides any release published later on a day the user
already checked, and makes a same-day re-check report nothing new even when something
shipped an hour ago. A tag is exact, and it has no UTC-vs-local ambiguity.

This is deliberately user-global rather than project-local: "where did I leave off in
Claude Code releases" is a fact about the user, not about a repo. A project-local path
resets in every new checkout and leaves a stray file in each repo's `.claude/`.

**Migration:** if the file contains an ISO date (`YYYY-MM-DD`) it is pre-0.3 state.
Treat it as "everything on or after that date is new" for this one run, then write a
tag back as normal. Do not warn the user about the format change.

## Quick Start

1. Read the last-seen tag from `~/.claude/changelog-last-check.txt` (see Migration if it holds a date; if the file is missing, summarize the 5 most recent releases)
2. Fetch releases from `https://github.com/anthropics/claude-code/releases`
3. Take every release above that tag in the list
4. Present summary with significant changes
5. Write the newest release tag you saw back to `~/.claude/changelog-last-check.txt`

## Workflow

**Read state** → Check `~/.claude/changelog-last-check.txt` for a release tag (`v2.1.233`)

**Fetch** → Use WebFetch on `https://github.com/anthropics/claude-code/releases`

**Filter** → Include every release newer than the stored tag, stopping when you reach it

**Summarize** → See [detailed-workflow.md](references/detailed-workflow.md) for output format and significance criteria

**Update** → Write the newest tag from this fetch to `~/.claude/changelog-last-check.txt`. Write the tag alone, nothing else — a session-start hook parses this file.

## Significance Criteria

Always include: **Security fixes**, **Breaking changes**, **Major features**
Consider: Workflow improvements, performance gains
Skip: Minor bug fixes, trivial changes

See [example-output.md](references/example-output.md) for a complete example.
