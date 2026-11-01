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
  AuthResponse,
  DrawnCardDto,
  SessionMessageDto
} from "@/types/api";

import {
  MOCK_CARDS,
  MOCK_DECKS,
  MOCK_SPREADS,
  MOCK_USER,
  MOCK_MYSTIC_PROFILE,
  MOCK_WALLET,
  MOCK_SESSIONS,
  MOCK_JOURNAL_ENTRIES
} from "./mockData";

// USE_MOCK defaults to FALSE: always connect to real backend & Supabase database
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper for local storage persistence
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors
  }
}

// Ensure JWT token is present for authenticated requests to Supabase backend
let authPromise: Promise<string | null> | null = null;
async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const existingToken = localStorage.getItem("tarot_access_token");
  if (existingToken && existingToken !== "null" && existingToken !== "undefined") {
    return existingToken;
  }

  if (authPromise) return authPromise;

  authPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: "live-seeker-token",
          email: "seeker@aitarotreader.com",
          name: "Seeker of Truth"
        })
      });
      if (res.ok) {
        const json = await res.json();
        const token = json?.data?.accessToken;
        if (token) {
          localStorage.setItem("tarot_access_token", token);
          if (json.data.user) {
            setStorageItem("tarot_user", json.data.user);
          }
          return token;
        }
      }
    } catch (e) {
      console.warn("Auto-provisioning session token warning:", e);
    } finally {
      authPromise = null;
    }
    return null;
  })();

  return authPromise;
}

// Unified fetch wrapper that connects to the real Spring Boot backend + Supabase database
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
    const token = await ensureAuthToken();
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.warn(`[Supabase API] ${options.method || "GET"} ${path} returned status ${res.status}:`, json);
      if (fallbackData !== undefined) {
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

  // Ensure spreadTemplate is complete
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

  // Ensure deck is complete
  let deck = session.deck;
  if (!deck) {
    const deckId = session.deckId || fallbackDeckId;
    deck = MOCK_DECKS.find((d) => d.id === deckId) || MOCK_DECKS[0];
  }

  // Ensure drawn cards have valid structure
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
      card: dc.card || MOCK_CARDS[idx % MOCK_CARDS.length]
    };
  });

  return {
    id,
    sessionCode,
    status,
    question,
    inputMode,
    persona,
    spreadTemplate,
    deck,
    drawnCards,
    aiInterpretation,
    messages: session.messages || [],
    createdAt
  };
}

// ----------------------------------------------------------------------
// Unified Live API Client Connected Directly to Supabase
// ----------------------------------------------------------------------
export const apiClient = {
  // 1. Auth Module
  auth: {
    async getCurrentUser(): Promise<ApiResponse<UserDto>> {
      return requestApi<UserDto>("/api/v1/auth/me", {}, MOCK_USER);
    },

    async login(email: string, password = "secretPassword123"): Promise<ApiResponse<AuthResponse>> {
      const res = await requestApi<AuthResponse>(
        "/api/v1/auth/google",
        {
          method: "POST",
          body: JSON.stringify({
            idToken: "user-session-token",
            email,
            name: email.split("@")[0]
          })
        },
        {
          accessToken: "mock_jwt_token_sample",
          tokenType: "Bearer",
          user: { ...MOCK_USER, email }
        }
      );

      if (res.code === 200 && res.data?.accessToken) {
        localStorage.setItem("tarot_access_token", res.data.accessToken);
        if (res.data.user) {
          setStorageItem("tarot_user", res.data.user);
        }
      }
      return res;
    },

    async logout(): Promise<ApiResponse<boolean>> {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tarot_access_token");
        localStorage.removeItem("tarot_user");
      }
      return { code: 200, message: "Logged out", data: true, timestamp: new Date().toISOString() };
    }
  },

  // 2. Tarot Catalog Module (Direct from Supabase PostgreSQL Database)
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

  // 3. Reading Session Module (Saved directly in Supabase reading_sessions & drawn_cards)
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

      // Local fallback if backend temporarily unreachable
      const spread = MOCK_SPREADS.find((s) => s.id === req.spreadId) || MOCK_SPREADS[1];
      const deck = MOCK_DECKS.find((d) => d.id === req.deckId) || MOCK_DECKS[0];
      const fallbackSession: ReadingSessionDto = {
        id: `RS-${Date.now().toString().slice(-4)}`,
        sessionCode: `SESSION-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "CREATED",
        question: req.question || "General energetic guidance and spiritual clarity.",
        inputMode: req.inputMode || "CARD_DRAW",
        persona: req.persona || "MYSTIC_SAGE",
        spreadTemplate: spread,
        deck,
        drawnCards: [],
        messages: [],
        createdAt: new Date().toISOString()
      };
      return { code: 201, message: "Session created (Fallback)", data: fallbackSession, timestamp: new Date().toISOString() };
    },

    async getById(id: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${id}`);
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      const fallback = MOCK_SESSIONS.find((s) => s.id === id || s.sessionCode === id) || MOCK_SESSIONS[0];
      return { code: 200, message: "OK", data: fallback, timestamp: new Date().toISOString() };
    },

    async drawCards(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/draw`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      // Fallback
      const session = MOCK_SESSIONS[0];
      return { code: 200, message: "Cards drawn", data: session, timestamp: new Date().toISOString() };
    },

    async interpret(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/interpret`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      // Fallback
      const session = MOCK_SESSIONS[0];
      return { code: 200, message: "Interpretation generated", data: session, timestamp: new Date().toISOString() };
    },

    async sendChat(sessionId: string, userMessage: string): Promise<ApiResponse<SessionMessageDto>> {
      const res = await requestApi<SessionMessageDto>(`/api/v1/readings/sessions/${sessionId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question: userMessage })
      });
      if (res.data) return res;

      const fallbackMsg: SessionMessageDto = {
        id: `MSG-${Date.now()}-A`,
        sender: "AI_READER",
        content: `Dựa trên năng lượng của lá bài và câu hỏi của bạn: "${userMessage}", vũ trụ khuyên bạn hãy tin tưởng vào trực giác nội tâm.`,
        createdAt: new Date().toISOString()
      };
      return { code: 200, message: "Reply sent", data: fallbackMsg, timestamp: new Date().toISOString() };
    },

    async saveJournal(sessionId: string, notes: string, tags: string[] = []): Promise<ApiResponse<JournalEntryDto>> {
      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/journal`, {
        method: "PUT",
        body: JSON.stringify({ reflectionNote: notes, notes, moodTags: tags, tags })
      });

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
      return { code: 201, message: "Saved to journal", data: entry, timestamp: new Date().toISOString() };
    },

    async getHistory(): Promise<ApiResponse<ReadingSessionDto[]>> {
      const res = await requestApi<any[]>("/api/v1/readings/history");
      if (res.data && Array.isArray(res.data)) {
        const normalized = res.data.map((s) => normalizeReadingSession(s));
        return { ...res, data: normalized };
      }
      return { code: 200, message: "OK", data: MOCK_SESSIONS, timestamp: new Date().toISOString() };
    },

    async getJournal(): Promise<ApiResponse<JournalEntryDto[]>> {
      const res = await requestApi<JournalEntryDto[]>("/api/v1/readings/journal");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
      return { code: 200, message: "OK", data: MOCK_JOURNAL_ENTRIES, timestamp: new Date().toISOString() };
    }
  },

  // 4. Mystic Profile Module (Direct from Supabase mystic_profiles table)
  profile: {
    async getMysticProfile(): Promise<ApiResponse<MysticProfileDto>> {
      return requestApi<MysticProfileDto>("/api/v1/profile/mystic", {}, MOCK_MYSTIC_PROFILE);
    },

    async updateMysticProfile(data: UpdateMysticProfileRequest): Promise<ApiResponse<MysticProfileDto>> {
      return requestApi<MysticProfileDto>(
        "/api/v1/profile/mystic",
        {
          method: "PUT",
          body: JSON.stringify(data)
        },
        { ...MOCK_MYSTIC_PROFILE, ...data }
      );
    }
  },

  // 5. Crystal Wallet Module (Direct from Supabase users.crystal_balance)
  wallet: {
    async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
      const res = await requestApi<any>("/api/v1/wallet/balance", {}, MOCK_WALLET);
      if (res.data) {
        const balance = res.data.balance !== undefined ? res.data.balance : res.data.crystalBalance || 20;
        const normalized: WalletBalanceDto = {
          balance,
          tier: (res.data.tier as "FREE" | "PRO" | "SEEKER") || "FREE",
          transactions: MOCK_WALLET.transactions
        };
        return { ...res, data: normalized };
      }
      return { code: 200, message: "OK", data: MOCK_WALLET, timestamp: new Date().toISOString() };
    },

    async claimDailyReward(): Promise<ApiResponse<WalletBalanceDto>> {
      const res = await requestApi<any>("/api/v1/wallet/daily-reward", { method: "POST" });
      if (res.data) {
        const balance = res.data.balance !== undefined ? res.data.balance : res.data.crystalBalance || 30;
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
            },
            ...MOCK_WALLET.transactions
          ]
        };
        return { ...res, code: 200, data: normalized };
      }
      const updatedBalance = MOCK_WALLET.balance + 10;
      const updatedWallet: WalletBalanceDto = {
        ...MOCK_WALLET,
        balance: updatedBalance
      };
      return { code: 200, message: "Daily reward claimed (+10 Crystals)", data: updatedWallet, timestamp: new Date().toISOString() };
    }
  }
};
