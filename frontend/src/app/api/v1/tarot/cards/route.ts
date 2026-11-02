export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { MOCK_CARDS } from "@/services/mockData";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arcana = searchParams.get("arcana");
  const suit = searchParams.get("suit");

  try {
    const params = new URLSearchParams();
    if (arcana) params.append("arcana", arcana);
    if (suit) params.append("suit", suit);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${BACKEND_URL}/api/v1/tarot/cards${query}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Proxy to Supabase backend failed, returning fallback cards:", e);
  }

  let cards = [...MOCK_CARDS];
  if (arcana) {
    cards = cards.filter((c) => c.arcana.toUpperCase() === arcana.toUpperCase());
  }
  if (suit) {
    cards = cards.filter((c) => c.suit && c.suit.toUpperCase() === suit.toUpperCase());
  }

  return NextResponse.json({
    code: 200,
    message: "OK (Fallback)",
    data: cards,
    timestamp: new Date().toISOString()
  });
}
