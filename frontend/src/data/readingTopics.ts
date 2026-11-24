export type ReadingTopicId = "LOVE" | "FAMILY" | "CAREER";

export interface ReadingTopicConfig {
  id: ReadingTopicId;
  icon: string;
  labelVi: string;
  labelEn: string;
  descVi: string;
  descEn: string;
  positionsVi: [string, string, string];
  positionsEn: [string, string, string];
  sampleQuestionsVi: string[];
  sampleQuestionsEn: string[];
  placeholderVi: string;
  placeholderEn: string;
}

export const READING_TOPICS: ReadingTopicConfig[] = [
  {
    id: "LOVE",
    icon: "favorite",
    labelVi: "Tình cảm",
    labelEn: "Love & Relationships",
    descVi: "Soi chiếu cảm xúc hai phía, rào cản ẩn và hướng mở cho mối quan hệ.",
    descEn: "Explore mutual feelings, hidden blocks, and the healthiest direction for your bond.",
    positionsVi: [
      "Hiện Trạng Kết Nối",
      "Cảm Xúc & Rào Cản Ẩn",
      "Hướng Mở & Lời Khuyên Tình Cảm",
    ],
    positionsEn: [
      "Current Connection",
      "Hidden Feelings & Blocks",
      "Relationship Path & Advice",
    ],
    sampleQuestionsVi: [
      "Mối quan hệ hiện tại giữa tôi và người ấy đang chuyển biến theo hướng nào?",
      "Điều gì đang cản trở sự thấu hiểu trong chuyện tình cảm của tôi lúc này?",
    ],
    sampleQuestionsEn: [
      "Where is the connection between me and them heading right now?",
      "What unspoken block is affecting my love life at this moment?",
    ],
    placeholderVi: "Ví dụ: Mối quan hệ giữa tôi và người ấy trong 3 tháng tới cần lưu ý điều gì?",
    placeholderEn: "Example: What do I need to understand about my relationship over the next few months?",
  },
  {
    id: "FAMILY",
    icon: "cottage",
    labelVi: "Gia đình",
    labelEn: "Family & Home",
    descVi: "Lắng nghe gốc rễ bất đồng, không khí mái ấm và cách hàn gắn gắn kết.",
    descEn: "Examine family dynamics, unspoken tensions, and practical paths toward harmony.",
    positionsVi: [
      "Căn Nguyên & Không Khí Gia Đình",
      "Nút Thắt Cần Thấu Hiểu",
      "Hướng Gắn Kết & Bình An",
    ],
    positionsEn: [
      "Family Roots & Atmosphere",
      "Unspoken Tension to Heal",
      "Path to Family Harmony",
    ],
    sampleQuestionsVi: [
      "Tôi nên ứng xử thế nào để hóa giải căng thẳng gần đây trong gia đình?",
      "Quyết định sắp tới của gia đình cần cân nhắc điều gì để giữ hòa khí?",
    ],
    sampleQuestionsEn: [
      "How can I help ease recent tension within my family?",
      "What does our family need most right now to restore mutual trust?",
    ],
    placeholderVi: "Ví dụ: Làm sao để tôi và gia đình tìm được tiếng nói chung về chuyện sắp tới?",
    placeholderEn: "Example: How can my family and I find common ground on this upcoming decision?",
  },
  {
    id: "CAREER",
    icon: "work",
    labelVi: "Công việc",
    labelEn: "Career & Work",
    descVi: "Đọc rõ cục diện sự nghiệp, thách thức đòn bẩy và bước đi chiến lược.",
    descEn: "Clarify your current career landscape, core obstacles, and strategic next move.",
    positionsVi: [
      "Cục Diện Công Việc Hiện Tại",
      "Thách Thức & Đòn Bẩy",
      "Triển Vọng & Bước Đi Chiến Lược",
    ],
    positionsEn: [
      "Current Career Landscape",
      "Key Challenge & Leverage",
      "Career Trajectory & Next Step",
    ],
    sampleQuestionsVi: [
      "Tôi có nên chuyển hướng hoặc nhận cơ hội công việc mới trong giai đoạn này không?",
      "Đâu là điểm nghẽn lớn nhất khiến công việc hiện tại chưa bứt phá được?",
    ],
    sampleQuestionsEn: [
      "Should I pursue a new career opportunity or stay focused on my current role?",
      "What is the main bottleneck holding back my professional progress right now?",
    ],
    placeholderVi: "Ví dụ: Hướng đi công việc của tôi trong quý tới nên tập trung vào điều gì?",
    placeholderEn: "Example: What should I prioritize in my career over the next quarter?",
  },
];

export const TOPIC_DRAFT_STORAGE_KEY = "ai_tarot_topic_reading_draft";

export function getTopicConfig(topicId: ReadingTopicId): ReadingTopicConfig {
  return READING_TOPICS.find((t) => t.id === topicId) || READING_TOPICS[0];
}

export function detectSessionTopic(question?: string): ReadingTopicId | null {
  if (!question) return null;
  const normalized = question.trim().toLowerCase();
  if (normalized.startsWith("[tình cảm]") || normalized.startsWith("[love]")) {
    return "LOVE";
  }
  if (normalized.startsWith("[gia đình]") || normalized.startsWith("[family]")) {
    return "FAMILY";
  }
  if (normalized.startsWith("[công việc]") || normalized.startsWith("[career]")) {
    return "CAREER";
  }
  return null;
}

export function getTopicActionSteps(topic: ReadingTopicId | null, isVi: boolean): string[] {
  if (topic === "LOVE") {
    return isVi
      ? [
          "Lắng nghe thẳng thắn nhu cầu cảm xúc thật sự của bản thân trước khi phản hồi đối phương.",
          "Dành một cuộc trò chuyện chân thành, không phán xét để tháo gỡ hiểu lầm ở vị trí lá thứ hai.",
          "Nếu còn băn khoăn một chi tiết cụ thể, hãy rút thêm lá làm rõ (tối đa 10 lá trong phiên).",
        ]
      : [
          "Acknowledge your honest emotional boundaries before reacting to your partner.",
          "Create space for a calm, non-defensive conversation around the tension highlighted in card two.",
          "Draw additional clarifier cards (up to 10 total) if you want deeper insight into a specific question.",
        ];
  }
  if (topic === "FAMILY") {
    return isVi
      ? [
          "Tạm lùi một nhịp để quan sát kỳ vọng giữa các thế hệ mà không vội bảo vệ cái tôi.",
          "Chủ động mở lời bằng sự quan tâm thực tế về một việc nhỏ trong gia đình tuần này.",
          "Theo dõi diễn biến và rút thêm lá làm rõ nếu cần soi kỹ từng thành viên liên quan.",
        ]
      : [
          "Step back to understand differing expectations across family members without escalating friction.",
          "Initiate a practical, caring gesture this week to soften unspoken distance.",
          "Draw clarifier cards (up to 10 total) if another angle of the family situation needs focus.",
        ];
  }
  if (topic === "CAREER") {
    return isVi
      ? [
          "Rà soát lại mục tiêu nghề nghiệp cốt lõi và tách bạch việc khẩn cấp khỏi việc tạo giá trị dài hạn.",
          "Tận dụng điểm mạnh và đòn bẩy đã thấy ở lá bài thứ hai để xử lý dứt điểm nút thắt hiện tại.",
          "Nếu đang cân nhắc một ngã rẽ mới, hãy rút thêm lá làm rõ hoặc hỏi đáp trực tiếp bên dưới.",
        ]
      : [
          "Audit your core professional priorities and separate noise from high-leverage work.",
          "Apply the insight from card two directly to unblock your current work bottleneck.",
          "Draw clarifier cards (up to 10 total) or ask follow-up questions below to test a specific option.",
        ];
  }
  return isVi
    ? [
        "Rà soát lại nhịp sinh hoạt và giữ tâm thế tĩnh tại khi đón nhận thông điệp ngày hôm nay.",
        "Chọn một hành động nhỏ có thể thực hiện ngay trong ngày thay vì suy nghĩ quá nhiều.",
        "Mọi diễn biến của phiên trải bài hôm nay tự động được lưu trong Nhật Ký Lịch Ngày.",
      ]
    : [
        "Review today's core signal calmly before rushing into external commitments.",
        "Take one grounded, practical step today aligned with the card's counsel.",
        "Today's reading session is automatically preserved in your Calendar Journal.",
      ];
}
