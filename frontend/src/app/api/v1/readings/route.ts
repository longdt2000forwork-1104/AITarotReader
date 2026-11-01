import { NextResponse } from "next/server";
import { MOCK_SPREADS, MOCK_DECKS, MOCK_SESSIONS } from "@/services/mockData";
import { ReadingSessionDto } from "@/types/api";

export async function GET() {
  return NextResponse.json({
    code: 200,
    message: "OK",
    data: MOCK_SESSIONS,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
        message: "Session created",
        data: newSession,
        timestamp: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid payload" }, { status: 400 });
  }
}
