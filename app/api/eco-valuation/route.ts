import { NextRequest, NextResponse } from "next/server";
import type { EcoValuation } from "@/types";

const SCRAPER_URL = process.env.SCRAPER_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy directly to the Python backend eco-valuation endpoint
    const res = await fetch(`${SCRAPER_URL}/eco-valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceName: body.deviceName || "",
        conditions: body.conditions || [],
        additionalNotes: body.additionalNotes || "",
        deviceType: body.deviceType || "Smartphone",
        ramGB: body.ramGB || 0,
        storageGB: body.storageGB || 0,
        images: body.images || [],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: detail || "Eco valuation failed" },
        { status: res.status }
      );
    }

    const data: EcoValuation = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Eco valuation proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach valuation service" },
      { status: 502 }
    );
  }
}
