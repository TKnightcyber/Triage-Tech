"""
FastAPI entry point for the Second Life Hardware Matcher scraper service.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import asyncio
import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import GROQ_API_KEY, SCRAPER_TIMEOUT
from schemas import ScrapeRequest, ScrapeResponse
from pipeline import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set! Scraping will fail.")
    else:
        logger.info("GROQ_API_KEY is configured. Scraper ready.")
    yield


app = FastAPI(
    title="Second Life Scraper",
    description="Real web scraping backend for the Second Life Hardware Matcher",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint for the Next.js proxy to verify the scraper is running."""
    return {
        "status": "ok",
        "groq_configured": bool(GROQ_API_KEY),
        "timestamp": int(time.time() * 1000),
    }


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    """
    Main scraping endpoint.
    Accepts device info, runs all scrapers concurrently, returns structured results.
    """
    logger.info(
        "Scrape request: device=%s conditions=%s mode=%s",
        request.deviceName,
        request.conditions,
        request.mode,
    )

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured. Cannot scrape.",
        )

    try:
        result = await asyncio.wait_for(
            run_pipeline(
                device=request.deviceName,
                conditions=request.conditions,
                mode=request.mode,
            ),
            timeout=SCRAPER_TIMEOUT,
        )
        logger.info(
            "Scrape complete: %d recommendations",
            len(result.recommendations),
        )
        return result

    except asyncio.TimeoutError:
        logger.error("Scrape timed out after %ds", SCRAPER_TIMEOUT)
        raise HTTPException(
            status_code=504,
            detail=f"Scraping timed out after {SCRAPER_TIMEOUT} seconds.",
        )
    except Exception as e:
        logger.exception("Scrape failed")
        raise HTTPException(status_code=500, detail=str(e))
