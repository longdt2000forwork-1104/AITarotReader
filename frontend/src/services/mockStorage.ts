import {
  ReadingSessionDto,
  CreateReadingSessionRequest,
  DrawnCardDto,
  SessionMessageDto,
  JournalEntryDto,
  MysticProfileDto,
  UpdateMysticProfileRequest,
  WalletBalanceDto,
  UserDto,
  TarotCardDto
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

const STORAGE_KEYS = {
  SESSIONS: "tarot_mock_sessions_store",
  JOURNALS: "tarot_mock_journals_store",
  PROFILE: "tarot_mock_profile_store",
  WALLET: "tarot_mock_wallet_store",
  DAILY_DRAW: "tarot_mock_daily_draw_store"
};

function readStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Mock storage write failed:", e);
  }
}

// 1. Sessions Management
export function getMockSessions(): ReadingSessionDto[] {
  return readStorage<ReadingSessionDto[]>(STORAGE_KEYS.SESSIONS, MOCK_SESSIONS);
}

export function getMockSessionById(id: string): ReadingSessionDto | null {
  const sessions = getMockSessions();
  const found = sessions.find((s) => s.id === id || s.sessionCode === id);
  return found || sessions[0] || null;
}

export function createMockSession(req: CreateReadingSessionRequest): ReadingSessionDto {
  const sessions = getMockSessions();
  const spread = MOCK_SPREADS.find((s) => s.id === req.spreadId) || MOCK_SPREADS[1];
  const deck = MOCK_DECKS.find((d) => d.id === req.deckId) || MOCK_DECKS[0];
  
  const id = `RS-MOCK-${Date.now().toString().slice(-4)}`;
  const sessionCode = `SESSION-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newSession: ReadingSessionDto = {
    id,
    sessionCode,
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

  const updated = [newSession, ...sessions];
  writeStorage(STORAGE_KEYS.SESSIONS, updated);
  return newSession;
}

export function drawCardsForMockSession(sessionId: string): ReadingSessionDto {
  const sessions = getMockSessions();
  let session = sessions.find((s) => s.id === sessionId) || sessions[0];
  if (!session) {
    session = createMockSession({ spreadId: "S-02", deckId: "ED-01" });
  }

  if (session.drawnCards && session.drawnCards.length > 0) {
    return session;
  }

  const positions = session.spreadTemplate?.parsedPositions || [
    { index: 0, name_en: "Focus 1", name_vi: "Trọng tâm 1" },
    { index: 1, name_en: "Focus 2", name_vi: "Trọng tâm 2" },
    { index: 2, name_en: "Focus 3", name_vi: "Trọng tâm 3" }
  ];

  // Shuffle and pick cards
  const shuffled = [...MOCK_CARDS].sort(() => 0.5 - Math.random());
  const drawnCards: DrawnCardDto[] = positions.map((pos, idx) => {
    const card = shuffled[idx % shuffled.length];
    return {
      id: `DC-MOCK-${sessionId}-${idx + 1}`,
      positionIndex: idx,
      positionNameEn: pos.name_en,
      positionNameVi: pos.name_vi,
      isReversed: Math.random() < 0.2,
      isClarifier: false,
      card
    };
  });

  session = {
    ...session,
    drawnCards,
    status: "DRAWING"
  };

  const updated = sessions.map((s) => (s.id === session.id ? session : s));
  writeStorage(STORAGE_KEYS.SESSIONS, updated);
  return session;
}

export function interpretMockSession(sessionId: string): ReadingSessionDto {
  const sessions = getMockSessions();
  let session = sessions.find((s) => s.id === sessionId) || sessions[0];
  if (!session) {
    session = drawCardsForMockSession(sessionId);
  } else if (!session.drawnCards || session.drawnCards.length === 0) {
    session = drawCardsForMockSession(sessionId);
  }

  const cards = session.drawnCards || [];
  const cardAnalysis = cards
    .map((dc, idx) => {
      const name = dc.card?.nameVi || dc.card?.nameEn || `Lá bài #${idx + 1}`;
      const state = dc.isReversed ? "Nghịch hướng (Reversed)" : "Thuận hướng (Upright)";
      const meaning = dc.isReversed
        ? dc.card?.meaningReversedVi || "Cần soi rọi lại nội tâm để vượt qua rào cản tạm thời."
        : dc.card?.meaningUprightVi || "Năng lượng đang khai mở mạnh mẽ, tràn đầy tiềm năng.";
      return `${idx + 1}. **${dc.positionNameVi} — ${name} (${state})**\n   - *Ý nghĩa chiêm nghiệm:* ${meaning}\n   - *Thông điệp cốt lõi:* Biểu trưng cho sự chuyển biến cần thiết trên hành trình của bạn.`;
    })
    .join("\n\n");

  const aiInterpretation = `### Tổng hòa Luận giải Năng lượng: ${session.question || "Định hướng & Chiêm nghiệm"}

Dòng năng lượng trong phiên trải bài này phản ánh một giai đoạn chuyển giao quan trọng, nơi ý chí cá nhân kết hợp cùng dòng chảy tự nhiên của vũ trụ để tạo ra bước ngoặt mới.

---

### Chi tiết Từng Vị Trí Trải Bài

${cardAnalysis}

---

### Lời Khuyên Hành Động & Định Hướng Tương Lai
- **Tập trung nội tại:** Hãy giữ tâm thế bình thản trước những biến động ngoại cảnh.
- **Dứt khoát chuyển động:** Đừng chần chừ khi cơ hội gõ cửa; những nền tảng đã sẵn sàng để bạn tạo đột phá.
- **Tin tưởng vào trực giác:** Lắng nghe tiếng nói sâu thẳm bên trong hơn là những ồn ào xung quanh.`;

  const initialMsg: SessionMessageDto = {
    id: `MSG-INIT-${Date.now()}`,
    sender: "AI_READER",
    content: "Chào bạn. Tôi là AI Tarot Reader. Tôi đã luận giải xong trải bài của bạn. Bạn có muốn đi sâu hơn vào lá bài nào không?",
    createdAt: new Date().toISOString()
  };

  session = {
    ...session,
    aiInterpretation,
    status: "COMPLETED",
    messages: session.messages && session.messages.length > 0 ? session.messages : [initialMsg]
  };

  const updated = sessions.map((s) => (s.id === session.id ? session : s));
  writeStorage(STORAGE_KEYS.SESSIONS, updated);
  return session;
}

export function drawClarifierForMockSession(sessionId: string): ReadingSessionDto {
  const sessions = getMockSessions();
  let session = sessions.find((s) => s.id === sessionId) || sessions[0];
  if (!session) return session;

  const drawnCardIds = new Set((session.drawnCards || []).map((dc) => dc.card?.id));
  const availableCards = MOCK_CARDS.filter((c) => !drawnCardIds.has(c.id));
  const clarifierCard = availableCards[Math.floor(Math.random() * availableCards.length)] || MOCK_CARDS[0];

  const clarifierCount = (session.drawnCards || []).filter((dc) => dc.isClarifier).length + 1;
  const isReversed = Math.random() < 0.2;

  const newClarifier: DrawnCardDto = {
    id: `DC-CLARIFIER-${Date.now()}`,
    positionIndex: (session.drawnCards || []).length,
    positionNameEn: `Clarifier Card #${clarifierCount}`,
    positionNameVi: `Thẻ Bổ Trợ #${clarifierCount}`,
    isReversed,
    isClarifier: true,
    card: clarifierCard
  };

  const clarifierExplanation: SessionMessageDto = {
    id: `MSG-CLARIFIER-${Date.now()}`,
    sender: "AI_READER",
    content: `✨ **Rút thẻ bổ trợ:** Tôi đã rút lá **${clarifierCard.nameVi} (${clarifierCard.nameEn}) - ${isReversed ? "Nghịch hướng" : "Thuận hướng"}** nhằm soi rọi sâu sắc hơn vào câu hỏi của bạn.\n\n*Thông điệp bổ sung:* ${
      isReversed ? clarifierCard.meaningReversedVi : clarifierCard.meaningUprightVi
    }`,
    createdAt: new Date().toISOString()
  };

  session = {
    ...session,
    drawnCards: [...(session.drawnCards || []), newClarifier],
    messages: [...(session.messages || []), clarifierExplanation]
  };

  const updated = sessions.map((s) => (s.id === session.id ? session : s));
  writeStorage(STORAGE_KEYS.SESSIONS, updated);
  return session;
}

export function sendChatForMockSession(sessionId: string, userMessage: string): SessionMessageDto {
  const sessions = getMockSessions();
  const session = sessions.find((s) => s.id === sessionId) || sessions[0];

  const userMsg: SessionMessageDto = {
    id: `MSG-${Date.now()}-U`,
    sender: "USER",
    content: userMessage,
    createdAt: new Date().toISOString()
  };

  const aiReply: SessionMessageDto = {
    id: `MSG-${Date.now()}-A`,
    sender: "AI_READER",
    content: `Dựa trên câu hỏi của bạn: "${userMessage}" cùng năng lượng các lá bài trong trải bài này, vũ trụ gửi đến bạn thông điệp rằng: Mọi rào cản bạn đang gặp phải chỉ là bước thử thách độ kiên nhẫn. Hãy vững tin vào giá trị bản thân và từng bước thực hiện kế hoạch đã định.`,
    createdAt: new Date(Date.now() + 500).toISOString()
  };

  if (session) {
    session.messages = [...(session.messages || []), userMsg, aiReply];
    const updated = sessions.map((s) => (s.id === session.id ? session : s));
    writeStorage(STORAGE_KEYS.SESSIONS, updated);
  }

  return aiReply;
}

// 2. Daily Draw Simulation
export function checkMockDailyDraw(locale = "vi"): ReadingSessionDto | null {
  const stored = readStorage<ReadingSessionDto | null>(STORAGE_KEYS.DAILY_DRAW, null);
  if (stored && stored.drawnCards && stored.drawnCards.length > 0) {
    return stored;
  }
  return null;
}

export function flipMockDailyDraw(locale = "vi", force = false): ReadingSessionDto {
  if (!force) {
    const existing = checkMockDailyDraw(locale);
    if (existing) return existing;
  }

  const randomCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)] || MOCK_CARDS[19];
  const isVi = locale === "vi";

  const dailySession: ReadingSessionDto = {
    id: `DAILY-${Date.now()}`,
    sessionCode: `DAILY-${new Date().toISOString().slice(0, 10)}`,
    status: "COMPLETED",
    question: isVi ? "Thông điệp và năng lượng dẫn lối ngày hôm nay" : "Daily Guidance & Energy Focus",
    inputMode: "CARD_DRAW",
    persona: "MYSTIC_SAGE",
    spreadTemplate: MOCK_SPREADS[0],
    deck: MOCK_DECKS[0],
    drawnCards: [
      {
        id: `DC-DAILY-${Date.now()}`,
        positionIndex: 0,
        positionNameEn: "Daily Focus & Guidance",
        positionNameVi: "Năng lượng & Lời khuyên trọng tâm",
        isReversed: false,
        isClarifier: false,
        card: randomCard
      }
    ],
    aiInterpretation: isVi
      ? `### Thông Điệp Ngày: ${randomCard.nameVi} (${randomCard.nameEn})\n\n**Ý nghĩa:** ${randomCard.meaningUprightVi}\n\n**Lời khuyên hôm nay:** Hãy bắt đầu ngày mới với tâm thế tích cực và cởi mở đón nhận những cơ hội bất ngờ.`
      : `### Daily Guidance: ${randomCard.nameEn}\n\n**Meaning:** ${randomCard.meaningUprightEn}\n\n**Advice for Today:** Approach the day with openness and embrace emerging opportunities with confidence.`,
    messages: [],
    createdAt: new Date().toISOString()
  };

  writeStorage(STORAGE_KEYS.DAILY_DRAW, dailySession);
  return dailySession;
}

// 3. Journal Management
export function getMockJournals(): JournalEntryDto[] {
  return readStorage<JournalEntryDto[]>(STORAGE_KEYS.JOURNALS, MOCK_JOURNAL_ENTRIES);
}

export function saveMockJournal(sessionId: string, notes: string, tags: string[] = []): JournalEntryDto {
  const journals = getMockJournals();
  const session = getMockSessionById(sessionId);

  const entry: JournalEntryDto = {
    id: `JN-${Date.now().toString().slice(-4)}`,
    readingSessionId: sessionId,
    sessionCode: session?.sessionCode || `SESSION-${sessionId.slice(0, 8)}`,
    title: session?.question || "Ghi chép trải bài Tarot",
    summary: notes.slice(0, 120) || "Nghiệm lý trải bài Tarot",
    userNotes: notes,
    tags: tags.length ? tags : ["Tarot Reflection", "Mock Mode"],
    spreadNameEn: session?.spreadTemplate?.nameEn || "Tarot Spread",
    spreadNameVi: session?.spreadTemplate?.nameVi || "Trải bài Tarot",
    cardCount: session?.drawnCards?.length || 3,
    createdAt: new Date().toISOString()
  };

  const updated = [entry, ...journals];
  writeStorage(STORAGE_KEYS.JOURNALS, updated);
  return entry;
}

// 4. Profile & Wallet
export function getMockProfile(): MysticProfileDto {
  return readStorage<MysticProfileDto>(STORAGE_KEYS.PROFILE, MOCK_MYSTIC_PROFILE);
}

export function updateMockProfile(data: UpdateMysticProfileRequest): MysticProfileDto {
  const current = getMockProfile();
  const updated: MysticProfileDto = {
    ...current,
    ...data
  };
  writeStorage(STORAGE_KEYS.PROFILE, updated);
  return updated;
}

export function getMockWallet(): WalletBalanceDto {
  return readStorage<WalletBalanceDto>(STORAGE_KEYS.WALLET, MOCK_WALLET);
}

export function claimMockDailyReward(): WalletBalanceDto {
  const current = getMockWallet();
  const updated: WalletBalanceDto = {
    ...current,
    balance: current.balance + 10,
    transactions: [
      {
        id: `TX-DAILY-${Date.now()}`,
        amount: +10,
        type: "DAILY_REWARD",
        description: "Daily Dawn Login Blessing (Mock Mode)",
        createdAt: new Date().toISOString()
      },
      ...current.transactions
    ]
  };
  writeStorage(STORAGE_KEYS.WALLET, updated);
  return updated;
}

// Reset all mock data to factory state
export function resetAllMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.JOURNALS);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.WALLET);
  localStorage.removeItem(STORAGE_KEYS.DAILY_DRAW);
  localStorage.removeItem("ai_tarot_daily_draw");
}
