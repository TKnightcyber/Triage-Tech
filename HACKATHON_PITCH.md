# DeviceRevive — Hackathon Pitch Document

> **Tagline:** *Don't Trash It. Transform It.*
> **Team:** Triage Tech | **Repository:** [github.com/TKnightcyber/Triage-Tech](https://github.com/TKnightcyber/Triage-Tech)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Our Solution — DeviceRevive](#2-our-solution--devicerevive)
3. [Key Features](#3-key-features)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [AI / ML Capabilities](#6-ai--ml-capabilities)
7. [How It Works — User Flow](#7-how-it-works--user-flow)
8. [Scoring Algorithm](#8-scoring-algorithm)
9. [Eco-Exchange — AI-Powered Trade-In Valuation](#9-eco-exchange--ai-powered-trade-in-valuation)
10. [Sustainability & Environmental Impact](#10-sustainability--environmental-impact)
11. [Security & Reliability](#11-security--reliability)
12. [Scalability](#12-scalability)
13. [Unique Selling Points (USPs)](#13-unique-selling-points-usps)
14. [Business Model / Monetization Potential](#14-business-model--monetization-potential)
15. [Future Roadmap](#15-future-roadmap)
16. [API Endpoint Reference](#16-api-endpoint-reference)
17. [Data Models](#17-data-models)
18. [Demo Script](#18-demo-script)
19. [Anticipated Q&A from Judges](#19-anticipated-qa-from-judges)

---

## 1. Problem Statement

### The E-Waste Crisis

- **62 million tonnes** of e-waste were generated globally in 2022 (UN Global E-Waste Monitor 2024), projected to hit **82 million tonnes by 2030**.
- Only **22.3%** of e-waste is formally collected and recycled.
- E-waste contains **toxic materials** (lead, mercury, cadmium, brominated flame retardants) that leach into groundwater and soil.
- A single smartphone contains **~70 elements** from the periodic table; mining replacements causes deforestation, water pollution, and human rights violations.
- Indians alone generate **3.2 million tonnes** of e-waste annually (third-largest globally), with recycling rates below 5%.

### The Real Problem

Most people throw away devices because:
1. **They don't know what else to do** — they can't imagine a use for a phone with a broken screen or a laptop with a dead battery.
2. **Trade-in programs are confusing** — dozens of retailers with different offers, unclear eligibility.
3. **DIY repair/repurpose guides are scattered** — across YouTube, Reddit, GitHub, Instructables, with no way to filter by *what's actually broken*.

**DeviceRevive solves all three.**

---

## 2. Our Solution — DeviceRevive

DeviceRevive is an **AI-powered platform** that takes a broken or outdated electronic device and:

1. **Searches the entire web** (6 platforms simultaneously) for real repurposing projects — filtered by the device's *exact broken components*.
2. **Generates AI creative build ideas** — beyond "install Linux" — suggesting physical transformations like converting a broken laptop screen into a portable monitor.
3. **Provides trade-in valuations** with real retailer partner links (Amazon, Best Buy, Apple, Samsung, etc.).
4. **Identifies unknown devices** from photos using computer vision — so even "I found this in a drawer" users can get help.
5. **Calculates environmental impact** — showing exactly how much CO₂ and e-waste is saved.

---

## 3. Key Features

### 3.1 Multi-Source Intelligent Web Scraping
- Scrapes **6 specialized platforms** concurrently: YouTube, Reddit, GitHub, Instructables/Hackaday/iFixit, General Web, Creative DIY channels
- **Condition-aware query formulation**: If the screen is broken → searches for "headless server" projects. If the battery is dead → searches for "wall-powered" setups.
- Each scraper is a specialized class that extracts structured data (title, URL, platform, description, steps).

### 3.2 AI Creative Builds ("Second Life Hardware Architect")
- LLM generates **4–6 spec-aware creative project ideas** per device
- Enforces strict engineering constraints:
  - **Headless Rule** — Broken screen? All projects must use SSH/ADB/Web-UI control
  - **Tethered Rule** — Dead battery? All projects assume permanent wall power
  - **Power Rule** — Dead charging port AND battery? Only component harvesting or wireless-charging mods
  - **Sensor Rule** — Dead camera → no vision projects; Dead speaker → no audio projects
- Returns feasibility scores, required parts, difficulty levels, and step-by-step instructions

### 3.3 AI Fallback Generator
- When web scraping returns **zero** results, a separate LLM call generates **5–8 diverse project ideas**
- Mix of Software, Hardware Harvest, and Creative Build types
- Guarantees users **always** get actionable recommendations

### 3.4 Eco-Exchange Valuation Engine
- AI grades condition from **A to F** with stacking multiplicative penalties
- Estimates **resale value** (eBay/Swappa-calibrated) and **scrap parts value**
- Generates **3 real-world trade-in offers** from Amazon, Best Buy, Apple, Samsung, Google, Dell, Gazelle, Back Market — with real URLs
- **"Golden Rule"**: Coupon values are 20–40% higher than scrap cash to incentivize recycling

### 3.5 AI Vision — Device Identification
- Upload **1–3 photos** → AI identifies brand, model, device type, and visual condition
- Returns confidence rating (High/Medium/Low)
- Available in **both** the main search section and Eco-Exchange section

### 3.6 AI Vision — Condition Assessment
- Analyzes photos for physical damage: cracks, dents, scratches, screen state, port/button damage
- Returns **cosmetic grade** (Pristine/Good/Fair/Poor/Damaged) + detected issues list
- Merged into Eco-Exchange valuation for more accurate pricing

### 3.7 iFixit Disassembly Manual Finder
- Automatically finds the official iFixit teardown/disassembly guide for the device
- Runs concurrently with all other tasks

### 3.8 Sustainability Scoring Engine
- Calculates **CO₂ saved** per device type
- Estimates **lifespan extension** (2–4 years)
- **Gamified badge system**: Beginner → Sustainability Starter → Green Hero → Eco Champion

### 3.9 Multi-Device Type Support
- **5 main types**: Smartphone, Laptop, Tablet, Desktop, Other
- **7 appliance sub-types**: Fridge, TV, Washing Machine, AC, Microwave, Printer, Other Appliance
- Each with **6–8 device-specific condition toggles**

### 3.10 Dual Research Modes
- **Standard** — Software repurposing + creative reuse projects
- **Teardown/Harvest** — Component harvesting, pinout identification, parts-for-robotics/Arduino

### 3.11 Free-Text Condition Notes
- Users can describe their device's condition in natural language beyond toggle options
- Notes are wired through the entire pipeline: query generation → web scraping → AI recommendations
- AI identify results auto-fill this field with detected visual conditions

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND — Next.js 16 (React 19)               │
│          TypeScript · Tailwind CSS 4 · Lucide Icons             │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Device Input    │  │  Eco Exchange    │  │ Results View  │  │
│  │  Panel           │  │  Landing         │  │ (3 tabs)      │  │
│  │  • Name/Type     │  │  • Valuation     │  │ • Software    │  │
│  │  • Conditions    │  │  • Trade-Ins     │  │ • Creative    │  │
│  │  • Specs (RAM,   │  │  • Vision Upload │  │ • Hardware    │  │
│  │    Storage)      │  │  • AI Identify   │  │ • Eco Report  │  │
│  │  • Notes         │  │  • INR Pricing   │  │ • iFixit Link │  │
│  │  • Photos        │  │                  │  │ • CO₂ Stats   │  │
│  │  • AI Identify   │  │                  │  │               │  │
│  └────────┬────────┘  └────────┬─────────┘  └───────────────┘  │
│           │                     │                                │
│  ┌────────▼─────────────────────▼────────────────────────────┐  │
│  │          Next.js API Routes (Proxy Layer)                 │  │
│  │  /api/research  ·  /api/eco-valuation  ·  /api/identify   │  │
│  │  Health-check → Proxy OR Mock Fallback                    │  │
│  └────────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────┘
                                │ HTTP (localhost:8000)
┌───────────────────────────────▼─────────────────────────────────┐
│                  BACKEND — Python FastAPI + Uvicorn              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Pipeline Orchestrator                   │   │
│  │                  (asyncio.gather — 9 tasks)               │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │              Web Scrapers (6×)                    │    │   │
│  │  │  YouTube · Reddit · GitHub · Instructables       │    │   │
│  │  │  General Web · Creative DIY                      │    │   │
│  │  │  (via DuckDuckGo subprocess isolation)            │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │  ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐  │   │
│  │  │ AI Creative     │ │ Eco-Exchange │ │ iFixit       │  │   │
│  │  │ Builds          │ │ Valuation    │ │ Finder       │  │   │
│  │  │ (Groq LLM)     │ │ (Groq LLM)  │ │ (DuckDuckGo) │  │   │
│  │  └─────────────────┘ └──────────────┘ └──────────────┘  │   │
│  │                                                           │   │
│  │  Post-Processing: Dedup → Score → Classify → Rank        │   │
│  │  Fallback: AI Generator if 0 results                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            AI Vision Module (Groq Vision API)            │    │
│  │  • identify_device_from_images()                         │    │
│  │  • analyze_device_images()                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────┬───────────────────────────┘
                   │                  │
    ┌──────────────▼──┐     ┌────────▼──────────┐
    │  Groq Cloud API  │     │  DuckDuckGo Web   │
    │  • Text LLM      │     │  (6 platforms)    │
    │  • Vision LLM    │     │                    │
    └─────────────────┘     └────────────────────┘
```

---

## 5. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | Full-stack React framework, API routes |
| React | 19.2.3 | UI components, state management |
| TypeScript | ^5 | Type safety across frontend |
| Tailwind CSS | ^4 | Utility-first responsive styling |
| Lucide React | ^0.564.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Core backend language |
| FastAPI | ≥0.115.0 | High-performance async API framework |
| Uvicorn | ≥0.34.0 | ASGI server |
| Pydantic | ≥2.0 | Data validation & serialization |
| httpx | ≥0.27.0 | Async HTTP client for Groq API |
| ddgs | ≥9.0.0 | DuckDuckGo search library |
| python-dotenv | ≥1.0.0 | Environment variable management |

### AI / Machine Learning
| Service | Model | Use Case |
|---|---|---|
| Groq Cloud (Text) | `llama-3.3-70b-versatile` | Creative builds, fallback, valuations |
| Groq Cloud (Vision) | `meta-llama/llama-4-scout-17b-16e-instruct` | Device identification, condition analysis |

### Infrastructure
| Tool | Purpose |
|---|---|
| Git + GitHub | Version control |
| `.env` files | Secret management |
| `start.bat` / `start.ps1` | One-click startup scripts |

---

## 6. AI / ML Capabilities

### 6.1 LLM Text Generation (Groq)

| Module | Model | Temp | Max Tokens | Role |
|---|---|---|---|---|
| Creative AI | `llama-3.3-70b-versatile` | 0.7 | 4096 | Generate spec-aware creative build projects |
| AI Fallback | `llama-3.3-70b-versatile` | 0.7 | 4096 | Generate fallback recommendations |
| Eco Valuation | `llama-3.3-70b-versatile` | 0.6 | 2048 | Condition grading, pricing, trade-in offers |

**Key Design Decisions:**
- All LLM outputs are **structured JSON** with strict schema enforcement
- Automatic markdown code fence stripping (`json` block extraction)
- Domain-specific system prompts with engineering constraints
- Every AI call is wrapped in try/except for graceful degradation

### 6.2 Computer Vision (Groq Vision)

| Module | Model | Temp | Max Tokens | Role |
|---|---|---|---|---|
| Device Identify | `llama-4-scout-17b-16e-instruct` | 0.3 | 1024 | Identify brand/model/type from photos |
| Condition Analyze | `llama-4-scout-17b-16e-instruct` | 0.3 | 1024 | Assess physical condition from photos |

**Vision Architecture:**
- Accepts up to **3 base64-encoded images** per request
- Uses `image_url` content blocks with `detail: "high"` for maximum analysis quality
- System prompt embedded as text content part (required for Llama 4 Scout compatibility)
- Returns structured JSON: confidence level, identified brand/model, cosmetic grade, detected issues

### 6.3 Prompt Engineering Highlights

**Creative AI Prompt — "Second Life Hardware Architect":**
- Receives device name, conditions, working RAM/storage
- Applies 4 hard rules (Headless, Tethered, Power, Sensor) based on broken components
- Generates 4–6 projects with: title, description, difficulty, feasibility score, required parts, step-by-step instructions
- Each project has a `reasoning` field explaining why it works for this specific device

**Eco Valuation Prompt — "Fair Market Valuation Expert":**
- Maps each condition to a penalty multiplier (0.25–0.65)
- Stacks penalties multiplicatively (e.g., broken screen × dead battery = severe)
- Follows the "Golden Rule" for coupon vs. cash pricing

---

## 7. How It Works — User Flow

### Flow A: Main Research Pipeline

```
1. User enters device name (e.g., "Samsung Galaxy S10")
   OR uploads photos → AI identifies it → auto-fills form

2. User selects device type → sees type-specific condition toggles

3. User toggles broken components (Screen, Battery, Touch, etc.)
   + optionally adds free-text condition notes
   + optionally provides RAM/Storage specs

4. User selects mode (Standard or Teardown/Harvest)

5. User clicks "Find Revival Projects"

6. Animated terminal shows real-time progress:
   Phase 1 — "Formulating research queries..."
   Phase 2 — "Searching YouTube for video tutorials..."
   Phase 3 — "Analyzing and scoring 47 results..."
   Phase 4 — "Synthesis complete. 15 recommendations ready."

7. Results appear in 3 tabs:
   • Software — OS installs, server setups, dashboards
   • Creative Builds — Physical mods, DIY Perks-style projects
   • Hardware Harvest — Component extraction, Arduino/robotics

8. Each project card shows:
   • Compatibility Score (0–100 with color bar)
   • Difficulty badge (Beginner/Intermediate/Expert)
   • "Why this works" reasoning
   • Step-by-step instructions (expandable)
   • Required parts list
   • Source link

9. Sidebar shows:
   • Eco valuation summary (INR pricing)
   • 3 clickable trade-in offers
   • iFixit disassembly link
   • CO₂ saved badge
```

### Flow B: Eco-Exchange

```
1. User scrolls to Eco Exchange section

2. Selects device type → type-specific conditions appear

3. Optionally uploads photos → AI analyzes condition

4. Clicks "Get Eco Valuation"

5. Receives:
   • Condition Grade (A–F)
   • Estimated Resale Value (₹)
   • Estimated Scrap Cash Value (₹)
   • 3 Trade-In Offers (clickable cards with real retailer URLs)
   • Environmental impact message
```

### Flow C: AI Device Identification

```
1. User clicks "Don't know your device?"
2. Uploads 1–3 photos
3. AI returns: Brand, Model, Device Type, Description, Confidence
4. User reviews → clicks "Use This Device" → auto-fills all form fields
5. OR clicks "Continue as Unknown" if identification seems wrong
```

---

## 8. Scoring Algorithm

### Compatibility Score (0–100)

Each project recommendation receives a score based on how well it matches the user's device and its broken conditions.

**Base Score: 65 points**

| Factor | Score Change | Logic |
|---|---|---|
| Device name appears in project text | +10 | Direct relevance match |
| ≥3 step-by-step instructions | +8 | Well-documented project |
| ≥1 step-by-step instruction | +4 | Has some documentation |
| Has required parts listed | +3 | Feasibility indicator |
| Platform = GitHub | +3 | Open-source, verifiable |
| Platform = YouTube + has steps | +5 | Video tutorial quality |
| **Screen Broken** + headless/server project | +12 | Perfect fit |
| **Screen Broken** + needs display | −10 | Incompatible |
| **Dead Battery** + wall-powered project | +8 | Works without battery |
| **Dead Battery** + portable project | −8 | Incompatible |
| **Touch Broken** + ADB/headless project | +10 | Workaround available |
| **Touch Broken** + needs touchscreen | −10 | Incompatible |
| **Dead Camera** + camera-based project | −15 | Hardware missing |
| **Broken Speaker** + audio project | −10 | Hardware missing |

**AI Creative Builds Scoring:**
- LLM returns `feasibility_score` (1–10), mapped to 60–100 range
- +5 bonus for ≥3 documented steps
- Minimum score of 70 for AI-generated fallback projects

**Deduplication:**
- Sequence matching with **0.75 similarity threshold** on titles (case-insensitive)
- Prevents duplicate projects from different scrapers

**Result Curation:**
- Up to **6 slots** reserved for AI Creative Builds
- Remaining **14 slots** filled by top web-scraped results
- Final sort: `compatibilityScore` descending
- Maximum **20 recommendations** returned

---

## 9. Eco-Exchange — AI-Powered Trade-In Valuation

### Condition Grading System

| Grade | Meaning | Example |
|---|---|---|
| **A** | Like New | Minor cosmetic wear only |
| **B** | Good | One minor issue (e.g., battery at 80%) |
| **C** | Fair | 1–2 moderate issues |
| **D** | Poor | Multiple significant issues |
| **E** | Very Poor | Mostly non-functional |
| **F** | Parts Only | Major components non-functional |

### Pricing Model

- **Resale Value**: eBay/Swappa-calibrated estimate in INR
- **Scrap/Parts Value**: 30–50% of resale value
- **Condition Penalties**: Stacking multiplicative (e.g., broken screen = ×0.35, dead battery = ×0.50 → combined = ×0.175)
- **Currency**: Server-side USD→INR conversion (×83.5)

### Trade-In Offer Generation

3 real-world offers from rotating pool of partners:
- Amazon Trade-In, Best Buy, Apple Trade In, Samsung Trade-In, Google Store, Dell Refurbished, Gazelle, Back Market
- Each offer includes: partner name, offer type ("Store Credit", "Gift Card"), headline, monetary value cap, real coupon URL, reasoning
- **Golden Rule**: Coupon values are 20–40% higher than scrap cash — incentivizing recycling over landfill

### Vision-Enhanced Valuation

When users upload photos:
1. AI Vision analyzes physical condition (cracks, dents, scratches, screen clarity)
2. Returns cosmetic grade + detected issues
3. Vision assessment is **merged** with toggle-based conditions
4. Produces more accurate valuation than self-reporting alone

---

## 10. Sustainability & Environmental Impact

### CO₂ Savings Calculator

| Device Type | Manufacturing CO₂ | Reuse Factor | CO₂ Saved |
|---|---|---|---|
| Laptop | 200 kg | 0.4 | **80 kg** |
| Smartphone | 70 kg | 0.4 | **28 kg** |
| Tablet | 100 kg | 0.4 | **40 kg** |
| Other | 120 kg | 0.4 | **48 kg** |

### Lifespan Extension
- Each successful repurpose extends device life by **2–4 years**
- Prevents mining of 70+ rare earth elements per device

### Gamified Badge System

| CO₂ Saved | Badge | Icon |
|---|---|---|
| 0–49 pts | Beginner | 🌱 |
| 50–99 pts | Sustainability Starter | 🥈 |
| 100–199 pts | Green Hero | 🥇 |
| 200+ pts | Eco Champion | 🏆 |

### Eco-Messaging
Each valuation includes a personalized eco message:
> *"Recycling this device recovers 35g of copper, 1g of gold, and prevents 28kg of CO₂ emissions"*

### Alignment with UN SDGs
- **SDG 12**: Responsible Consumption and Production
- **SDG 13**: Climate Action
- **SDG 9**: Industry, Innovation and Infrastructure

---

## 11. Security & Reliability

| Measure | Implementation |
|---|---|
| **CORS Restriction** | Backend only accepts requests from `localhost:3000` and `127.0.0.1:3000` |
| **API Key Protection** | `GROQ_API_KEY` stored in `.env`, never exposed to frontend or API responses |
| **Input Validation** | All request bodies validated via Pydantic models with type constraints |
| **Image Cap** | Vision endpoints limited to 3 images to prevent token overflow & abuse |
| **Timeout Protection** | Layered timeouts: 30s (vision), 60s (per-scraper), 90s (proxy), 120s (overall pipeline) |
| **Base64 Sanitization** | Image data strips `data:` prefix before forwarding to prevent injection |
| **Error Masking** | Frontend receives generic error messages; detailed errors stay server-side |
| **Health Check Safety** | `/health` returns boolean `groq_configured` but never the actual API key |
| **Graceful Degradation** | Three-tier fallback: Real scraper → Mock pipeline → Error state |

---

## 12. Scalability

| Aspect | Approach |
|---|---|
| **Concurrency** | `asyncio.gather` runs 9 tasks in parallel (6 scrapers + 3 AI tasks) |
| **Process Isolation** | DuckDuckGo searches run in separate subprocesses to avoid event-loop deadlocks |
| **Configurable Limits** | `MAX_RESULTS_PER_SOURCE` (5), `SCRAPER_TIMEOUT` (120s), adjustable via `.env` |
| **Result Capping** | Max 20 recommendations returned per request |
| **Stateless Design** | No database, no sessions — every request is self-contained → horizontal scaling ready |
| **Environment-Based Config** | All keys, timeouts, and limits configurable without code changes |
| **Query Capping** | Each scraper processes max 3–4 queries to bound search volume |

### Production Deployment Path
- **Frontend**: Deploy to Vercel (zero-config Next.js hosting)
- **Backend**: Containerize with Docker, deploy to AWS ECS / Google Cloud Run / Railway
- **Database** (future): Add Redis for caching frequent device queries, PostgreSQL for user accounts

---

## 13. Unique Selling Points (USPs)

| # | USP | Why It Matters |
|---|---|---|
| 1 | **"Zero results" is impossible** | Three-tier fallback (web scraping → AI creative builds → AI fallback) guarantees actionable output |
| 2 | **Condition-aware intelligence** | Every query, score, and recommendation adapts to exact broken components |
| 3 | **Hardware Architect rules engine** | Not generic AI — enforces Headless, Tethered, Power, and Sensor engineering constraints |
| 4 | **Real-world trade-in links** | Actual Amazon, Best Buy, Apple, Samsung trade-in URLs — not hypothetical offers |
| 5 | **Computer Vision pipeline** | Upload a photo → AI identifies device AND assesses damage → auto-fills everything |
| 6 | **"DIY Perks-style" creative builds** | Physical transformations (laptop screen → portable monitor, phone → Bluetooth speaker) |
| 7 | **Dual-mode demo architecture** | Works fully live OR falls back to rich mock data — demo never fails |
| 8 | **Multi-category support** | Phones, laptops, tablets, desktops, fridges, TVs, washing machines, ACs, printers |
| 9 | **Sustainability gamification** | CO₂ calculator + badge system drives continued engagement |
| 10 | **Transparent reasoning** | Every project card shows "Why this works for YOUR device" with condition-specific justifications |

---

## 14. Business Model / Monetization Potential

| Revenue Stream | Description |
|---|---|
| **Affiliate Commissions** | Earn commissions from trade-in partner links (Amazon, Best Buy, Gazelle, Back Market) |
| **Parts Marketplace** | Connect users needing parts with sellers (future feature) |
| **Premium Tier** | Unlimited scans, priority AI processing, saved device history |
| **B2B API** | License the valuation + recommendation API to e-waste recyclers, refurbishment companies |
| **Sustainability Certifications** | Partner with companies to offer "Green Device" badges for corporate ESG reporting |
| **Data Insights** | Anonymized aggregated data on device failure patterns → sell to manufacturers for QA improvement |

### Target Market
- **Primary**: DIY/maker community, tech-savvy individuals with broken devices
- **Secondary**: E-waste recyclers, refurbishment businesses, corporate IT departments
- **Tertiary**: Environmental organizations, government e-waste programs

### Market Size
- Global e-waste management market: **$72.5 billion** (2023), projected **$143 billion by 2030** (CAGR: 10.2%)
- Global refurbished electronics market: **$65.5 billion** (2023), projected **$140 billion by 2030**

---

## 15. Future Roadmap

| Phase | Timeline | Features |
|---|---|---|
| **Phase 1** (Current) | Hackathon | Core platform with all features described above |
| **Phase 2** | 1–3 months | User accounts, saved devices, history tracking |
| **Phase 3** | 3–6 months | Community marketplace (buy/sell broken parts), karma system |
| **Phase 4** | 6–12 months | Mobile app (React Native), barcode/QR scanning for instant device identification |
| **Phase 5** | 12+ months | B2B API for enterprise clients, integration with repair shops, AR-guided repair tutorials |

### Planned Technical Improvements
- **Redis caching** for frequent device queries (avoid redundant scraping)
- **PostgreSQL** for user accounts and device history
- **WebSocket** real-time progress streaming (replace polling)
- **Playwright-based scraping** for JavaScript-heavy sites
- **Multi-language support** (Hindi, Spanish, Mandarin) for global reach

---

## 16. API Endpoint Reference

### Python Backend (FastAPI — Port 8000)

| Method | Endpoint | Timeout | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/health` | — | — | `{status, groq_configured, timestamp}` |
| `POST` | `/scrape` | 120s | `ScrapeRequest` | `ScrapeResponse` (recommendations, eco valuation, thoughts) |
| `POST` | `/identify-device` | 30s | `DeviceIdentifyRequest` | `DeviceIdentifyResponse` (brand, model, type, confidence) |
| `POST` | `/eco-valuation` | 60s | `EcoValuationRequest` | `EcoValuation` (grades, pricing, trade-in offers) |

### Next.js API Routes (Port 3000)

| Method | Endpoint | Behavior |
|---|---|---|
| `POST` | `/api/research` | Health check → proxy to `/scrape` OR fall back to mock pipeline |
| `POST` | `/api/eco-valuation` | Proxy to `/eco-valuation` |
| `POST` | `/api/identify-device` | Proxy to `/identify-device` |

---

## 17. Data Models

### Core TypeScript Interfaces

```typescript
interface ResearchRequest {
  deviceName: string;
  conditions: string[];
  mode: 'standard' | 'teardown';
  deviceType?: string;
  appliance_type?: string;
  ramGB?: number;
  storageGB?: number;
  conditionNotes?: string;
}

interface ProjectRecommendation {
  id: string;
  title: string;
  type: 'Software' | 'Hardware Harvest' | 'Creative Build';
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  compatibilityScore: number;  // 0–100
  reasoning: string;
  requiredParts: string[];
  sourceUrl: string;
  steps: StepByStepInstruction[];
  platform: string;
}

interface EcoValuation {
  valuationSummary: ValuationSummary;
  tradeInOffers: TradeInOffer[];
}

interface DeviceIdentifyResponse {
  identifiedDevice: string;
  brand: string;
  model: string;
  deviceType: string;
  description: string;
  confidence: string;   // "High" | "Medium" | "Low"
  visualCondition: string;
}
```

### Core Pydantic Models (Python)

```python
class ScrapeRequest(BaseModel):
    deviceName: str
    conditions: List[str]
    mode: str = "standard"
    deviceType: str = ""
    appliance_type: str = ""
    ramGB: int = 0
    storageGB: int = 0
    conditionNotes: str = ""

class ProjectRecommendation(BaseModel):
    id: str
    title: str
    type: str
    description: str
    difficulty: str
    compatibility_score: int = Field(ge=0, le=100, alias="compatibilityScore")
    reasoning: str
    required_parts: List[str] = Field(alias="requiredParts")
    source_url: str = Field(alias="sourceUrl")
    steps: List[StepByStepInstruction]
    platform: str
```

---

## 18. Demo Script

### 2-Minute Demo Walkthrough

**Scene 1: The Problem (15s)**
> "I have a Samsung Galaxy S10 with a cracked screen and dead battery. Most people would throw this away. Let's not."

**Scene 2: AI Identification (20s)**
> *Upload photos of the phone* → AI identifies "Samsung Galaxy S10, Medium confidence. Visual condition: Cracked screen, scuffed corners" → Click "Use This Device"

**Scene 3: Condition Selection (15s)**
> Toggle "Cracked/Broken Screen" and "Battery Won't Hold Charge" → Add note "back glass also cracked" → Select Standard mode → Click "Find Revival Projects"

**Scene 4: Live Pipeline (30s)**
> Watch the animated terminal: "Searching YouTube...", "Scraping Reddit for community builds...", "AI generating creative projects..." → "15 recommendations ready!"

**Scene 5: Results (30s)**
> - **Software tab**: "Home automation hub (headless, SSH-controlled)" — Score: 92
> - **Creative tab**: "Convert to a dedicated Spotify streaming box with wall power" — Score: 88
> - **Hardware tab**: "Extract OLED panel + AMOLED driver board for custom display" — Score: 85
> Show the "Why this works" reasoning: "Screen broken → headless server mode via ADB/SSH. Battery dead → assumes wall power."

**Scene 6: Eco-Exchange (20s)**
> Scroll to Eco Exchange → See condition grade "D" → Resale: ₹2,500 → Scrap: ₹1,500 → Amazon Trade-In: ₹3,200 store credit → Click the real Amazon URL

**Scene 7: Impact (10s)**
> "By reviving this phone, we save 28kg of CO₂ and extend its life by 3 years. 🌱 Eco Champion badge unlocked."

---

## 19. Anticipated Q&A from Judges

### Technical Questions

**Q: How do you handle rate limiting from websites / DuckDuckGo?**
> Each DuckDuckGo search runs in an isolated subprocess with a 30-second timeout. We cap at 3 queries per scraper (max 18 total web searches). The subprocess isolation means even if one search hangs or gets rate-limited, it doesn't block the others. If all web searches fail, our AI Fallback generates recommendations from the LLM alone.

**Q: Why DuckDuckGo instead of Google?**
> DuckDuckGo provides a free, no-API-key-required search API through the `ddgs` Python package. Google Search requires a paid API key and has strict rate limits. For a hackathon prototype, DuckDuckGo provides adequate coverage across all 6 platforms.

**Q: Why Groq instead of OpenAI/Anthropic?**
> Groq offers **free API access** with generous rate limits, running Llama models on their custom LPU hardware at extremely low latency (~200ms for 70B model responses). This makes it ideal for a hackathon where cost is zero and speed matters for the live demo.

**Q: How accurate is the AI device identification?**
> The Llama 4 Scout vision model returns confidence levels (High/Medium/Low). In our testing, it correctly identifies brand and model for popular devices (iPhones, Samsung Galaxy, MacBooks) with High confidence. For less common devices, it may return Medium/Low confidence, and users can override or continue as "Unknown Device."

**Q: What happens if no projects are found?**
> Three-tier fallback: (1) Web scraping across 6 platforms → (2) AI Creative Builds (always generates 4–6 projects) → (3) AI Fallback Generator (generates 5–8 projects if web scraping returns zero). It's architecturally impossible to return zero recommendations.

**Q: How do you ensure the AI doesn't suggest impossible projects?**
> The "Second Life Hardware Architect" system prompt enforces 4 hard rules: Headless Rule (broken screen → SSH/ADB only), Tethered Rule (dead battery → wall power only), Power Rule (dead charging + battery → harvest only), Sensor Rule (dead camera → no vision projects). The scoring algorithm then **penalizes** web-scraped results that violate these rules (−10 to −15 points).

**Q: How does the scoring algorithm prevent irrelevant results?**
> Multi-factor scoring: base 65 + relevance bonuses (device name match, documentation quality, platform quality) + condition-aware adjustments (broken screen + headless project = +12; broken screen + display project = −10). Deduplication via SequenceMatcher at 0.75 threshold removes near-duplicates. Results are capped at 20, sorted by score.

**Q: Is there a database?**
> No. The current architecture is fully stateless — no database, no sessions. Every request is self-contained. This is intentional for hackathon simplicity and enables horizontal scaling. Future phases would add Redis (caching) and PostgreSQL (user accounts).

**Q: How is the Eco-Exchange pricing calibrated?**
> The LLM is prompted with real-world market references (eBay, Swappa, BackMarket pricing patterns). Condition penalties stack multiplicatively — each defect reduces value by 25–65%. Scrap value is 30–50% of resale. Trade-in coupon values are intentionally 20–40% higher than scrap cash (the "Golden Rule") to incentivize recycling.

### Product Questions

**Q: Who is your target user?**
> Primary: DIY makers and tech enthusiasts with broken devices who want creative repurpose ideas. Secondary: Everyday consumers who want to know the trade-in value of their old devices. Tertiary: E-waste recyclers needing automated condition assessment and valuation.

**Q: What's your competitive advantage over iFixit / YouTube search?**
> iFixit focuses on repair (restore to original function). YouTube search returns thousands of unranked results. DeviceRevive is the only platform that: (a) searches 6 platforms simultaneously, (b) filters by exact broken components, (c) scores results for feasibility, (d) generates creative builds beyond repair, (e) provides trade-in valuations, and (f) uses computer vision for device identification — all in one unified experience.

**Q: How do you ensure trade-in links are real / not broken?**
> We link to the landing pages of real trade-in programs (e.g., `amazon.com/tradein`, `apple.com/shop/trade-in`). These are stable institutional URLs that don't change frequently. The AI generates the correct URL for each partner from its training data.

**Q: What's the environmental impact at scale?**
> If 1% of India's 3.2 million tonnes annual e-waste is diverted through DeviceRevive (32,000 tonnes), that's equivalent to preventing **~1.3 million tonnes of CO₂** from new manufacturing. Each repurposed laptop saves 80kg CO₂; each phone saves 28kg.

**Q: Can this work for non-electronic items?**
> The architecture is extensible. Currently supports electronics + home appliances (fridge, TV, washing machine, AC, microwave, printer). The condition-toggle system can be extended to any device category by adding new condition sets and training queries.

### Business Questions

**Q: How would you monetize this?**
> (1) Affiliate commissions from trade-in partner links (Amazon, Best Buy, Gazelle earn 2–5% per transaction). (2) Premium tier for unlimited scans and saved device history. (3) B2B API licensing to e-waste recyclers and refurbishment companies. (4) Parts marketplace connecting buyers and sellers.

**Q: What's the market size?**
> Global e-waste management market: $72.5B (2023) → $143B by 2030. Refurbished electronics market: $65.5B → $140B by 2030. Combined, that's a $283B addressable market by 2030.

**Q: How do you acquire users?**
> (1) SEO — "what to do with broken iPhone" ranks millions of monthly searches globally. (2) Community — Reddit r/DIY, r/electronics, maker spaces. (3) Partnerships — e-waste recycling events, Right to Repair movement. (4) Content — share creative build ideas on social media with DeviceRevive attribution.

### Presentation Tips

**Q: What makes this different from just Googling "broken phone projects"?**
> "Try Googling that right now. You'll get 1.5 billion results with no way to filter by what's actually broken on YOUR phone. DeviceRevive understands that YOUR phone has a broken screen and dead battery, and only shows you headless, wall-powered projects — ranked by feasibility score. Plus, it generates creative builds that don't exist anywhere on the internet, and gives you trade-in offers with real prices."

---

## Appendix: Project File Map

```
second-life-matcher/
├── start.bat                 # One-click Windows startup
├── start.ps1                 # PowerShell startup script
├── package.json              # Node.js deps (Next.js 16, React 19)
├── types.ts                  # Shared TypeScript interfaces (117 lines)
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
├── postcss.config.mjs        # PostCSS + Tailwind
├── eslint.config.mjs         # ESLint config
│
├── app/
│   ├── page.tsx              # Main UI — single-page app (2176 lines)
│   ├── layout.tsx            # Root layout + metadata
│   ├── globals.css           # Global styles + Tailwind
│   └── api/
│       ├── research/
│       │   └── route.ts      # Proxy to /scrape + mock fallback (772 lines)
│       ├── eco-valuation/
│       │   └── route.ts      # Proxy to /eco-valuation
│       └── identify-device/
│           └── route.ts      # Proxy to /identify-device
│
├── utils/
│   └── sustainability.js     # CO₂ calculator, badges, scoring
│
└── scraper/
    ├── .env                  # API key (gitignored)
    ├── .env.example          # Template
    ├── requirements.txt      # Python deps
    ├── main.py               # FastAPI app + 4 endpoints (294 lines)
    ├── pipeline.py           # Orchestrator — 9 concurrent tasks (483 lines)
    ├── config.py             # Environment config + model names
    ├── schemas.py            # 12 Pydantic models (128 lines)
    ├── query_generator.py    # Per-platform query generation (144 lines)
    ├── creative_ai.py        # LLM creative builds generator
    ├── ai_fallback.py        # LLM fallback recommendations (124 lines)
    ├── eco_exchange.py       # LLM valuation + Vision analysis (456 lines)
    └── scrapers/
        ├── __init__.py       # Package init
        ├── base.py           # Abstract base scraper class
        ├── ddgs_helper.py    # DuckDuckGo subprocess isolation
        ├── youtube_scraper.py
        ├── reddit_scraper.py
        ├── github_scraper.py
        ├── instructables_scraper.py  # Instructables + Hackaday + iFixit
        ├── general_scraper.py
        └── creative_scraper.py       # DIY Perks-style channels
```

---

*Prepared for hackathon presentation by Team Triage Tech*
*Project: DeviceRevive — "Don't Trash It. Transform It."*
*Repository: [github.com/TKnightcyber/Triage-Tech](https://github.com/TKnightcyber/Triage-Tech)*
