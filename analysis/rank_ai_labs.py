import math

# Source: Artificial Analysis model pages (retrieved via web search snippets, 2026-09-07).
# Each lab represented by its highest-Intelligence-Index model on AA.
# fields: lab, model, intelligence_index, blended_price_usd_per_Mtok (7:2:1), output_tok_per_sec
DATA = [
    ("Anthropic", "Claude Fable 5.1 (max)",      57, 7.17,  68.2),
    ("OpenAI",    "GPT-6 Astra (max)",           55, 7.70,  67.0),
    ("Moonshot",  "Kimi K3 (max)",               50, 2.31,  41.3),
    ("Google",    "Gemini 3.8 Flash (high)",     47, 0.58, 277.3),
    ("Alibaba",   "Qwen3.8 Max",                 47, 1.18,  40.5),
    ("xAI",       "Grok 4.5 (high)",             45, 1.21,  57.3),
    ("Z.ai",      "GLM-5.3 (max)",               44, 0.90,  75.4),
    ("DeepSeek",  "DeepSeek V4 Pro 0813 (max)",  42, 0.69,  54.1),
]

def score(rows, wi, wc, ws, google_ii=None):
    rows = [list(r) for r in rows]
    if google_ii is not None:
        for r in rows:
            if r[0] == "Google":
                r[2] = google_ii
    ii   = [r[2] for r in rows]
    lp   = [math.log10(r[3]) for r in rows]   # log price: 13x spread, linear would swamp everything
    sp   = [r[4] for r in rows]
    out = []
    for r, p in zip(rows, lp):
        I = (r[2] - min(ii)) / (max(ii) - min(ii))
        C = (max(lp) - p) / (max(lp) - min(lp))          # cheaper = better
        S = (r[4] - min(sp)) / (max(sp) - min(sp))
        out.append((wi*I + wc*C + ws*S, r[0], r[1], r[2], r[3], r[4], I, C, S))
    return sorted(out, reverse=True)

def show(title, rows):
    print(f"\n=== {title} ===")
    print(f"{'#':<3}{'Lab':<11}{'Model':<28}{'Intel':>6}{'$/Mtok':>9}{'tok/s':>8}{'  I':>6}{'  C':>6}{'  S':>6}{'SCORE':>8}")
    for i, (s, lab, m, x, p, v, I, C, S) in enumerate(rows, 1):
        print(f"{i:<3}{lab:<11}{m:<28}{x:>6}{p:>9.2f}{v:>8.1f}{I:>6.2f}{C:>6.2f}{S:>6.2f}{s:>8.3f}")

show("BASE  50% intelligence / 30% cost / 20% speed", score(DATA, .5, .3, .2))
show("SENS-A  70/15/15 (intelligence-heavy)",         score(DATA, .7, .15, .15))
show("SENS-B  base weights, Google II = 59 (launch-article figure)",
     score(DATA, .5, .3, .2, google_ii=59))
show("SENS-C  equal weights 1/3 each",                score(DATA, 1/3, 1/3, 1/3))
