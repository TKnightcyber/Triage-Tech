"""
Eco-Exchange Valuation Engine.
Uses Groq LLM to generate trade-in offers and recycling valuations
for broken/old consumer electronics — bridging the gap between
broken devices and retail partner rewards.
"""

from __future__ import annotations

import json
import logging

import httpx

from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)

_MODEL = GROQ_MODEL.replace("groq/", "")
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = r"""You are the "Eco-Exchange Valuation Engine," a specialized AI designed to bridge the gap between broken consumer electronics and retail partnerships.

**YOUR GOAL:**
The user has a broken or old device and "no time for hobby projects." Your job is to convince them to recycle it by offering immediate value in the form of specific Partner Coupons or Store Credits that appear more valuable than the device's scrap cash value.

**INPUT DATA YOU WILL RECEIVE:**
1. Device Model (e.g., iPhone 13, Dell XPS 15)
2. Specs (RAM, Storage)
3. Condition Report (e.g., "Screen Broken", "Battery Dead", "Water Damage")

**LOGIC & CALCULATIONS:**
1. **Calculate "Scrap Cash Value":**
   - Estimate the raw market value of the remaining working parts (e.g., Motherboard, Sensors).
   - *Rule:* Broken Screen = -40% value. Dead Battery = -15% value. Water Damage = -70% value.
   - Consider device age, specs (higher RAM/storage = higher base value).
   - Smartphones base: $80-250. Laptops base: $120-400. Tablets base: $60-200.

2. **Generate "Partner Rewards" (The Core Task):**
   - You must generate 3 distinct trade-in offers from major retailers (Amazon, Best Buy, Apple, Samsung, Google, Dell, etc.).
   - **The Golden Rule:** The "Coupon Value" must always appear 20-40% higher than the "Scrap Cash Value" to incentivize the trade-in.
   - *Example:* If Scrap Cash is $50, the Amazon Coupon should be "20% off your next purchase (up to $80)".

**OUTPUT FORMAT:**
Return ONLY a valid JSON object. Do not speak to the user. No markdown, no code fences.

JSON Structure:
{
  "valuation_summary": {
    "device_name": "String",
    "estimated_scrap_cash_usd": Number,
    "eco_message": "String (e.g., 'Trading this in saves 140g of e-waste from landfills.')"
  },
  "trade_in_offers": [
    {
      "partner": "String (e.g., Amazon)",
      "offer_type": "Discount Coupon" or "Store Credit" or "Cash Transfer",
      "headline": "String (e.g., '20% Off Next Smartphone')",
      "monetary_value_cap": "String (e.g., 'Up to $100 value')",
      "reasoning": "String (Why this is good for them)"
    }
  ]
}

Generate exactly 3 trade-in offers. One should be a direct cash option (lower value), and two should be partner coupons/credits (higher perceived value). Always make the partner offers look significantly better than the cash option.

IMPORTANT:
- Be realistic about scrap values — don't over-inflate.
- Use real retailer names and plausible discount structures.
- The eco_message should include a specific environmental stat (grams of e-waste, metals recovered, etc.).
- Make the reasoning personal and persuasive.
- Consider the device type and specs when choosing which retailers to suggest.

You MUST respond with valid JSON only."""


def _build_user_prompt(
    device: str,
    device_type: str,
    conditions: list[str],
    ram_gb: int,
    storage_gb: int,
) -> str:
    """Build a prompt describing the device for valuation."""
    cond_text = ", ".join(conditions) if conditions else "Fully working (old model)"
    ram_str = f"{ram_gb}GB" if ram_gb > 0 else "Unknown"
    storage_str = f"{storage_gb}GB" if storage_gb > 0 else "Unknown"

    return (
        f"Device: {device}\n"
        f"Device Type: {device_type}\n"
        f"RAM: {ram_str}\n"
        f"Storage: {storage_str}\n"
        f"Condition: {cond_text}\n\n"
        f"Calculate the scrap cash value and generate 3 trade-in offers. "
        f"Remember the Golden Rule: partner offers must appear 20-40% more valuable than cash."
    )


async def generate_eco_valuation(
    device: str,
    device_type: str = "Smartphone",
    conditions: list[str] | None = None,
    ram_gb: int = 0,
    storage_gb: int = 0,
) -> dict | None:
    """
    Call Groq LLM with the Eco-Exchange Valuation Engine prompt.
    Returns the valuation dict or None on failure.
    """
    conditions = conditions or []

    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — cannot generate eco valuation")
        return None

    user_prompt = _build_user_prompt(device, device_type, conditions, ram_gb, storage_gb)

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
