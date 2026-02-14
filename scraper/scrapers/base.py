"""Abstract base class for all source scrapers."""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseScraper(ABC):
    platform: str = "Web"

    @abstractmethod
    async def scrape(
        self,
        queries: list[str],
        device: str,
        conditions: list[str],
    ) -> dict:
        """
        Returns {
            "projects": list[dict],   # list of ScrapedProject-like dicts
            "thoughts": list[ThoughtLogEntry],
        }
        """
        ...
