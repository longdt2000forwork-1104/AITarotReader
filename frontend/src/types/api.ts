export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export type Arcana = "MAJOR" | "MINOR";
export type Suit = "WANDS" | "CUPS" | "SWORDS" | "PENTACLES";
export type Persona = "MYSTIC_SAGE" | "PRACTICAL_COACH" | "SHADOW_EXPLORER";
export type InputMode = "CARD_DRAW" | "QUESTION_FIRST" | "INTENT_PROMPT";
export type SessionStatus = "CREATED" | "DRAWING" | "INTERPRETING" | "COMPLETED";

export interface TarotCardDto {
  id: number;
  slug: string;
  arcana: Arcana;
  suit: Suit | null;
  cardOrder: number;
  nameEn: string;
  nameVi: string;
  element: string;
  keywordsUprightEn: string;
  keywordsUprightVi: string;
  keywordsReversedEn: string;
  keywordsReversedVi: string;
  meaningUprightEn: string;
  meaningUprightVi: string;
  meaningReversedEn: string;
  meaningReversedVi: string;
  archetypeEn: string;
  archetypeVi: string;
  imageUrl: string;
}

export interface TarotDeck {
  id: string;
  slug: string;
  nameEn: string;
  nameVi: string;
  artist: string;
  unlockTier: "FREE" | "PRO" | "MASTER";
  creditCost: number;
  cardCount: number;
  descriptionEn: string;
  descriptionVi: string;
  coverImageUrl: string;
  isActive: boolean;
}

export interface SpreadPosition {
  index: number;
  name_en: string;
  name_vi: string;
}

export interface SpreadTemplate {
  id: string;
  code: string;
  nameEn: string;
  nameVi: string;
  cardCount: number;
  crystalCost: number;
  descriptionEn: string;
  descriptionVi: string;
  positionsJson: string;
  parsedPositions?: SpreadPosition[];
}

export interface DrawnCardDto {
  id?: string;
  positionIndex: number;
  positionNameEn: string;
  positionNameVi: string;
  isReversed: boolean;
  notes?: string;
  card: TarotCardDto;
}

export interface SessionMessageDto {
  id: string;
  sender: "USER" | "AI_READER";
  content: string;
  createdAt: string;
}

export interface ReadingSessionDto {
  id: string;
  sessionCode: string;
  status: SessionStatus;
  question: string;
  inputMode: InputMode;
  persona: Persona;
  spreadTemplate: SpreadTemplate;
  deck: TarotDeck;
  drawnCards: DrawnCardDto[];
  aiInterpretation?: string;
  messages: SessionMessageDto[];
  createdAt: string;
}

export interface CreateReadingSessionRequest {
  spreadId: string;
  deckId: string;
  question?: string;
  inputMode?: InputMode;
  persona?: Persona;
}

export interface JournalEntryDto {
  id: string;
  readingSessionId: string;
  sessionCode: string;
  title: string;
  summary: string;
  userNotes: string;
  tags: string[];
  spreadNameEn: string;
  spreadNameVi: string;
  cardCount: number;
  createdAt: string;
}

export interface MysticProfileDto {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  lifePathNumber: number;
  dominantArchetype: string;
  readingStyle: string;
}

export interface UpdateMysticProfileRequest {
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  dominantArchetype?: string;
  readingStyle?: string;
}

export interface CrystalTransactionDto {
  id: string;
  amount: number;
  type: "DAILY_REWARD" | "SPREAD_READING" | "PURCHASE" | "AI_FOLLOWUP";
  description: string;
  createdAt: string;
}

export interface WalletBalanceDto {
  balance: number;
  tier: "FREE" | "PRO" | "SEEKER";
  transactions: CrystalTransactionDto[];
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  tier: "FREE" | "PRO" | "SEEKER";
  crystalBalance: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserDto;
}
