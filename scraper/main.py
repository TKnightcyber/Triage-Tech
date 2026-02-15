"""
FastAPI entry point for the DeviceRevive scraper service.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000

Note: Avoid --reload in production or when running alongside file editors,
as file-change restarts can kill in-flight AI creative build requests.
"""

from __future__ import annotations

import asyncio
import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import GROQ_API_KEY, SCRAPER_TIMEOUT
from schemas import ScrapeRequest, ScrapeResponse, EcoValuationRequest, EcoValuation, ValuationSummary, TradeInOffer
from pipeline import run_pipeline
from eco_exchange import generate_eco_valuation

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
    title="DeviceRevive Scraper",
    description="AI-powered web scraping backend for DeviceRevive",
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
                device_type=request.deviceType,
                ram_gb=request.ramGB,
                storage_gb=request.storageGB,
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


@app.post("/eco-valuation", response_model=EcoValuation)
async def eco_valuation(request: EcoValuationRequest):
    """
    Standalone Eco-Exchange Valuation endpoint.
    Called from the landing page to get trade-in offers without running full scrape pipeline.
    """
    logger.info(
        "Eco valuation request: device=%s conditions=%s",
        request.deviceName,
        request.conditions,
    )

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured.",
        )

    try:
        result = await asyncio.wait_for(
            generate_eco_valuation(
                device=request.deviceName,
                device_type=request.deviceType,
                conditions=request.conditions,
                ram_gb=request.ramGB,
                storage_gb=request.storageGB,
            ),
            timeout=60,
        )

        if not result:
            raise HTTPException(status_code=500, detail="AI valuation returned no result.")

        vs = result.get("valuation_summary", {})
        offers_raw = result.get("trade_in_offers", [])

        return EcoValuation(
            valuationSummary=ValuationSummary(
                deviceName=vs.get("device_name", request.deviceName),
                conditionGrade=vs.get("condition_grade", "C"),
                estimatedResaleUsd=vs.get("estimated_resale_usd", 0),
                estimatedScrapCashUsd=vs.get("estimated_scrap_cash_usd", 0),
                ecoMessage=vs.get("eco_message", ""),
            ),
            tradeInOffers=[
                TradeInOffer(
                    partner=o.get("partner", "Unknown"),
                    offerType=o.get("offer_type", "Discount Coupon"),
                    headline=o.get("headline", ""),
                    monetaryValueCap=o.get("monetary_value_cap", ""),
                    couponUrl=o.get("coupon_url", ""),
                    reasoning=o.get("reasoning", ""),
                )
                for o in offers_raw
                if isinstance(o, dict)
            ],
        )

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Eco valuation timed out.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Eco valuation failed")
        raise HTTPException(status_code=500, detail=str(e))
