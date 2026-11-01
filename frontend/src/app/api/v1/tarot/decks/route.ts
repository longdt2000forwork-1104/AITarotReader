import { NextResponse } from "next/server";
import { MOCK_DECKS } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    code: 200,
    message: "OK",
    data: MOCK_DECKS,
    timestamp: new Date().toISOString()
  });
}
