import { NextResponse } from "next/server";
import { MOCK_MYSTIC_PROFILE } from "@/services/mockData";

export async function GET() {
  return NextResponse.json({
    code: 200,
    message: "OK",
    data: MOCK_MYSTIC_PROFILE,
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = { ...MOCK_MYSTIC_PROFILE, ...body };
    return NextResponse.json({
      code: 200,
      message: "Profile updated",
      data: updated,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid payload" }, { status: 400 });
  }
}
