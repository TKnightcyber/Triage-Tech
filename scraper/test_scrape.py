"""Quick test script - test DDGS search directly, then test the full endpoint."""
import asyncio
import sys

# ── Test 1: Direct DDGS search ───────────────────────────────────────────────
async def test_ddgs():
    sys.path.insert(0, ".")
    from scrapers.ddgs_helper import ddgs_search, ddgs_results_to_projects

    print("Testing DDGS search...")
    results = await ddgs_search("macbook air teardown repurpose", max_results=3, timeout=15)
    print(f"  Got {len(results)} raw results")
    for r in results:
        print(f"    - {r.get('title', 'N/A')[:60]}")

    projects = ddgs_results_to_projects(results, "Web")
    print(f"  Converted to {len(projects)} projects")
    return len(projects) > 0

async def test_pipeline():
    sys.path.insert(0, ".")
    from pipeline import run_pipeline

    print("\nTesting full pipeline...")
    result = await asyncio.wait_for(
        run_pipeline(
            device="macbook air 13 m3",
            conditions=["Camera Dead"],
            mode="Teardown/Harvest",
        ),
        timeout=90,
    )
    recs = result.recommendations
    print(f"  Got {len(recs)} recommendations")
    for r in recs[:5]:
        print(f"    - {r.title[:60]} ({r.platform}) score={r.compatibilityScore} steps={len(r.steps)}")

    print(f"\n  Thought log ({len(result.thoughts)} entries):")
    for t in result.thoughts:
        print(f"    > {t.message}")

if __name__ == "__main__":
    ok = asyncio.run(test_ddgs())
    if ok:
        print("\nDDGS works! Testing full pipeline...")
        asyncio.run(test_pipeline())
    else:
        print("\nDDGS returned no results, pipeline will use AI fallback")
        asyncio.run(test_pipeline())
