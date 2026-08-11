---
name: prune-lessons
description: Review and curate the "### Lessons" section of the user's global ~/.claude/CLAUDE.md — find duplicates, contradictions, stale or vague entries, propose a consolidated list, and apply it only after the user approves. Use when the user asks to prune, clean up, review, or consolidate their lessons or self-learning rules, or when a session-start nudge suggests it.
---

# Prune Lessons

Curate the self-learning "### Lessons" section of the user's global CLAUDE.md at `~/.claude/CLAUDE.md`. Lessons are one-line rules Claude appended after corrections (the Boris Cherny self-learning loop). Over time they accumulate duplicates, conflicts, and stale entries. This skill is interactive: NEVER rewrite the section without showing the proposal and getting approval first.

## Steps

1. **Read** the global CLAUDE.md. Extract every bullet under `### Lessons` (stop at the next heading). If the section is empty or missing, say so and stop.

2. **Analyze** each lesson against the others AND against the rest of the file (core rules, security sections, etc.). Classify:
   - **Duplicate** — same rule as another lesson or already covered by an existing section. Propose: delete (or merge into the covering rule).
   - **Contradiction** — conflicts with another lesson or an existing rule. Propose: quote both sides, recommend which to keep, and ASK the user which wins. Never resolve a contradiction silently.
   - **Stale** — references a tool, file, project, or workflow that no longer exists (verify before claiming — check the filesystem or config when a lesson names something concrete).
   - **Vague** — too unspecific to change behavior ("be careful with paths"). Propose: rewrite as a concrete one-liner, or delete if it can't be made actionable.
   - **Promote** — a lesson that has proven general and important enough to belong in a named rules section instead. Propose the move.
   - **Keep** — specific, current, non-duplicative. Leave verbatim.

3. **Propose** the result as a table: current line → verdict → proposed action. Then show the full proposed replacement Lessons section. Quote every line being deleted or changed so the edit is reversible from the conversation.

4. **Confirm** with one AskUserQuestion (apply all / let me pick / cancel). Apply only what's approved, editing ONLY the `### Lessons` section (plus any approved promotions into other sections).

5. **Touch the marker** so the session-start nudge resets its 30-day clock:
   `node -e "const p=require('path'),f=require('fs'),d=p.join(require('os').homedir(),'.claude','hooks');f.mkdirSync(d,{recursive:true});f.writeFileSync(p.join(d,'.lessons-last-pruned'),new Date().toISOString())"`

6. **Report** what changed, line by line.

## Rules

- The file loads into every session of every project — a bad edit propagates everywhere. When unsure whether a lesson is stale or still wanted, keep it and flag it rather than delete.
- Never delete a safety-critical prohibition ("never do X") without explicit per-line approval.
- Preserve the user's formatting and the `(Claude adds lessons as one-line rules here)` placeholder if the section ends up empty.
