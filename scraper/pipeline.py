"""
Pipeline orchestrator: runs all scrapers concurrently, deduplicates,
scores, and returns the final ScrapeResponse.
"""

from __future__ import annotations

import asyncio
import time
import uuid
import logging
from difflib import SequenceMatcher

from schemas import (
    ThoughtLogEntry,
    ProjectRecommendation,
    StepByStepInstruction,
    ScrapeResponse,
)
from query_generator import generate_queries
from scrapers.youtube_scraper import YouTubeScraper
from scrapers.reddit_scraper import RedditScraper
from scrapers.github_scraper import GitHubScraper
from scrapers.instructables_scraper import InstructablesScraper
from scrapers.general_scraper import GeneralScraper
from scrapers.creative_scraper import CreativeScraper
from scrapers.ddgs_helper import ddgs_search
from ai_fallback import generate_ai_recommendations

logger = logging.getLogger(__name__)

SCRAPERS = [
    YouTubeScraper(),
    RedditScraper(),
    GitHubScraper(),
    InstructablesScraper(),
    GeneralScraper(),
    CreativeScraper(),
]

PER_SOURCE_TIMEOUT = 60  # seconds


def _thought(msg: str) -> ThoughtLogEntry:
    return ThoughtLogEntry(timestamp=int(time.time() * 1000), message=msg)


def _similar(a: str, b: str) -> float:
    """Quick string similarity ratio (0-1)."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _deduplicate(projects: list[dict], threshold: float = 0.75) -> list[dict]:
    """Remove projects with very similar titles."""
    deduped: list[dict] = []
    seen_titles: list[str] = []

    for p in projects:
        title = p.get("title", "")
        if not title:
            continue
        is_dupe = any(_similar(title, t) > threshold for t in seen_titles)
        if not is_dupe:
            seen_titles.append(title)
            deduped.append(p)

    return deduped


def _normalize_difficulty(raw: str) -> str:
    raw_lower = raw.lower().strip()
    if "beginner" in raw_lower or "easy" in raw_lower:
        return "Beginner"
    if "expert" in raw_lower or "hard" in raw_lower or "advanced" in raw_lower:
        return "Expert"
    return "Intermediate"


def _classify_type(project: dict, mode: str) -> str:
    """Determine if a project is Software, Hardware Harvest, or Creative Build."""
    text = f"{project.get('title', '')} {project.get('description', '')}".lower()
    hardware_keywords = [
        "teardown", "harvest", "disassembly", "component", "extract",
        "motor", "battery", "camera module", "display panel", "pcb",
        "solder", "desolder", "ifixit",
    ]
    if mode == "Teardown/Harvest" and any(kw in text for kw in hardware_keywords):
        return "Hardware Harvest"

    creative_keywords = [
        "convert into", "transform into", "build into", "make into",
        "secondary display", "external monitor", "portable monitor",
        "diy perks", "conversion", "custom build", "repurpose into",
        "turned into", "made from", "built from", "transform",
    ]
    if any(kw in text for kw in creative_keywords):
        return "Creative Build"

    return "Software"


def _score_project(
    project: dict,
    device: str,
    conditions: list[str],
    mode: str,
) -> int:
    """Assign a compatibility score 0-100 based on device conditions."""
    score = 65  # base

    text = f"{project.get('title', '')} {project.get('description', '')}".lower()
    device_lower = device.lower()

    # Boost if the project specifically mentions the device
    if device_lower in text:
        score += 10

    # Boost if the project has detailed steps
    steps = project.get("steps", [])
    if len(steps) >= 3:
        score += 8
    elif len(steps) >= 1:
        score += 4

    # Boost if it has required parts listed
    if project.get("required_parts"):
        score += 3

    # Condition-aware scoring
    if "Screen Broken" in conditions:
        if "headless" in text or "no screen" in text or "server" in text:
            score += 12
        if "display" in text or "screen" in text or "mirror" in text:
            score -= 10

    if "Bad Battery" in conditions:
        if "wall" in text or "plugged" in text or "usb power" in text:
            score += 8
        if "portable" in text or "battery powered" in text:
            score -= 8

    if "Touch Broken" in conditions:
        if "adb" in text or "headless" in text or "sensor" in text or "ssh" in text:
            score += 10
        if "touchscreen" in text or "touch interface" in text:
            score -= 10

    if "Camera Dead" in conditions:
        if "camera" in text or "security cam" in text or "webcam" in text:
            score -= 15

    if "Speaker Broken" in conditions:
        if "audio" in text or "speaker" in text or "music" in text:
            score -= 10

    # Platform bonus (some platforms are better for certain content)
    platform = project.get("platform", "Web")
    if platform == "GitHub":
        score += 3  # repos tend to have actionable code
    if platform == "YouTube" and len(steps) > 0:
        score += 5  # video tutorials with steps are very useful

    return max(0, min(100, score))


async def run_pipeline(
    device: str,
    conditions: list[str],
    mode: str,
) -> ScrapeResponse:
    """Main entry point: orchestrate all scrapers and return structured results."""

    all_thoughts: list[ThoughtLogEntry] = []
    all_thoughts.append(_thought(f"Analyzing {device} specs..."))

    # ── Step 1: Generate queries ──────────────────────────────────────────
    query_data = generate_queries(device, conditions, mode)
    all_thoughts.extend(query_data["thoughts"])
    queries_by_platform: dict[str, list[str]] = query_data["queries"]

    # ── Step 2: Run scrapers concurrently ─────────────────────────────────
    platform_map = {
        "YouTube": "youtube",
        "Reddit": "reddit",
        "GitHub": "github",
        "Instructables": "instructables",
        "Web": "general",
        "Creative": "creative",
    }

    all_thoughts.append(
        _thought(f"Launching {len(SCRAPERS)} scraper agents in parallel...")
    )

    async def _run_scraper(scraper):
        key = platform_map.get(scraper.platform, "general")
        qs = queries_by_platform.get(key, queries_by_platform.get("general", []))
        if not qs:
            return {"projects": [], "thoughts": []}
        return await asyncio.wait_for(
            scraper.scrape(qs, device, conditions),
            timeout=PER_SOURCE_TIMEOUT,
        )

    tasks = [_run_scraper(s) for s in SCRAPERS]

    # Also search for disassembly manual concurrently
    async def _find_disassembly_url():
        try:
            results = await ddgs_search(
                f"site:ifixit.com {device} teardown disassembly guide",
                max_results=3, timeout=15.0,
            )
            for r in results:
                url = r.get("href", "")
                if "ifixit.com" in url:
                    return url
        except Exception:
            pass
        return ""

    all_tasks = tasks + [_find_disassembly_url()]
    all_results = await asyncio.gather(*all_tasks, return_exceptions=True)

    # Split: first N are scraper results, last is disassembly URL
    results = all_results[:-1]
    disasm_result = all_results[-1]
    disassembly_url = disasm_result if isinstance(disasm_result, str) else ""

    # ── Step 3: Collect results ───────────────────────────────────────────
    all_projects: list[dict] = []
    for scraper, result in zip(SCRAPERS, results):
        if isinstance(result, Exception):
            logger.warning("[%s] Failed: %s", scraper.platform, result)
            all_thoughts.append(
                _thought(f"[{scraper.platform}] Failed: {str(result)[:80]}. Continuing...")
            )
        else:
            all_thoughts.extend(result.get("thoughts", []))
            all_projects.extend(result.get("projects", []))

    all_thoughts.append(
        _thought(f"Collected {len(all_projects)} raw results across all sources.")
    )

    # ── Step 4: Deduplicate ───────────────────────────────────────────────
    deduped = _deduplicate(all_projects)
    all_thoughts.append(
        _thought(f"After deduplication: {len(deduped)} unique projects.")
    )

    # ── Step 4b: AI Fallback when scraping returns nothing ────────────────
    if len(deduped) == 0:
        all_thoughts.append(
            _thought(
                "No web results found. Activating AI to generate project recommendations..."
            )
        )
        ai_projects = await generate_ai_recommendations(device, conditions, mode)
        if ai_projects:
            all_thoughts.append(
                _thought(
                    f"AI generated {len(ai_projects)} creative project ideas with step-by-step instructions."
                )
            )
            deduped = ai_projects
        else:
            all_thoughts.append(
                _thought("AI fallback also returned no results. Delivering empty set.")
            )

    # ── Step 5: Score, convert, rank ──────────────────────────────────────
    all_thoughts.append(_thought("Scoring projects by device compatibility..."))
    if disassembly_url:
        all_thoughts.append(_thought(f"Found disassembly manual: {disassembly_url[:60]}..."))

    recommendations: list[ProjectRecommendation] = []
    for p in deduped:
        score = _score_project(p, device, conditions, mode)

        # Use explicit type if set (creative scraper / AI), otherwise classify
        explicit_type = p.get("type")
        if explicit_type in ("Software", "Hardware Harvest", "Creative Build"):
            proj_type = explicit_type
        else:
            proj_type = _classify_type(p, mode)

        difficulty = _normalize_difficulty(p.get("difficulty", "Intermediate"))

        steps: list[StepByStepInstruction] = []
        for i, step_text in enumerate(p.get("steps", []), 1):
            if isinstance(step_text, str) and step_text.strip():
                steps.append(
                    StepByStepInstruction(stepNumber=i, description=step_text.strip())
                )

        # AI-generated projects get a higher base score since they're tailored
        if p.get("platform") == "AI Generated":
            score = max(score, 70)

        reasoning = p.get("reasoning") or f"Found on {p.get('platform', 'Web')}. Compatible with your {device}'s condition."

        recommendations.append(
            ProjectRecommendation(
                id=uuid.uuid4().hex[:8],
                title=p.get("title", "Untitled Project"),
                type=proj_type,
                description=p.get("description", ""),
                difficulty=difficulty,
                compatibilityScore=score,
                reasoning=reasoning,
                requiredParts=p.get("required_parts", []),
                sourceUrl=p.get("source_url", ""),
                steps=steps,
                platform=p.get("platform", "Web"),
            )
        )

    recommendations.sort(key=lambda r: r.compatibilityScore, reverse=True)
    recommendations = recommendations[:20]  # cap at 20 (more space for 3 tabs)

    all_thoughts.append(
        _thought(f"Synthesis complete. Generated {len(recommendations)} recommendations.")
    )
    all_thoughts.append(_thought("Generating shopping lists and difficulty ratings..."))
    all_thoughts.append(_thought("Done. Delivering results."))

    # ── Build flat query list ─────────────────────────────────────────────
    flat_queries: list[str] = []
    for qs in queries_by_platform.values():
        flat_queries.extend(qs)

    return ScrapeResponse(
        thoughts=all_thoughts,
        recommendations=recommendations,
        searchQueries=flat_queries,
        deviceSummary=(
            f"{device} with "
            f"{', '.join(conditions) if conditions else 'no reported issues'}"
            f" — Mode: {mode}"
        ),
        disassemblyUrl=disassembly_url,
    )
