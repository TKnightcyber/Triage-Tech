"""
AI-powered Creative Builds generator.
Uses Groq LLM with the "Second Life Hardware Architect" prompt to generate
intelligent, spec-aware project recommendations based on device type,
broken components, and hardware specs (RAM, storage).
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

SYSTEM_PROMPT = """You are the "Second Life Hardware Architect" — an expert embedded-systems engineer, 
maker-space mentor, and sustainability consultant rolled into one.

Your job: given a broken or outdated consumer device (with specific damaged components and remaining specs), 
generate PRACTICAL, CREATIVE second-life project ideas that reuse the device as-is (no hypothetical "if the screen worked" projects).

## RULES YOU MUST FOLLOW

### Headless Rule
If the screen OR touch digitizer is broken, EVERY project must be controllable via SSH, ADB, web UI, 
or companion app — never rely on the local display/touch.

### Tethered Rule
If the battery is dead or the charging port is broken, the project must assume permanent wall power 
(USB supply or wireless charging pad) — do NOT suggest portable/battery-dependent ideas.

### Power Rule
If the charging port is broken AND the battery is dead, the only viable path is component harvesting 
or a wireless-charging mod; make that clear.

### Sensor Rule
If camera is dead, exclude any vision-based project. If speaker is broken, exclude audio-output projects. 
Only propose projects that use WORKING sensors/components.

## OUTPUT FORMAT
Return a JSON array of project objects. Each object:
{
  "title": "Short project name (5-8 words)",
  "difficulty": "Beginner" | "Intermediate" | "Expert",
  "feasibility_score": 1-10 (how realistic given the broken parts),
  "use_case": "One-line use case summary",
  "description": "2-4 sentence detailed description covering what the project does and why it's a good fit for this device",
  "required_software": ["list", "of", "software/tools"],
  "hardware_fix_needed": "None" | "Brief description of any minor hardware fix required",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ..."]
}

Generate 4-6 diverse projects. Rank them by feasibility_score (highest first).

IMPORTANT:
- Be specific about real software, tools, and techniques.
- Consider RAM and storage constraints — don't suggest running heavy software on 1GB RAM.
- For smartphones with >=2GB RAM: consider home server, Pi-hole, media server, sensor hub.
- For smartphones with <2GB RAM: consider IoT sensor node, digital photo frame, dedicated single-app device.
- For laptops with >=4GB RAM: consider NAS, home server, development box, network monitor, Plex media server.
- For laptops with <4GB RAM: consider lightweight Linux distro, retro gaming, dedicated kiosk.
- For tablets: consider wall-mounted dashboard, digital frame, secondary display.
- Each project must ACTUALLY work with the reported broken components.
- Think creatively about PHYSICAL transformations: backlight from a broken LCD → desk lamp,
  laptop with broken screen → headless home server, broken phone → motion-sensor night light,
  old tablet → smart mirror frame, phone motherboard → IoT node, laptop speakers → Bluetooth speaker mod.
- Mix software-only projects (install Linux, run Pi-hole) with physical hack projects (extract backlight for lamp, convert into wall-mounted display).

You MUST respond with valid JSON only — no markdown, no code fences, no explanation outside the JSON."""


def _build_user_prompt(
    device: str,
    device_type: str,
    conditions: list[str],
    ram_gb: int,
    storage_gb: int,
) -> str:
    """Build a detailed user prompt describing the device state."""
    cond_text = ", ".join(conditions) if conditions else "All components working"

    # Identify what still works
    all_components = {
        "Screen", "Touch Digitizer", "Battery", "Camera",
        "Speaker", "Charging Port", "WiFi", "Bluetooth",
        "Accelerometer", "Gyroscope", "GPS",
    }
    broken_map = {
        "Screen Broken": "Screen",
        "Touch Broken": "Touch Digitizer",
        "Bad Battery": "Battery",
        "Camera Dead": "Camera",
        "Speaker Broken": "Speaker",
        "No Charging Port": "Charging Port",
    }
    broken_parts = {broken_map[c] for c in conditions if c in broken_map}
    working_parts = all_components - broken_parts

    ram_str = f"{ram_gb}GB" if ram_gb > 0 else "Unknown"
    storage_str = f"{storage_gb}GB" if storage_gb > 0 else "Unknown"

    return (
        f"Device: {device}\n"
        f"Device Type: {device_type}\n"
        f"RAM: {ram_str}\n"
        f"Storage: {storage_str}\n"
        f"Broken Components: {cond_text}\n"
        f"Working Components: {', '.join(sorted(working_parts))}\n\n"
        f"Generate creative second-life project ideas for this {device_type.lower()}. "
        f"Remember: {cond_text} — all projects must work AROUND these limitations. "
        f"Only use the working components listed above.\n"
        f"Respond with a JSON array of project objects only."
    )


async def generate_creative_builds(
    device: str,
    device_type: str = "Smartphone",
    conditions: list[str] | None = None,
    ram_gb: int = 0,
    storage_gb: int = 0,
) -> list[dict]:
    """
    Call Groq LLM with the Second Life Hardware Architect prompt
    to generate intelligent, spec-aware creative build ideas.
    Returns a list of project dicts compatible with the pipeline.
    """
    conditions = conditions or []

    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — cannot generate creative builds")
        return []

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

            # Map feasibility_score (1-10) to compatibilityScore (0-100)
            feasibility = p.get("feasibility_score", 7)
            if isinstance(feasibility, (int, float)):
                compat_score = int(min(100, max(0, feasibility * 10)))
            else:
                compat_score = 70

            # Build required_parts from required_software + hardware_fix_needed
            required_parts = p.get("required_software", [])
            hw_fix = p.get("hardware_fix_needed", "None")
            if hw_fix and hw_fix.lower() != "none":
                required_parts.append(f"Hardware: {hw_fix}")

            # Build reasoning from use_case
            use_case = p.get("use_case", "")
            reasoning = (
                f"{use_case} "
                f"(Feasibility: {feasibility}/10) — "
                f"AI-generated recommendation tailored to your device's specs and condition."
            )

            normalized.append({
                "title": p.get("title", ""),
                "description": p.get("description", ""),
                "source_url": "",  # AI-generated, no URL
                "steps": p.get("steps", []),
                "required_parts": required_parts,
                "difficulty": p.get("difficulty", "Intermediate"),
                "platform": "AI Generated",
                "type": "Creative Build",
                "reasoning": reasoning,
                "feasibility_score": feasibility,
            })

        logger.info("Creative AI generated %d project ideas", len(normalized))
        return normalized

    except Exception as e:
        logger.exception("Creative AI generation failed: %s", e)
        return []
