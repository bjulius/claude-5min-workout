---
name: changelog-skill
description: Use when the user asks "what's new in Claude Code", "check the changelog", or wants to catch up on recent Claude Code CLI updates. Fetches official releases and summarizes significant changes.
---

# Claude Code Changelog Checker

Check the official Claude Code CLI changelog for updates since your last check.

## State File

Last-check state lives at `~/.claude/changelog-last-check.txt` — expand `~` to the
user's home directory and pass an absolute path to file tools.

This is deliberately user-global rather than project-local: "when did I last look at
Claude Code releases" is a fact about the user, not about a repo. A project-local path
resets the date in every new checkout and leaves a stray file in each repo's `.claude/`.

## Quick Start

1. Read last check date from `~/.claude/changelog-last-check.txt` (default: 30 days ago)
2. Fetch releases from `https://github.com/anthropics/claude-code/releases`
3. Filter releases newer than last check date
4. Present summary with significant changes
5. Update `~/.claude/changelog-last-check.txt` with today's date

## Workflow

**Read state** → Check `~/.claude/changelog-last-check.txt` for ISO date (YYYY-MM-DD)

**Fetch** → Use WebFetch on `https://github.com/anthropics/claude-code/releases`

**Filter** → Only include releases newer than last check date

**Summarize** → See [detailed-workflow.md](references/detailed-workflow.md) for output format and significance criteria

**Update** → Write today's date to `~/.claude/changelog-last-check.txt`

## Significance Criteria

Always include: **Security fixes**, **Breaking changes**, **Major features**
Consider: Workflow improvements, performance gains
Skip: Minor bug fixes, trivial changes

See [example-output.md](references/example-output.md) for a complete example.
