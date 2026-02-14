"""Quick test: hit the running server with a real scrape request."""
import urllib.request
import json
import time

data = json.dumps({
    "deviceName": "MacBook Air M4",
    "conditions": ["Bad Battery", "Camera Dead"],
    "mode": "Teardown/Harvest",
}).encode()

req = urllib.request.Request(
    "http://localhost:8000/scrape",
    data=data,
    headers={"Content-Type": "application/json"},
)

print("Sending scrape request...")
t0 = time.time()
resp = urllib.request.urlopen(req, timeout=120)
result = json.loads(resp.read())
elapsed = time.time() - t0

recs = result["recommendations"]
disasm = result.get("disassemblyUrl", "")

print(f"\nGot {len(recs)} recommendations in {elapsed:.1f}s")
print(f"Disassembly URL: {disasm or '(none)'}\n")

# Group by type
types = {}
for r in recs:
    t = r["type"]
    types.setdefault(t, []).append(r)

for t, projects in types.items():
    print(f"--- {t} ({len(projects)}) ---")
    for r in projects[:3]:
        print(f"  [{r['compatibilityScore']}] {r['title'][:65]}")
        print(f"       {r['platform']} | {r['sourceUrl'][:55]}")
    if len(projects) > 3:
        print(f"  ... and {len(projects) - 3} more")
    print()
