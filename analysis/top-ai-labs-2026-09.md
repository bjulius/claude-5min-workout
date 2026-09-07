# Top 5 AI Labs — Weighted Intelligence / Cost / Speed

**As of 2026-09-07.** Reproduce with `python3 analysis/rank_ai_labs.py`.

## Method

- **Unit of analysis:** the lab, represented by its single highest-Intelligence-Index
  model on Artificial Analysis. A lab is only as good as its best available frontier
  offering, so the flagship is the fair proxy.
- **Metrics** (all from Artificial Analysis, same measurement regime for every row):
  - *Intelligence* — Artificial Analysis Intelligence Index
  - *Cost* — blended USD per 1M tokens at AA's 7:2:1 cache-hit / input / output ratio
  - *Speed* — median output throughput, tokens/sec
- **Normalization:** min-max across the eight labs. Cost is normalized on **log10**
  price, not linear — the field spans 13x ($0.58 to $7.70) and a linear scale would
  let the cost axis swamp the other two.
- **Base weights:** 50% intelligence, 30% cost, 20% speed. Intelligence gets the
  plurality because a model that can't do the task is not cheap at any price;
  cost outranks speed because cost is a hard budget constraint while speed is
  usually a UX constraint.

## Inputs

| Lab | Flagship model | Intelligence Index | Blended $/1M tok | Output tok/s |
|---|---|---:|---:|---:|
| Anthropic | Claude Fable 5.1 (max) | 57 | 7.17 | 68.2 |
| OpenAI | GPT-6 Astra (max) | 55 | 7.70 | 67.0 |
| Moonshot | Kimi K3 (max) | 50 | 2.31 | 41.3 |
| Google | Gemini 3.8 Flash (high) | 47 * | 0.58 | 277.3 |
| Alibaba | Qwen3.8 Max | 47 * | 1.18 | 40.5 |
| xAI | Grok 4.5 (high) | 45 | 1.21 | 57.3 |
| Z.ai | GLM-5.3 (max) | 44 | 0.90 | 75.4 |
| DeepSeek | DeepSeek V4 Pro 0813 (max) | 42 | 0.69 | 54.1 |

`*` = disputed value. See **Data caveats**.

## Result — base weights (50/30/20)

| # | Lab | Intel (norm) | Cost (norm) | Speed (norm) | **Score** |
|---|---|---:|---:|---:|---:|
| 1 | **Google** | 0.33 | 1.00 | 1.00 | **0.667** |
| 2 | **Anthropic** | 1.00 | 0.03 | 0.12 | **0.532** |
| 3 | **OpenAI** | 0.87 | 0.00 | 0.11 | **0.456** |
| 4 | **Moonshot** | 0.53 | 0.47 | 0.00 | **0.407** |
| 5 | **Alibaba** | 0.33 | 0.73 | 0.00 | **0.384** |
| 6 | Z.ai | 0.13 | 0.83 | 0.15 | 0.345 |
| 7 | xAI | 0.20 | 0.72 | 0.07 | 0.329 |
| 8 | DeepSeek | 0.00 | 0.93 | 0.06 | 0.291 |

### Read of the standings

1. **Google** — wins by *shape*, not by peak. Gemini 3.8 Flash is not the smartest
   model in the set, but it is simultaneously the cheapest and ~4x faster than
   anything else here. Winning two of three axes outright beats winning one.
2. **Anthropic** — owns the intelligence ceiling (57, the highest measured), and pays
   for it: $7.17/M blended is the second-worst price in the set.
3. **OpenAI** — strictly dominated by Anthropic on this scorecard: lower intelligence
   (55 vs 57), higher price ($7.70 vs $7.17), marginally slower. Same strategy,
   executed a step behind.
4. **Moonshot** — the best intelligence-per-dollar at the high end (index 50 for
   $2.31/M). Killed by throughput: 41.3 tok/s is the slowest in the set.
5. **Alibaba** — cheap and respectable, but 40.5 tok/s is dead last on speed.

## Sensitivity

The **membership of the top five is stable**; the **ordering is not**.

| Scenario | Order |
|---|---|
| Base 50/30/20 | Google, Anthropic, OpenAI, Moonshot, Alibaba |
| 70/15/15 (intelligence-heavy) | Anthropic, OpenAI, Google, Moonshot, Alibaba |
| Base weights, Google index = 59 | Google, Anthropic, OpenAI, Moonshot, Alibaba |
| Equal thirds | Google, Anthropic, Z.ai, Alibaba, Moonshot |

Only under equal thirds does the membership change — cost/speed weighting that heavy
pushes Z.ai in and OpenAI all the way to 8th. Under any weighting that treats
intelligence as at least co-equal, the same five labs come out on top.

## Data caveats — read before quoting these numbers

The Artificial Analysis site was **not directly reachable** from the environment this
was built in (egress-blocked at the proxy). All figures were recovered from web-search
snippets of AA's own model pages. That is real sourced data, not estimates, but it was
not verified against the rendered table. Two cells came back inconsistent:

- **Google / Gemini 3.8 Flash (high):** AA's model-page snippet returns **47**;
  AA's own launch article returns **59** (with medium 57, low 52). These are almost
  certainly different Intelligence Index versions. The base table uses the
  conservative 47. Note that Google finishes **#1 under either figure**, so the
  conclusion does not depend on resolving it.
- **Alibaba / Qwen3.8 Max:** the dedicated model page returns **47**; a
  comparison-page snippet returned **58**. The model page (47) is used. At 58 Qwen
  would top the entire intelligence axis, which contradicts AA's own stated
  leaderboard ordering, so 58 is likely a mis-parse.

Also worth knowing: the Gemini 3.7 Flash rows returned medium=53 above high=45, which
is internally backwards and reinforces that the Google rows are the shakiest in the set.

**Verification step:** pull the live table from
`https://artificialanalysis.ai/models` and re-run `analysis/rank_ai_labs.py` with the
`DATA` list refreshed. The script's ranking logic is independent of the input values.

## Sources

- Artificial Analysis — model pages for Claude Fable 5.1, Claude Opus 5, GPT-6 Astra,
  GPT-5.6 Sol, Gemini 3.8 Flash, Gemini 3.7 Flash, Kimi K3, Qwen3.8 Max, Grok 4.5,
  GLM-5.3, DeepSeek V4 Pro (https://artificialanalysis.ai/models)
- Artificial Analysis — Intelligence Index methodology and blended-price definition
  (https://artificialanalysis.ai/methodology)
