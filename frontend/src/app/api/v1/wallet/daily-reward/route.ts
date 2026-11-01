import { NextResponse } from "next/server";
import { MOCK_WALLET } from "@/services/mockData";

export async function POST() {
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
    message: "Daily reward claimed (+10 Crystals)",
    data: updatedWallet,
    timestamp: new Date().toISOString()
  });
}
