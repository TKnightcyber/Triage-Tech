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
from schemas import ScrapeRequest, ScrapeResponse, EcoValuationRequest, EcoValuation, ValuationSummary, TradeInOffer, DeviceIdentifyRequest, DeviceIdentifyResponse
from pipeline import run_pipeline
from eco_exchange import generate_eco_valuation, analyze_device_images, identify_device_from_images

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
                condition_notes=request.conditionNotes,
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


@app.post("/identify-device", response_model=DeviceIdentifyResponse)
async def identify_device(request: DeviceIdentifyRequest):
    """
    Identify a device from uploaded photos using AI vision.
    Returns the identified device name, type, brand, model, and confidence.
    """
    logger.info("Device identification request: %d images", len(request.images))

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured.",
        )

    if not request.images:
        raise HTTPException(
            status_code=400,
            detail="At least one image is required.",
        )

    try:
        result = await asyncio.wait_for(
            identify_device_from_images(images_base64=request.images),
            timeout=30,
        )

        if not result:
            return DeviceIdentifyResponse(
                identifiedDevice="Unknown Device",
                brand="Unknown",
                model="Unknown",
                deviceType="Other",
                description="Could not identify the device from the provided images.",
                confidence="Low",
                visualCondition="",
            )

        # Map the vision model's device_type to our categories
        raw_type = result.get("device_type", "Other")
        # Map appliance types to "Other" for the main device type selector
        main_device_types = {"Smartphone", "Laptop", "Tablet", "Desktop"}
        device_type = raw_type if raw_type in main_device_types else "Other"

        return DeviceIdentifyResponse(
            identifiedDevice=result.get("identified_device", "Unknown Device"),
            brand=result.get("brand", "Unknown"),
            model=result.get("model", "Unknown"),
            deviceType=device_type,
            description=result.get("description", ""),
            confidence=result.get("confidence", "Low"),
            visualCondition=result.get("visual_condition", ""),
        )

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Device identification timed out.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Device identification failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/eco-valuation", response_model=EcoValuation)
async def eco_valuation(request: EcoValuationRequest):
    """
    Standalone Eco-Exchange Valuation endpoint.
    Called from the landing page to get trade-in offers without running full scrape pipeline.
    Optionally accepts base64 images for AI vision-based condition analysis.
    """
    logger.info(
        "Eco valuation request: device=%s conditions=%s notes=%s images=%d",
        request.deviceName,
        request.conditions,
        request.additionalNotes[:50] if request.additionalNotes else "",
        len(request.images) if request.images else 0,
    )

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured.",
        )

    USD_TO_INR = 83.5  # approximate conversion rate

    # ── Vision Analysis (if images provided) ──────────────────────────────
    vision_notes = ""
    if request.images and len(request.images) > 0:
        try:
            vision_result = await asyncio.wait_for(
                analyze_device_images(
                    images_base64=request.images,
                    device_name=request.deviceName,
                ),
                timeout=30,
            )
            if vision_result:
                # Merge vision findings into the additional notes
                summary = vision_result.get("visual_condition_summary", "")
                issues = vision_result.get("detected_issues", [])
                grade = vision_result.get("cosmetic_grade", "")
                confidence = vision_result.get("confidence", "")

                vision_notes = f"\n[AI Vision Analysis (confidence: {confidence})]"
                if summary:
                    vision_notes += f"\nVisual Assessment: {summary}"
                if issues:
                    vision_notes += f"\nDetected Issues: {', '.join(issues)}"
                if grade:
                    vision_notes += f"\nCosmetic Grade: {grade}"

                logger.info("Vision analysis merged: grade=%s, %d issues", grade, len(issues))
        except asyncio.TimeoutError:
            logger.warning("Vision analysis timed out, continuing without it")
        except Exception as e:
            logger.warning("Vision analysis failed, continuing without it: %s", e)

    # Combine user notes with vision analysis
    combined_notes = (request.additionalNotes or "").strip()
    if vision_notes:
        combined_notes = combined_notes + "\n" + vision_notes if combined_notes else vision_notes

    try:
        result = await asyncio.wait_for(
            generate_eco_valuation(
                device=request.deviceName,
                device_type=request.deviceType,
                conditions=request.conditions,
                ram_gb=request.ramGB,
                storage_gb=request.storageGB,
                additional_notes=combined_notes,
            ),
            timeout=60,
        )

        if not result:
            raise HTTPException(status_code=500, detail="AI valuation returned no result.")

        vs = result.get("valuation_summary", {})
        offers_raw = result.get("trade_in_offers", [])

        resale_usd = vs.get("estimated_resale_usd", 0) or 0
        scrap_usd = vs.get("estimated_scrap_cash_usd", 0) or 0

        return EcoValuation(
            valuationSummary=ValuationSummary(
                deviceName=vs.get("device_name", request.deviceName),
                conditionGrade=vs.get("condition_grade", "C"),
                estimatedResaleUsd=resale_usd,
                estimatedResaleInr=round(resale_usd * USD_TO_INR),
                estimatedScrapCashUsd=scrap_usd,
                estimatedScrapCashInr=round(scrap_usd * USD_TO_INR),
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
