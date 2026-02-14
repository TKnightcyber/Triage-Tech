# DeviceRevive

An AI-powered tool that finds creative revival projects for broken or old electronics. Enter your device info, and it searches the web (YouTube, Reddit, GitHub, Instructables) **and** generates AI-powered creative build ideas using Groq LLM.

## Prerequisites

- **Python 3.10+** — [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Groq API Key** (free) — [console.groq.com/keys](https://console.groq.com/keys)

## Quick Start (Windows)

1. **Get your Groq API key** from [console.groq.com/keys](https://console.groq.com/keys)

2. **Set up your API key:**
   ```
   copy scraper\.env.example scraper\.env
   ```
   Open `scraper\.env` in a text editor and replace `your_groq_api_key_here` with your actual key.

3. **Run the app — double-click `start.bat`**

   Or from terminal:
   ```powershell
   .\start.bat
   ```

   This will:
   - Create a Python virtual environment and install dependencies
   - Install Node.js dependencies
   - Start the backend (port 8000) and frontend (port 3000)
   - Open your browser to `http://localhost:3000`

## Manual Start

If you prefer to start things manually:

### Backend (Python)
```powershell
cd scraper
python -m venv ..\.venv
..\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```powershell
# In a separate terminal, from the project root:
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Project Structure

```
device-revive/
├── start.bat              # Double-click to start everything
├── start.ps1              # PowerShell startup script
├── package.json           # Node.js dependencies
├── types.ts               # Shared TypeScript types
├── app/
│   ├── page.tsx           # Main UI (React)
│   ├── layout.tsx         # App layout
│   ├── globals.css        # Styles
│   └── api/research/
│       └── route.ts       # Next.js API proxy → Python backend
└── scraper/
    ├── .env               # Your API key (not in repo)
    ├── .env.example       # Template for .env
    ├── requirements.txt   # Python dependencies
    ├── main.py            # FastAPI server entry point
    ├── pipeline.py        # Orchestrator: runs all scrapers + AI
    ├── config.py          # Environment config
    ├── schemas.py         # Pydantic models
    ├── creative_ai.py     # Groq LLM creative builds generator
    ├── ai_fallback.py     # AI fallback when web search fails
    ├── query_generator.py # Search query builder
    └── scrapers/
        ├── base.py            # Base scraper class
        ├── ddgs_helper.py     # DuckDuckGo search helper
        ├── youtube_scraper.py
        ├── reddit_scraper.py
        ├── github_scraper.py
        ├── general_scraper.py
        ├── creative_scraper.py
        └── instructables_scraper.py
```

## What It Does

1. **Software Revival** — Projects to repurpose your device with software (install Linux, run a server, etc.)
2. **Creative Builds** — Physical maker projects + AI-generated ideas (convert broken laptop into headless server, extract backlight for desk lamp, etc.)
3. **Hardware Harvest** — Teardown guides to extract reusable components

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** FastAPI, Python 3.10+
- **AI:** Groq API (Llama 3.3 70B)
- **Search:** DuckDuckGo (via ddgs package)
