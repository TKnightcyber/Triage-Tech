// ─── Device Condition Toggles ────────────────────────────────────────────────
export type DeviceCondition =
  | "Screen Broken"
  | "Bad Battery"
  | "Touch Broken"
  | "Camera Dead"
  | "Speaker Broken"
  | "No Charging Port";

// ─── Research Mode ───────────────────────────────────────────────────────────
export type ResearchMode = "Standard" | "Teardown/Harvest";

// ─── Device Type ─────────────────────────────────────────────────────────────
export type DeviceType =
  | "Smartphone"
  | "Laptop"
  | "Tablet"
  | "Desktop"
  | "Other";

// ─── API Request Payload ─────────────────────────────────────────────────────
export interface ResearchRequest {
  deviceName: string;
  conditions: DeviceCondition[];
  mode: ResearchMode;
  deviceType?: DeviceType;
  ramGB?: number;
  storageGB?: number;
}

// ─── Step-by-step instruction (from scraper) ─────────────────────────────────
export interface StepByStepInstruction {
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

// ─── Project Recommendation (strict output schema) ───────────────────────────
export interface ProjectRecommendation {
  id: string;
  title: string;
  type: "Software" | "Hardware Harvest" | "Creative Build";
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  compatibilityScore: number; // 0–100
  reasoning: string;
  requiredParts: string[];
  sourceUrl: string;
  steps?: StepByStepInstruction[];
  platform?: string; // "YouTube" | "Reddit" | "GitHub" | "Instructables" | "Web"
}

// ─── Thought-log entry streamed to the terminal UI ───────────────────────────
export interface ThoughtLogEntry {
  timestamp: number;
  message: string;
}

// ─── Full API Response ───────────────────────────────────────────────────────
export interface ResearchResponse {
  thoughts: ThoughtLogEntry[];
  recommendations: ProjectRecommendation[];
  searchQueries: string[];
  deviceSummary: string;
  disassemblyUrl?: string;
}

// ─── Simulated Tavily search result item ─────────────────────────────────────
export interface MockSearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

// ─── UI Phase State ──────────────────────────────────────────────────────────
export type ResearchPhase =
  | "idle"
  | "searching"
  | "analyzing"
  | "synthesizing"
  | "complete"
  | "error";
