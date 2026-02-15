from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal


# ─── Request / Response models (mirror TypeScript types) ──────────────────────

class ScrapeRequest(BaseModel):
    deviceName: str
    conditions: list[str] = []
    mode: str = "Standard"
    deviceType: str = "Smartphone"
    ramGB: int = 0
    storageGB: int = 0


class StepByStepInstruction(BaseModel):
    stepNumber: int
    description: str
    imageUrl: str | None = None


class ProjectRecommendation(BaseModel):
    id: str
    title: str
    type: Literal["Software", "Hardware Harvest", "Creative Build"]
    description: str
    difficulty: Literal["Beginner", "Intermediate", "Expert"]
    compatibilityScore: int = Field(ge=0, le=100)
    reasoning: str
    requiredParts: list[str] = []
    sourceUrl: str
    steps: list[StepByStepInstruction] = []
    platform: str = "Web"


class ThoughtLogEntry(BaseModel):
    timestamp: int
    message: str


class TradeInOffer(BaseModel):
    partner: str = ""
    offerType: str = "Discount Coupon"
    headline: str = ""
    monetaryValueCap: str = ""
    couponUrl: str = ""
    reasoning: str = ""


class ValuationSummary(BaseModel):
    deviceName: str = ""
    conditionGrade: str = "C"
    estimatedResaleUsd: int | float = 0
    estimatedResaleInr: int | float = 0
    estimatedScrapCashUsd: int | float = 0
    estimatedScrapCashInr: int | float = 0
    ecoMessage: str = ""


class EcoValuation(BaseModel):
    valuationSummary: ValuationSummary | None = None
    tradeInOffers: list[TradeInOffer] = []


class EcoValuationRequest(BaseModel):
    """Standalone eco-valuation request (for landing page)."""
    deviceName: str
    conditions: list[str] = []
    additionalNotes: str = ""
    deviceType: str = "Smartphone"
    ramGB: int = 0
    storageGB: int = 0
    images: list[str] = Field(default_factory=list, description="Base64-encoded device images for AI vision analysis")


class ScrapeResponse(BaseModel):
    thoughts: list[ThoughtLogEntry]
    recommendations: list[ProjectRecommendation]
    searchQueries: list[str]
    deviceSummary: str
    disassemblyUrl: str = ""
    ecoValuation: EcoValuation | None = None


# ─── Schema for ScrapeGraphAI structured extraction ──────────────────────────

class ScrapedProject(BaseModel):
    """Schema given to ScrapeGraphAI so it returns structured data."""
    title: str = Field(description="Project title or video title")
    description: str = Field(description="Brief project description (2-3 sentences)")
    source_url: str = Field(description="Full URL to the original content")
    steps: list[str] = Field(
        default_factory=list,
        description="Step-by-step instructions if available",
    )
    required_parts: list[str] = Field(
        default_factory=list,
        description="Required parts, tools, or materials",
    )
    difficulty: str = Field(
        default="Intermediate",
        description="Beginner, Intermediate, or Expert",
    )


class ScrapedResults(BaseModel):
    """Wrapper for ScrapeGraphAI to return a list of projects."""
    projects: list[ScrapedProject] = []
