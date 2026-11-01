export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { MOCK_SPREADS } from "@/services/mockData";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/tarot/spreads`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Proxy to Supabase backend failed, returning fallback spreads:", e);
  }

  return NextResponse.json({
    code: 200,
    message: "OK (Fallback)",
    data: MOCK_SPREADS,
    timestamp: new Date().toISOString()
  });
}
