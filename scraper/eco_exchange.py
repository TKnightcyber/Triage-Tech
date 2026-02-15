"""
Eco-Exchange Valuation Engine.
Uses Groq LLM to generate trade-in offers and recycling valuations
for broken/old consumer electronics — bridging the gap between
broken devices and retail partner rewards.
"""

from __future__ import annotations

import json
import logging

import base64

import httpx

from config import GROQ_API_KEY, GROQ_MODEL, GROQ_VISION_MODEL

logger = logging.getLogger(__name__)

_MODEL = GROQ_MODEL.replace("groq/", "")
_VISION_MODEL = GROQ_VISION_MODEL
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = r"""You are the "Eco-Exchange Valuation Engine," a specialized AI designed to bridge the gap between broken consumer electronics and retail partnerships.

**YOUR GOAL:**
The user has a broken or old device. Your job is to:
1. Evaluate the device's condition and give it a CONDITION GRADE.
2. Estimate what it can SELL FOR on the used market (eBay, Swappa, Facebook Marketplace).
3. Estimate raw SCRAP PARTS value.
4. Generate compelling PARTNER COUPONS that beat the cash value.

**INPUT DATA YOU WILL RECEIVE:**
1. Device Model (e.g., iPhone 13, Dell XPS 15)
2. Specs (RAM, Storage)
3. Condition Report (list of issues like "Screen Broken", "Bad Battery", etc.)

**LOGIC & CALCULATIONS:**

1. **Condition Grade (A-F):**
   - A = Fully working, cosmetic wear only
   - B = Minor issue (bad battery or cosmetic damage)
   - C = One major issue (screen broken OR touch broken)
   - D = Multiple issues (2+ broken components)
   - F = Not functional (water damage or 3+ issues)

2. **Calculate "Estimated Resale Value":**
   - What the device could realistically sell for on eBay/Swappa in its current condition.
   - Start from the device's current used market value in working condition.
   - Apply condition penalties: Screen Broken = -40%, Bad Battery = -15%, Touch Broken = -35%, Camera Dead = -10%, Speaker Broken = -10%, No Charging Port = -25%.
   - Multiple penalties stack multiplicatively.
   - Smartphones base: $80-400. Laptops base: $150-600. Tablets base: $60-300.

3. **Calculate "Scrap Cash Value":**
   - Raw parts value (motherboard, sensors, housing).
   - Typically 30-50% of resale value.

4. **Generate "Partner Rewards" (The Core Task):**
   - Generate 3 distinct trade-in offers from major retailers.
   - Each offer MUST include a coupon_url — use the REAL trade-in program URL for that retailer.
   - **The Golden Rule:** Coupon value must appear 20-40% higher than Scrap Cash to incentivize trade-in.
   - Real retailer trade-in URLs to use:
     * Amazon: https://www.amazon.com/l/9187220011
     * Best Buy: https://www.bestbuy.com/trade-in
     * Apple: https://www.apple.com/shop/trade-in
     * Samsung: https://www.samsung.com/us/trade-in/
     * Google: https://store.google.com/us/magazine/trade_in
     * Dell: https://www.dell.com/en-us/lp/dell-trade-in
     * Gazelle: https://www.gazelle.com/
     * Back Market: https://www.backmarket.com/en-us/buyback

**OUTPUT FORMAT:**
Return ONLY a valid JSON object. No markdown, no code fences, no explanation.

{
  "valuation_summary": {
    "device_name": "String",
    "condition_grade": "A" or "B" or "C" or "D" or "F",
    "estimated_resale_usd": Number,
    "estimated_scrap_cash_usd": Number,
    "eco_message": "String (include specific environmental stat)"
  },
  "trade_in_offers": [
    {
      "partner": "String (e.g., Amazon)",
      "offer_type": "Discount Coupon" or "Store Credit" or "Cash Transfer",
      "headline": "String (e.g., '20% Off Next Smartphone')",
      "monetary_value_cap": "String (e.g., 'Up to $100 value')",
      "coupon_url": "String (real trade-in URL for that retailer)",
      "reasoning": "String (Why this is good for them)"
    }
  ]
}

Generate exactly 3 trade-in offers. One should be a direct cash option (lower value), and two should be partner coupons/credits (higher perceived value). Always make the partner offers look significantly better than the cash option.

IMPORTANT:
- Be realistic — don't over-inflate values.
- Use real retailer names and their actual trade-in program URLs.
- The eco_message should include a specific environmental stat (grams saved, metals recovered, etc.).
- Make the reasoning personal and persuasive.
- Choose retailers that make sense for the device type (e.g., Apple trade-in for iPhones).
- The condition_grade MUST accurately reflect the reported issues.

You MUST respond with valid JSON only."""


def _build_user_prompt(
    device: str,
    device_type: str,
    conditions: list[str],
    ram_gb: int,
    storage_gb: int,
    additional_notes: str = "",
) -> str:
    """Build a prompt describing the device for valuation."""
    cond_text = ", ".join(conditions) if conditions else "Fully working (old model)"
    ram_str = f"{ram_gb}GB" if ram_gb > 0 else "Unknown"
    storage_str = f"{storage_gb}GB" if storage_gb > 0 else "Unknown"

    prompt = (
        f"Device: {device}\n"
        f"Device Type: {device_type}\n"
        f"RAM: {ram_str}\n"
        f"Storage: {storage_str}\n"
        f"Condition: {cond_text}\n"
    )

    if additional_notes.strip():
        prompt += f"Additional Details: {additional_notes.strip()}\n"

    prompt += (
        "\nCalculate the scrap cash value, estimated resale value, and generate 3 trade-in offers. "
        "Remember the Golden Rule: partner offers must appear 20-40% more valuable than cash."
    )

    return prompt


async def generate_eco_valuation(
    device: str,
    device_type: str = "Smartphone",
    conditions: list[str] | None = None,
    ram_gb: int = 0,
    storage_gb: int = 0,
    additional_notes: str = "",
) -> dict | None:
    """
    Call Groq LLM with the Eco-Exchange Valuation Engine prompt.
    Returns the valuation dict or None on failure.
    """
    conditions = conditions or []

    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — cannot generate eco valuation")
        return None

    user_prompt = _build_user_prompt(device, device_type, conditions, ram_gb, storage_gb, additional_notes)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                GROQ_CHAT_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": _MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.6,
                    "max_tokens": 2048,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        content = data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if the model added them
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[: content.rfind("```")]
            content = content.strip()

        result = json.loads(content)

        if not isinstance(result, dict):
            logger.warning("Eco valuation returned non-dict: %s", type(result))
            return None

        # Validate expected structure
        if "valuation_summary" not in result or "trade_in_offers" not in result:
            logger.warning("Eco valuation missing required keys")
            return None

        logger.info(
            "Eco valuation: scrap=$%s, %d offers",
            result["valuation_summary"].get("estimated_scrap_cash_usd", "?"),
            len(result.get("trade_in_offers", [])),
        )
        return result

    except Exception as e:
        logger.exception("Eco valuation generation failed: %s", e)
        return None


# ─── Vision-based device condition analysis ──────────────────────────────────

VISION_PROMPT = """You are a device condition analyst. Analyze the image(s) of this device and provide a detailed condition report.

**YOUR TASK:**
Look at the device image carefully and describe:
1. **Physical damage** you can see (cracks, dents, scratches, discoloration, missing parts)
2. **Screen condition** (cracked, scratched, burn-in, dead pixels, working)
3. **Body/housing condition** (bent, cracked, scuffed, clean)
4. **Port/button condition** (if visible — damaged, missing, dirty)
5. **Overall cosmetic grade** (Pristine / Good / Fair / Poor / Damaged)

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this structure:
{
  "visual_condition_summary": "A 2-3 sentence summary of the device's physical condition based on the image",
  "detected_issues": ["list", "of", "specific", "issues", "spotted"],
  "cosmetic_grade": "Pristine" or "Good" or "Fair" or "Poor" or "Damaged",
  "confidence": "High" or "Medium" or "Low"
}

Be honest and specific. Only report what you can actually see in the image. If the image is unclear, set confidence to "Low".
Respond with valid JSON only — no markdown, no code fences."""


async def analyze_device_images(
    images_base64: list[str],
    device_name: str = "",
) -> dict | None:
    """
    Use Groq vision model to analyze device images and extract condition info.
    Each item in images_base64 should be a base64-encoded image string (no data: prefix).
    Returns a dict with visual_condition_summary, detected_issues, cosmetic_grade, confidence
    or None on failure.
    """
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — cannot analyze images")
        return None

    if not images_base64:
        return None

    # Build multimodal content array
    content_parts: list[dict] = []

    if device_name:
        content_parts.append({
            "type": "text",
            "text": f"This is a {device_name}. Analyze its physical condition from the image(s)."
        })
    else:
        content_parts.append({
            "type": "text",
            "text": "Analyze this device's physical condition from the image(s)."
        })

    for img_b64 in images_base64[:3]:  # Cap at 3 images to avoid token limits
        # Ensure no data: prefix
        if img_b64.startswith("data:"):
            # Extract just the base64 part
            img_b64 = img_b64.split(",", 1)[-1]

        content_parts.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{img_b64}",
            },
        })

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                GROQ_CHAT_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": _VISION_MODEL,
                    "messages": [
                        {"role": "system", "content": VISION_PROMPT},
                        {"role": "user", "content": content_parts},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        content = data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if the model added them
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[: content.rfind("```")]
            content = content.strip()

        result = json.loads(content)

        if not isinstance(result, dict):
            logger.warning("Vision analysis returned non-dict: %s", type(result))
            return None

        logger.info(
            "Vision analysis: grade=%s, issues=%d, confidence=%s",
            result.get("cosmetic_grade", "?"),
            len(result.get("detected_issues", [])),
            result.get("confidence", "?"),
        )
        return result

    except Exception as e:
        logger.exception("Vision analysis failed: %s", e)
        return None
