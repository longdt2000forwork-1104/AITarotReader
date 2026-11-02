import { TAROT_CARDS } from "@/data/tarotCards";
import {
  TarotCardDto,
  TarotDeck,
  SpreadTemplate,
  MysticProfileDto,
  WalletBalanceDto,
  UserDto,
  ReadingSessionDto,
  JournalEntryDto,
  Arcana,
  Suit
} from "@/types/api";

// 1. Curated Tarot Decks (Exact alignment with V2__seed_tarot_catalog.sql)
export const MOCK_DECKS: TarotDeck[] = [
  {
    id: "ED-01",
    slug: "rider-waite-1909",
    nameEn: "Rider-Waite 1909 Restoration",
    nameVi: "Phục chế Rider-Waite 1909",
    artist: "Pamela Colman Smith & A.E. Waite",
    unlockTier: "FREE",
    creditCost: 0,
    cardCount: 78,
    descriptionEn: "The canonical 1909 classic edition restored with antique archival colors.",
    descriptionVi: "Bản phục chế chuẩn xác ấn bản cổ điển năm 1909 với màu giấy ngà hoài niệm.",
    coverImageUrl: "/decks/rider-waite-1909/cards/00_the_fool.webp",
    isActive: true
  },
  {
    id: "ED-02",
    slug: "golden-art-nouveau",
    nameEn: "Golden Art Nouveau Folio",
    nameVi: "Bản dát vàng Art Nouveau",
    artist: "Giulia F. Massaglia",
    unlockTier: "PRO",
    creditCost: 50,
    cardCount: 78,
    descriptionEn: "Lavish gold foil details and flowing organic floral motifs inspired by the Belle Époque.",
    descriptionVi: "Họa tiết hoa lá uốn lượn và chi tiết ánh kim sang trọng lấy cảm hứng từ thời kỳ hoàng kim.",
    coverImageUrl: "/decks/rider-waite-1909/cards/01_the_magician.webp",
    isActive: true
  },
  {
    id: "ED-03",
    slug: "minimalist-charcoal",
    nameEn: "Minimalist Charcoal Noir",
    nameVi: "Than chì Đen tối giản",
    artist: "Atelier Monochrome",
    unlockTier: "PRO",
    creditCost: 40,
    cardCount: 78,
    descriptionEn: "Stripped down brutalist ink sketches emphasizing visceral raw archetypes.",
    descriptionVi: "Nét vẽ mực than chì tối giản, lược bỏ chi tiết rườm rà tập trung vào năng lượng cốt lõi.",
    coverImageUrl: "/decks/rider-waite-1909/cards/13_death.webp",
    isActive: true
  },
  {
    id: "ED-04",
    slug: "botanical-herbarium",
    nameEn: "Botanical Flora Herbarium",
    nameVi: "Thảo mộc Cổ điển Herbarium",
    artist: "Sylvia Vance",
    unlockTier: "PRO",
    creditCost: 40,
    cardCount: 78,
    descriptionEn: "Deep connection between plant folklore, medicinal herbs, and ancient Tarot wisdom.",
    descriptionVi: "Sự kết hợp giữa tri thức thảo mộc, hoa cỏ cổ truyền và hệ thống biểu tượng Tarot.",
    coverImageUrl: "/decks/rider-waite-1909/cards/17_the_star.webp",
    isActive: true
  },
  {
    id: "ED-05",
    slug: "celestial-starlight",
    nameEn: "Celestial Starlight Astral",
    nameVi: "Tinh tú Vũ trụ Celestial",
    artist: "Orion Constellation Guild",
    unlockTier: "PRO",
    creditCost: 60,
    cardCount: 78,
    descriptionEn: "Deep indigo cosmic nebula backdrops with glowing stellar constellations and sacred geometry.",
    descriptionVi: "Nền vũ trụ chòm sao màu chàm huyền ảo với hình học thiêng liêng rực rỡ.",
    coverImageUrl: "/decks/rider-waite-1909/cards/19_the_sun.webp",
    isActive: true
  }
];

// 2. Spread Templates (Exact alignment with V2__seed_tarot_catalog.sql)
export const MOCK_SPREADS: SpreadTemplate[] = [
  {
    id: "S-01",
    code: "daily_single",
    nameEn: "Daily Guidance Card",
    nameVi: "Lá bài Định hướng Ngày",
    cardCount: 1,
    crystalCost: 0,
    descriptionEn: "A single card drawn for morning focus, meditation, and daily energetic forecast.",
    descriptionVi: "Một lá bài duy nhất cho năng lượng ngày mới, lời khuyên và thông điệp tĩnh tâm.",
    positionsJson: '[{"index":0,"name_en":"Daily Focus & Advice","name_vi":"Năng lượng & Lời khuyên trọng tâm"}]',
    parsedPositions: [
      { index: 0, name_en: "Daily Focus & Advice", name_vi: "Năng lượng & Lời khuyên trọng tâm" }
    ]
  },
  {
    id: "S-02",
    code: "past_present_future",
    nameEn: "Three Card Timeline",
    nameVi: "Dòng thời gian Quá khứ - Hiện tại - Tương lai",
    cardCount: 3,
    crystalCost: 5,
    descriptionEn: "The classic three-card layout uncovering origins, current dynamics, and emerging outcomes.",
    descriptionVi: "Trải bài kinh điển khai mở căn nguyên quá khứ, hiện trạng cốt lõi và hướng đi tương lai.",
    positionsJson: '[{"index":0,"name_en":"Past Roots","name_vi":"Nguồn gốc Quá khứ"},{"index":1,"name_en":"Present Dynamics","name_vi":"Năng lượng Hiện tại"},{"index":2,"name_en":"Future Outcome","name_vi":"Xu hướng Tương lai"}]',
    parsedPositions: [
      { index: 0, name_en: "Past Roots", name_vi: "Nguồn gốc Quá khứ" },
      { index: 1, name_en: "Present Dynamics", name_vi: "Năng lượng Hiện tại" },
      { index: 2, name_en: "Future Outcome", name_vi: "Xu hướng Tương lai" }
    ]
  },
  {
    id: "S-03",
    code: "mind_body_spirit",
    nameEn: "Mind, Body & Spirit",
    nameVi: "Thân - Tâm - Trí",
    cardCount: 3,
    crystalCost: 5,
    descriptionEn: "A holistic diagnostic spread assessing mental clarity, physical stamina, and soul alignment.",
    descriptionVi: "Chẩn đoán toàn diện về tâm trí, cảm xúc cơ thể và định hướng tâm linh cá nhân.",
    positionsJson: '[{"index":0,"name_en":"Mind (Mental State)","name_vi":"Tâm trí (Suy nghĩ & Định hướng)"},{"index":1,"name_en":"Body (Action & Grounding)","name_vi":"Thân thể (Hành động & Thể chất)"},{"index":2,"name_en":"Spirit (Higher Intuition)","name_vi":"Linh hồn (Trực giác & Bình an)"}]',
    parsedPositions: [
      { index: 0, name_en: "Mind (Mental State)", name_vi: "Tâm trí (Suy nghĩ & Định hướng)" },
      { index: 1, name_en: "Body (Action & Grounding)", name_vi: "Thân thể (Hành động & Thể chất)" },
      { index: 2, name_en: "Spirit (Higher Intuition)", name_vi: "Linh hồn (Trực giác & Bình an)" }
    ]
  },
  {
    id: "S-04",
    code: "relationship_mirror",
    nameEn: "Relationship Mirror",
    nameVi: "Gương phản chiếu Mối quan hệ",
    cardCount: 5,
    crystalCost: 10,
    descriptionEn: "Five-card deep dive exploring interpersonal connection, unspoken tensions, and shared growth.",
    descriptionVi: "Trải 5 lá đi sâu vào kết nối hai phía, những điểm nghẽn ngầm và hướng phát triển chung.",
    positionsJson: '[{"index":0,"name_en":"Your Energy","name_vi":"Năng lượng của bạn"},{"index":1,"name_en":"Their Energy","name_vi":"Năng lượng đối phương"},{"index":2,"name_en":"The Bridge / Tension","name_vi":"Cầu nối / Điểm nghẽn"},{"index":3,"name_en":"Unspoken Factor","name_vi":"Yếu tố tiềm ẩn"},{"index":4,"name_en":"Probable Outcome","name_vi":"Tiềm năng phát triển"}]',
    parsedPositions: [
      { index: 0, name_en: "Your Energy", name_vi: "Năng lượng của bạn" },
      { index: 1, name_en: "Their Energy", name_vi: "Năng lượng đối phương" },
      { index: 2, name_en: "The Bridge / Tension", name_vi: "Cầu nối / Điểm nghẽn" },
      { index: 3, name_en: "Unspoken Factor", name_vi: "Yếu tố tiềm ẩn" },
      { index: 4, name_en: "Probable Outcome", name_vi: "Tiềm năng phát triển" }
    ]
  },
  {
    id: "S-05",
    code: "celtic_cross",
    nameEn: "The Grand Celtic Cross",
    nameVi: "Thập tự Celtic Toàn diện",
    cardCount: 10,
    crystalCost: 15,
    descriptionEn: "The legendary comprehensive diagnostic uncovering hidden influences, conscious hopes, and inevitable destiny.",
    descriptionVi: "Trải bài Celtic 10 lá huyền thoại phân tích đa tầng từ tiềm thức, thử thách đến đỉnh cao vận mệnh.",
    positionsJson: '[{"index":0,"name_en":"Present Core","name_vi":"Thực tại cốt lõi"},{"index":1,"name_en":"Cross Challenge","name_vi":"Thử thách cản trở"},{"index":2,"name_en":"Root Foundation","name_vi":"Nền tảng căn cơ"},{"index":3,"name_en":"Past Influences","name_vi":"Dấu ấn quá khứ"},{"index":4,"name_en":"Crown Aspirations","name_vi":"Khát vọng ý thức"},{"index":5,"name_en":"Near Future","name_vi":"Tương lai gần"},{"index":6,"name_en":"Self Attitude","name_vi":"Thái độ bản thân"},{"index":7,"name_en":"External Forces","name_vi":"Tác động môi trường"},{"index":8,"name_en":"Hopes and Fears","name_vi":"Hy vọng & Lo ngại"},{"index":9,"name_en":"Final Outcome","name_vi":"Kết cục tối hậu"}]',
    parsedPositions: [
      { index: 0, name_en: "Present Core", name_vi: "Thực tại cốt lõi" },
      { index: 1, name_en: "Cross Challenge", name_vi: "Thử thách cản trở" },
      { index: 2, name_en: "Root Foundation", name_vi: "Nền tảng căn cơ" },
      { index: 3, name_en: "Past Influences", name_vi: "Dấu ấn quá khứ" },
      { index: 4, name_en: "Crown Aspirations", name_vi: "Khát vọng ý thức" },
      { index: 5, name_en: "Near Future", name_vi: "Tương lai gần" },
      { index: 6, name_en: "Self Attitude", name_vi: "Thái độ bản thân" },
      { index: 7, name_en: "External Forces", name_vi: "Tác động môi trường" },
      { index: 8, name_en: "Hopes and Fears", name_vi: "Hy vọng & Lo ngại" },
      { index: 9, name_en: "Final Outcome", name_vi: "Kết cục tối hậu" }
    ]
  }
];

// 3. Full 78 Tarot Cards mapped to TarotCardDto
export const MOCK_CARDS: TarotCardDto[] = TAROT_CARDS.map((c, index) => {
  const isMajor = c.suit === "MAJOR";
  const arcana: Arcana = isMajor ? "MAJOR" : "MINOR";
  const suit: Suit | null = isMajor ? null : (c.suit as Suit);

  return {
    id: c.id,
    slug: c.slug,
    arcana,
    suit,
    cardOrder: index,
    nameEn: c.nameEn,
    nameVi: c.nameVi,
    element: c.element,
    keywordsUprightEn: c.keywordsEn,
    keywordsUprightVi: c.keywordsVi,
    keywordsReversedEn: "Reversed blockages, delays, hidden aspects",
    keywordsReversedVi: "Trì hoãn, tắc nghẽn năng lượng, bài học cần chuyển hóa",
    meaningUprightEn: c.meaningUprightEn,
    meaningUprightVi: c.meaningUprightVi,
    meaningReversedEn: "A temporary hesitation invites deeper self-examination before proceeding.",
    meaningReversedVi: "Sự ngập ngừng tạm thời nhắc nhở bạn soi rọi lại nội tâm trước khi bước tiếp.",
    archetypeEn: isMajor ? "Major Archetype" : `${c.suit} Suit Lesson`,
    archetypeVi: isMajor ? "Nguyên mẫu Đại bí tích" : `Bài học bộ ${c.suit}`,
    imageUrl: c.image
  };
});

// 4. Default Mock User & Auth
export const MOCK_USER: UserDto = {
  id: "USR-007",
  email: "aria.mystic@aitarotreader.com",
  fullName: "Aria Thorne",
  role: "ROLE_USER",
  tier: "SEEKER",
  crystalBalance: 85
};

// 5. Default Mystic Profile
export const MOCK_MYSTIC_PROFILE: MysticProfileDto = {
  birthDate: "1998-04-12",
  birthTime: "07:30",
  birthCity: "Vienna, Austria",
  sunSign: "Aries",
  moonSign: "Scorpio",
  risingSign: "Leo",
  lifePathNumber: 7,
  dominantArchetype: "The Mystic Seeker",
  readingStyle: "POETIC_REFLECTIVE"
};

// 6. Default Wallet State
export const MOCK_WALLET: WalletBalanceDto = {
  balance: 85,
  tier: "SEEKER",
  transactions: [
    {
      id: "TX-101",
      amount: +10,
      type: "DAILY_REWARD",
      description: "Daily Dawn Login Blessing",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "TX-102",
      amount: -5,
      type: "SPREAD_READING",
      description: "Three Card Timeline Reading",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "TX-103",
      amount: +50,
      type: "PURCHASE",
      description: "Starlight Crystal Starter Pack",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ]
};

// 7. Initial Reading Sessions & Journals
export const MOCK_SESSIONS: ReadingSessionDto[] = [
  {
    id: "RS-8901",
    sessionCode: "SESSION-2026-001",
    status: "COMPLETED",
    question: "What energetic shift should I focus on for my upcoming creative venture?",
    inputMode: "CARD_DRAW",
    persona: "MYSTIC_SAGE",
    spreadTemplate: MOCK_SPREADS[1], // Three Card Timeline
    deck: MOCK_DECKS[0],
    drawnCards: [
      {
        id: "DC-01",
        positionIndex: 0,
        positionNameEn: "Past Roots",
        positionNameVi: "Nguồn gốc Quá khứ",
        isReversed: false,
        card: MOCK_CARDS[0] // The Fool
      },
      {
        id: "DC-02",
        positionIndex: 1,
        positionNameEn: "Present Dynamics",
        positionNameVi: "Năng lượng Hiện tại",
        isReversed: false,
        card: MOCK_CARDS[1] // The Magician
      },
      {
        id: "DC-03",
        positionIndex: 2,
        positionNameEn: "Future Outcome",
        positionNameVi: "Xu hướng Tương lai",
        isReversed: false,
        card: MOCK_CARDS[17] // The Star
      }
    ],
    aiInterpretation:
      "### Tổng hòa Trải bài: Khởi đầu Rực rỡ và Sự Thành toàn Sáng tạo\n\n1. **Quá khứ (The Fool - Thuận)**: Bạn đã bắt đầu hành trình này bằng một niềm tin thuần khiết, không bị gò bó bởi những định kiến cũ. Sự dũng cảm nhảy vào vùng vô định đã tạo tiền đề cho sự thức tỉnh hiện tại.\n\n2. **Hiện tại (The Magician - Thuận)**: Mọi công cụ, kỹ năng và nguồn lực cần thiết đều đã nằm trong lòng bàn tay bạn. Đây là thời khắc để hành động dứt khoát, biến ý tưởng thành tạo vật hữu hình.\n\n3. **Tương lai (The Star - Thuận)**: Ngôi sao hy vọng và sự hồi sinh soi chiếu chặng đường kế tiếp. Dự án của bạn không chỉ đạt được thành công mà còn mang lại sự chữa lành sâu sắc cho cộng đồng xung quanh.",
    messages: [
      {
        id: "MSG-01",
        sender: "AI_READER",
        content: "Chào Aria. Trải bài của bạn mang luồng năng lượng thăng hoa tuyệt vời từ The Fool đến The Star.",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "MSG-02",
        sender: "USER",
        content: "Lá The Magician ở vị trí hiện tại nhắc tôi cần chú ý điều gì nhất?",
        createdAt: new Date(Date.now() - 3600000 * 23.5).toISOString()
      },
      {
        id: "MSG-03",
        sender: "AI_READER",
        content: "The Magician nhắc nhở bạn không nên chần chừ tìm kiếm thêm công cụ từ bên ngoài; vũ khí mạnh nhất của bạn hiện giờ chính là sự tập trung cao độ và niềm tin vào bản thân.",
        createdAt: new Date(Date.now() - 3600000 * 23).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const MOCK_JOURNAL_ENTRIES: JournalEntryDto[] = [
  {
    id: "JN-01",
    readingSessionId: "RS-8901",
    sessionCode: "SESSION-2026-001",
    title: "Sự Thức Tỉnh Sáng Tạo (The Fool -> The Magician -> The Star)",
    summary: "Dự án mới đòi hỏi sự can đảm khởi đầu và vận dụng tối đa các công cụ sẵn có.",
    userNotes: "Cần duy trì sự kỷ luật hàng ngày, không để nỗi sợ thất bại làm xao nhãng việc thực thi.",
    tags: ["Creative Venture", "Career", "Aries Fire"],
    spreadNameEn: "Three Card Timeline",
    spreadNameVi: "Dòng thời gian Quá khứ - Hiện tại - Tương lai",
    cardCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];
