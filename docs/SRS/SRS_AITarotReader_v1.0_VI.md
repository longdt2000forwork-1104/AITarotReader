# Đặc Tả Yêu Cầu Phần Mềm (SRS) & Nghiên Cứu Khả Thi: AITarotReader

**Phiên bản:** 1.1 (Updated with Full Architecture & UML Diagrams)
**Nền tảng mục tiêu:** Web Application & Android Mobile App
**Ngôn ngữ hỗ trợ:** Tiếng Việt (VI) & Tiếng Anh (EN)
**Kiến trúc Công nghệ Đã chốt (Phương án 1):**
- **Frontend:** Next.js (App Router, TypeScript, TailwindCSS, Framer Motion) + Capacitor (Đóng gói Android `.apk`/`.aab`)
- **Backend:** Spring Boot 3.x REST API (Java 21, Spring Security JWT/OAuth2, Spring AI / SSE, PostgreSQL, Redis)

---

## PHẦN A: NGHIÊN CỨU THỊ TRƯỜNG & PHÂN TÍCH TÍNH KHẢ THI (MARKET RESEARCH & FEASIBILITY)

### 1. Phân tích Đối thủ Cạnh tranh trên Thị trường (Competitive Landscape)

Thị trường ứng dụng Tarot & Huyền học số toàn cầu đang chuyển dịch mạnh mẽ từ các ứng dụng tra cứu từ điển tĩnh sang trải nghiệm cá nhân hóa bằng AI. Dưới đây là bảng đối chiếu trực tiếp giữa **AITarotReader** và 4 đối thủ lớn nhất hiện nay:

| Tiêu chí | Labyrinthos | Tarotap | Mystic Mondays | Co-Star | AITarotReader (Của bạn) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Định vị cốt lõi** | Học Tarot & Từ điển tra cứu truyền thống | Chatbot AI giải bài hội thoại | Rút bài hàng ngày (Daily Habit) & Nghệ thuật | Chiêm tinh học (Astrology) & Mạng xã hội | **Tarot Master huyền học + Daily Companion tìm ý tưởng & định hướng** |
| **Trải nghiệm AI** | Trung bình (AI chỉ hỗ trợ phụ cho từ điển có sẵn) | Cao (Hội thoại sâu, nhiều Persona) | Thấp (Văn bản tĩnh viết sẵn bởi tác giả) | Cao (Sinh thông điệp ngắn sắc sảo mỗi ngày) | **Cao & Có cấu trúc (Tổng hợp liên kết các lá bài + Hỏi sâu giới hạn lượt + Rút lá Clarifier)** |
| **Nhập bài từ bộ bài thật (Physical Deck)** | Có (Nhập tay để lưu lịch sử học tập) | Hạn chế | Không | Không hỗ trợ Tarot 78 lá | **Có (Manual Card Picker nhanh chóng để nhờ AI giải trải bài thực tế)** |
| **Hồ sơ & Nhật ký (Journal)** | Có (Tập trung vào ghi chú tự học) | Lưu lịch sử chat đơn thuần | Nhật ký ngắn gọn | Lưu bản đồ sao cá nhân | **Mystic Profile + Tarot Journal thông minh (AI nhớ ngữ cảnh các lần xem trước)** |
| **Chia sẻ MXH (Viral Loop)** | Kém | Trung bình | Khá (Thiết kế bài đẹp) | **Rất mạnh** (Meme/Card thông điệp viral) | **Mạnh (Tự động xuất Shareable Card thẩm mỹ cao cho từng phiên trải bài/Daily Draw)** |
| **Hỗ trợ Tiếng Việt tự nhiên** | Không (Chủ yếu Tiếng Anh) | Bản dịch tự động chưa mượt | Không | Không | **Native Song ngữ Anh - Việt (Văn phong huyền học Việt Nam chuẩn xác, tự nhiên)** |
| **Mô hình doanh thu** | Bán bộ bài vật lý + Mua lẻ lượt AI | Freemium + Gói Credit / Subscription | Mua app / Mua bộ bài số (In-App Purchase) | Freemium + Mua báo cáo chi tiết | **Hybrid: Freemium + Hệ thống Năng lượng/Pha lê (Pay-as-you-go) + Gói Pro Subscription** |

### 2. Phân tích Điểm mạnh Khác biệt (Unique Selling Proposition - USP)

1. **Giải quyết "Nỗi đau" văn bản tĩnh và Chatbot vô hồn:**
   - Các app truyền thống (*Labyrinthos, Mystic Mondays*) giải từng lá bài rời rạc khiến người dùng phải tự đoán xem lá số 1 (Quá khứ) liên quan gì đến lá số 3 (Tương lai).
   - Các công cụ như *ChatGPT* thì giải chữ tốt nhưng thiếu **nghi thức trải bài (Ritual)**, thiếu quản lý **Clarifier Card (rút lá bổ sung làm rõ)** và không có **Tarot Journal** trực quan.
   - **AITarotReader** kết hợp trọn vẹn nghi thức lật bài huyền bí với khả năng tổng hợp (Synthesis) của AI và giới hạn 1–3 câu hỏi đào sâu/rút lá Clarifier đúng chuẩn một buổi xem bài thực tế.
2. **Cầu nối cho người sở hữu bộ bài giấy (Manual Physical Spread Input):**
   - Rất nhiều người tin vào Tarot sở hữu ít nhất 1 bộ bài Rider-Waite ở nhà để lấy cảm hứng/ý tưởng, nhưng họ không đủ kiến thức kết nối các lá bài trong một trải bài khó (như Celtic Cross hay Tìm ý tưởng sáng tạo). Tính năng **Chọn lá bài thủ công (Manual Picker)** giúp họ nhập nhanh các lá vừa bốc ngoài đời (kèm chiều Xuôi/Ngược) để AI phân tích chuyên sâu.
3. **Lợi thế sân nhà Việt Nam & Khả năng mở rộng Global:**
   - Giới trẻ và dân văn phòng/sáng tạo tại Việt Nam có nhu cầu xem Tarot cực lớn nhưng thiếu một ứng dụng có văn phong tiếng Việt sâu sắc, giàu hình ảnh và hỗ trợ thanh toán linh hoạt (mua lẻ Pha lê hoặc đăng ký gói).

---

### 3. Kiến trúc Kỹ thuật Đã chốt: Next.js + Capacitor (Android) & Spring Boot REST API

Dự án thống nhất lựa chọn **Phương án 1: Next.js (Web) + Capacitor (Android Native Shell)** kết nối với **Spring Boot 3.x REST API**.

| Thành phần | Công nghệ lựa chọn | Lý do & Vai trò |
| :--- | :--- | :--- |
| **Web & Mobile UI** | **Next.js (App Router) + TypeScript + TailwindCSS + Framer Motion** | Phát triển 1 codebase duy nhất cho cả Web và Android; hiệu ứng lật/tráo bài 3D mượt mà; tối ưu SEO và kết xuất ảnh Shareable Card tự động. |
| **Android Packaging** | **Capacitor 6+** | Đóng gói Web App thành ứng dụng Android Native (`.apk`/`.aab`), tích hợp Haptic Feedback (rung nhẹ khi rút bài), Push Notification (nhắc rút Daily Card) và Google Play Billing. |
| **Backend API** | **Spring Boot 3.x (Java 21)** | Cung cấp hệ thống REST API bảo mật, xử lý đồng thời cao, hỗ trợ Server-Sent Events (SSE) để stream văn bản giải bài AI theo thời gian thực. |
| **Database & Cache** | **PostgreSQL + Redis + Flyway** | PostgreSQL lưu trữ người dùng, hồ sơ huyền học, lịch sử trải bài và sổ cái ví Pha lê (ACID). Redis cache danh mục 78 lá bài và giới hạn tần suất gọi AI (Rate Limiting). |
| **AI Engine** | **Spring AI / Gemini 2.5 Flash API** | Tối ưu tốc độ phản hồi (TTFB < 2s), chi phí token thấp, khả năng biểu đạt ngôn ngữ Tiếng Việt và Tiếng Anh tự nhiên, sâu sắc. |

---

## PHẦN B: TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS - IEEE 830 / ISO 29148)

### 1. Giới thiệu (Introduction)
- **1.1 Mục đích (Purpose):** Tài liệu này định nghĩa toàn bộ yêu cầu nghiệp vụ, chức năng, phi chức năng và thiết kế hệ thống cho ứng dụng **AITarotReader** trên nền tảng Web và Android.
- **1.2 Phạm vi sản phẩm (Product Scope):**
  - Cung cấp bộ bài Tarot chuẩn 78 lá (Rider-Waite-Smith làm gốc) song ngữ Anh – Việt.
  - Hỗ trợ trải bài ảo (Virtual Ritual) và nhập lá bài thủ công từ bộ bài thật (Manual Physical Input).
  - Ứng dụng AI (LLM) đóng vai trò Tarot Master để luận giải tổng hòa các lá bài theo ngữ cảnh người dùng, cho phép hỏi đào sâu và rút lá bài làm rõ (Clarifier).
  - Cung cấp tính năng Rút bài hàng ngày (Daily Companion), Hồ sơ huyền học (Mystic Profile), Nhật ký Tarot (Tarot Journal) và Xuất ảnh chia sẻ mạng xã hội (Shareable Card).
  - Tích hợp hệ thống ví năng lượng (Pha lê/Crystals) và Gói đăng ký (Pro Subscription).
- **1.3 Ngoài phạm vi (Out of Scope):**
  - Không bao gồm tính năng nhận diện lá bài qua Camera/Quét ảnh (OCR/Vision).
  - Không cung cấp dịch vụ tư vấn tâm lý y khoa hoặc kết nối trực tiếp với Reader người thật.

---

### 2. Mô tả Tổng quan & Sơ đồ Tác nhân (User Classes & Use Case Diagram)

| Nhóm người dùng | Mô tả & Quyền hạn chính |
| :--- | :--- |
| **Guest (Khách vãng lai)** | Trải nghiệm thử 1 lần Rút bài hàng ngày (Daily Card) trên Web, xem thư viện 78 lá bài cơ bản, xem các đường link Shareable Card được chia sẻ công khai. |
| **Free Member (Thành viên miễn phí)** | Đăng ký tài khoản; nhận định mức năng lượng miễn phí mỗi ngày (ví dụ: 1 Daily Draw + 1 trải bài 3 lá cơ bản/ngày); lưu tối đa 10 bản ghi Tarot Journal gần nhất; xuất Shareable Card có watermark. |
| **Crystal Buyer (Người mua lẻ Pha lê)** | Nạp Pha lê (Pay-as-you-go) để mở khóa các trải bài chuyên sâu (5-10 lá), hỏi thêm câu hỏi phụ (Follow-up), hoặc rút lá bài bổ sung (Clarifier Card). |
| **Pro Subscriber (Thành viên VIP tháng/năm)** | Không giới hạn lưu trữ Tarot Journal; nhận Pha lê định kỳ mỗi ngày; mở khóa toàn bộ AI Reader Personas, trải bài nâng cao, phân tích tổng kết tháng từ Journal và xuất Shareable Card không dính watermark. |
| **System Admin (Quản trị viên)** | Quản lý danh mục 78 lá bài (EN/VI), cấu hình các mẫu Trải bài (Spreads), tinh chỉnh System Prompt cho các AI Personas, quản lý gói cước và theo dõi chi phí Token AI. |

#### Sơ đồ 1: Sơ đồ Ca sử dụng Tổng quan (System Use Case Diagram)

---

### 3. Yêu cầu Chức năng Chi tiết (Functional Requirements)

#### Module 1: Xác thực & Hồ sơ Huyền học (Auth & Mystic Profile)
- **FR-1.1 (Authentication):** Hỗ trợ đăng nhập/đăng ký qua Google OAuth2 và Email/OTP thông qua Spring Security + JWT (Access Token & Refresh Token).
- **FR-1.2 (Mystic Profile Onboarding):** Khi khởi tạo tài khoản, người dùng thiết lập:
  - Tên gọi / Biệt danh, Ngôn ngữ ưu tiên (`vi` hoặc `en`).
  - Ngày tháng năm sinh (tự động tính Cung Mặt Trời - Zodiac Sign & Con số chủ đạo - Life Path Number).
  - Mục tiêu quan tâm chính (Sự nghiệp & Ý tưởng, Tình cảm, Phát triển bản thân, Tài chính).
- **FR-1.3 (AI Context Toggle):** Người dùng có quyền bật/tắt việc cho phép AI sử dụng thông tin Mystic Profile và lịch sử Journal gần nhất để cá nhân hóa lời giải.

#### Module 2: Trải bài Ảo & Nhập bài Thủ công (Tarot Reading Modes)
- **FR-2.1 (Spread Selection):** Cung cấp kho sơ đồ trải bài (Spreads) theo mục đích:
  - *1 Lá (Daily Message / Yes-No / Tìm 1 ý tưởng nhanh)*
  - *3 Lá (Quá khứ - Hiện tại - Tương lai / Tình huống - Hành động - Kết quả / Mind - Body - Spirit)*
  - *Trải bài Sáng tạo & Định hướng (5 Lá: Ý tưởng cốt lõi - Rào cản - Nguồn lực ẩn - Bước đi đầu tiên - Tiềm năng)*
  - *Celtic Cross (10 Lá chuyên sâu)*
- **FR-2.2 (Mode A - Virtual Deck Ritual):**
  - Hiệu ứng xào bài (Shuffle), cắt bài và trải hình cánh quạt trên màn hình (kèm rung nhẹ Haptics trên Android).
  - Hệ thống sinh số ngẫu nhiên an toàn (`SecureRandom` hoặc Web Crypto) kết hợp thời điểm chạm của người dùng để bốc lá bài kèm trạng thái **Xuôi (Upright)** hoặc **Ngược (Reversed)**.
- **FR-2.3 (Mode B - Manual Physical Deck Input):**
  - Dành cho người tự rút bài giấy ở nhà: Hiển thị giao diện tìm kiếm/lọc nhanh đủ 78 lá bài theo nhóm (*22 Major Arcana, 14 Wands, 14 Cups, 14 Swords, 14 Pentacles*).
  - Người dùng gán từng lá bài vào đúng vị trí trong sơ đồ trải bài và gạt nút chọn chiều **Xuôi / Ngược**.
- **FR-2.4 (Multi-Deck System — 5 Bộ Bài Tuyển Chọn & Tùy Chỉnh Lưng Bài):**
  - Cung cấp 5 bộ bài Tarot hoàn chỉnh (mỗi bộ đủ **78/78 lá bài**):
    1. `ED-01`: *Rider-Waite-Smith 1909 (Centennial Lithograph)* — Miễn phí (Mặc định)
    2. `ED-02`: *Sunlit Botanical Herbarium (2025 Archival Edition)* — Miễn phí
    3. `ED-03`: *Swiss Geometric Bauhaus (Minimalist Grid)* — Miễn phí
    4. `ED-04`: *Ancien Tarot de Marseille 1760 (Nicolas Conver Woodcut)* — Pro hoặc 30 Credits
    5. `ED-05`: *Kyoto Washed Sumi-e & Mineral Watercolor* — Pro hoặc 45 Credits
  - Hỗ trợ 4 chất liệu mặt lưng bài (*Natural Flax, Botanical Emerald Foil, Terracotta Wax Seal, Classic 1909 Tudor Rose*) và chế độ xem **Contact Sheet 78 Lá + So sánh lá bài song song giữa 5 bộ bài**.

#### Module 3: Hệ thống AI Tarot Master & Tương tác Đào sâu (AI Reading Engine)
- **FR-3.1 (AI Reader Persona):** Cho phép chọn phong cách Reader trước khi giải:
  1. *The Classic Mystic (Huyền học truyền thống, sâu sắc, giàu biểu tượng).*
  2. *The Idea Spark (Tập trung khơi gợi ý tưởng sáng tạo, góc nhìn mới và kế hoạch hành động).*
  3. *The Gentle Friend (Đồng cảm, nhẹ nhàng, khích lệ tinh thần).*
- **FR-3.2 (Holistic Synthesis Reading):** AI không giải từng lá độc lập mà trả về cấu trúc luận giải gồm 4 phần (hỗ trợ **SSE Streaming** để chữ hiện ra mượt mà theo thời gian thực):
  1. **Tổng quan năng lượng trải bài** (Sự kết hợp giữa nguyên tố Lửa/Nước/Khí/Đất và tỉ lệ bài Chính/Phụ).
  2. **Luận giải từng vị trí trong mối liên hệ với câu hỏi.**
  3. **Điểm giao thoa (Synthesis):** Các lá bài đang kể chung câu chuyện gì?
  4. **Lời khuyên hành động / Ý tưởng gợi mở thực tế (Actionable Takeaways).**
- **FR-3.3 (Interactive Follow-up & Clarifier Card):**
  - Sau bản giải chính, người dùng có thể đặt tối đa **3 câu hỏi đào sâu (Follow-up questions)** xoay quanh trải bài đó.
  - Người dùng có thể bấm **"Rút lá làm rõ (Draw Clarifier Card)"** (tối đa 1-2 lá/phiên, bằng cách bốc ảo hoặc chọn tay) để AI giải thích rõ hơn cho một vị trí còn mơ hồ.

#### Module 4: Daily Companion & Nhật ký Tarot (Retention Loop)
- **FR-4.1 (Daily Card of the Day):** Mỗi ngày mở app, người dùng được rút 1 lá bài miễn phí kèm thông điệp ngắn gọn (Quote trong ngày, Từ khóa năng lượng, Gợi ý 1 việc nên thử hôm nay).
- **FR-4.2 (Tarot Journal & Reflection):**
  - Tự động lưu toàn bộ phiên trải bài vào Nhật ký cá nhân.
  - Cho phép người dùng viết thêm **Ghi chú nghiệm lý (Personal Note)** và gắn thẻ cảm xúc/chủ đề sau khi sự việc đã diễn ra.
  - Thống kê thú vị: *"Lá bài xuất hiện nhiều nhất trong tháng của bạn"*, *"Biểu đồ năng lượng nguyên tố trong 30 ngày qua"*.

#### Module 5: Xuất Thẻ Chia Sẻ (Shareable Card Generator)
- **FR-5.1 (Card Template Engine):** Sau mỗi lần rút Daily Card hoặc trải bài, người dùng bấm **"Tạo Thẻ Chia Sẻ"**:
  - Tự động kết xuất ảnh tỉ lệ `9:16` (Story/TikTok/Reels) hoặc `1:1` (Instagram/Facebook Post).
  - Nội dung gồm: Hình ảnh các lá bài đã rút, Câu hỏi/Chủ đề, 1 đoạn đúc kết sắc sảo nhất do AI tóm tắt (dưới 40 từ), cùng thương hiệu/QR của **AITarotReader**.

#### Module 6: Ví Pha Lê & Thanh toán (Hybrid Monetization)
- **FR-6.1 (Crystal Ledger):** Quản lý số dư Pha lê (Crystals) với bảng lịch sử giao dịch bất biến (Transaction Ledger) trên PostgreSQL để chống gian lận.
- **FR-6.2 (Pricing Rules):** Cấu hình linh hoạt số Pha lê tiêu hao cho từng hành động (ví dụ: Trải 3 lá = 10 Pha lê, Rút lá Clarifier = 5 Pha lê, Hỏi thêm AI = 3 Pha lê).
- **FR-6.3 (Payment Gateways):** Tích hợp Google Play Billing (cho Android App) và cổng thanh toán Web (Stripe / PayOS / VNPay QR).

---

### 4. Thiết kế Kiến trúc Hệ thống, Luồng Nghiệp vụ & Cơ sở dữ liệu (System & Data Architecture)

#### Sơ đồ 2: Sơ đồ Kiến trúc Hệ thống Tổng thể (System Architecture Diagram)

#### Sơ đồ 3: Sơ đồ Tuần tự Luồng Trải bài & AI Luận giải (Sequence Diagram)

#### Sơ đồ 4: Sơ đồ Trạng thái Vòng đời Phiên Trải bài (Reading Session State Machine)

#### Sơ đồ 5: Sơ đồ Thực thể Liên kết Cơ sở dữ liệu (Database ERD)

#### 4.1 Cấu trúc Bảng Cơ sở dữ liệu (PostgreSQL Schema Overview)

| Tên bảng | Các trường chính | Mô tả |
| :--- | :--- | :--- |
| `users` | `id (UUID)`, `email`, `locale (vi/en)`, `crystal_balance`, `tier (FREE/PRO)`, `created_at` | Lưu thông tin tài khoản và số dư ví Pha lê hiện tại |
| `mystic_profiles` | `user_id (FK)`, `birth_date`, `zodiac_sign`, `life_path_number`, `preferred_deck_id (FK)`, `preferred_back_id`, `allow_ai_context` | Lưu hồ sơ huyền học cá nhân và bộ bài/lưng bài đang chọn |
| `tarot_decks` | `id (ED-01..05)`, `slug`, `name_i18n (JSONB)`, `artist`, `unlock_tier`, `credit_cost`, `card_count (78)` | Danh mục 5 bộ bài Tarot hoàn chỉnh (mỗi bộ đủ 78 lá) |
| `tarot_cards` | `id (0..77)`, `code`, `arcana (MAJOR/MINOR)`, `suit`, `name_i18n (JSONB)`, `keywords_upright_i18n`, `keywords_reversed_i18n` | Danh mục gốc 78 lá bài chuẩn (22 Major + 56 Minor) song ngữ Anh - Việt |
| `deck_card_artworks` | `deck_id (FK)`, `card_id (FK 0..77)`, `image_url`, `artist_note_i18n` | Bảng ánh xạ hình ảnh từng lá bài (`78 lá x 5 bộ = 390 bản khắc`) |
| `spread_templates` | `id`, `code`, `card_count`, `crystal_cost`, `positions_i18n (JSONB)` | Định nghĩa các sơ đồ trải bài (1 lá, 3 lá, 5 lá, Celtic Cross...) |
| `reading_sessions` | `id (UUID)`, `user_id (FK)`, `spread_id (FK)`, `input_mode (VIRTUAL/MANUAL)`, `persona_code`, `user_question`, `ai_synthesis_result`, `follow_up_count` | Phiên trải bài và kết quả luận giải tổng hợp của AI |
| `drawn_cards` | `id (UUID)`, `session_id (FK)`, `card_id (FK)`, `position_index`, `is_reversed`, `is_clarifier` | Các lá bài cụ thể đã rút/nhập trong phiên (bao gồm cả lá Clarifier) |
| `session_messages` | `id (UUID)`, `session_id (FK)`, `role (USER/AI)`, `content`, `created_at` | Lịch sử các câu hỏi đào sâu (Follow-up chat) trong phiên |
| `journal_entries` | `session_id (PK, FK)`, `reflection_note`, `mood_tags (JSONB)`, `updated_at` | Ghi chú nghiệm lý cá nhân của người dùng cho từng phiên |
| `crystal_transactions` | `id (UUID)`, `user_id (FK)`, `amount (+/-)`, `reason_code`, `reference_id`, `created_at` | Sổ cái lịch sử biến động Pha lê (bất biến) |

#### 4.2 Danh sách Spring Boot REST API Trọng tâm

| Method | Endpoint | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/google` | Đăng nhập Google OAuth2, trả về JWT |
| `GET/PUT` | `/api/v1/profile/mystic` | Lấy và cập nhật Hồ sơ huyền học & ngôn ngữ (`vi`/`en`) |
| `GET` | `/api/v1/tarot/cards` | Lấy danh mục 78 lá bài (Cache qua Redis/CDN) |
| `GET` | `/api/v1/tarot/spreads` | Lấy danh sách các sơ đồ trải bài & chi phí Pha lê |
| `POST` | `/api/v1/readings/daily` | Rút lá bài hàng ngày (Miễn phí 1 lần/ngày) |
| `POST` | `/api/v1/readings/sessions` | Khởi tạo phiên trải bài (Virtual hoặc Manual Input) & Stream kết quả AI (SSE) |
| `POST` | `/api/v1/readings/sessions/{id}/clarifier` | Rút thêm lá bài bổ sung (Clarifier) trong phiên hiện tại |
| `POST` | `/api/v1/readings/sessions/{id}/chat` | Gửi câu hỏi đào sâu (Follow-up question) cho AI Reader |
| `PUT` | `/api/v1/readings/sessions/{id}/journal` | Cập nhật ghi chú nghiệm lý (Tarot Journal) & cảm xúc |
| `POST` | `/api/v1/readings/sessions/{id}/share-card` | Tạo thông tin & hình ảnh Shareable Card |
| `GET` | `/api/v1/wallet/balance` | Kiểm tra số dư Pha lê & trạng thái gói Pro |

---

### 5. Yêu cầu Phi chức năng (Non-Functional Requirements)
1. **Hiệu năng & Độ trễ AI (Latency):**
   - Thời gian phản hồi byte đầu tiên (TTFB) của luồng giải bài AI qua Server-Sent Events (SSE) phải `< 2.0 giây`.
2. **Kiểm soát Chi phí & Chống lạm dụng (Cost & Guardrails):**
   - Giới hạn độ dài câu hỏi của người dùng (`<= 500 ký tự`).
   - System Prompt có lớp bảo vệ (Prompt Injection Guard) chỉ trả lời trong phạm vi Tarot, định hướng ý tưởng và phát triển bản thân; từ chối các câu hỏi vi phạm pháp luật, y tế cực đoan hoặc cờ bạc.
3. **Đa ngôn ngữ (i18n):**
   - Giao diện và câu trả lời của AI tự động đồng bộ theo ngôn ngữ người dùng chọn (`Tiếng Việt` hoặc `English`).

---

## PHẦN C: LỘ TRÌNH TRIỂN KHAI DỰ ÁN (IMPLEMENTATION ROADMAP)

| Giai đoạn | Mục tiêu trọng tâm | Đầu ra (Deliverables) |
| :--- | :--- | :--- |
| **Phase 1: Foundation & Core Data (Tuần 1-2)** | Khởi tạo kiến trúc Spring Boot + Database + Dữ liệu 78 lá bài song ngữ | - Bộ khung Spring Boot 3 (PostgreSQL, Redis, Flyway, JWT Auth).<br>- Seed chuẩn dữ liệu 78 lá bài Tarot (EN/VI) & 5 sơ đồ trải bài phổ biến.<br>- Khởi tạo Monorepo/Project Next.js + TailwindCSS + Capacitor. |
| **Phase 2: Core Reading & AI Engine (Tuần 3-4)** | Luồng Trải bài ảo + Chọn bài thủ công + AI Luận giải | - Giao diện xào/lật bài ảo & bộ chọn bài thủ công (Manual Picker).<br>- Tích hợp LLM Streaming (SSE) với 3 AI Reader Personas.<br>- Tính năng hỏi đào sâu (Follow-up) & rút lá Clarifier. |
| **Phase 3: Daily Companion, Journal & Share Card (Tuần 5)** | Tăng trưởng & Giữ chân người dùng | - Tính năng Daily Draw + Mystic Profile.<br>- Nhật ký Tarot (Tarot Journal) & thống kê năng lượng.<br>- Bộ tạo ảnh Shareable Card (9:16 & 1:1). |
| **Phase 4: Monetization & Android Release (Tuần 6)** | Tích hợp thanh toán & Đóng gói phát hành | - Ví Pha lê (Crystal Wallet) + Gói Pro Subscription.<br>- Tích hợp cổng thanh toán Web & Google Play Billing qua Capacitor.<br>- Kiểm thử toàn diện & Build bản Android (`.aab`) + Deploy Web. |
