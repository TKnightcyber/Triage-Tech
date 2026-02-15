import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this config file
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "groq/llama-3.3-70b-versatile"
GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
SCRAPER_TIMEOUT = int(os.getenv("SCRAPER_TIMEOUT", "120"))
MAX_RESULTS_PER_SOURCE = int(os.getenv("MAX_RESULTS_PER_SOURCE", "5"))


def get_graph_config() -> dict:
    """Returns the ScrapeGraphAI graph_config dict for Groq."""
    return {
        "llm": {
            "model": GROQ_MODEL,
            "api_key": GROQ_API_KEY,
            "temperature": 0.1,
        },
        "max_results": MAX_RESULTS_PER_SOURCE,
        "verbose": True,
        "headless": True,
    }
