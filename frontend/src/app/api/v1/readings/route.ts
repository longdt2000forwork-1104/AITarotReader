export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { MOCK_SPREADS, MOCK_DECKS, MOCK_SESSIONS } from "@/services/mockData";
import { ReadingSessionDto } from "@/types/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/v1/readings/sessions`, {
      headers,
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Proxy to Supabase backend failed, returning fallback sessions:", e);
  }

  return NextResponse.json({
    code: 200,
    message: "OK (Fallback)",
    data: MOCK_SESSIONS,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/v1/readings/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    const spread = MOCK_SPREADS.find((s) => s.id === body.spreadId) || MOCK_SPREADS[1];
    const deck = MOCK_DECKS.find((d) => d.id === body.deckId) || MOCK_DECKS[0];

    const newSession: ReadingSessionDto = {
      id: `RS-${Date.now().toString().slice(-4)}`,
      sessionCode: `SESSION-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "CREATED",
      question: body.question || "Daily guidance & intuitive focus.",
      inputMode: body.inputMode || "CARD_DRAW",
      persona: body.persona || "MYSTIC_SAGE",
      spreadTemplate: spread,
      deck,
      drawnCards: [],
      messages: [],
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(
      {
        code: 201,
        message: "Session created (Fallback)",
        data: newSession,
        timestamp: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid payload" }, { status: 400 });
  }
}
