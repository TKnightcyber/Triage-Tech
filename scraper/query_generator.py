"""
Port of the TypeScript formulateQueries function from route.ts.
Generates per-platform search queries based on device conditions.
"""

from __future__ import annotations

import time
from schemas import ThoughtLogEntry


def _thought(message: str) -> ThoughtLogEntry:
    return ThoughtLogEntry(timestamp=int(time.time() * 1000), message=message)


def generate_queries(
    device: str,
    conditions: list[str],
    mode: str,
    condition_notes: str = "",
) -> dict:
    """
    Returns {
        "queries": { "youtube": [...], "reddit": [...], ... },
        "thoughts": [ThoughtLogEntry, ...]
    }
    """
    thoughts: list[ThoughtLogEntry] = []
    youtube: list[str] = []
    reddit: list[str] = []
    github: list[str] = []
    instructables: list[str] = []
    general: list[str] = []
    creative: list[str] = []

    thoughts.append(_thought(f"Analyzing {device} specs..."))

    # ── Condition-specific queries ────────────────────────────────────────

    if "Screen Broken" in conditions:
        thoughts.append(
            _thought("Detected 'Broken Screen'. Filtering out Smart Mirrors...")
        )
        youtube.append(f"{device} headless project no screen needed tutorial")
        reddit.append(f"{device} headless server project broken screen")
        github.append("headless android server project")
        general.append(f"{device} headless android projects server -screen")

    if "Bad Battery" in conditions:
        thoughts.append(
            _thought(
                "Battery is dead. Searching for wall-powered / always-plugged projects..."
            )
        )
        youtube.append(f"{device} wall powered always plugged project tutorial")
        reddit.append("old phone no battery wall power server project")
        general.append(f"{device} wall powered project always plugged in server")

    if "Touch Broken" in conditions:
        thoughts.append(
            _thought(
                "Touch digitizer broken. Looking for ADB-controlled or sensor-only projects..."
            )
        )
        youtube.append(f"{device} broken touch ADB control project")
        reddit.append(f"android phone broken touch ADB project automation")
        general.append(f"{device} no touch sensor station automation")

    if "Camera Dead" in conditions:
        thoughts.append(
            _thought(
                "Camera module dead. Excluding security-cam projects, keeping audio/server..."
            )
        )
        reddit.append(f"old android phone project no camera needed server")
        general.append(f"old android phone project no camera needed")

    if "Speaker Broken" in conditions:
        thoughts.append(
            _thought("Speaker broken. Focusing on silent/display-only projects...")
        )
        general.append(f"old android phone silent display dashboard project")

    if "No Charging Port" in conditions:
        thoughts.append(
            _thought(
                "Charging port broken. Looking for wireless-charging setups or parts harvest..."
            )
        )
        youtube.append(f"{device} wireless charging mod project")
        general.append(f"{device} wireless charging mod DIY")

    # ── Creative Build queries (DIY Perks style) ─────────────────────────

    creative.append(f"DIY Perks style {device} creative project build conversion")
    creative.append(f"broken {device} convert into unique project DIY build")
    if "Screen Broken" in conditions:
        creative.append(f"broken laptop screen portable external monitor build DIY")
    elif "Bad Battery" in conditions:
        creative.append(f"{device} no battery wall powered creative station build")
    else:
        creative.append(f"old {device} creative conversion mod project unique")

    # ── Default queries if nothing specific ───────────────────────────────

    if not any([youtube, reddit, github, instructables, general]):
        youtube.append(f"{device} repurpose upcycle project tutorial 2024")
        reddit.append(f"{device} second life repurpose DIY project")
        github.append(f"{device} repurpose project")
        general.append(f"{device} repurpose upcycle project ideas 2024")

    # ── Condition notes — user free-text description ──────────────────────

    if condition_notes and condition_notes.strip():
        notes = condition_notes.strip()
        thoughts.append(_thought(f"User described condition: \"{notes[:80]}{'...' if len(notes) > 80 else ''}\". Adding targeted queries..."))
        general.append(f"{device} {notes[:60]} repurpose project")
        youtube.append(f"{device} {notes[:60]} DIY fix reuse tutorial")
        general.append(f"{device} second life DIY project github")

    # ── Harvest / teardown mode ───────────────────────────────────────────

    if mode == "Teardown/Harvest":
        thoughts.append(
            _thought(
                f"Harvest mode enabled. Searching for {device} teardown & component pinouts..."
            )
        )
        youtube.append(f"{device} teardown disassembly tutorial")
        reddit.append(f"{device} teardown parts harvest reuse")
        github.append("smartphone component harvesting arduino")
        instructables.append(f"{device} teardown parts harvest")
        instructables.append(f"{device} ifixit teardown components reuse")
        general.append(f"{device} teardown parts list pinout")

    all_count = len(youtube) + len(reddit) + len(github) + len(instructables) + len(general) + len(creative)
    thoughts.append(
        _thought(f"Formulated {all_count} search queries across 6 platforms. Initiating web search...")
    )

    return {
        "queries": {
            "youtube": youtube,
            "reddit": reddit,
            "github": github,
            "instructables": instructables,
            "general": general,
            "creative": creative,
        },
        "thoughts": thoughts,
    }
