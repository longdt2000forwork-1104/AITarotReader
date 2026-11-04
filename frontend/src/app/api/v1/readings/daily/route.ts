export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// In-memory cache for today's daily draw
let dailyCache: {
  dateKey: string;
  session: any;
} | null = null;

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function generateGeminiDailyMessage(
  card: TarotCard,
  isReversed: boolean,
  locale: string = "vi"
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return locale === "vi" ? card.meaningUprightVi : card.meaningUprightEn;
  }

  const isVi = locale === "vi";
  const orientation = isReversed ? (isVi ? "Ngược (Reversed)" : "Reversed") : (isVi ? "Xuôi (Upright)" : "Upright");
  const cardName = isVi ? card.nameVi : card.nameEn;
  const keywords = isVi ? card.keywordsVi : card.keywordsEn;

  const prompt = isVi
    ? `Bạn là một Tarot Reader thông thái, chiêm nghiệm theo trường phái Hermetic và Botanical Editorial Print.
Hôm nay seeker rút được lá bài hàng ngày (Daily Tarot Card):
- Lá bài: ${cardName} (${card.nameEn}) - Số ${card.number} (Bộ ${card.suit})
- Trạng thái: ${orientation}
- Nguyên tố: ${card.element}
- Từ khóa: ${keywords}

Yêu cầu:
Viết một thông điệp chiêm nghiệm ngắn gọn (khoảng 2-3 câu, tối đa 70 từ) cho ngày mới. Văn phong bình an, sâu sắc, không mê tín dị đoan, tập trung vào sự sáng tỏ tâm trí và một lời khuyên hành động thực tế cho hôm nay.`
    : `You are an insightful Tarot Reader in the Sunlit Botanical & Editorial Print tradition.
Today the seeker drew the daily card:
- Card: ${card.nameEn} (No. ${card.number}, Suit: ${card.suit})
- Orientation: ${orientation}
- Element: ${card.element}
- Keywords: ${keywords}

Instruction:
Write an inspiring, reflective daily guidance note (2-3 sentences, max 70 words). Elegant, grounded, mindful, and offering a practical focus for today.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY.trim()}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn("Direct Gemini daily card call failed or timed out, using fallback:", err);
  }

  return isVi ? card.meaningUprightVi : card.meaningUprightEn;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";
  const locale = searchParams.get("locale") || "vi";
  const dateKey = getTodayDateKey();

  // 1. Try forwarding to backend if online and force is not explicitly local
  try {
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;

    if (force) {
      const res = await fetch(`${BACKEND_URL}/api/v1/readings/daily`, {
        method: "POST",
        headers,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } else {
      const res = await fetch(`${BACKEND_URL}/api/v1/readings/daily`, {
        headers,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline, fallback to standalone local generator
  }

  // 2. Return cached daily draw if same date and not forced
  if (!force && dailyCache && dailyCache.dateKey === dateKey) {
    return NextResponse.json({
      code: 200,
      message: "Daily card retrieved from cache",
      data: dailyCache.session,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Generate a new daily card draw
  const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
  const card = TAROT_CARDS[randomIndex];
  const isReversed = Math.random() < 0.2; // 20% chance reversed
  const aiMessage = await generateGeminiDailyMessage(card, isReversed, locale);

  const session = {
    id: `RS-DAILY-${dateKey}`,
    sessionCode: `DAILY-${dateKey}`,
    status: "COMPLETED",
    inputMode: "CARD_DRAW",
    persona: "MYSTIC_SAGE",
    question: locale === "vi" ? "Thông điệp & Năng lượng ngày mới" : "Daily Energy & Mindful Focus",
    aiSynthesisResult: aiMessage,
    dateKey: dateKey,
    drawnCards: [
      {
        id: `DC-${dateKey}-${card.id}`,
        card: card,
        positionIndex: 0,
        positionNameVi: "Năng lượng & Định hướng Ngày Mới",
        positionNameEn: "Daily Focus & Guidance",
        isReversed: isReversed,
        isClarifier: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  dailyCache = { dateKey, session };

  return NextResponse.json({
    code: 200,
    message: "Daily draw completed with Gemini synthesis",
    data: session,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "vi";
  const dateKey = getTodayDateKey();

  // Try proxying to backend
  try {
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/v1/readings/daily`, {
      method: "POST",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  // Standalone generation on POST (force new draw)
  const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
  const card = TAROT_CARDS[randomIndex];
  const isReversed = Math.random() < 0.2;
  const aiMessage = await generateGeminiDailyMessage(card, isReversed, locale);

  const session = {
    id: `RS-DAILY-${dateKey}`,
    sessionCode: `DAILY-${dateKey}`,
    status: "COMPLETED",
    inputMode: "CARD_DRAW",
    persona: "MYSTIC_SAGE",
    question: locale === "vi" ? "Thông điệp & Năng lượng ngày mới" : "Daily Energy & Mindful Focus",
    aiSynthesisResult: aiMessage,
    dateKey: dateKey,
    drawnCards: [
      {
        id: `DC-${dateKey}-${card.id}`,
        card: card,
        positionIndex: 0,
        positionNameVi: "Năng lượng & Định hướng Ngày Mới",
        positionNameEn: "Daily Focus & Guidance",
        isReversed: isReversed,
        isClarifier: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  dailyCache = { dateKey, session };

  return NextResponse.json({
    code: 200,
    message: "New daily draw generated with Gemini",
    data: session,
    timestamp: new Date().toISOString(),
  });
}
