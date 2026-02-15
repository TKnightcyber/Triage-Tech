"""
AI Fallback Generator.
When web scraping returns zero results, this module uses Groq LLM
to brainstorm project ideas with detailed step-by-step instructions.
"""

from __future__ import annotations

import json
import logging

import httpx

from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)

# GROQ_MODEL is like "groq/llama-3.3-70b-versatile" — strip the "groq/" prefix for API
_MODEL = GROQ_MODEL.replace("groq/", "")

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are a hardware hacking and electronics upcycling expert.
Given a device and its conditions, you generate creative, practical project ideas
for giving the device a second life.

You MUST respond with valid JSON only — no markdown, no code fences, no explanation.
The JSON must be an array of project objects. Each project object has these fields:
- "title": string — short project name
- "description": string — 2-3 sentence explanation of the project
- "difficulty": "Beginner" | "Intermediate" | "Expert"
- "type": "Software" | "Hardware Harvest" | "Creative Build"
- "required_parts": string[] — list of parts, tools, or software needed
- "steps": string[] — 5-10 detailed step-by-step instructions
- "reasoning": string — why this project is a good fit for this device and conditions

Generate 5-8 diverse projects. Include a mix of Software, Hardware Harvest, and Creative Build types.
"Creative Build" means physically transforming the device into something entirely new
(like DIY Perks style projects — e.g., turning a laptop screen into a portable monitor,
making a phone into a home server, building a custom Bluetooth speaker from phone parts).
Each project must work with the device's reported conditions (broken parts).
Be specific and actionable — include real software names, tools, and techniques."""


async def generate_ai_recommendations(
    device: str,
    conditions: list[str],
    mode: str,
    condition_notes: str = "",
) -> list[dict]:
    """
    Call Groq LLM to generate project recommendations when scraping fails.
    Returns a list of project dicts compatible with the pipeline.
    """
    cond_text = ", ".join(conditions) if conditions else "no reported issues"
    notes_text = f"\nUser's description of condition: {condition_notes}\n" if condition_notes else ""
    user_prompt = (
        f"Device: {device}\n"
        f"Conditions: {cond_text}\n"
        f"{notes_text}"
        f"Mode: {mode}\n\n"
        f"Generate creative second-life project ideas for this device. "
        f"Remember the device has these broken/damaged parts: {cond_text}. "
        f"{'The user also describes: ' + condition_notes + '. ' if condition_notes else ''}"
        f"All projects must work AROUND these limitations.\n"
        f"{'Focus on teardown and component harvesting projects.' if mode == 'Teardown/Harvest' else 'Focus on software repurposing and creative reuse projects.'}\n"
        f"Respond with a JSON array of project objects only."
    )

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
                    "temperature": 0.7,
                    "max_tokens": 4096,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        content = data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if the model added them
        if content.startswith("```"):
            content = content.split("\n", 1)[1]  # remove first line
            if content.endswith("```"):
                content = content[: content.rfind("```")]
            content = content.strip()

        projects = json.loads(content)

        if not isinstance(projects, list):
            projects = projects.get("projects", []) if isinstance(projects, dict) else []

        # Normalize into pipeline-compatible format
        normalized: list[dict] = []
        for p in projects:
            if not isinstance(p, dict) or not p.get("title"):
                continue
            normalized.append({
                "title": p.get("title", ""),
                "description": p.get("description", ""),
                "source_url": "",  # AI-generated, no URL
                "steps": p.get("steps", []),
                "required_parts": p.get("required_parts", []),
                "difficulty": p.get("difficulty", "Intermediate"),
                "platform": "AI Generated",
                "type": p.get("type", "Software"),
                "reasoning": p.get("reasoning", "AI-generated recommendation based on device specs."),
            })

        logger.info("AI fallback generated %d recommendations", len(normalized))
        return normalized

    except Exception as e:
        logger.exception("AI fallback generation failed: %s", e)
        return []
