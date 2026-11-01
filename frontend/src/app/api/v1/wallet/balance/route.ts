export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { MOCK_WALLET } from "@/services/mockData";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/v1/wallet/balance`, {
      headers,
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Proxy to Supabase backend failed, returning fallback wallet:", e);
  }

  return NextResponse.json({
    code: 200,
    message: "OK (Fallback)",
    data: MOCK_WALLET,
    timestamp: new Date().toISOString()
  });
}
