"""Creative Builds scraper — finds unique DIY conversion projects (DIY Perks style).

Searches for projects that transform a broken/old device into something
entirely new: external monitors from laptop screens, home servers from
old phones, custom Bluetooth speakers, etc.
"""

from __future__ import annotations

import time
import logging

from scrapers.base import BaseScraper
from scrapers.ddgs_helper import ddgs_search, ddgs_results_to_projects
from schemas import ThoughtLogEntry

logger = logging.getLogger(__name__)


def _thought(msg: str) -> ThoughtLogEntry:
    return ThoughtLogEntry(timestamp=int(time.time() * 1000), message=msg)


class CreativeScraper(BaseScraper):
    platform = "Creative"

    async def scrape(self, queries: list[str], device: str, conditions: list[str]) -> dict:
        thoughts: list[ThoughtLogEntry] = []
        projects: list[dict] = []

        for query in queries[:4]:
            thoughts.append(_thought(f"[Creative Builds] Searching: {query}"))
            try:
                raw = await ddgs_search(query, max_results=5)
                found = ddgs_results_to_projects(raw, "Web")

                # Tag results as Creative Build and detect actual platform from URL
                for p in found:
                    p["type"] = "Creative Build"
                    url = p.get("source_url", "").lower()
                    if "youtube.com" in url or "youtu.be" in url:
                        p["platform"] = "YouTube"
                    elif "reddit.com" in url:
                        p["platform"] = "Reddit"
                    elif "instructables.com" in url:
                        p["platform"] = "Instructables"
                    elif "hackaday" in url:
                        p["platform"] = "Hackaday"
                    elif "ifixit.com" in url:
                        p["platform"] = "iFixit"

                projects.extend(found)
                thoughts.append(_thought(f"[Creative Builds] Found {len(found)} results"))
            except Exception as e:
                logger.warning("Creative search error: %s", e)
                thoughts.append(_thought(f"[Creative Builds] Error: {str(e)[:100]}"))

        return {"projects": projects, "thoughts": thoughts}
