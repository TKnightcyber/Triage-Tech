import { NextRequest, NextResponse } from "next/server";
import type {
  ResearchRequest,
  ResearchResponse,
  ThoughtLogEntry,
  MockSearchResult,
  ProjectRecommendation,
  DeviceCondition,
} from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function thought(message: string): ThoughtLogEntry {
  return { timestamp: Date.now(), message };
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Query Formulator ────────────────────────────────────────────────────────

function formulateQueries(
  device: string,
  conditions: DeviceCondition[],
  mode: string
): { queries: string[]; thoughts: ThoughtLogEntry[] } {
  const thoughts: ThoughtLogEntry[] = [];
  const queries: string[] = [];

  thoughts.push(thought(`Analyzing ${device} specs...`));

  // Condition-specific queries
  if (conditions.includes("Screen Broken")) {
    thoughts.push(
      thought("Detected 'Broken Screen'. Filtering out Smart Mirrors...")
    );
    queries.push(`headless android projects server github -screen`);
    queries.push(`${device} headless server raspberry pi alternative`);
  }

  if (conditions.includes("Bad Battery")) {
    thoughts.push(
      thought(
        "Battery is dead. Searching for wall-powered / always-plugged projects..."
      )
    );
    queries.push(`${device} wall powered project always plugged in server`);
    queries.push(`old android phone no battery wall power server`);
  }

  if (conditions.includes("Touch Broken")) {
    thoughts.push(
      thought(
        "Touch digitizer broken. Looking for ADB-controlled or sensor-only projects..."
      )
    );
    queries.push(`android phone broken touch adb control project`);
    queries.push(`${device} no touch sensor station automation`);
  }

  if (conditions.includes("Camera Dead")) {
    thoughts.push(
      thought(
        "Camera module dead. Excluding security-cam projects, keeping audio/server..."
      )
    );
    queries.push(`old android phone project no camera needed`);
  }

  if (conditions.includes("Speaker Broken")) {
    thoughts.push(
      thought("Speaker broken. Focusing on silent/display-only projects...")
    );
    queries.push(`old android phone silent display dashboard project`);
  }

  if (conditions.includes("No Charging Port")) {
    thoughts.push(
      thought(
        "Charging port broken. Looking for wireless-charging setups or parts harvest..."
      )
    );
    queries.push(`${device} wireless charging mod project`);
  }

  // Default general query if nothing specific
  if (queries.length === 0) {
    queries.push(`${device} repurpose upcycle project ideas 2024`);
    queries.push(`${device} second life DIY project github`);
  }

  // Harvest mode queries
  if (mode === "Teardown/Harvest") {
    thoughts.push(
      thought(
        `Harvest mode enabled. Searching for ${device} teardown & component pinouts...`
      )
    );
    queries.push(`${device} teardown parts list pinout`);
    queries.push(`${device} ifixit teardown components reuse`);
    queries.push(`smartphone component harvesting robotics arduino`);
  }

  thoughts.push(
    thought(`Formulated ${queries.length} search queries. Initiating web search...`)
  );

  return { queries, thoughts };
}

// ─── Mock Tavily Search ──────────────────────────────────────────────────────

const MOCK_RESULTS_DB: Record<string, MockSearchResult[]> = {
  headless: [
    {
      title: "OctoPrint - 3D Printer Web Interface",
      url: "https://octoprint.org",
      snippet:
        "Turn any old Android phone into a powerful 3D printer controller using OctoPrint. Works headless via WiFi, no screen needed. Connect via OTG cable.",
      score: 0.95,
    },
    {
      title: "PhoneGap Home Server with Termux",
      url: "https://github.com/example/termux-server",
      snippet:
        "Run a full Node.js / Python web server from your old Android phone using Termux. Supports headless operation, SSH, and cron jobs.",
      score: 0.88,
    },
    {
      title: "Pi-hole on Android via Linux Deploy",
      url: "https://github.com/example/pihole-android",
      snippet:
        "Block ads network-wide by deploying Pi-hole on an old phone. Uses Linux Deploy to run a Debian container. No screen required.",
      score: 0.85,
    },
  ],
  "wall powered": [
    {
      title: "Always-On Dashboard Display",
      url: "https://github.com/example/wall-dashboard",
      snippet:
        "Mount an old phone on the wall as a permanent home dashboard. Shows weather, calendar, smart home controls. Powered via USB.",
      score: 0.9,
    },
    {
      title: "IP Security Camera (Wall Powered)",
      url: "https://www.instructables.com/old-phone-camera",
      snippet:
        "Convert old phones into IP security cameras with Alfred or IP Webcam. Perfect when always plugged in — no battery needed.",
      score: 0.87,
    },
  ],
  teardown: [
    {
      title: "Galaxy S9 Teardown - iFixit",
      url: "https://www.ifixit.com/Teardown/Samsung+Galaxy+S9",
      snippet:
        "Full teardown revealing: 12MP OIS camera module, vibration motor (ERM), 3000mAh battery, Qualcomm SDM845, Super AMOLED 5.8\" panel.",
      score: 0.97,
    },
    {
      title: "Harvesting Phone Components for Arduino",
      url: "https://www.instructables.com/phone-parts-arduino",
      snippet:
        "Guide to extracting vibration motors, speakers, cameras, and flex cables from old smartphones for robotics and Arduino projects.",
      score: 0.92,
    },
    {
      title: "Phone Screen as OLED Module - Hackaday",
      url: "https://hackaday.com/phone-oled-reuse",
      snippet:
        "Reverse-engineering phone OLED panels with MIPI DSI interface. Drive Samsung AMOLED panels with FPGA or specialized controller boards.",
      score: 0.78,
    },
  ],
  sensor: [
    {
      title: "Old Phone as Environment Sensor Hub",
      url: "https://github.com/example/phone-sensors",
      snippet:
        "Use built-in accelerometer, barometer, gyroscope, and light sensor to create an environment monitoring station. Data sent via MQTT.",
      score: 0.82,
    },
  ],
  server: [
    {
      title: "Minecraft Bedrock Server on Android",
      url: "https://github.com/example/mc-android",
      snippet:
        "Host a Minecraft Bedrock server on old Android phones. Supports up to 10 players on local network using Termux + Nukkit.",
      score: 0.75,
    },
    {
      title: "Jellyfin Media Server on Phone",
      url: "https://github.com/example/jellyfin-android",
      snippet:
        "Stream your media library from an old phone running Jellyfin via Termux. Add external storage via OTG for more space.",
      score: 0.8,
    },
  ],
  default: [
    {
      title: "Home Assistant Companion Kiosk",
      url: "https://www.home-assistant.io",
      snippet:
        "Mount your old phone as a smart home control panel running Home Assistant dashboard in kiosk mode. Touchscreen UI included.",
      score: 0.88,
    },
    {
      title: "Retro Game Emulator Station",
      url: "https://github.com/example/retro-phone",
      snippet:
        "Transform old phones into retro gaming consoles with RetroArch. Connect to TV via HDMI adapter and pair a Bluetooth controller.",
      score: 0.72,
    },
  ],
};

function searchWeb(queries: string[]): {
  results: MockSearchResult[];
  thoughts: ThoughtLogEntry[];
} {
  const thoughts: ThoughtLogEntry[] = [];
  const seen = new Set<string>();
  const results: MockSearchResult[] = [];

  for (const query of queries) {
    thoughts.push(thought(`Searching: "${query}"...`));
    const lq = query.toLowerCase();

    // Match against keyword buckets
    let matched = false;
    for (const [key, items] of Object.entries(MOCK_RESULTS_DB)) {
      if (key !== "default" && lq.includes(key)) {
        for (const item of items) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            results.push(item);
          }
        }
        matched = true;
      }
    }
    if (!matched) {
      for (const item of MOCK_RESULTS_DB.default) {
        if (!seen.has(item.title)) {
          seen.add(item.title);
          results.push(item);
        }
      }
    }
  }

  thoughts.push(thought(`Found ${results.length} viable results. Analyzing...`));
  return { results, thoughts };
}

// ─── Mock LLM Synthesis ──────────────────────────────────────────────────────

function synthesizeRecommendations(
  device: string,
  conditions: DeviceCondition[],
  mode: string,
  results: MockSearchResult[]
): { recommendations: ProjectRecommendation[]; thoughts: ThoughtLogEntry[] } {
  const thoughts: ThoughtLogEntry[] = [];
  const recommendations: ProjectRecommendation[] = [];

  thoughts.push(
    thought("Synthesizing search results into project recommendations...")
  );

  const screenBroken = conditions.includes("Screen Broken");
  const badBattery = conditions.includes("Bad Battery");
  const touchBroken = conditions.includes("Touch Broken");
  const cameraDead = conditions.includes("Camera Dead");

  // ─── Software Projects ───────────────────────────────────────────────

  // OctoPrint (great if screen is broken)
  if (
    results.some((r) => r.title.includes("OctoPrint")) ||
    screenBroken ||
    !cameraDead
  ) {
    thoughts.push(
      thought("OctoPrint is a strong match — screen not required, WiFi works.")
    );
    recommendations.push({
      id: uid(),
      title: "OctoPrint 3D Printer Server",
      type: "Software",
      description: `Turn your ${device} into a wireless 3D printer controller. Connect via OTG to your printer and control everything from a laptop browser.`,
      difficulty: "Intermediate",
      compatibilityScore: screenBroken ? 95 : 80,
      reasoning: screenBroken
        ? "Perfect fit: screen not needed. WiFi + USB OTG is all you need."
        : "Good fit: phone has all needed capabilities. Screen is a bonus for local monitoring.",
      requiredParts: ["USB OTG Cable", "3D Printer with USB port"],
      sourceUrl: "https://octoprint.org",
    });
  }

  // Pi-hole
  if (results.some((r) => r.title.includes("Pi-hole")) || screenBroken) {
    thoughts.push(
      thought(
        "Pi-hole runs headless — perfect for broken screens. Checking network capability..."
      )
    );
    recommendations.push({
      id: uid(),
      title: "Network Ad Blocker (Pi-hole)",
      type: "Software",
      description: `Deploy Pi-hole on your ${device} to block ads for every device on your home network. Runs entirely headless via Linux Deploy.`,
      difficulty: "Intermediate",
      compatibilityScore: screenBroken ? 92 : 78,
      reasoning: screenBroken
        ? "Excellent: no screen needed. Runs as a background DNS server."
        : "Solid choice, though a working screen means you have better options too.",
      requiredParts: ["WiFi Network", "Router DNS access"],
      sourceUrl: "https://github.com/example/pihole-android",
    });
  }

  // Home Server (Termux)
  thoughts.push(thought("Evaluating Termux-based home server options..."));
  recommendations.push({
    id: uid(),
    title: "Home Web Server (Termux)",
    type: "Software",
    description: `Run Node.js, Python, or static file servers from your ${device}. Host personal websites, APIs, or file shares on your local network.`,
    difficulty: "Beginner",
    compatibilityScore: badBattery ? 70 : 85,
    reasoning: badBattery
      ? "Works when wall-powered, but no battery means no UPS protection."
      : "Reliable home server with battery backup during power outages.",
    requiredParts: ["USB Charger (always plugged)"],
    sourceUrl: "https://github.com/example/termux-server",
  });

  // Media Server
  if (!screenBroken || badBattery) {
    recommendations.push({
      id: uid(),
      title: "Jellyfin Media Server",
      type: "Software",
      description: `Stream your movie and music collection from your ${device} to any browser or smart TV on your network.`,
      difficulty: "Beginner",
      compatibilityScore: 75,
      reasoning:
        "Good storage and networking for local media. Add OTG storage for larger libraries.",
      requiredParts: ["USB OTG Cable", "USB Flash Drive or SD Card"],
      sourceUrl: "https://github.com/example/jellyfin-android",
    });
  }

  // Smart Home Dashboard (only if screen works)
  if (!screenBroken && !touchBroken) {
    thoughts.push(
      thought(
        "Screen and touch work — adding smart home dashboard option..."
      )
    );
    recommendations.push({
      id: uid(),
      title: "Home Assistant Wall Panel",
      type: "Software",
      description: `Wall-mount your ${device} as a beautiful smart home control panel. Control lights, thermostat, and cameras from one screen.`,
      difficulty: "Beginner",
      compatibilityScore: 90,
      reasoning:
        "Working touchscreen makes this ideal. Wall-mount with always-on USB power.",
      requiredParts: [
        "Wall Mount / Magnetic Mount",
        "USB Charger",
        "Home Assistant Server (on another device)",
      ],
      sourceUrl: "https://www.home-assistant.io",
    });
  }

  // Security Camera (only if camera works)
  if (!cameraDead) {
    recommendations.push({
      id: uid(),
      title: "IP Security Camera",
      type: "Software",
      description: `Position your ${device} as a WiFi security camera with motion detection, night vision (if supported), and cloud/local recording.`,
      difficulty: "Beginner",
      compatibilityScore: touchBroken ? 88 : 82,
      reasoning: touchBroken
        ? "Touch broken doesn't matter — set it once via ADB, then it runs hands-free."
        : "Easy setup. Works great as a baby monitor or pet cam too.",
      requiredParts: ["Phone Mount / Tripod", "USB Charger"],
      sourceUrl: "https://www.instructables.com/old-phone-camera",
    });
  }

  // Retro Gaming (needs screen + touch)
  if (!screenBroken && !touchBroken) {
    recommendations.push({
      id: uid(),
      title: "Retro Gaming Console",
      type: "Software",
      description: `Play NES, SNES, GBA, and PS1 games on your ${device} with RetroArch. Connect to a TV via HDMI adapter for the full experience.`,
      difficulty: "Beginner",
      compatibilityScore: 72,
      reasoning:
        "The AMOLED screen and Snapdragon chipset handle retro emulation flawlessly.",
      requiredParts: ["Bluetooth Controller", "USB-C to HDMI Adapter (optional)"],
      sourceUrl: "https://github.com/example/retro-phone",
    });
  }

  // Sensor Station (good if screen/touch broken)
  if (screenBroken || touchBroken) {
    recommendations.push({
      id: uid(),
      title: "Environment Sensor Hub",
      type: "Software",
      description: `Use the built-in barometer, accelerometer, light sensor, and thermometer of your ${device} as an IoT environment monitor. Data pushed via MQTT.`,
      difficulty: "Intermediate",
      compatibilityScore: 80,
      reasoning:
        "Sensors still work regardless of screen/touch. Perfect data logger.",
      requiredParts: ["WiFi Network", "MQTT Broker (e.g., Mosquitto)"],
      sourceUrl: "https://github.com/example/phone-sensors",
    });
  }

  // ─── Hardware Harvest Projects (only in Teardown mode) ─────────────

  if (mode === "Teardown/Harvest") {
    thoughts.push(
      thought(
        `Entering destructive harvest analysis for ${device}. Mapping extractable components...`
      )
    );

    recommendations.push({
      id: uid(),
      title: "Vibration Motor for Robotics",
      type: "Hardware Harvest",
      description:
        "Extract the ERM (Eccentric Rotating Mass) vibration motor. Runs on 3V, perfect for small robots, haptic feedback projects, or bristle-bots.",
      difficulty: "Beginner",
      compatibilityScore: 95,
      reasoning:
        "Easy to remove, standard voltage. Works directly with Arduino digital pins.",
      requiredParts: [
        "Spudger / Pry Tool",
        "Soldering Iron",
        "Arduino or Raspberry Pi",
      ],
      sourceUrl: "https://www.instructables.com/phone-parts-arduino",
    });

    recommendations.push({
      id: uid(),
      title: "AMOLED Display Panel Reuse",
      type: "Hardware Harvest",
      description: `Harvest the 5.8" Super AMOLED display from your ${device}. Requires a MIPI DSI adapter board to drive it from a Raspberry Pi or FPGA.`,
      difficulty: "Expert",
      compatibilityScore: screenBroken ? 20 : 65,
      reasoning: screenBroken
        ? "Screen is broken — panel may be cracked. Low chance of reuse."
        : "Intact AMOLED panels are valuable. MIPI DSI driving is complex but rewarding.",
      requiredParts: [
        "MIPI DSI Adapter Board",
        "FPGA or Compatible SBC",
        "FPC Connector",
        "Heat Gun (for removal)",
      ],
      sourceUrl: "https://hackaday.com/phone-oled-reuse",
    });

    recommendations.push({
      id: uid(),
      title: "Camera Module for Raspberry Pi",
      type: "Hardware Harvest",
      description: `The 12MP OIS rear camera module can be repurposed with a MIPI CSI adapter. Higher quality than standard Pi cameras.`,
      difficulty: "Expert",
      compatibilityScore: cameraDead ? 10 : 70,
      reasoning: cameraDead
        ? "Camera is reported dead — module likely damaged."
        : "12MP with OIS is premium. Requires MIPI CSI adapter and custom driver.",
      requiredParts: [
        "MIPI CSI Adapter Board",
        "Raspberry Pi",
        "FPC Connector",
        "Soldering Station",
      ],
      sourceUrl: "https://www.ifixit.com/Teardown/Samsung+Galaxy+S9",
    });

    recommendations.push({
      id: uid(),
      title: "Li-Ion Battery for Projects",
      type: "Hardware Harvest",
      description: `Extract the 3000mAh Li-Ion battery. Use with a TP4056 charge controller for powering Arduino/ESP32 projects, LED strips, or portable power packs.`,
      difficulty: "Intermediate",
      compatibilityScore: badBattery ? 15 : 88,
      reasoning: badBattery
        ? "Battery reported as bad — may have degraded capacity. Test before reuse."
        : "3000mAh is solid for portable projects. Always use a protection circuit.",
      requiredParts: [
        "TP4056 Charge Module",
        "Battery Holder or Wiring",
        "Heat Gun (for safe removal)",
      ],
      sourceUrl: "https://www.instructables.com/phone-parts-arduino",
    });

    recommendations.push({
      id: uid(),
      title: "Speaker & Microphone Modules",
      type: "Hardware Harvest",
      description:
        "Tiny MEMS microphone and micro-speaker from the phone work with Arduino at 3.3V. Great for voice-activated projects or small audio devices.",
      difficulty: "Beginner",
      compatibilityScore: 80,
      reasoning:
        "Small, low-power audio components. The MEMS mic is especially useful for voice/sound detection.",
      requiredParts: ["Soldering Iron", "Arduino / ESP32", "Amplifier Module (for speaker)"],
      sourceUrl: "https://www.instructables.com/phone-parts-arduino",
    });
  }

  // Sort by compatibility score
  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // ─── Creative Build Projects ──────────────────────────────────────
  thoughts.push(thought("Generating creative DIY conversion ideas (DIY Perks style)..."));

  recommendations.push({
    id: uid(),
    title: "Portable Monitor from Device Screen",
    type: "Creative Build",
    description: `Salvage the LCD/OLED panel from your ${device} and pair it with a controller board to create a portable USB-C monitor — perfect as a secondary display.`,
    difficulty: "Intermediate",
    compatibilityScore: screenBroken ? 25 : 88,
    reasoning: screenBroken
      ? "Screen is broken — panel may be cracked and unusable for this build."
      : "The display panel is the most valuable part. An HDMI/USB-C controller board (\u223C$15) turns it into a standalone monitor.",
    requiredParts: ["LCD/eDP Controller Board", "Inverter Board (if LCD)", "12V Power Adapter", "3D-Printed or DIY Case", "HDMI / USB-C Cable"],
    sourceUrl: "https://www.youtube.com/results?search_query=DIY+Perks+laptop+screen+portable+monitor",
  });

  recommendations.push({
    id: uid(),
    title: "Dedicated Home Server / NAS",
    type: "Creative Build",
    description: `Strip your ${device} down to just the motherboard, add an external drive, and build a compact always-on home server for file sharing, backups, or Plex.`,
    difficulty: "Intermediate",
    compatibilityScore: 82,
    reasoning: "Even with broken peripherals, the CPU, RAM, and WiFi still work. A headless Linux install turns it into a solid home server.",
    requiredParts: ["USB External HDD/SSD", "USB Hub", "Ethernet Adapter (optional)", "Compact Enclosure or Mount", "USB Power Supply"],
    sourceUrl: "https://www.youtube.com/results?search_query=old+laptop+home+server+build",
  });

  recommendations.push({
    id: uid(),
    title: "Custom Bluetooth Speaker Build",
    type: "Creative Build",
    description: `Harvest the amplifier circuit and combine it with a Bluetooth module and better speaker drivers to craft a custom portable Bluetooth speaker.`,
    difficulty: "Expert",
    compatibilityScore: 72,
    reasoning: "The battery (if working), charging circuit, and Bluetooth chip can be reused. Pair with proper speaker drivers for great sound.",
    requiredParts: ["Bluetooth Audio Module (KRC-86B)", "Speaker Drivers (40mm)", "Lithium Battery Pack", "Custom Enclosure (wood/3D-printed)", "Amplifier Module (PAM8403)"],
    sourceUrl: "https://www.youtube.com/results?search_query=DIY+Perks+bluetooth+speaker+build",
  });

  recommendations.push({
    id: uid(),
    title: "Digital Photo Frame / Art Display",
    type: "Creative Build",
    description: `Mount the screen in a custom wooden frame and run a slideshow of your photos or AI art — like a modern digital picture frame.`,
    difficulty: "Beginner",
    compatibilityScore: screenBroken ? 20 : 85,
    reasoning: screenBroken
      ? "Screen is broken — this project needs a working display."
      : "Beautiful OLED/LCD display in a handmade frame. Load photos via WiFi or USB. Always-on via wall power.",
    requiredParts: ["Picture Frame or Custom Wood Frame", "USB Charger", "Velcro or Mounting Brackets", "Photo Slideshow App"],
    sourceUrl: "https://www.youtube.com/results?search_query=old+phone+digital+photo+frame+DIY",
  });

  // Re-sort after adding creative builds
  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  thoughts.push(
    thought(
      `Synthesis complete. Generated ${recommendations.length} recommendations.`
    )
  );
  thoughts.push(thought("Generating shopping list and difficulty ratings..."));
  thoughts.push(thought("Done. Delivering results."));

  return { recommendations, thoughts };
}

// ─── Real Scraper Proxy ──────────────────────────────────────────────────────

const SCRAPER_URL = process.env.SCRAPER_URL || "http://localhost:8000";
const SCRAPER_TIMEOUT = 90_000; // 90 seconds

interface ScraperRec {
  id?: string;
  title?: string;
  type?: string;
  description?: string;
  difficulty?: string;
  compatibilityScore?: number;
  reasoning?: string;
  requiredParts?: string[];
  sourceUrl?: string;
  steps?: { stepNumber: number; description: string; imageUrl?: string }[];
  platform?: string;
}

function normalizeScraperResponse(data: {
  thoughts?: { timestamp: number; message: string }[];
  recommendations?: ScraperRec[];
  searchQueries?: string[];
  deviceSummary?: string;
  disassemblyUrl?: string;
}): ResearchResponse {
  const recommendations: ProjectRecommendation[] = (
    data.recommendations ?? []
  ).map((rec) => ({
    id: rec.id || uid(),
    title: rec.title || "Untitled Project",
    type:
      rec.type === "Hardware Harvest"
        ? ("Hardware Harvest" as const)
        : rec.type === "Creative Build"
          ? ("Creative Build" as const)
          : ("Software" as const),
    description: rec.description || "",
    difficulty: (
      ["Beginner", "Intermediate", "Expert"].includes(rec.difficulty || "")
        ? rec.difficulty!
        : "Intermediate"
    ) as "Beginner" | "Intermediate" | "Expert",
    compatibilityScore: Math.min(
      100,
      Math.max(0, rec.compatibilityScore ?? 50)
    ),
    reasoning: rec.reasoning || "",
    requiredParts: rec.requiredParts ?? [],
    sourceUrl: rec.sourceUrl || "",
    steps: rec.steps ?? [],
    platform: rec.platform ?? "Web",
  }));

  return {
    thoughts: data.thoughts ?? [],
    recommendations,
    searchQueries: data.searchQueries ?? [],
    deviceSummary: data.deviceSummary ?? "",
    disassemblyUrl: data.disassemblyUrl ?? "",
  };
}

async function tryRealScraper(
  request: ResearchRequest
): Promise<ResearchResponse | null> {
  try {
    // Quick health check (2s timeout)
    const healthController = new AbortController();
    const healthTimer = setTimeout(() => healthController.abort(), 2000);
    const healthRes = await fetch(`${SCRAPER_URL}/health`, {
      signal: healthController.signal,
    });
    clearTimeout(healthTimer);

    if (!healthRes.ok) return null;

    const health = await healthRes.json();
    if (!health.groq_configured) return null;

    // Call the real scraper
    const scrapeController = new AbortController();
    const scrapeTimer = setTimeout(() => scrapeController.abort(), SCRAPER_TIMEOUT);
    const res = await fetch(`${SCRAPER_URL}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: scrapeController.signal,
    });
    clearTimeout(scrapeTimer);

    if (!res.ok) return null;

    const data = await res.json();
    return normalizeScraperResponse(data);
  } catch {
    // Scraper unavailable — fall through to mock
    return null;
  }
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ResearchRequest = await req.json();
    const { deviceName, conditions, mode } = body;

    if (!deviceName || deviceName.trim().length === 0) {
      return NextResponse.json(
        { error: "Device name is required." },
        { status: 400 }
      );
    }

    // ── Attempt real scraper first ────────────────────────────────────────
    const scraperResponse = await tryRealScraper(body);
    if (scraperResponse) {
      return NextResponse.json(scraperResponse);
    }

    // ── Fallback to mock pipeline ─────────────────────────────────────────

    // Phase 1 — Formulate queries
    const { queries, thoughts: queryThoughts } = formulateQueries(
      deviceName,
      conditions ?? [],
      mode ?? "Standard"
    );

    // Phase 2 — Mock web search
    const { results, thoughts: searchThoughts } = searchWeb(queries);

    // Phase 3 — Synthesize into recommendations
    const { recommendations, thoughts: synthThoughts } =
      synthesizeRecommendations(deviceName, conditions ?? [], mode ?? "Standard", results);

    const allThoughts = [
      thought("[Fallback] Live scraper unavailable, using cached demo data..."),
      ...queryThoughts,
      ...searchThoughts,
      ...synthThoughts,
    ];

    const response: ResearchResponse = {
      thoughts: allThoughts,
      recommendations,
      searchQueries: queries,
      deviceSummary: `${deviceName} with ${
        conditions.length > 0 ? conditions.join(", ") : "no reported issues"
      } — Mode: ${mode}`,
      disassemblyUrl: "",
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
