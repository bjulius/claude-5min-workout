"""Poll one flagship model per lab via OpenRouter and aggregate their rankings.

Two stages:
  python3 poll_labs_openrouter.py --list          # show live candidates per lab, pick your slugs
  python3 poll_labs_openrouter.py --run SLUG ...  # poll them, write raw + aggregate

Requires OPENROUTER_API_KEY in the environment. Writes every raw response to
out/raw/ so the aggregate is auditable and nothing is taken on trust.
"""
import argparse, itertools, json, os, pathlib, random, sys, urllib.request

API = "https://openrouter.ai/api/v1"
LABS = ["Google", "Anthropic", "OpenAI", "Moonshot", "Alibaba"]
DIMS = ["innovation", "market_position_now", "market_position_1yr", "market_position_3yr"]
OUT = pathlib.Path(__file__).parent / "out"

def call(path, key, payload=None):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(payload).encode() if payload else None,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)

def list_models(key):
    """Print candidates per lab so tiers can be matched by hand, not guessed."""
    prefixes = {"Google": "google/", "Anthropic": "anthropic/", "OpenAI": "openai/",
                "Moonshot": "moonshot", "Alibaba": "qwen/"}
    models = call("/models", key)["data"]
    for lab, pfx in prefixes.items():
        print(f"\n### {lab}")
        for m in sorted((x for x in models if x["id"].startswith(pfx)), key=lambda x: x["id"]):
            p = m.get("pricing", {})
            print(f"  {m['id']:<52} ctx={m.get('context_length','?'):>9}  "
                  f"in=${p.get('prompt','?')}  out=${p.get('completion','?')}")

PROMPT = """Rank these five AI labs from best (1) to worst (5) on each dimension.

Labs: {labs}

Dimensions:
- innovation: rate of genuine technical advance, not marketing
- market_position_now: current commercial standing
- market_position_1yr: predicted standing in one year
- market_position_3yr: predicted standing in three years

Also name the single lab LEAST likely to still exist as an independent
company in three years, and say why in one sentence.

Reply with ONLY this JSON, no prose:
{{"innovation":["..."],"market_position_now":["..."],
"market_position_1yr":["..."],"market_position_3yr":["..."],
"least_likely_to_survive":"...","reason":"..."}}"""

def poll(key, slugs, trials):
    """Each model, each trial, with lab order shuffled to control position bias."""
    OUT.joinpath("raw").mkdir(parents=True, exist_ok=True)
    results = []
    for slug in slugs:
        for t in range(trials):
            order = random.sample(LABS, len(LABS))
            body = {"model": slug, "temperature": 0, "max_tokens": 1500,
                    "messages": [{"role": "user",
                                  "content": PROMPT.format(labs=", ".join(order))}]}
            try:
                resp = call("/chat/completions", key, body)
                text = resp["choices"][0]["message"]["content"]
                OUT.joinpath("raw", f"{slug.replace('/','_')}_{t}.json").write_text(
                    json.dumps({"order_shown": order, "response": resp}, indent=2))
                parsed = json.loads(text[text.index("{"):text.rindex("}") + 1])
                results.append({"model": slug, "trial": t, **parsed})
                print(f"  ok   {slug} trial {t}")
            except Exception as e:                      # a failure is recorded, never filled in
                print(f"  FAIL {slug} trial {t}: {e}", file=sys.stderr)
                results.append({"model": slug, "trial": t, "error": str(e)})
    return results

def aggregate(results):
    ok = [r for r in results if "error" not in r]
    if not ok:
        print("\nNo successful responses. Nothing to aggregate.")
        return
    print(f"\nMean rank across {len(ok)} responses (1 = best, lower is better)\n")
    print(f"{'Lab':<12}" + "".join(f"{d:>22}" for d in DIMS))
    table = {}
    for lab in LABS:
        row = []
        for d in DIMS:
            ranks = [r[d].index(lab) + 1 for r in ok if lab in r.get(d, [])]
            row.append(sum(ranks) / len(ranks) if ranks else float("nan"))
        table[lab] = row
        print(f"{lab:<12}" + "".join(f"{v:>22.2f}" for v in row))
    print("\nOverall (mean of the four dimensions):")
    for lab, v in sorted(table.items(), key=lambda kv: sum(kv[1]) / len(kv[1])):
        print(f"  {lab:<12}{sum(v)/len(v):.2f}")
    print("\nLeast likely to survive 3yr — votes:")
    votes = {}
    for r in ok:
        votes[r.get("least_likely_to_survive", "?")] = votes.get(r.get("least_likely_to_survive", "?"), 0) + 1
    for lab, n in sorted(votes.items(), key=lambda kv: -kv[1]):
        print(f"  {lab:<12}{n}/{len(ok)}")
    OUT.joinpath("aggregate.json").write_text(json.dumps(results, indent=2))
    print(f"\nRaw responses: {OUT/'raw'}   Aggregate: {OUT/'aggregate.json'}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--run", nargs="+", metavar="SLUG")
    ap.add_argument("--trials", type=int, default=3)
    a = ap.parse_args()
    k = os.environ.get("OPENROUTER_API_KEY")
    if not k:
        sys.exit("OPENROUTER_API_KEY is not set.")
    if a.list:
        list_models(k)
    elif a.run:
        aggregate(poll(k, a.run, a.trials))
    else:
        ap.print_help()
