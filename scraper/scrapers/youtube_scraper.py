"""YouTube scraper using DuckDuckGo search."""

from __future__ import annotations

import time
import logging

from scrapers.base import BaseScraper
from scrapers.ddgs_helper import ddgs_search, ddgs_results_to_projects
from schemas import ThoughtLogEntry

logger = logging.getLogger(__name__)


def _thought(msg: str) -> ThoughtLogEntry:
    return ThoughtLogEntry(timestamp=int(time.time() * 1000), message=msg)


class YouTubeScraper(BaseScraper):
    platform = "YouTube"

    async def scrape(self, queries: list[str], device: str, conditions: list[str]) -> dict:
        thoughts: list[ThoughtLogEntry] = []
        projects: list[dict] = []

        for query in queries[:3]:
            thoughts.append(_thought(f"[YouTube] Searching: {query}"))
            try:
                yt_query = f"site:youtube.com {query}"
                raw = await ddgs_search(yt_query, max_results=5)
                found = ddgs_results_to_projects(raw, self.platform)
                found = [p for p in found if "youtube.com" in p.get("source_url", "")]
                projects.extend(found)
                thoughts.append(_thought(f"[YouTube] Found {len(found)} results"))
            except Exception as e:
                logger.warning("YouTube search error: %s", e)
                thoughts.append(_thought(f"[YouTube] Error: {str(e)[:100]}"))

        return {"projects": projects, "thoughts": thoughts}
