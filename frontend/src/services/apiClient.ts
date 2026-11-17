import {
  ApiResponse,
  TarotCardDto,
  TarotDeck,
  SpreadTemplate,
  ReadingSessionDto,
  CreateReadingSessionRequest,
  JournalEntryDto,
  MysticProfileDto,
  UpdateMysticProfileRequest,
  WalletBalanceDto,
  UserDto,
  DrawnCardDto,
  SessionMessageDto
} from "@/types/api";

import {
  MOCK_CARDS,
  MOCK_DECKS,
  MOCK_SPREADS,
  MOCK_SESSIONS,
  MOCK_JOURNAL_ENTRIES
} from "./mockData";
import { TAROT_CARDS } from "@/data/tarotCards";
import { authApi } from "./authApi";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// Unified fetch wrapper that calls same-origin Next.js proxy (/api/backend/*) with httpOnly cookies
async function requestApi<T>(
  path: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<ApiResponse<T>> {
  if (USE_MOCK && fallbackData !== undefined) {
    return {
      code: 200,
      message: "OK (Mock)",
      data: fallbackData,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    const proxyPath = path.startsWith("/api/backend")
      ? path
      : `/api/backend${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(proxyPath, {
      ...options,
      credentials: "include",
      headers,
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return {
        code: 401,
        message: json?.message || "Authentication required",
        data: null as unknown as T,
        timestamp: json?.timestamp || new Date().toISOString()
      };
    }

    if (!res.ok) {
      console.warn(`[Supabase API] ${options.method || "GET"} ${path} returned status ${res.status}:`, json);
      if (fallbackData !== undefined && res.status >= 500) {
        return {
          code: res.status,
          message: json?.message || "Using fallback",
          data: fallbackData,
          timestamp: new Date().toISOString()
        };
      }
      return {
        code: res.status,
        message: json?.message || res.statusText || "Request failed",
        data: (json?.data ?? null) as T,
        timestamp: json?.timestamp || new Date().toISOString()
      };
    }

    return {
      code: res.status,
      message: json?.message || "OK",
      data: (json?.data !== undefined ? json.data : json) as T,
      timestamp: json?.timestamp || new Date().toISOString()
    };
  } catch (err: any) {
    console.error(`[Supabase API Network Error] ${path}:`, err);
    if (fallbackData !== undefined) {
      return {
        code: 200,
        message: "Fallback upon network error",
        data: fallbackData,
        timestamp: new Date().toISOString()
      };
    }
    return {
      code: 500,
      message: err?.message || "Backend network error",
      data: null as unknown as T,
      timestamp: new Date().toISOString()
    };
  }
}

// Normalizer to ensure ReadingSessionDto adheres to UI expectations
function normalizeReadingSession(session: any, fallbackSpreadId = "S-02", fallbackDeckId = "ED-01"): ReadingSessionDto {
  if (!session) return session;

  const id = session.id ? session.id.toString() : `RS-${Date.now().toString().slice(-4)}`;
  const sessionCode = session.sessionCode || `SESSION-${id.slice(0, 8)}`;
  const question = session.question || session.userQuestion || "General energetic guidance and clarity.";
  const aiInterpretation = session.aiInterpretation || session.aiSynthesisResult || "";
  const persona = session.persona || session.personaCode || "MYSTIC_SAGE";
  const inputMode = session.inputMode || "CARD_DRAW";
  const status = session.status || "CREATED";
  const createdAt = session.createdAt || new Date().toISOString();

  let spreadTemplate = session.spreadTemplate;
  if (!spreadTemplate || !spreadTemplate.parsedPositions) {
    const spreadId = session.spreadId || (spreadTemplate && spreadTemplate.id) || fallbackSpreadId;
    const matched = MOCK_SPREADS.find((s) => s.id === spreadId) || MOCK_SPREADS[1];
    spreadTemplate = {
      ...matched,
      ...(spreadTemplate || {}),
      parsedPositions: spreadTemplate?.positionsJson
        ? (typeof spreadTemplate.positionsJson === "string"
            ? JSON.parse(spreadTemplate.positionsJson)
            : spreadTemplate.positionsJson)
        : matched.parsedPositions
    };
  }

  let deck = session.deck;
  if (!deck) {
    const deckId = session.deckId || fallbackDeckId;
    deck = MOCK_DECKS.find((d) => d.id === deckId) || MOCK_DECKS[0];
  }

  const rawCards = session.drawnCards || [];
  const drawnCards: DrawnCardDto[] = rawCards.map((dc: any, idx: number) => {
    const pos = spreadTemplate?.parsedPositions?.[idx] || {
      index: idx,
      name_en: `Position ${idx + 1}`,
      name_vi: `Vị trí ${idx + 1}`
    };
    return {
      id: dc.id ? dc.id.toString() : `DC-${idx}`,
      positionIndex: dc.positionIndex !== undefined ? dc.positionIndex : idx,
      positionNameEn: dc.positionNameEn || pos.name_en,
      positionNameVi: dc.positionNameVi || pos.name_vi,
      isReversed: dc.isReversed ?? false,
      isClarifier: dc.isClarifier ?? false,
      card: dc.card || MOCK_CARDS[idx % MOCK_CARDS.length]
    };
  });

  const normalizedMessages: SessionMessageDto[] = (session.messages || []).map((m: any, idx: number) => ({
    id: m.id ? m.id.toString() : `MSG-${idx}`,
    sender: (m.sender || m.role || "AI_READER") as "USER" | "AI_READER",
    content: m.content || "",
    createdAt: m.createdAt || new Date().toISOString()
  }));

  const existingNamesVi = new Set(
    drawnCards.map((dc) => (dc.card?.nameVi || "").toLowerCase()).filter(Boolean)
  );
  const existingNamesEn = new Set(
    drawnCards.map((dc) => (dc.card?.nameEn || "").toLowerCase()).filter(Boolean)
  );

  const clarifierOrderMap = new Map<number, number>();
  let orderCounter = 0;

  for (const msg of normalizedMessages) {
    const text = msg.content || "";
    const lowerText = text.toLowerCase();
    const isClarifierMsg =
      lowerText.includes("vừa rút thêm lá bài làm rõ") ||
      lowerText.includes("just drew a clarifier") ||
      lowerText.includes("lá bài bổ sung (clarifier)");
    if (!isClarifierMsg) continue;

    for (const tc of TAROT_CARDS) {
      const viLower = tc.nameVi.toLowerCase();
      const enLower = tc.nameEn.toLowerCase();
      const mentioned =
        (viLower && lowerText.includes(viLower)) || (enLower && lowerText.includes(enLower));
      if (!mentioned) continue;

      const isBaseCard = drawnCards.some(
        (dc) =>
          !dc.isClarifier &&
          (Number((dc.card as any)?.id) === tc.id ||
            (dc.card?.nameVi || "").toLowerCase() === viLower ||
            (dc.card?.nameEn || "").toLowerCase() === enLower)
      );
      if (isBaseCard) continue;

      if (!clarifierOrderMap.has(tc.id)) {
        clarifierOrderMap.set(tc.id, orderCounter++);
      }

      if (!existingNamesVi.has(viLower) && !existingNamesEn.has(enLower) && drawnCards.length < 10) {
        const isRev = new RegExp(`${tc.nameVi}[^\\n)]*ngược|${tc.nameEn}[^\\n)]*reversed`, "i").test(text);
        existingNamesVi.add(viLower);
        existingNamesEn.add(enLower);
        drawnCards.push({
          id: `DC-CLARIFIER-${tc.id}`,
          positionIndex: drawnCards.length,
          positionNameEn: "Clarifier Insight",
          positionNameVi: "Lá Làm Rõ (Clarifier)",
          isReversed: isRev,
          isClarifier: true,
          card: {
            id: tc.id,
            slug: tc.slug,
            cardOrder: tc.id,
            number: tc.number,
            nameVi: tc.nameVi,
            nameEn: tc.nameEn,
            arcana: tc.suit === "MAJOR" ? "MAJOR" : "MINOR",
            suit: tc.suit === "MAJOR" ? null : tc.suit,
            element: tc.element,
            imageUrl: tc.image,
            meaningUprightVi: tc.meaningUprightVi,
            meaningUprightEn: tc.meaningUprightEn,
            meaningReversedVi: tc.meaningUprightVi,
            meaningReversedEn: tc.meaningUprightEn,
            keywordsUprightVi: tc.keywordsVi,
            keywordsUprightEn: tc.keywordsEn,
            keywordsReversedVi: tc.keywordsVi,
            keywordsReversedEn: tc.keywordsEn,
            archetypeEn: tc.nameEn,
            archetypeVi: tc.nameVi
          }
        });
      }
    }
  }

  const baseCards = drawnCards
    .filter((dc) => !dc.isClarifier)
    .sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0));
  const clarifierCards = drawnCards
    .filter((dc) => dc.isClarifier)
    .sort((a, b) => {
      const idA = Number((a.card as any)?.id ?? -1);
      const idB = Number((b.card as any)?.id ?? -1);
      const orderA = clarifierOrderMap.has(idA)
        ? clarifierOrderMap.get(idA)!
        : 1000 + (a.positionIndex ?? 0);
      const orderB = clarifierOrderMap.has(idB)
        ? clarifierOrderMap.get(idB)!
        : 1000 + (b.positionIndex ?? 0);
      return orderA - orderB;
    });

  const sortedDrawnCards = [...baseCards, ...clarifierCards]
    .slice(0, 10)
    .map((dc, idx) => ({
      ...dc,
      positionIndex: idx
    }));

  return {
    id,
    sessionCode,
    status,
    question,
    inputMode,
    persona,
    spreadTemplate,
    deck,
    drawnCards: sortedDrawnCards,
    aiInterpretation,
    aiSynthesisResult: aiInterpretation,
    dateKey: session.dateKey,
    messages: normalizedMessages,
    createdAt
  };
}

// ----------------------------------------------------------------------
// Unified Live API Client Connected via Cookie-Authenticated Proxy
// ----------------------------------------------------------------------
export const apiClient = {
  // 1. Auth Module
  auth: {
    async getCurrentUser(): Promise<ApiResponse<UserDto>> {
      const res = await authApi.me();
      return {
        code: res.status,
        message: res.message,
        data: res.data as UserDto,
        timestamp: new Date().toISOString()
      };
    },

    async logout(): Promise<ApiResponse<boolean>> {
      await authApi.logout();
      return { code: 200, message: "Logged out", data: true, timestamp: new Date().toISOString() };
    }
  },

  // 2. Tarot Catalog Module (Public catalog endpoints)
  tarot: {
    async getCards(arcana?: string, suit?: string): Promise<ApiResponse<TarotCardDto[]>> {
      const params = new URLSearchParams();
      if (arcana) params.append("arcana", arcana);
      if (suit) params.append("suit", suit);
      const query = params.toString() ? `?${params.toString()}` : "";
      return requestApi<TarotCardDto[]>(`/api/v1/tarot/cards${query}`, {}, MOCK_CARDS);
    },

    async getCardById(id: number): Promise<ApiResponse<TarotCardDto>> {
      const fallback = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
      return requestApi<TarotCardDto>(`/api/v1/tarot/cards/${id}`, {}, fallback);
    },

    async getDecks(): Promise<ApiResponse<TarotDeck[]>> {
      return requestApi<TarotDeck[]>("/api/v1/tarot/decks", {}, MOCK_DECKS);
    },

    async getSpreads(): Promise<ApiResponse<SpreadTemplate[]>> {
      const res = await requestApi<SpreadTemplate[]>("/api/v1/tarot/spreads", {}, MOCK_SPREADS);
      if (res.data && Array.isArray(res.data)) {
        res.data = res.data.map((spread) => {
          if (!spread.parsedPositions && spread.positionsJson) {
            try {
              spread.parsedPositions = JSON.parse(spread.positionsJson);
            } catch {
              spread.parsedPositions = [{ index: 0, name_en: "Focus", name_vi: "Trọng tâm" }];
            }
          }
          return spread;
        });
      }
      return res;
    }
  },

  // 3. Reading Session Module (Authenticated user only)
  readings: {
    async create(req: CreateReadingSessionRequest): Promise<ApiResponse<ReadingSessionDto>> {
      const payload = {
        spreadId: req.spreadId,
        deckId: req.deckId || "ED-01",
        inputMode: req.inputMode || "VIRTUAL",
        personaCode: req.persona || "MYSTIC_SAGE",
        userQuestion: req.question || "General energetic guidance and spiritual clarity.",
        cards: []
      };

      const res = await requestApi<any>("/api/v1/readings/sessions", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.data) {
        const normalized = normalizeReadingSession(res.data, req.spreadId, req.deckId);
        return { ...res, code: res.code || 201, data: normalized };
      }
      return res;
    },

    async getById(id: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${id}`);
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      return res;
    },

    async drawCards(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/draw`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      return res;
    },

    async interpret(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/interpret`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      return res;
    },

    async drawClarifier(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/clarifier`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      return res;
    },

    async sendChat(sessionId: string, userMessage: string): Promise<ApiResponse<SessionMessageDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question: userMessage })
      });

      if (res.data) {
        const msgs = res.data.messages || [];
        const lastAiMsg = [...msgs].reverse().find((m: any) => m.role === "AI_READER" || m.sender === "AI_READER");
        if (lastAiMsg && lastAiMsg.content) {
          return {
            code: 200,
            message: "OK",
            data: {
              id: lastAiMsg.id || `MSG-${Date.now()}`,
              sender: "AI_READER",
              content: lastAiMsg.content,
              createdAt: lastAiMsg.createdAt || new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
        }

        if (res.data.content) {
          return {
            code: 200,
            message: "OK",
            data: {
              id: res.data.id || `MSG-${Date.now()}`,
              sender: "AI_READER",
              content: res.data.content,
              createdAt: res.data.createdAt || new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
        }
      }

      return res as unknown as ApiResponse<SessionMessageDto>;
    },

    async saveJournal(sessionId: string, notes: string, tags: string[] = []): Promise<ApiResponse<JournalEntryDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/journal`, {
        method: "PUT",
        body: JSON.stringify({ reflectionNote: notes, notes, moodTags: tags, tags })
      });
      if (res.code === 401) {
        return res;
      }

      const entry: JournalEntryDto = {
        id: `JN-${Date.now().toString().slice(-4)}`,
        readingSessionId: sessionId,
        sessionCode: `SESSION-${sessionId.slice(0, 8)}`,
        title: `Ghi chép trải bài`,
        summary: "Nghiệm lý trải bài Tarot",
        userNotes: notes,
        tags: tags.length ? tags : ["Personal Reflection", "Reading"],
        spreadNameEn: "Tarot Spread",
        spreadNameVi: "Trải bài Tarot",
        cardCount: 3,
        createdAt: new Date().toISOString()
      };
      return { code: res.code || 200, message: "Saved to journal", data: entry, timestamp: new Date().toISOString() };
    },

    async getHistory(): Promise<ApiResponse<ReadingSessionDto[]>> {
      if (USE_MOCK) {
        return { code: 200, message: "OK (Mock)", data: MOCK_SESSIONS, timestamp: new Date().toISOString() };
      }
      const res = await requestApi<any[]>("/api/v1/readings/history");
      if (res.data && Array.isArray(res.data)) {
        const normalized = res.data.map((s) => normalizeReadingSession(s));
        return { ...res, data: normalized };
      }
      return { ...res, data: [] };
    },

    async getJournal(): Promise<ApiResponse<JournalEntryDto[]>> {
      if (USE_MOCK) {
        return { code: 200, message: "OK (Mock)", data: MOCK_JOURNAL_ENTRIES, timestamp: new Date().toISOString() };
      }
      const res = await requestApi<JournalEntryDto[]>("/api/v1/readings/journal");
      if (res.data && Array.isArray(res.data)) {
        return res;
      }
      return { ...res, data: [] };
    },

    async checkDailyDraw(locale: string = "vi"): Promise<ApiResponse<ReadingSessionDto | null>> {
      const endpoint = `/api/v1/readings/daily?locale=${locale}`;
      const res = await requestApi<any>(endpoint, { method: "GET" });
      if (res.data && res.data.id) {
        return { ...res, data: normalizeReadingSession(res.data, "S-01", "ED-01") };
      }
      return { ...res, data: null };
    },

    async flipDailyDraw(locale: string = "vi", force: boolean = false): Promise<ApiResponse<ReadingSessionDto>> {
      const endpoint = `/api/v1/readings/daily?locale=${locale}${force ? "&force=true" : ""}`;
      const res = await requestApi<any>(endpoint, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data, "S-01", "ED-01") };
      }
      return res;
    },

    async getDailyDraw(locale: string = "vi", force: boolean = false): Promise<ApiResponse<ReadingSessionDto>> {
      const endpoint = `/api/v1/readings/daily?locale=${locale}${force ? "&force=true" : ""}`;
      const res = await requestApi<any>(endpoint, {
        method: force ? "POST" : "GET"
      });
      if (res.data && res.data.id) {
        return { ...res, data: normalizeReadingSession(res.data, "S-01", "ED-01") };
      }
      return { ...res, data: null as unknown as ReadingSessionDto };
    }
  },

  // 4. Mystic Profile Module
  profile: {
    async getMysticProfile(): Promise<ApiResponse<MysticProfileDto>> {
      return requestApi<MysticProfileDto>("/api/v1/profile/mystic", {});
    },

    async updateMysticProfile(data: UpdateMysticProfileRequest): Promise<ApiResponse<MysticProfileDto>> {
      return requestApi<MysticProfileDto>("/api/v1/profile/mystic", {
        method: "PUT",
        body: JSON.stringify(data)
      });
    }
  },

  // 5. Crystal Wallet Module
  wallet: {
    async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
      const res = await requestApi<any>("/api/v1/wallet/balance", {});
      if (res.data) {
        const balance = res.data.balance !== undefined ? res.data.balance : res.data.crystalBalance ?? 20;
        const normalized: WalletBalanceDto = {
          balance,
          tier: (res.data.tier as "FREE" | "PRO" | "SEEKER") || "FREE",
          transactions: []
        };
        return { ...res, data: normalized };
      }
      return res;
    },

    async claimDailyReward(): Promise<ApiResponse<WalletBalanceDto>> {
      const res = await requestApi<any>("/api/v1/wallet/daily-reward", { method: "POST" });
      if (res.data) {
        const balance = res.data.balance !== undefined ? res.data.balance : res.data.crystalBalance ?? 30;
        const normalized: WalletBalanceDto = {
          balance,
          tier: (res.data.tier as "FREE" | "PRO" | "SEEKER") || "FREE",
          transactions: [
            {
              id: `TX-${Date.now()}`,
              amount: +10,
              type: "DAILY_REWARD",
              description: "Daily Dawn Login Blessing",
              createdAt: new Date().toISOString()
            }
          ]
        };
        return { ...res, code: 200, data: normalized };
      }
      return res;
    }
  }
};
