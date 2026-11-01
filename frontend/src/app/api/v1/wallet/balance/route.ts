import { NextResponse } from "next/server";
import { MOCK_WALLET } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    code: 200,
    message: "OK",
    data: MOCK_WALLET,
    timestamp: new Date().toISOString()
  });
}
