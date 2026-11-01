import { NextResponse } from "next/server";
import { MOCK_CARDS } from "@/services/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arcana = searchParams.get("arcana");
  const suit = searchParams.get("suit");

  let cards = [...MOCK_CARDS];
  if (arcana) {
    cards = cards.filter((c) => c.arcana.toUpperCase() === arcana.toUpperCase());
  }
  if (suit) {
    cards = cards.filter((c) => c.suit && c.suit.toUpperCase() === suit.toUpperCase());
  }

  return NextResponse.json({
    code: 200,
    message: "OK",
    data: cards,
    timestamp: new Date().toISOString()
  });
}
