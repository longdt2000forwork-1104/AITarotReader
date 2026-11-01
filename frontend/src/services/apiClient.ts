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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper for simulated async delay in mock mode
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

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
    // Ignore storage quota errors
  }
}

// ----------------------------------------------------------------------
// Unified API Client
// ----------------------------------------------------------------------
export const apiClient = {
  // 1. Auth Module
  auth: {
    async getCurrentUser(): Promise<ApiResponse<UserDto>> {
      if (USE_MOCK) {
        await delay(100);
        const user = getStorageItem("tarot_user", MOCK_USER);
        return { code: 200, message: "OK", data: user, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/auth/me`, { credentials: "include" });
      return res.json();
    },

    async login(email: string): Promise<ApiResponse<AuthResponse>> {
      if (USE_MOCK) {
        await delay(250);
        const user = { ...MOCK_USER, email };
        setStorageItem("tarot_user", user);
        return {
          code: 200,
          message: "Login successful",
          data: {
            accessToken: "mock_jwt_token_sample",
            tokenType: "Bearer",
            user
          },
          timestamp: new Date().toISOString()
        };
      }
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      return res.json();
    },

    async logout(): Promise<ApiResponse<boolean>> {
      if (USE_MOCK) {
        await delay(100);
        return { code: 200, message: "Logged out", data: true, timestamp: new Date().toISOString() };
      }
      return { code: 200, message: "Logged out", data: true, timestamp: new Date().toISOString() };
    }
  },

  // 2. Tarot Catalog Module
  tarot: {
    async getCards(arcana?: string, suit?: string): Promise<ApiResponse<TarotCardDto[]>> {
      if (USE_MOCK) {
        await delay(150);
        let cards = [...MOCK_CARDS];
        if (arcana) {
          cards = cards.filter((c) => c.arcana.toUpperCase() === arcana.toUpperCase());
        }
        if (suit) {
          cards = cards.filter((c) => c.suit && c.suit.toUpperCase() === suit.toUpperCase());
        }
        return { code: 200, message: "OK", data: cards, timestamp: new Date().toISOString() };
      }
      const params = new URLSearchParams();
      if (arcana) params.append("arcana", arcana);
      if (suit) params.append("suit", suit);
      const res = await fetch(`${BASE_URL}/api/v1/tarot/cards?${params.toString()}`);
      return res.json();
    },

    async getCardById(id: number): Promise<ApiResponse<TarotCardDto>> {
      if (USE_MOCK) {
        await delay(100);
        const card = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        return { code: 200, message: "OK", data: card, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/tarot/cards/${id}`);
      return res.json();
    },

    async getDecks(): Promise<ApiResponse<TarotDeck[]>> {
      if (USE_MOCK) {
        await delay(150);
        return { code: 200, message: "OK", data: MOCK_DECKS, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/tarot/decks`);
      return res.json();
    },

    async getSpreads(): Promise<ApiResponse<SpreadTemplate[]>> {
      if (USE_MOCK) {
        await delay(150);
        return { code: 200, message: "OK", data: MOCK_SPREADS, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/tarot/spreads`);
      return res.json();
    }
  },

  // 3. Reading Session Module
  readings: {
    async create(req: CreateReadingSessionRequest): Promise<ApiResponse<ReadingSessionDto>> {
      if (USE_MOCK) {
        await delay(300);
        const spread = MOCK_SPREADS.find((s) => s.id === req.spreadId) || MOCK_SPREADS[1];
        const deck = MOCK_DECKS.find((d) => d.id === req.deckId) || MOCK_DECKS[0];

        const newSession: ReadingSessionDto = {
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

        const existing = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        setStorageItem("tarot_sessions", [newSession, ...existing]);

        return { code: 201, message: "Session created", data: newSession, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      return res.json();
    },

    async getById(id: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (USE_MOCK) {
        await delay(150);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        const session = sessions.find((s) => s.id === id || s.sessionCode === id) || sessions[0];
        return { code: 200, message: "OK", data: session, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/${id}`);
      return res.json();
    },

    async drawCards(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (USE_MOCK) {
        await delay(400);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        const session = sessionIndex >= 0 ? sessions[sessionIndex] : sessions[0];

        const count = session.spreadTemplate.cardCount;
        const positions = session.spreadTemplate.parsedPositions || [
          { index: 0, name_en: "Focus", name_vi: "Trọng tâm" }
        ];

        // Draw unique random cards
        const shuffled = [...MOCK_CARDS].sort(() => 0.5 - Math.random());
        const drawnCards: DrawnCardDto[] = shuffled.slice(0, count).map((card, idx) => {
          const pos = positions[idx] || { index: idx, name_en: `Position ${idx + 1}`, name_vi: `Vị trí ${idx + 1}` };
          const isReversed = Math.random() < 0.25; // 25% chance reversed
          return {
            id: `DC-${Date.now()}-${idx}`,
            positionIndex: idx,
            positionNameEn: pos.name_en,
            positionNameVi: pos.name_vi,
            isReversed,
            card
          };
        });

        session.drawnCards = drawnCards;
        session.status = "DRAWING";

        sessions[sessionIndex >= 0 ? sessionIndex : 0] = session;
        setStorageItem("tarot_sessions", sessions);

        return { code: 200, message: "Cards drawn", data: session, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/${sessionId}/draw`, { method: "POST" });
      return res.json();
    },

    async interpret(sessionId: string): Promise<ApiResponse<ReadingSessionDto>> {
      if (USE_MOCK) {
        await delay(600);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        const session = sessionIndex >= 0 ? sessions[sessionIndex] : sessions[0];

        // Generate synthetic interpretation based on drawn cards
        const cardSummaries = session.drawnCards
          .map((dc, i) => {
            const orientation = dc.isReversed ? "Ngược (Reversed)" : "Thuận (Upright)";
            return `${i + 1}. **${dc.positionNameVi} (${dc.card.nameVi} - ${orientation})**:\n${
              dc.isReversed ? dc.card.meaningReversedVi : dc.card.meaningUprightVi
            }`;
          })
          .join("\n\n");

        session.aiInterpretation = `### Phân tích Tổng quan Trải bài (${session.spreadTemplate.nameVi})\n\n${cardSummaries}\n\n**Lời khuyên đúc kết**: Năng lượng cốt lõi nhắc nhở bạn giữ vững tâm định, lắng nghe trực giác và tự tin vào các quyết định hành động trong tuần này.`;
        session.status = "COMPLETED";

        sessions[sessionIndex >= 0 ? sessionIndex : 0] = session;
        setStorageItem("tarot_sessions", sessions);

        return { code: 200, message: "Interpretation generated", data: session, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/${sessionId}/interpret`, { method: "POST" });
      return res.json();
    },

    async sendChat(sessionId: string, userMessage: string): Promise<ApiResponse<SessionMessageDto>> {
      if (USE_MOCK) {
        await delay(400);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        const session = sessionIndex >= 0 ? sessions[sessionIndex] : sessions[0];

        const userMsg: SessionMessageDto = {
          id: `MSG-${Date.now()}-U`,
          sender: "USER",
          content: userMessage,
          createdAt: new Date().toISOString()
        };

        const aiMsg: SessionMessageDto = {
          id: `MSG-${Date.now()}-A`,
          sender: "AI_READER",
          content: `Dựa trên năng lượng của lá bài và câu hỏi của bạn: "${userMessage}", vũ trụ khuyên bạn hãy tin tưởng vào cảm nhận nội tâm đầu tiên. Sự do dự chỉ là tấm gương phản chiếu những lo lắng tạm thời.`,
          createdAt: new Date(Date.now() + 500).toISOString()
        };

        session.messages = [...(session.messages || []), userMsg, aiMsg];
        sessions[sessionIndex >= 0 ? sessionIndex : 0] = session;
        setStorageItem("tarot_sessions", sessions);

        return { code: 200, message: "Reply sent", data: aiMsg, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      return res.json();
    },

    async saveJournal(sessionId: string, notes: string, tags: string[] = []): Promise<ApiResponse<JournalEntryDto>> {
      if (USE_MOCK) {
        await delay(250);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        const session = sessions.find((s) => s.id === sessionId) || sessions[0];

        const newEntry: JournalEntryDto = {
          id: `JN-${Date.now().toString().slice(-4)}`,
          readingSessionId: session.id,
          sessionCode: session.sessionCode,
          title: `Ghi chép: ${session.question.slice(0, 40)}...`,
          summary: session.aiInterpretation?.slice(0, 100) || "Trải bài định hướng cá nhân",
          userNotes: notes,
          tags: tags.length ? tags : ["Personal Reflection", "Reading"],
          spreadNameEn: session.spreadTemplate.nameEn,
          spreadNameVi: session.spreadTemplate.nameVi,
          cardCount: session.drawnCards.length || session.spreadTemplate.cardCount,
          createdAt: new Date().toISOString()
        };

        const existing = getStorageItem<JournalEntryDto[]>("tarot_journals", MOCK_JOURNAL_ENTRIES);
        setStorageItem("tarot_journals", [newEntry, ...existing]);

        return { code: 201, message: "Saved to journal", data: newEntry, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/${sessionId}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, tags })
      });
      return res.json();
    },

    async getHistory(): Promise<ApiResponse<ReadingSessionDto[]>> {
      if (USE_MOCK) {
        await delay(150);
        const sessions = getStorageItem<ReadingSessionDto[]>("tarot_sessions", MOCK_SESSIONS);
        return { code: 200, message: "OK", data: sessions, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/history`);
      return res.json();
    },

    async getJournal(): Promise<ApiResponse<JournalEntryDto[]>> {
      if (USE_MOCK) {
        await delay(150);
        const journals = getStorageItem<JournalEntryDto[]>("tarot_journals", MOCK_JOURNAL_ENTRIES);
        return { code: 200, message: "OK", data: journals, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/readings/journal`);
      return res.json();
    }
  },

  // 4. Mystic Profile Module
  profile: {
    async getMysticProfile(): Promise<ApiResponse<MysticProfileDto>> {
      if (USE_MOCK) {
        await delay(150);
        const profile = getStorageItem("tarot_mystic_profile", MOCK_MYSTIC_PROFILE);
        return { code: 200, message: "OK", data: profile, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/profile/mystic`);
      return res.json();
    },

    async updateMysticProfile(data: UpdateMysticProfileRequest): Promise<ApiResponse<MysticProfileDto>> {
      if (USE_MOCK) {
        await delay(250);
        const current = getStorageItem("tarot_mystic_profile", MOCK_MYSTIC_PROFILE);
        const updated = { ...current, ...data };
        setStorageItem("tarot_mystic_profile", updated);
        return { code: 200, message: "Profile updated", data: updated, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/profile/mystic`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },

  // 5. Crystal Wallet Module
  wallet: {
    async getBalance(): Promise<ApiResponse<WalletBalanceDto>> {
      if (USE_MOCK) {
        await delay(150);
        const wallet = getStorageItem("tarot_wallet", MOCK_WALLET);
        return { code: 200, message: "OK", data: wallet, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/wallet/balance`);
      return res.json();
    },

    async claimDailyReward(): Promise<ApiResponse<WalletBalanceDto>> {
      if (USE_MOCK) {
        await delay(250);
        const wallet = getStorageItem("tarot_wallet", MOCK_WALLET);
        const updatedBalance = wallet.balance + 10;
        const newTx = {
          id: `TX-${Date.now()}`,
          amount: +10,
          type: "DAILY_REWARD" as const,
          description: "Daily Dawn Login Blessing",
          createdAt: new Date().toISOString()
        };
        const updatedWallet: WalletBalanceDto = {
          ...wallet,
          balance: updatedBalance,
          transactions: [newTx, ...wallet.transactions]
        };
        setStorageItem("tarot_wallet", updatedWallet);
        return { code: 200, message: "Daily reward claimed (+10 Crystals)", data: updatedWallet, timestamp: new Date().toISOString() };
      }
      const res = await fetch(`${BASE_URL}/api/v1/wallet/daily-reward`, { method: "POST" });
      return res.json();
    }
  }
};
