import { NextResponse } from "next/server";
import { MOCK_SPREADS } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    code: 200,
    message: "OK",
    data: MOCK_SPREADS,
    timestamp: new Date().toISOString()
  });
}
