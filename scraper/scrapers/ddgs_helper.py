"""
Direct DuckDuckGo search helper.
Uses the ddgs package for reliable web search.
"""

from __future__ import annotations

import asyncio
import logging
import concurrent.futures
from typing import Optional

logger = logging.getLogger(__name__)

# Shared thread pool for DDGS searches (avoid creating threads per search)
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)


def _do_search(search_query: str, max_results: int) -> list[dict]:
    """Synchronous DDGS search (runs in thread pool)."""
    try:
        from ddgs import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(search_query, max_results=max_results))
            return results or []
    except Exception as e:
        logger.warning("DDGS sync search error for '%s': %s", search_query, e)
        return []


async def ddgs_search(
    query: str,
    max_results: int = 5,
    site: Optional[str] = None,
    timeout: float = 30.0,
) -> list[dict]:
    """
    Run a DuckDuckGo text search and return a list of dicts:
      [{"title": ..., "body": ..., "href": ...}, ...]
    """
    try:
        search_query = f"site:{site} {query}" if site else query
        loop = asyncio.get_running_loop()
        results = await asyncio.wait_for(
            loop.run_in_executor(_executor, _do_search, search_query, max_results),
            timeout=timeout,
        )
        return results or []
    except asyncio.TimeoutError:
        logger.warning("DDGS search timed out for '%s'", query)
        return []
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
