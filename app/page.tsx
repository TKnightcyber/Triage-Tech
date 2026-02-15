"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Monitor,
  MonitorOff,
  Battery,
  BatteryWarning,
  Fingerprint,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  PlugZap,
  Wrench,
  Recycle,
  Terminal,
  ChevronRight,
  Star,
  ShoppingCart,
  ExternalLink,
  RotateCcw,
  Cpu,
  Scissors,
  Leaf,
  AlertTriangle,
  Youtube,
  MessageSquare,
  Github,
  BookOpen,
  Globe,
  ListOrdered,
  Lightbulb,
  DollarSign,
  Gift,
  Tag,
  TrendingUp,
  Keyboard,
  Mouse,
  Fan,
  HardDrive,
  Usb,
  Thermometer,
  Power,
  Tv,
  Zap,
  Droplets,
  Lock,
  Settings,
  Wifi,
  Printer,
} from "lucide-react";
import type {
  DeviceCondition,
  DeviceType,
  ResearchMode,
  ResearchPhase,
  ResearchResponse,
  ProjectRecommendation,
  ThoughtLogEntry,
  EcoValuation,
  TradeInOffer,
} from "@/types";

// ─── Device Type Config ──────────────────────────────────────────────────────

const DEVICE_TYPES: { value: DeviceType; label: string; icon: React.ReactNode }[] = [
  { value: "Smartphone", label: "Smartphone", icon: <Cpu className="w-4 h-4" /> },
  { value: "Laptop", label: "Laptop", icon: <Monitor className="w-4 h-4" /> },
  { value: "Tablet", label: "Tablet", icon: <Monitor className="w-4 h-4" /> },
  { value: "Desktop", label: "Desktop", icon: <Cpu className="w-4 h-4" /> },
  { value: "Other", label: "Other", icon: <Wrench className="w-4 h-4" /> },
];

// ─── RAM / Storage presets ───────────────────────────────────────────────────

const RAM_OPTIONS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 32, 64];
const STORAGE_OPTIONS = [0, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

// ─── Condition Toggle Config (dynamic per device / appliance type) ───────────

type ConditionConfig = {
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
};

const SMARTPHONE_CONDITIONS: ConditionConfig[] = [
  { label: "Screen Broken", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
  { label: "Bad Battery", icon: <Battery className="w-5 h-5" />, activeIcon: <BatteryWarning className="w-5 h-5" /> },
  { label: "Touch Broken", icon: <Fingerprint className="w-5 h-5" />, activeIcon: <Fingerprint className="w-5 h-5 opacity-50" /> },
  { label: "Camera Dead", icon: <Camera className="w-5 h-5" />, activeIcon: <CameraOff className="w-5 h-5" /> },
  { label: "Speaker Broken", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
  { label: "No Charging Port", icon: <PlugZap className="w-5 h-5" />, activeIcon: <PlugZap className="w-5 h-5 opacity-50" /> },
];

const LAPTOP_CONDITIONS: ConditionConfig[] = [
  { label: "Screen Broken", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
  { label: "Bad Battery", icon: <Battery className="w-5 h-5" />, activeIcon: <BatteryWarning className="w-5 h-5" /> },
  { label: "Keyboard Broken", icon: <Keyboard className="w-5 h-5" />, activeIcon: <Keyboard className="w-5 h-5 opacity-50" /> },
  { label: "Trackpad Broken", icon: <Mouse className="w-5 h-5" />, activeIcon: <Mouse className="w-5 h-5 opacity-50" /> },
  { label: "Hinge Broken", icon: <Wrench className="w-5 h-5" />, activeIcon: <Wrench className="w-5 h-5 opacity-50" /> },
  { label: "No Charging Port", icon: <PlugZap className="w-5 h-5" />, activeIcon: <PlugZap className="w-5 h-5 opacity-50" /> },
  { label: "Fan Broken", icon: <Fan className="w-5 h-5" />, activeIcon: <Fan className="w-5 h-5 opacity-50" /> },
  { label: "Overheating", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
];

const TABLET_CONDITIONS: ConditionConfig[] = [
  { label: "Screen Broken", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
  { label: "Bad Battery", icon: <Battery className="w-5 h-5" />, activeIcon: <BatteryWarning className="w-5 h-5" /> },
  { label: "Touch Broken", icon: <Fingerprint className="w-5 h-5" />, activeIcon: <Fingerprint className="w-5 h-5 opacity-50" /> },
  { label: "Camera Dead", icon: <Camera className="w-5 h-5" />, activeIcon: <CameraOff className="w-5 h-5" /> },
  { label: "Speaker Broken", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
  { label: "No Charging Port", icon: <PlugZap className="w-5 h-5" />, activeIcon: <PlugZap className="w-5 h-5 opacity-50" /> },
];

const DESKTOP_CONDITIONS: ConditionConfig[] = [
  { label: "No Power", icon: <Power className="w-5 h-5" />, activeIcon: <Power className="w-5 h-5 opacity-50" /> },
  { label: "GPU Issues", icon: <Cpu className="w-5 h-5" />, activeIcon: <Cpu className="w-5 h-5 opacity-50" /> },
  { label: "Fan Broken", icon: <Fan className="w-5 h-5" />, activeIcon: <Fan className="w-5 h-5 opacity-50" /> },
  { label: "No Display Output", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
  { label: "Drive Failed", icon: <HardDrive className="w-5 h-5" />, activeIcon: <HardDrive className="w-5 h-5 opacity-50" /> },
  { label: "USB Ports Broken", icon: <Usb className="w-5 h-5" />, activeIcon: <Usb className="w-5 h-5 opacity-50" /> },
  { label: "RAM Issues", icon: <Cpu className="w-5 h-5" />, activeIcon: <Cpu className="w-5 h-5 opacity-50" /> },
  { label: "Overheating", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
];

// ─── Appliance types for "Other" ────────────────────────────────────────────

type ApplianceType = "Fridge" | "TV" | "Washing Machine" | "AC" | "Microwave" | "Printer" | "Other Appliance";

const APPLIANCE_TYPES: { value: ApplianceType; label: string; icon: React.ReactNode }[] = [
  { value: "Fridge", label: "Fridge", icon: <Thermometer className="w-4 h-4" /> },
  { value: "TV", label: "TV", icon: <Tv className="w-4 h-4" /> },
  { value: "Washing Machine", label: "Washing Machine", icon: <Droplets className="w-4 h-4" /> },
  { value: "AC", label: "AC", icon: <Fan className="w-4 h-4" /> },
  { value: "Microwave", label: "Microwave", icon: <Zap className="w-4 h-4" /> },
  { value: "Printer", label: "Printer", icon: <Printer className="w-4 h-4" /> },
  { value: "Other Appliance", label: "Other", icon: <Settings className="w-4 h-4" /> },
];

const APPLIANCE_CONDITIONS: Record<ApplianceType, ConditionConfig[]> = {
  Fridge: [
    { label: "Compressor Dead", icon: <Power className="w-5 h-5" />, activeIcon: <Power className="w-5 h-5 opacity-50" /> },
    { label: "Not Cooling", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
    { label: "Water Leak", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
    { label: "Ice Maker Broken", icon: <Wrench className="w-5 h-5" />, activeIcon: <Wrench className="w-5 h-5 opacity-50" /> },
    { label: "Door Seal Worn", icon: <Lock className="w-5 h-5" />, activeIcon: <Lock className="w-5 h-5 opacity-50" /> },
    { label: "Noisy Operation", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
  ],
  TV: [
    { label: "Screen Cracked", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
    { label: "No Display", icon: <MonitorOff className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5 opacity-50" /> },
    { label: "No Sound", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
    { label: "Remote Not Working", icon: <Wifi className="w-5 h-5" />, activeIcon: <Wifi className="w-5 h-5 opacity-50" /> },
    { label: "Backlight Failed", icon: <Lightbulb className="w-5 h-5" />, activeIcon: <Lightbulb className="w-5 h-5 opacity-50" /> },
    { label: "HDMI Ports Broken", icon: <Usb className="w-5 h-5" />, activeIcon: <Usb className="w-5 h-5 opacity-50" /> },
  ],
  "Washing Machine": [
    { label: "Won't Spin", icon: <RotateCcw className="w-5 h-5" />, activeIcon: <RotateCcw className="w-5 h-5 opacity-50" /> },
    { label: "Water Leak", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
    { label: "Won't Drain", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
    { label: "Noisy Operation", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
    { label: "Door Won't Lock", icon: <Lock className="w-5 h-5" />, activeIcon: <Lock className="w-5 h-5 opacity-50" /> },
    { label: "Control Panel Dead", icon: <Settings className="w-5 h-5" />, activeIcon: <Settings className="w-5 h-5 opacity-50" /> },
  ],
  AC: [
    { label: "Not Cooling", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
    { label: "Compressor Dead", icon: <Power className="w-5 h-5" />, activeIcon: <Power className="w-5 h-5 opacity-50" /> },
    { label: "Gas Leak", icon: <AlertTriangle className="w-5 h-5" />, activeIcon: <AlertTriangle className="w-5 h-5 opacity-50" /> },
    { label: "Noisy Operation", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
    { label: "Remote Not Working", icon: <Wifi className="w-5 h-5" />, activeIcon: <Wifi className="w-5 h-5 opacity-50" /> },
    { label: "Water Dripping", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
  ],
  Microwave: [
    { label: "Not Heating", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
    { label: "Turntable Broken", icon: <RotateCcw className="w-5 h-5" />, activeIcon: <RotateCcw className="w-5 h-5 opacity-50" /> },
    { label: "Door Won't Close", icon: <Lock className="w-5 h-5" />, activeIcon: <Lock className="w-5 h-5 opacity-50" /> },
    { label: "Display Dead", icon: <Monitor className="w-5 h-5" />, activeIcon: <MonitorOff className="w-5 h-5" /> },
    { label: "Sparking Inside", icon: <Zap className="w-5 h-5" />, activeIcon: <Zap className="w-5 h-5 opacity-50" /> },
    { label: "Buttons Unresponsive", icon: <Settings className="w-5 h-5" />, activeIcon: <Settings className="w-5 h-5 opacity-50" /> },
  ],
  Printer: [
    { label: "Paper Jam", icon: <Printer className="w-5 h-5" />, activeIcon: <Printer className="w-5 h-5 opacity-50" /> },
    { label: "Not Printing", icon: <Printer className="w-5 h-5" />, activeIcon: <Printer className="w-5 h-5 opacity-50" /> },
    { label: "Low Quality Print", icon: <AlertTriangle className="w-5 h-5" />, activeIcon: <AlertTriangle className="w-5 h-5 opacity-50" /> },
    { label: "Wi-Fi Issues", icon: <Wifi className="w-5 h-5" />, activeIcon: <Wifi className="w-5 h-5 opacity-50" /> },
    { label: "Scanner Broken", icon: <Camera className="w-5 h-5" />, activeIcon: <CameraOff className="w-5 h-5" /> },
    { label: "Ink Issues", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
  ],
  "Other Appliance": [
    { label: "No Power", icon: <Power className="w-5 h-5" />, activeIcon: <Power className="w-5 h-5 opacity-50" /> },
    { label: "Not Working", icon: <AlertTriangle className="w-5 h-5" />, activeIcon: <AlertTriangle className="w-5 h-5 opacity-50" /> },
    { label: "Noisy Operation", icon: <Volume2 className="w-5 h-5" />, activeIcon: <VolumeX className="w-5 h-5" /> },
    { label: "Physical Damage", icon: <Wrench className="w-5 h-5" />, activeIcon: <Wrench className="w-5 h-5 opacity-50" /> },
    { label: "Leaking", icon: <Droplets className="w-5 h-5" />, activeIcon: <Droplets className="w-5 h-5 opacity-50" /> },
    { label: "Overheating", icon: <Thermometer className="w-5 h-5" />, activeIcon: <Thermometer className="w-5 h-5 opacity-50" /> },
  ],
};

// Helper to get conditions for a device type (+ appliance type for "Other")
function getConditionsForDevice(
  deviceType: DeviceType,
  applianceType: ApplianceType | null
): ConditionConfig[] {
  switch (deviceType) {
    case "Smartphone": return SMARTPHONE_CONDITIONS;
    case "Laptop": return LAPTOP_CONDITIONS;
    case "Tablet": return TABLET_CONDITIONS;
    case "Desktop": return DESKTOP_CONDITIONS;
    case "Other": return applianceType ? APPLIANCE_CONDITIONS[applianceType] : [];
    default: return SMARTPHONE_CONDITIONS;
  }
}

// ─── Platform Icon Config ────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  YouTube:       { icon: <Youtube className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-500/15" },
  Reddit:        { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-500/15" },
  GitHub:        { icon: <Github className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-500/15" },
  Instructables: { icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-500/15" },
  Hackaday:      { icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-500/15" },
  iFixit:        { icon: <Wrench className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-500/15" },
  Web:           { icon: <Globe className="w-3.5 h-3.5" />, color: "text-zinc-400 bg-zinc-500/15" },
};

// ─── Difficulty badge helper ─────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Beginner: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    Intermediate: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    Expert: { bg: "bg-red-500/20", text: "text-red-400" },
  };
  const c = config[level] ?? config.Beginner;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}
    >
      {level}
    </span>
  );
}

// ─── Score ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-yellow-400"
        : "stroke-red-400";

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-zinc-700"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-200">
        {score}
      </span>
    </div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const platformCfg = PLATFORM_ICONS[project.platform ?? "Web"] ?? PLATFORM_ICONS.Web;

  const cardStyle =
    project.type === "Software"
      ? "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50"
      : project.type === "Creative Build"
        ? "border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/50"
        : "border-orange-500/30 bg-orange-950/20 hover:border-orange-500/50";

  const stepColor =
    project.type === "Creative Build"
      ? "bg-cyan-500/20 text-cyan-400"
      : project.type === "Hardware Harvest"
        ? "bg-orange-500/20 text-orange-400"
        : "bg-emerald-500/20 text-emerald-400";

  const bulletColor =
    project.type === "Creative Build"
      ? "bg-cyan-500"
      : project.type === "Hardware Harvest"
        ? "bg-orange-500"
        : "bg-emerald-500";

  const linkColor =
    project.type === "Creative Build"
      ? "text-cyan-400 hover:text-cyan-300"
      : project.type === "Hardware Harvest"
        ? "text-orange-400 hover:text-orange-300"
        : "text-emerald-400 hover:text-emerald-300";

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${cardStyle}`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <ScoreRing score={project.compatibilityScore} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-zinc-100 text-sm">
                {project.title}
              </h3>
              <DifficultyBadge level={project.difficulty} />
              {project.platform && (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${platformCfg.color}`}
                >
                  {platformCfg.icon}
                  {project.platform}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 mt-1 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Why this works
            </p>
            <p className="text-sm text-zinc-300">{project.reasoning}</p>
          </div>

          {project.steps && project.steps.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ListOrdered className="w-3 h-3" /> Step-by-Step Instructions
              </p>
              <ol className="space-y-2">
                {project.steps.map((step) => (
                  <li
                    key={step.stepNumber}
                    className="flex gap-3 text-sm text-zinc-300"
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${stepColor} flex items-center justify-center text-xs font-bold`}>
                      {step.stepNumber}
                    </span>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" /> Shopping List
            </p>
            <ul className="space-y-1">
              {project.requiredParts.map((part, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} flex-shrink-0`} />
                  {part}
                </li>
              ))}
            </ul>
          </div>

          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs ${linkColor} transition-colors`}
            >
              <ExternalLink className="w-3 h-3" />
              View Source
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  // Input State
  const [deviceName, setDeviceName] = useState("");
  const [conditions, setConditions] = useState<DeviceCondition[]>([]);
  const [mode, setMode] = useState<ResearchMode>("Standard");
  const [deviceType, setDeviceType] = useState<DeviceType>("Smartphone");
  const [ramGB, setRamGB] = useState(0);
  const [storageGB, setStorageGB] = useState(0);

  // Research State
  const [phase, setPhase] = useState<ResearchPhase>("idle");
  const [visibleThoughts, setVisibleThoughts] = useState<ThoughtLogEntry[]>([]);
  const [response, setResponse] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"software" | "creative" | "hardware">("software");

  // Eco Exchange State (landing page)
  const [ecoDevice, setEcoDevice] = useState("");
  const [ecoConditions, setEcoConditions] = useState<DeviceCondition[]>([]);
  const [ecoDeviceType, setEcoDeviceType] = useState<DeviceType>("Smartphone");
  const [ecoNotes, setEcoNotes] = useState("");
  const [ecoLoading, setEcoLoading] = useState(false);
  const [ecoResult, setEcoResult] = useState<EcoValuation | null>(null);
  const [ecoError, setEcoError] = useState<string | null>(null);

  // Appliance type state (for "Other" device type)
  const [applianceType, setApplianceType] = useState<ApplianceType | null>(null);
  const [ecoApplianceType, setEcoApplianceType] = useState<ApplianceType | null>(null);

  // Compute dynamic conditions for each section
  const currentConditions = getConditionsForDevice(deviceType, applianceType);
  const currentEcoConditions = getConditionsForDevice(ecoDeviceType, ecoApplianceType);

  const terminalRef = useRef<HTMLDivElement>(null);
  const thoughtIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allThoughtsRef = useRef<ThoughtLogEntry[]>([]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleThoughts]);

  // Condition toggle (main section)
  const toggleCondition = (c: DeviceCondition) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Eco condition toggle
  const toggleEcoCondition = (c: DeviceCondition) => {
    setEcoConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Handle device type change (main section) — clear conditions + appliance
  const handleDeviceTypeChange = (dt: DeviceType) => {
    setDeviceType(dt);
    setConditions([]);
    if (dt !== "Other") setApplianceType(null);
  };

  // Handle appliance type change (main section) — clear conditions
  const handleApplianceTypeChange = (at: ApplianceType) => {
    setApplianceType(at);
    setConditions([]);
  };

  // Handle device type change (eco section) — clear conditions + appliance
  const handleEcoDeviceTypeChange = (dt: DeviceType) => {
    setEcoDeviceType(dt);
    setEcoConditions([]);
    if (dt !== "Other") setEcoApplianceType(null);
  };

  // Handle appliance type change (eco section) — clear conditions
  const handleEcoApplianceTypeChange = (at: ApplianceType) => {
    setEcoApplianceType(at);
    setEcoConditions([]);
  };

  // Eco Exchange submit
  const handleEcoSubmit = async () => {
    if (!ecoDevice.trim()) return;
    setEcoLoading(true);
    setEcoError(null);
    setEcoResult(null);

    try {
      const res = await fetch("/api/eco-valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: ecoDevice,
          conditions: ecoConditions,
          additionalNotes: ecoNotes,
          deviceType: ecoDeviceType,
        }),
      });

      if (!res.ok) throw new Error("Valuation failed. Please try again.");

      const data: EcoValuation = await res.json();
      setEcoResult(data);
    } catch (err) {
      setEcoError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setEcoLoading(false);
    }
  };

  const handleEcoReset = () => {
    setEcoDevice("");
    setEcoConditions([]);
    setEcoDeviceType("Smartphone");
    setEcoApplianceType(null);
    setEcoNotes("");
    setEcoResult(null);
    setEcoError(null);
  };

  // Animate thoughts one-by-one
  const animateThoughts = useCallback(
    (thoughts: ThoughtLogEntry[], onDone: () => void) => {
      allThoughtsRef.current = thoughts;
      thoughtIndexRef.current = 0;
      setVisibleThoughts([]);

      timerRef.current = setInterval(() => {
        const idx = thoughtIndexRef.current;
        if (idx >= allThoughtsRef.current.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          onDone();
          return;
        }
        setVisibleThoughts((prev) => [...prev, allThoughtsRef.current[idx]]);
        thoughtIndexRef.current += 1;

        // Update phase label based on progress
        const progress = idx / allThoughtsRef.current.length;
        if (progress < 0.3) setPhase("searching");
        else if (progress < 0.7) setPhase("analyzing");
        else setPhase("synthesizing");
      }, 400);
    },
    []
  );

  // Submit research request
  const handleSubmit = async () => {
    if (!deviceName.trim()) return;

    setPhase("searching");
    setError(null);
    setResponse(null);
    setVisibleThoughts([]);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName, conditions, mode, deviceType, ramGB, storageGB }),
      });

      if (!res.ok) {
        throw new Error("Research failed. Please try again.");
      }

      const data: ResearchResponse = await res.json();

      // Animate the thought log then reveal results
      animateThoughts(data.thoughts, () => {
        setResponse(data);
        setPhase("complete");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setPhase("error");
    }
  };

  // Reset everything
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("idle");
    setDeviceName("");
    setConditions([]);
    setMode("Standard");
    setDeviceType("Smartphone");
    setApplianceType(null);
    setRamGB(0);
    setStorageGB(0);
    setResponse(null);
    setError(null);
    setVisibleThoughts([]);
    setActiveTab("software");
  };

  // Split recommendations
  const softwareProjects =
    response?.recommendations.filter((r) => r.type === "Software") ?? [];
  const hardwareProjects =
    response?.recommendations.filter((r) => r.type === "Hardware Harvest") ?? [];
  const creativeProjects =
    response?.recommendations.filter((r) => r.type === "Creative Build") ?? [];

  // Phase label
  const phaseLabel: Record<ResearchPhase, string> = {
    idle: "",
    searching: "Searching the web...",
    analyzing: "Analyzing results...",
    synthesizing: "Synthesizing recommendations...",
    complete: "Research complete",
    error: "Error occurred",
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-emerald-400">Device</span>Revive
              Matcher
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Green Computing Initiative</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* === SCREEN 1: Triage (Input) === */}
        {phase === "idle" && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Tagline */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Don&apos;t trash it.{" "}
                <span className="text-emerald-400">Transform it.</span>
              </h2>
              <p className="text-zinc-400">
                Enter your old device and we&apos;ll find creative ways to revive it — as a
                server, sensor hub, or organ donor for your next project.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="What device are we saving? (e.g., Galaxy S9, iPhone 8, Pixel 3)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-lg placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            {/* Device Type Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Device Type
              </label>
              <div className="flex flex-wrap gap-2">
                {DEVICE_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => handleDeviceTypeChange(value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      deviceType === value
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Appliance Type Selector (only when "Other" is selected) */}
            {deviceType === "Other" && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  What kind of appliance?
                </label>
                <div className="flex flex-wrap gap-2">
                  {APPLIANCE_TYPES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => handleApplianceTypeChange(value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        applianceType === value
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs: RAM + Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RAM Selector */}
              <div className="space-y-2 bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    RAM
                  </label>
                  <span className="text-sm font-bold text-emerald-400">
                    {ramGB === 0 ? "Unknown" : `${ramGB} GB`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={RAM_OPTIONS.length - 1}
                  value={RAM_OPTIONS.indexOf(ramGB)}
                  onChange={(e) => setRamGB(RAM_OPTIONS[parseInt(e.target.value)])}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="RAM in gigabytes"
                />
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>?</span>
                  <span>1</span>
                  <span>4</span>
                  <span>8</span>
                  <span>16</span>
                  <span>64</span>
                </div>
              </div>

              {/* Storage Selector */}
              <div className="space-y-2 bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Storage
                  </label>
                  <span className="text-sm font-bold text-emerald-400">
                    {storageGB === 0 ? "Unknown" : storageGB >= 1024 ? `${storageGB / 1024} TB` : `${storageGB} GB`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={STORAGE_OPTIONS.length - 1}
                  value={STORAGE_OPTIONS.indexOf(storageGB)}
                  onChange={(e) => setStorageGB(STORAGE_OPTIONS[parseInt(e.target.value)])}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="Storage in gigabytes"
                />
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>?</span>
                  <span>16</span>
                  <span>64</span>
                  <span>256</span>
                  <span>1TB</span>
                  <span>2TB</span>
                </div>
              </div>
            </div>

            {/* Condition Matrix */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                What&apos;s broken?
              </label>
              {currentConditions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentConditions.map(({ label, icon, activeIcon }) => {
                    const active = conditions.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleCondition(label)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          active
                            ? "bg-red-500/15 border-red-500/40 text-red-400"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {active ? activeIcon : icon}
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : deviceType === "Other" ? (
                <p className="text-xs text-zinc-600">
                  Select an appliance type above to see relevant conditions.
                </p>
              ) : null}
            </div>

            {/* Mode Switch */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Scissors className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Include Hardware Harvesting
                  </p>
                  <p className="text-xs text-zinc-500">
                    Destructive — extract individual components for reuse
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setMode((m) =>
                    m === "Standard" ? "Teardown/Harvest" : "Standard"
                  )
                }
                aria-label="Toggle hardware harvesting mode"
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  mode === "Teardown/Harvest" ? "bg-orange-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    mode === "Teardown/Harvest" ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!deviceName.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <span className="flex items-center justify-center gap-2">
                <Cpu className="w-5 h-5" />
                Find Revival Projects
              </span>
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            ECO EXCHANGE SECTION — LANDING PAGE
            ═══════════════════════════════════════════════════════════════════ */}
        {phase === "idle" && (
          <div className="max-w-2xl mx-auto mt-16 space-y-6">
            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Eco Exchange Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                Eco Exchange
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                Not a tinkerer? <span className="text-green-400">Get paid instead.</span>
              </h3>
              <p className="text-zinc-400 text-sm">
                Enter your device, select its condition, and get instant trade-in offers & resale estimates.
              </p>
            </div>

            {/* Eco Device Input */}
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={ecoDevice}
                onChange={(e) => setEcoDevice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEcoSubmit()}
                placeholder="What device are you trading in? (e.g., iPhone 13, MacBook Air M1)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 text-lg placeholder:text-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all"
              />
            </div>

            {/* Device Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Device Type
              </label>
              <div className="flex flex-wrap gap-2">
                {DEVICE_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => handleEcoDeviceTypeChange(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      ecoDeviceType === value
                        ? "bg-green-500/15 border-green-500/40 text-green-400"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eco Appliance Type Selector (only when "Other" is selected) */}
            {ecoDeviceType === "Other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  What kind of appliance?
                </label>
                <div className="flex flex-wrap gap-2">
                  {APPLIANCE_TYPES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => handleEcoApplianceTypeChange(value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        ecoApplianceType === value
                          ? "bg-green-500/15 border-green-500/40 text-green-400"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eco Condition Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                What&apos;s wrong with it?
              </label>
              {currentEcoConditions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentEcoConditions.map(({ label, icon, activeIcon }) => {
                    const active = ecoConditions.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleEcoCondition(label)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          active
                            ? "bg-red-500/15 border-red-500/40 text-red-400"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {active ? activeIcon : icon}
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : ecoDeviceType === "Other" ? (
                <p className="text-xs text-zinc-600">
                  Select an appliance type above to see relevant conditions.
                </p>
              ) : null}
              {currentEcoConditions.length > 0 && ecoConditions.length === 0 && (
                <p className="text-xs text-zinc-600">
                  Leave empty if the device is just old but fully working.
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Describe the condition (optional)
              </label>
              <textarea
                value={ecoNotes}
                onChange={(e) => setEcoNotes(e.target.value)}
                placeholder="E.g., 3 years old, scratches on back, slight burn-in on screen, still boots but slow..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all resize-none"
              />
            </div>

            {/* Eco Submit */}
            <button
              onClick={handleEcoSubmit}
              disabled={!ecoDevice.trim() || ecoLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white"
            >
              {ecoLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Evaluating device...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Get Trade-In Value
                </span>
              )}
            </button>

            {/* Eco Error */}
            {ecoError && (
              <div className="text-center py-4">
                <p className="text-sm text-red-400">{ecoError}</p>
              </div>
            )}

            {/* ═══ Eco Results ═══ */}
            {ecoResult && ecoResult.valuationSummary && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Condition Grade + Values */}
                <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-950/30 to-zinc-900/50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-green-400">
                        {ecoResult.valuationSummary.deviceName}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">AI Condition Assessment</p>
                    </div>
                    {/* Condition Grade Badge */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black border-2 ${
                      ecoResult.valuationSummary.conditionGrade === "A" ? "border-emerald-400 text-emerald-400 bg-emerald-500/10" :
                      ecoResult.valuationSummary.conditionGrade === "B" ? "border-green-400 text-green-400 bg-green-500/10" :
                      ecoResult.valuationSummary.conditionGrade === "C" ? "border-yellow-400 text-yellow-400 bg-yellow-500/10" :
                      ecoResult.valuationSummary.conditionGrade === "D" ? "border-orange-400 text-orange-400 bg-orange-500/10" :
                      "border-red-400 text-red-400 bg-red-500/10"
                    }`}>
                      {ecoResult.valuationSummary.conditionGrade}
                    </div>
                  </div>

                  {/* Value Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4 text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Can Sell For</p>
                      <p className="text-2xl font-bold text-green-400">
                        ₹{ecoResult.valuationSummary.estimatedResaleInr?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1">eBay / Swappa / OLX</p>
                    </div>
                    <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4 text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Scrap Parts Value</p>
                      <p className="text-2xl font-bold text-zinc-300">
                        ₹{ecoResult.valuationSummary.estimatedScrapCashInr?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1">raw components only</p>
                    </div>
                  </div>

                  {/* Eco message */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-900/20 border border-green-600/20">
                    <Leaf className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-xs text-green-300">
                      {ecoResult.valuationSummary.ecoMessage}
                    </p>
                  </div>
                </div>

                {/* Trade-In Offer Cards — CLICKABLE */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-400" />
                    Trade-In Offers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ecoResult.tradeInOffers.map((offer, i) => {
                      const isBest = i === 0;
                      const isCash = offer.offerType === "Cash Transfer";
                      const borderColor = isBest
                        ? "border-yellow-500/40 bg-yellow-950/20 hover:border-yellow-500/60"
                        : isCash
                          ? "border-zinc-500/30 bg-zinc-900/30 hover:border-zinc-500/50"
                          : "border-green-500/30 bg-green-950/20 hover:border-green-500/50";
                      const tagColor = isBest
                        ? "bg-yellow-500/20 text-yellow-400"
                        : isCash
                          ? "bg-zinc-500/20 text-zinc-400"
                          : "bg-green-500/20 text-green-400";

                      const CardWrapper = offer.couponUrl ? "a" : "div";
                      const linkProps = offer.couponUrl
                        ? { href: offer.couponUrl, target: "_blank" as const, rel: "noopener noreferrer" }
                        : {};

                      return (
                        <CardWrapper
                          key={i}
                          {...linkProps}
                          className={`block rounded-xl border p-4 space-y-3 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-lg hover:shadow-green-500/5 ${borderColor} ${offer.couponUrl ? "group" : ""}`}
                        >
                          {isBest && (
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                                Best Value
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {isCash ? (
                              <DollarSign className="w-5 h-5 text-zinc-400" />
                            ) : (
                              <Gift className="w-5 h-5 text-green-400" />
                            )}
                            <div>
                              <p className="text-sm font-bold text-zinc-200">
                                {offer.partner}
                              </p>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tagColor}`}>
                                {offer.offerType}
                              </span>
                            </div>
                          </div>
                          <p className="text-base font-semibold text-zinc-100">
                            {offer.headline}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-zinc-500" />
                            <span className="text-xs text-zinc-400">
                              {offer.monetaryValueCap}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {offer.reasoning}
                          </p>
                          {offer.couponUrl && (
                            <div className="flex items-center gap-1.5 text-xs text-green-400 group-hover:text-green-300 transition-colors pt-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>Claim this offer →</span>
                            </div>
                          )}
                        </CardWrapper>
                      );
                    })}
                  </div>
                </div>

                {/* Disclaimer + Reset */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-zinc-600">
                    * AI-generated estimates. Actual values may vary by retailer and condition assessment.
                  </p>
                  <button
                    onClick={handleEcoReset}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    New valuation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === SCREEN 2: Live Research Terminal === */}
        {(phase === "searching" ||
          phase === "analyzing" ||
          phase === "synthesizing") &&
          !response && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Phase indicator */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <Terminal className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {phaseLabel[phase]}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Researching: {deviceName}
                    {conditions.length > 0 && ` | ${conditions.join(", ")}`}
                    {mode === "Teardown/Harvest" && " | Harvest Mode"}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Scraping live sources may take 15-45 seconds...
                  </p>
                </div>
              </div>

              {/* Terminal Window */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border-b border-zinc-700/50">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono ml-2">
                    agent://second-life-research
                  </span>
                </div>

                {/* Log output */}
                <div
                  ref={terminalRef}
                  className="p-4 h-80 overflow-y-auto font-mono text-sm space-y-1"
                >
                  {visibleThoughts.map((t, i) => (
                    <div
                      key={i}
                      className="flex gap-2"
                    >
                      <span className="text-emerald-500 flex-shrink-0">
                        &gt;
                      </span>
                      <span className="text-zinc-300">{t.message}</span>
                    </div>
                  ))}
                  {/* Blinking cursor */}
                  <div className="flex gap-2">
                    <span className="text-emerald-500">&gt;</span>
                    <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* === SCREEN 3: Results Dashboard === */}
        {phase === "complete" && response && (
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold">
                  Results for{" "}
                  <span className="text-emerald-400">{deviceName}</span>
                </h2>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {response.recommendations.length} projects found |{" "}
                  {conditions.length > 0
                    ? conditions.join(", ")
                    : "No defects reported"}
                  {mode === "Teardown/Harvest" && " | Harvest Mode"}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
                New Search
              </button>
            </div>

            {/* Collapsible Thought Log */}
            <details className="group">
              <summary className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors">
                <Terminal className="w-3.5 h-3.5" />
                <span>View research log ({response.thoughts.length} steps)</span>
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto">
                {response.thoughts.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-600">&gt;</span>
                    <span className="text-zinc-400">{t.message}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Disassembly Manual Link */}
            {response.disassemblyUrl && (
              <a
                href={response.disassemblyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-blue-500/30 bg-blue-950/20 hover:border-blue-500/50 transition-all group"
              >
                <BookOpen className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-400">
                    Disassembly Manual Available
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    iFixit teardown guide for {deviceName}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-zinc-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab("software")}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "software"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Recycle className="w-4 h-4" />
                Software Revival ({softwareProjects.length})
              </button>
              <button
                onClick={() => setActiveTab("creative")}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "creative"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Creative Builds ({creativeProjects.length})
              </button>
              <button
                onClick={() => setActiveTab("hardware")}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "hardware"
                    ? "border-orange-400 text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Wrench className="w-4 h-4" />
                Hardware Harvest ({hardwareProjects.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-3">
              {/* Software Revival Tab */}
              {activeTab === "software" && (
                <>
                  {softwareProjects.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-8 text-center">
                      No software projects match the current conditions.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {softwareProjects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Creative Builds Tab */}
              {activeTab === "creative" && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-zinc-400">
                    <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p>
                      <span className="text-cyan-400 font-medium">DIY Perks-style projects</span> — unique conversions that
                      transform your device into something entirely new. Each project lists the extra parts needed
                      to make it a functioning tech piece.
                    </p>
                  </div>
                  {creativeProjects.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-8 text-center">
                      No creative build projects found. Try a different device or conditions.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {creativeProjects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Hardware Harvest Tab */}
              {activeTab === "hardware" && (
                <>
                  {hardwareProjects.length === 0 ? (
                    <div className="text-sm text-zinc-500 py-8 text-center space-y-2">
                      <AlertTriangle className="w-8 h-8 mx-auto text-zinc-700" />
                      <p>
                        Hardware harvesting is disabled.
                        <br />
                        <button
                          onClick={handleReset}
                          className="text-orange-400 hover:text-orange-300 underline mt-1"
                        >
                          Start over
                        </button>{" "}
                        and enable &quot;Include Hardware Harvesting&quot; to see
                        teardown projects.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {hardwareProjects.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-emerald-400" /> Score = compatibility
                with your device&apos;s condition
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Beginner
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                Intermediate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Expert
              </span>
            </div>
          </div>
        )}

        {/* === Error State === */}
        {phase === "error" && (
          <div className="max-w-md mx-auto text-center space-y-4 py-16">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-400" />
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-zinc-600">
          <span>DeviceRevive &mdash; Give Your Old Tech New Life</span>
          <span className="flex items-center gap-1">
            <Leaf className="w-3 h-3" /> Reduce e-waste. Reuse hardware.
          </span>
        </div>
      </footer>
    </main>
  );
}
