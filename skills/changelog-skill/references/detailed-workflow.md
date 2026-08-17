# Detailed Workflow

## Output Format

Present the changelog summary in this format:

```
## Claude Code Changelog Summary
**Period**: [Last Check Date] → [Today's Date]
**Total Releases**: [Count]

### Releases
- [version] ([date]) - [brief description]
...

### Most Significant Changes

**[version] ([date])**
- [change] - [why it's significant]
...
```

## Significance Criteria

Include multiple changes per release when warranted. Determine significance based on:

| Priority | Type | Notes |
|----------|------|-------|
| Always | Security fixes | Critical for users to know |
| Always | Breaking changes | May require user action |
| High | Major new features | New capabilities users should know about |
| Medium | Workflow improvements | Changes that affect daily usage |
| Medium | Performance improvements | Noticeable speed or efficiency gains |

**Skip**: Minor bug fixes and trivial changes unless they fix a common pain point.

## State Management

### Reading Last Check Date
- Location: `~/.claude/changelog-last-check.txt` (user-global, not project-local)
- Format: ISO date (e.g., `2025-01-15`)
- Default: If file doesn't exist, use 30 days before today

### Updating Last Check Date
- Write today's date in ISO format (YYYY-MM-DD)
- `~/.claude/` always exists, so no directory creation is needed

## Data Source

Official source: https://github.com/anthropics/claude-code/releases

This is maintained by Anthropic and contains the authoritative changelog with version tags, dates, and detailed release notes.
