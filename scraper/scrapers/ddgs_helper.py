"""
Direct DuckDuckGo search helper.
Uses the ddgs package for reliable web search.

Runs each DDGS search in a subprocess via asyncio.to_thread +
subprocess.run to avoid deadlocking uvicorn's event loop on Windows
(primp / DDGS is not safe inside a running asyncio loop).
"""

from __future__ import annotations

import asyncio
import json
import logging
import subprocess
import sys
from typing import Optional

logger = logging.getLogger(__name__)

# Inline script executed in a fresh subprocess for each search
_SEARCH_SCRIPT = r'''
import sys, json
try:
    from ddgs import DDGS
    query = sys.argv[1]
    max_results = int(sys.argv[2])
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    json.dump(results or [], sys.stdout)
except Exception as e:
    json.dump([], sys.stdout)
'''


def _run_search_subprocess(search_query: str, max_results: int, timeout: float) -> list[dict]:
    """Run DDGS in a subprocess (synchronous, meant to be called via to_thread)."""
    try:
        result = subprocess.run(
            [sys.executable, "-c", _SEARCH_SCRIPT, search_query, str(max_results)],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            logger.debug("DDGS subprocess stderr: %s", (result.stderr or "")[:200])
        raw = (result.stdout or "").strip()
        if not raw:
            return []
        return json.loads(raw)
    except subprocess.TimeoutExpired:
        logger.warning("DDGS subprocess timed out for '%s'", search_query)
        return []
    except Exception as e:
        logger.warning("DDGS subprocess error for '%s': %s", search_query, e)
        return []


async def ddgs_search(
    query: str,
    max_results: int = 5,
    site: Optional[str] = None,
    timeout: float = 30.0,
) -> list[dict]:
    """
    Run a DuckDuckGo text search in a subprocess and return a list of dicts:
      [{"title": ..., "body": ..., "href": ...}, ...]
    """
    search_query = f"site:{site} {query}" if site else query
    logger.info("DDGS search starting: %s", search_query)

    try:
        results = await asyncio.to_thread(
            _run_search_subprocess, search_query, max_results, timeout
        )
        logger.info("DDGS search got %d results for: %s", len(results), search_query)
        return results
    except Exception as e:
        logger.warning("DDGS search failed for '%s': %s", query, e)
        return []


def ddgs_results_to_projects(
    results: list[dict],
    platform: str,
) -> list[dict]:
    """Convert raw DDGS search results into project dicts compatible with pipeline."""
    projects = []
    for r in results:
        title = r.get("title", "").strip()
        body = r.get("body", "").strip()
        href = r.get("href", "").strip()

        if not title or not href:
            continue

        projects.append({
            "title": title,
            "description": body,
            "source_url": href,
            "steps": [],
            "required_parts": [],
            "difficulty": "Intermediate",
            "platform": platform,
        })

    return projects
