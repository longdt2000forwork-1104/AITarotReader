export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { MOCK_WALLET } from "@/services/mockData";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/v1/wallet/daily-reward`, {
      method: "POST",
      headers
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Proxy to Supabase backend failed, returning fallback reward:", e);
  }

  const updatedWallet = {
    ...MOCK_WALLET,
    balance: MOCK_WALLET.balance + 10,
    transactions: [
      {
        id: `TX-${Date.now()}`,
        amount: +10,
        type: "DAILY_REWARD" as const,
        description: "Daily Dawn Login Blessing",
        createdAt: new Date().toISOString()
      },
      ...MOCK_WALLET.transactions
    ]
  };

  return NextResponse.json({
    code: 200,
    message: "Daily reward claimed (+10 Crystals) (Fallback)",
    data: updatedWallet,
    timestamp: new Date().toISOString()
  });
}
