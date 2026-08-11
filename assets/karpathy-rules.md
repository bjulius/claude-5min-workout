# Karpathy Coding Rules

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### Think Before Coding
- Don't assume. Don't hide confusion. If something is unclear, stop, name
  what's confusing, and ask.
- State assumptions explicitly. If multiple interpretations exist, present
  them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### Simplicity First
- Minimum code that solves the problem. No features beyond what was asked.
- No abstractions for single-use code, no unrequested "flexibility" or
  configurability, no error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it. Ask: "Would a
  senior engineer say this is overcomplicated?" If yes, simplify.

### Surgical Changes
- ONLY modify what is explicitly requested. Every changed line should trace
  directly to the user's request.
- Don't "improve" adjacent code, comments, or formatting. Don't refactor
  things that aren't broken. Match existing style.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused. Don't
  remove pre-existing dead code unless asked.

### Goal-Driven Execution
- Transform tasks into verifiable goals: "fix the bug" → "write a test that
  reproduces it, then make it pass"; "refactor X" → "ensure tests pass
  before and after".
- For multi-step tasks, state a brief plan with a verify step per item.
- Strong success criteria let you loop independently; weak ones ("make it
  work") force constant clarification.
