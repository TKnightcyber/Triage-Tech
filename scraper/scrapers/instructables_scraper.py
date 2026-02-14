"""Instructables / Hackaday / iFixit scraper using DuckDuckGo search."""

from __future__ import annotations

import time
import logging

from scrapers.base import BaseScraper
from scrapers.ddgs_helper import ddgs_search, ddgs_results_to_projects
from schemas import ThoughtLogEntry

logger = logging.getLogger(__name__)


def _thought(msg: str) -> ThoughtLogEntry:
    return ThoughtLogEntry(timestamp=int(time.time() * 1000), message=msg)


class InstructablesScraper(BaseScraper):
    platform = "Instructables"

    async def scrape(self, queries: list[str], device: str, conditions: list[str]) -> dict:
        thoughts: list[ThoughtLogEntry] = []
        projects: list[dict] = []

        for query in queries[:3]:
            thoughts.append(_thought(f"[Maker Sites] Searching: {query}"))
            try:
                for site in ["instructables.com", "hackaday.com", "ifixit.com"]:
                    raw = await ddgs_search(query, max_results=3, site=site)
                    found = ddgs_results_to_projects(raw, self.platform)
                    projects.extend(found)
                thoughts.append(_thought(f"[Maker Sites] Found {len(projects)} results"))
            except Exception as e:
                logger.warning("Maker Sites search error: %s", e)
                thoughts.append(_thought(f"[Maker Sites] Error: {str(e)[:100]}"))

        return {"projects": projects, "thoughts": thoughts}
