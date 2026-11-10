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

import {
  getMockSessions,
  getMockSessionById,
  createMockSession,
  drawCardsForMockSession,
  interpretMockSession,
  drawClarifierForMockSession,
  sendChatForMockSession,
  getMockJournals,
  saveMockJournal,
  checkMockDailyDraw,
  flipMockDailyDraw,
  getMockProfile,
  updateMockProfile,
  getMockWallet,
  claimMockDailyReward
} from "./mockStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Mock Mode strictly controlled by environment variable
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
export function isMockMode(): boolean {
  return USE_MOCK;
}

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
  if (isMockMode() && fallbackData !== undefined) {
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

  // Reconcile any Clarifier cards mentioned in chat messages that were not persisted in drawnCards
  const existingNamesVi = new Set(
    drawnCards.map((dc) => (dc.card?.nameVi || "").toLowerCase()).filter(Boolean)
  );
  const existingNamesEn = new Set(
    drawnCards.map((dc) => (dc.card?.nameEn || "").toLowerCase()).filter(Boolean)
  );

  // Track chronological order of clarifier cards from chat messages (oldest message -> newest message)
  const clarifierOrderMap = new Map<number, number>();
  let orderCounter = 0;

  for (const msg of normalizedMessages) {
    const text = msg.content || "";
    const lowerText = text.toLowerCase();
    const isClarifierMsg =
      lowerText.includes("clarifier") ||
      lowerText.includes("bổ trợ") ||
      lowerText.includes("rút thêm");

    if (isClarifierMsg) {
      for (const card of MOCK_CARDS) {
        const viName = (card.nameVi || "").toLowerCase();
        const enName = (card.nameEn || "").toLowerCase();
        if (
          (lowerText.includes(viName) && !existingNamesVi.has(viName)) ||
          (lowerText.includes(enName) && !existingNamesEn.has(enName))
        ) {
          const isReversed =
            lowerText.includes(`${viName} (ngược)`) ||
            lowerText.includes(`${enName} (reversed)`) ||
            lowerText.includes("ngược hướng") ||
            lowerText.includes("reversed");

          const newIndex = drawnCards.length;
          drawnCards.push({
            id: `DC-CLARIFIER-${card.id}`,
            positionIndex: newIndex,
            positionNameEn: "Clarifier Card",
            positionNameVi: "Thẻ Bổ Trợ",
            isReversed,
            isClarifier: true,
            card
          });

          existingNamesVi.add(viName);
          existingNamesEn.add(enName);
          clarifierOrderMap.set(newIndex, orderCounter++);
        }
      }
    }
  }

  // Sort drawnCards: spread layout cards first, then clarifier cards in order of drawing
  drawnCards.sort((a, b) => {
    if (!a.isClarifier && !b.isClarifier) {
      return a.positionIndex - b.positionIndex;
    }
    if (!a.isClarifier && b.isClarifier) return -1;
    if (a.isClarifier && !b.isClarifier) return 1;
    const orderA = clarifierOrderMap.get(a.positionIndex) ?? a.positionIndex;
    const orderB = clarifierOrderMap.get(b.positionIndex) ?? b.positionIndex;
    return orderA - orderB;
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
    messages: normalizedMessages,
    createdAt
  };
}

// -------------------------------------------------------------
// Unified API Client
// -------------------------------------------------------------
export const apiClient = {
  isMockMode,

  // 1. Auth Module
  auth: {
    async getCurrentUser(): Promise<ApiResponse<UserDto>> {
      if (isMockMode()) {
        const user = getStorageItem<UserDto>("tarot_user", MOCK_USER);
        return { code: 200, message: "OK (Mock)", data: user, timestamp: new Date().toISOString() };
      }
      return requestApi<UserDto>("/api/v1/auth/me", {}, MOCK_USER);
    },

    async login(email: string, password = "secretPassword123"): Promise<ApiResponse<AuthResponse>> {
      if (isMockMode()) {
        const user: UserDto = { ...MOCK_USER, email, fullName: email.split("@")[0] };
        const mockAuth: AuthResponse = {
          accessToken: "mock_jwt_token_sample",
          tokenType: "Bearer",
          user
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("tarot_access_token", mockAuth.accessToken);
          setStorageItem("tarot_user", user);
        }
        return { code: 200, message: "Logged in (Mock)", data: mockAuth, timestamp: new Date().toISOString() };
      }

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

  // 2. Tarot Catalog Module (Direct from Supabase PostgreSQL Database or Mock)
  tarot: {
    async getCards(arcana?: string, suit?: string): Promise<ApiResponse<TarotCardDto[]>> {
      if (isMockMode()) {
        let cards = MOCK_CARDS;
        if (arcana) cards = cards.filter((c) => c.arcana === arcana);
        if (suit) cards = cards.filter((c) => c.suit === suit);
        return { code: 200, message: "OK (Mock)", data: cards, timestamp: new Date().toISOString() };
      }
      const params = new URLSearchParams();
      if (arcana) params.append("arcana", arcana);
      if (suit) params.append("suit", suit);
      const query = params.toString() ? `?${params.toString()}` : "";
      return requestApi<TarotCardDto[]>(`/api/v1/tarot/cards${query}`, {}, MOCK_CARDS);
    },

    async getCardById(id: number): Promise<ApiResponse<TarotCardDto>> {
      if (isMockMode()) {
        const fallback = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        return { code: 200, message: "OK (Mock)", data: fallback, timestamp: new Date().toISOString() };
      }
      const fallback = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
      return requestApi<TarotCardDto>(`/api/v1/tarot/cards/${id}`, {}, fallback);
    },

    async getDecks(): Promise<ApiResponse<TarotDeck[]>> {
      if (isMockMode()) {
        return { code: 200, message: "OK (Mock)", data: MOCK_DECKS, timestamp: new Date().toISOString() };
      }
      return requestApi<TarotDeck[]>("/api/v1/tarot/decks", {}, MOCK_DECKS);
    },

    async getSpreads(): Promise<ApiResponse<SpreadTemplate[]>> {
      if (isMockMode()) {
        return { code: 200, message: "OK (Mock)", data: MOCK_SPREADS, timestamp: new Date().toISOString() };
      }
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

  // 3. Reading Session Module (Saved directly in Supabase or Local Mock Storage)
  readings: {
    async create(req: CreateReadingSessionRequest): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const created = createMockSession(req);
        return { code: 201, message: "Session created (Mock)", data: created, timestamp: new Date().toISOString() };
      }

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
      const fallbackSession = createMockSession(req);
      return { code: 201, message: "Session created (Fallback)", data: fallbackSession, timestamp: new Date().toISOString() };
    },

    async getById(id: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const session = getMockSessionById(id);
        if (session) {
          return { code: 200, message: "OK (Mock)", data: session, timestamp: new Date().toISOString() };
        }
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${id}`);
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      const fallback = getMockSessionById(id) || MOCK_SESSIONS[0];
      return { code: 200, message: "OK", data: fallback, timestamp: new Date().toISOString() };
    },

    async drawCards(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const drawn = drawCardsForMockSession(sessionId);
        return { code: 200, message: "Cards drawn (Mock)", data: drawn, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/draw`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      // Fallback
      const fallback = drawCardsForMockSession(sessionId);
      return { code: 200, message: "Cards drawn (Fallback)", data: fallback, timestamp: new Date().toISOString() };
    },

    async interpret(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const interpreted = interpretMockSession(sessionId);
        return { code: 200, message: "Interpretation generated (Mock)", data: interpreted, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/interpret`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      // Fallback
      const fallback = interpretMockSession(sessionId);
      return { code: 200, message: "Interpretation generated (Fallback)", data: fallback, timestamp: new Date().toISOString() };
    },

    async drawClarifier(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const session = drawClarifierForMockSession(sessionId);
        return { code: 200, message: "Clarifier card drawn (Mock)", data: session, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/clarifier`, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data) };
      }
      const fallback = drawClarifierForMockSession(sessionId);
      return { code: 200, message: "Clarifier card drawn (Fallback)", data: fallback, timestamp: new Date().toISOString() };
    },

    async sendChat(sessionId: string, userMessage: string): Promise<ApiResponse<SessionMessageDto>> {
      if (isMockMode()) {
        const reply = sendChatForMockSession(sessionId, userMessage);
        return { code: 200, message: "OK (Mock)", data: reply, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question: userMessage })
      });

      if (res.data) {
        // Backend returns ReadingSessionDto containing messages list
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

      const fallbackReply = sendChatForMockSession(sessionId, userMessage);
      return { code: 200, message: "Reply sent (Fallback)", data: fallbackReply, timestamp: new Date().toISOString() };
    },

    async saveJournal(sessionId: string, notes: string, tags: string[] = []): Promise<ApiResponse<JournalEntryDto>> {
      if (isMockMode()) {
        const entry = saveMockJournal(sessionId, notes, tags);
        return { code: 201, message: "Saved to journal (Mock)", data: entry, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any>(`/api/v1/readings/sessions/${sessionId}/journal`, {
        method: "PUT",
        body: JSON.stringify({ reflectionNote: notes, notes, moodTags: tags, tags })
      });

      if (res.data) {
        const entry: JournalEntryDto = {
          id: res.data.id ? res.data.id.toString() : `JN-${Date.now().toString().slice(-4)}`,
          readingSessionId: sessionId,
          sessionCode: `SESSION-${sessionId.slice(0, 8)}`,
          title: res.data.title || `Ghi chép trải bài`,
          summary: res.data.summary || notes.slice(0, 100) || "Nghiệm lý trải bài Tarot",
          userNotes: notes,
          tags: tags.length ? tags : ["Personal Reflection", "Reading"],
          spreadNameEn: "Tarot Spread",
          spreadNameVi: "Trải bài Tarot",
          cardCount: 3,
          createdAt: res.data.createdAt || new Date().toISOString()
        };
        return { code: 201, message: "Saved to journal", data: entry, timestamp: new Date().toISOString() };
      }

      const entry = saveMockJournal(sessionId, notes, tags);
      return { code: 201, message: "Saved to journal (Fallback)", data: entry, timestamp: new Date().toISOString() };
    },

    async getHistory(): Promise<ApiResponse<ReadingSessionDto[]>> {
      if (isMockMode()) {
        const history = getMockSessions();
        return { code: 200, message: "OK (Mock)", data: history, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<any[]>("/api/v1/readings/history");
      if (res.data && Array.isArray(res.data)) {
        const normalized = res.data.map((s) => normalizeReadingSession(s));
        return { ...res, data: normalized };
      }
      return { code: 200, message: "OK", data: getMockSessions(), timestamp: new Date().toISOString() };
    },

    async getJournal(): Promise<ApiResponse<JournalEntryDto[]>> {
      if (isMockMode()) {
        const journals = getMockJournals();
        return { code: 200, message: "OK (Mock)", data: journals, timestamp: new Date().toISOString() };
      }

      const res = await requestApi<JournalEntryDto[]>("/api/v1/readings/journal");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
      return { code: 200, message: "OK", data: getMockJournals(), timestamp: new Date().toISOString() };
    },

    async checkDailyDraw(locale: string = "vi"): Promise<ApiResponse<ReadingSessionDto | null>> {
      if (isMockMode()) {
        const session = checkMockDailyDraw(locale);
        return { code: 200, message: "OK (Mock)", data: session, timestamp: new Date().toISOString() };
      }

      const endpoint = `/api/v1/readings/daily?locale=${locale}`;
      const res = await requestApi<any>(endpoint, { method: "GET" });
      if (res.data && res.data.id) {
        return { ...res, data: normalizeReadingSession(res.data, "S-01", "ED-01") };
      }
      return { ...res, data: null };
    },

    async flipDailyDraw(locale: string = "vi", force: boolean = false): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const session = flipMockDailyDraw(locale, force);
        return { code: 200, message: "Daily card flipped (Mock)", data: session, timestamp: new Date().toISOString() };
      }

      const endpoint = `/api/v1/readings/daily?locale=${locale}${force ? "&force=true" : ""}`;
      const res = await requestApi<any>(endpoint, { method: "POST" });
      if (res.data) {
        return { ...res, data: normalizeReadingSession(res.data, "S-01", "ED-01") };
      }
      const fallback = flipMockDailyDraw(locale, force);
      return { code: 200, message: "Daily card flipped (Fallback)", data: fallback, timestamp: new Date().toISOString() };
    },

    async getDailyDraw(locale: string = "vi", force: boolean = false): Promise<ApiResponse<ReadingSessionDto>> {
      if (isMockMode()) {
        const session = flipMockDailyDraw(locale, force);
        return { code: 200, message: "Daily card resolved (Mock)", data: session, timestamp: new Date().toISOString() };
      }

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

  // 4. Mystic Profile Module (Direct from Supabase mystic_profiles table or Mock)
  profile: {
    async getMysticProfile(): Promise<ApiResponse<MysticProfileDto>> {
      if (isMockMode()) {
        return { code: 200, message: "OK (Mock)", data: getMockProfile(), timestamp: new Date().toISOString() };
      }
      return requestApi<MysticProfileDto>("/api/v1/profile/mystic", {}, MOCK_MYSTIC_PROFILE);
    },

    async updateMysticProfile(data: UpdateMysticProfileRequest): Promise<ApiResponse<MysticProfileDto>> {
      if (isMockMode()) {
        const updated = updateMockProfile(data);
        return { code: 200, message: "Profile updated (Mock)", data: updated, timestamp: new Date().toISOString() };
      }
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

  // 5. Crystal Wallet Module (Direct from Supabase users.crystal_balance or Mock)
  wallet: {
    async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
      if (isMockMode()) {
        return { code: 200, message: "OK (Mock)", data: getMockWallet(), timestamp: new Date().toISOString() };
      }
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
      if (isMockMode()) {
        const updated = claimMockDailyReward();
        return { code: 200, message: "Daily reward claimed (+10 Crystals) (Mock)", data: updated, timestamp: new Date().toISOString() };
      }

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
      const updatedWallet = claimMockDailyReward();
      return { code: 200, message: "Daily reward claimed (+10 Crystals)", data: updatedWallet, timestamp: new Date().toISOString() };
    }
  }
};
