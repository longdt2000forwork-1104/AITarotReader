# Danh Sách Màn Hình (Screen List) & Đặc Tả Spring Boot REST API: AITarotReader

**Phiên bản:** 2.2 (Sunlit Botanical & Editorial Print — Bổ sung Hệ thống Đa Bộ Bài 5 Decks & Contact Sheet 78 Lá)
**Stitch Project ID:** `9263024000499436445` (`AITarotReader — Web & Android UI (Light Editorial)`)
**Stitch Design System ID:** `assets/9053777410806225859` (`Sunlit Botanical & Editorial Print (Anti-AI Light)`)
**Ngôn ngữ Thiết kế:** Tông sáng tạp chí & giấy mỹ thuật (`#FAF9F6` Warm Alabaster, `#FFFFFF` Pure White, viền mảnh `1px solid #E2E8F0`, chữ mực đậm `#0F172A`, 1 màu nhấn duy nhất Botanical Emerald `#059669`, không dùng nền tối u ám, không dùng neon glow tím/xanh, không lạm dụng thẻ nổi)
**Nền tảng mục tiêu:** Android Mobile (`MOBILE`) & Web Application (`DESKTOP`)
**Backend:** Spring Boot 3.x REST API (Java 21, PostgreSQL, Redis, Spring AI SSE)

---

## PHẦN 1: DANH SÁCH MÀN HÌNH TỔNG THỂ (14 SCREENS MAP 1:1 VỚI STITCH & SRS)

### 1.1 Nhóm Màn Hình Android (`deviceType: MOBILE` — 8 Màn hình)

| Mã Màn Hình | Stitch Screen ID | Tên Màn Hình (Trên Stitch) | Route / Đường dẫn | Map với SRS FR | Cấu trúc Giao diện (Chuẩn Anti-AI Light Mode) | REST API Kết nối |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCR-M01`** | `ec3d9735211a410d8a23782765d20007` | **Android — Daily Index & Sanctuary** | `/app/home` | FR-1.2, FR-4.1, FR-6.1 | Bố cục tạp chí sáng sủa (`#FAF9F6` / `#FFFFFF`). Thanh trạng thái trên cùng kẻ viền `1px` hiển thị Cung/Số chủ đạo, nút gạt `EN/VI` và số dư (`45 CR`). Khu vực Lá bài Hôm nay (`XIX The Sun`) nét khắc gỗ thực vật trên nền giấy kem kèm 3 tag in hoa và 2 dòng hành động (`Virtual Deck` \| `Manual Input`). | `GET /api/v1/profile/mystic`<br>`POST /api/v1/readings/daily`<br>`GET /api/v1/wallet/balance` |
| **`SCR-M02`** | `b924e509e4ce4fe39a494797eb7b82b7` | **Android — Spread & Reader Configuration** | `/app/readings/new` | FR-2.1, FR-2.4, FR-3.1 | Biểu mẫu 4 bước nền trắng sáng ngăn cách bằng `1px solid #E2E8F0`: (01) Chọn Sơ đồ trải bài (*1, 3, 5, 10 Lá*), (02) Chọn Bộ bài Tarot (*Sunlit Botanical, Rider-Waite 1909, Swiss Geometric* + link `Browse All 5 Decks →`), (03) Chọn Giọng đọc AI (*Classic Mystic, Idea Spark, Gentle Friend*), (04) Nhập câu hỏi (`<= 500 ký tự`). | `GET /api/v1/tarot/spreads`<br>`GET /api/v1/tarot/decks`<br>`GET /api/v1/wallet/balance` |
| **`SCR-M03`** | `67d3c8928ee649048953fb5bd25880ad` | **Android — Tactile Deck Draw** | `/app/readings/draw` | FR-2.2 | Bàn vải lanh sáng (`#FAF9F6`). Thanh trạng thái 3 cột có viền ở trên (`01 SITUATION`, `02 ACTION [SELECTING]`, `03 OUTCOME`). Dải bài nằm ngang chính giữa với lưng bài giấy kem họa tiết thực vật. Lá bài #27 nhô cao `16px` với viền xanh ngọc lục bảo `#059669`. | `POST /api/v1/readings/sessions` |
| **`SCR-M04`** | `551f8de635c840ee92bf2c98e27d37bf` | **Android — Physical Deck Index Picker** | `/app/readings/manual` | FR-2.3 | Danh mục tra cứu đủ 78 lá nền sáng để nhập lá bài giấy vừa bốc ngoài đời (Không dùng camera). Thanh ghim 3 vị trí trải bài, ô tìm kiếm trắng, thanh lọc chất bài (`ALL 78`, `MAJOR 22`, `WANDS 14`, `CUPS 14`, `SWORDS 14`, `PENTACLES 14`), lưới 3 cột phẳng và thanh cố định dưới cùng để gạt `Xuôi / Ngược`. | `GET /api/v1/tarot/cards`<br>`POST /api/v1/readings/sessions` |
| **`SCR-M05`** | `a965422ea71c4ce88810ef5a90351fa6` | **Android — Synthesis Report & Clarifier** | `/app/readings/{id}` | FR-3.2, FR-3.3 | Giao diện đọc bài nền trắng chuẩn tạp chí (như Substack / NYT). Dải tóm tắt các lá bài đã rút + ô `+1 Clarifier` ở đầu trang. Các phần luận giải ngăn cách bằng đường kẻ ngang `1px #E2E8F0`: Tỉ lệ Nguyên tố, Phân tích từng vị trí, Tổng hợp cốt lõi, Danh sách hành động. Thanh chat cố định ở đáy để hỏi sâu (`2/3 lượt`) & `Rút Clarifier`. | `GET /api/v1/readings/sessions/{id}`<br>`POST /api/v1/readings/sessions/{id}/clarifier`<br>`POST /api/v1/readings/sessions/{id}/chat` |
| **`SCR-M06`** | `beb4caef0fd545de83e6597801f509b1` | **Android — Editorial Print & Share Studio** | `/app/readings/{id}/share` | FR-4.2, FR-5.1 | Phòng lab xuất bản ảnh chia sẻ nền sáng. Thanh chuyển tab (`Share Print Studio` \| `Journal Entry`). Khung xem trước poster `9:16` trên nền giấy mỹ thuật kem (`#FAF9F6`). Nút chọn tỉ lệ (`9:16` / `1:1`), chủ đề giấy và ô nhập ghi chú nghiệm lý. | `POST /api/v1/readings/sessions/{id}/share-card`<br>`PUT /api/v1/readings/sessions/{id}/journal` |
| **`SCR-M07`** | `9b6c9a5dd970419d896c30ca6d9e99f8` | **Android — Credit Ledger & Pro Plan** | `/app/billing` | FR-6.1, FR-6.2, FR-6.3 | Giao diện quản lý tín dụng & gói cước nền trắng sáng. Hàng tóm tắt số dư (`45 Credits` + nút nhận `+5 CR`), bảng quyền lợi `Archival Pro ($6.99/tháng)` viền `#059669`, bảng 3 gói nạp lẻ (`50, 170, 480 Credits`) và biểu phí minh bạch 3 cột ở cuối trang. | `GET /api/v1/wallet/balance`<br>`POST /api/v1/wallet/checkout`<br>`GET /api/v1/wallet/transactions` |
| **`SCR-M08`** | `942adfdd75c84337a53d61a78d8e54a6` | **Android — Deck Edition Gallery & Art Preview** | `/app/decks` | FR-2.4 | Thư viện 5 Bộ bài Tarot (đủ 78 lá/bộ) nền sáng `#FAF9F6`: Khung Hero giới thiệu bộ đang chọn (`ED-01 Rider-Waite 1909` kèm 3 lá mẫu & mặt lưng), danh sách 4 bộ bài còn lại (*Sunlit Botanical, Swiss Geometric, Marseille 1760, Kyoto Sumi-e*) kèm nút Đổi bộ bài / Mở khóa bằng Credits, và bảng chọn 4 chất liệu mặt lưng bài (`Natural Flax, Botanical Emerald, Terracotta Seal, Tudor Rose`). | `GET /api/v1/tarot/decks`<br>`POST /api/v1/tarot/decks/{id}/unlock`<br>`PATCH /api/v1/profile/mystic/preferred-deck` |

---

### 1.2 Nhóm Màn Hình Web Desktop (`deviceType: DESKTOP` — 6 Màn hình)

| Mã Màn Hình | Stitch Screen ID | Tên Màn Hình (Trên Stitch) | Route / Đường dẫn | Map với SRS FR | Cấu trúc Giao diện (Chuẩn Anti-AI Light Mode) | REST API Kết nối |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCR-W01`** | `355fb17c4dca42f2b52ebcc7748c6a9d` | **Web — Editorial Portal & Daily Index** | `/` | FR-1.1, FR-1.2, FR-4.1 | Trang chủ bố cục lưới Thụy Sĩ nền sáng (`1280x1024`) phân tách bằng đường kẻ `1px #E2E8F0`. Phần Hero chia 2 cột (Trái `#FAF9F6`: Tuyên ngôn sản phẩm & nút bắt đầu; Phải `#FFFFFF`: Phiếu thông tin Lá bài Hàng ngày kèm bảng chỉ số nguyên tố), phía dưới là bảng danh mục 4 sơ đồ trải bài. | `POST /api/v1/auth/google`<br>`POST /api/v1/readings/daily`<br>`GET /api/v1/tarot/spreads` |
| **`SCR-W02`** | `6c7e5dfbb8f6408eb6b115ed3ddd2936` | **Web — Split-Pane Reading Workbench** | `/workbench/{id}` | FR-2.2, FR-3.2, FR-3.3 | Không gian làm việc 3 cột nền sáng phân tách bằng viền `1px solid #E2E8F0`: Sidebar trái (`240px #F8FAFC` lịch sử & chọn Persona), Bàn trải bài vải lanh giữa (`520px #FAF9F6` sơ đồ 5 lá + ô Clarifier), Cột đọc bài phải (`520px #FFFFFF` hiển thị văn bản SSE 4 phần + khung hỏi đáp cuối cột). | `POST /api/v1/readings/sessions`<br>`POST /api/v1/readings/sessions/{id}/clarifier`<br>`POST /api/v1/readings/sessions/{id}/chat` |
| **`SCR-W03`** | `0bb9c7fb18304eb0a1356cadb8b88aa5` | **Web — 78-Card Reference & Manual Input** | `/catalog-picker` | FR-2.3 | Giao diện tra cứu 78 lá bài & nhập trải bài vật lý nền sáng. Thanh ghim 3 ô vị trí trên cùng, thanh công cụ tìm kiếm/lọc theo chất bài, lưới 5 cột phẳng hiển thị 78 lá bài và ngăn kéo thông tin bên phải (`380px #FFFFFF`) hiển thị từ khóa song ngữ Anh-Việt. | `GET /api/v1/tarot/cards`<br>`POST /api/v1/readings/sessions` |
| **`SCR-W04`** | `91a5851e70e04282aadb656ed902745f` | **Web — Archive Journal & Pattern Ledger** | `/journal` | FR-4.2 | Bảng điều khiển phân tích & lưu trữ nhật ký nền sáng. Hàng trên cùng gồm 3 ô chỉ số KPI có viền (`Lá bài lặp lại nhiều nhất: IX The Hermit`, `Thanh tỉ lệ Nguyên tố 30 ngày`, `Trạng thái Hồ sơ Mystic`). Bên dưới chia Master-Detail: Cột trái (`480px`) là bảng nhật ký, Cột phải (`800px`) là trình soạn thảo nghiệm lý. | `GET /api/v1/journal/entries`<br>`GET /api/v1/journal/analytics`<br>`PUT /api/v1/readings/sessions/{id}/journal` |
| **`SCR-W05`** | `07bc70ee9b0f4c09a3c42c80c8860540` | **Web — Print Export Studio & Billing** | `/studio-billing` | FR-5.1, FR-6.1, FR-6.3 | Không gian 2 khu vực nền sáng: Bên trái/giữa (`840px`) là Studio xuất bản poster chia sẻ (`9:16` và `1:1` đặt cạnh nhau trên nền giấy kem `#FAF9F6`); Bên phải (`440px #FFFFFF`) là sổ cái tín dụng & thanh toán qua Stripe hoặc mã QR Việt Nam (`VietQR / PayOS`). | `POST /api/v1/readings/sessions/{id}/share-card`<br>`POST /api/v1/wallet/checkout`<br>`GET /api/v1/wallet/transactions` |
| **`SCR-W06`** | `f70f51f911c64ceda93a25a5e2c53e37` | **Web — Curated Deck Editions & 78-Card Contact Sheet** | `/decks-archive` | FR-2.4 | Bàn làm việc lưu trữ 3 cột nền sáng: Cột trái (`240px`) điều hướng, Cột giữa (`380px`) chọn 1 trong 5 Bộ bài Tarot hoàn chỉnh (`ED-01` đến `ED-05`), Khung chính bên phải hiển thị **Dải so sánh trực quan 1 lá bài (`XVII The Star`) trên cả 5 phong cách hội họa** đặt cạnh nhau + **Bảng Contact Sheet 6 cột tra cứu trọn bộ 78 lá bài (`22 Major + 56 Minor`)** của bộ đang chọn. | `GET /api/v1/tarot/decks`<br>`GET /api/v1/tarot/decks/{slug}/cards`<br>`PATCH /api/v1/profile/mystic/preferred-deck` |

---

## PHẦN 2: ĐẶC TẢ CHI TIẾT SPRING BOOT REST API (21 ENDPOINTS)

Toàn bộ API tuân thủ chuẩn RESTful, trả về JSON (hoặc `text/event-stream` cho luồng SSE AI), và xác thực qua JWT Bearer (`Authorization: Bearer <token>`).

### 2.1 Xác thực & Hồ sơ Huyền học (`/api/v1/auth`, `/api/v1/profile`)

| Mã API | Method & Endpoint | Phân quyền | Request Payload / Params | Cấu trúc Response | Màn hình sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-01`** | `POST /api/v1/auth/google` | Public | `{ "idToken": "string", "locale": "vi\|en" }` | `{ "accessToken": "jwt", "refreshToken": "jwt", "user": {...} }` | `SCR-W01`, `SCR-M01` |
| **`API-02`** | `GET /api/v1/profile/mystic` | User JWT | — | `{ "displayName": "Aria", "locale": "vi", "birthDate": "1998-04-12", "zodiacSign": "ARIES", "lifePathNumber": 7, "focusAreas": ["IDEAS", "CAREER"], "allowAiContext": true }` | `SCR-M01`, `SCR-W01`, `SCR-W04` |
| **`API-03`** | `PUT /api/v1/profile/mystic` | User JWT | `{ "displayName": "string", "locale": "vi\|en", "birthDate": "YYYY-MM-DD", "focusAreas": [...], "allowAiContext": true }` | Bản ghi `MysticProfileDto` đã cập nhật | `SCR-M01`, `SCR-W04` |

### 2.2 Danh mục 78 Lá bài, 5 Bộ bài (Multi-Deck) & Sơ đồ Trải bài (`/api/v1/tarot`)

| Mã API | Method & Endpoint | Phân quyền | Request Payload / Params | Cấu trúc Response | Màn hình sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-04`** | `GET /api/v1/tarot/cards` | Public (Redis Cache) | `?lang=vi\|en&deck=sunlit-botanical-herbarium&suit=MAJOR\|WANDS\|CUPS\|SWORDS\|PENTACLES&q=search` | Danh sách đủ **78 lá bài** (`00..77`: 22 Major + 56 Minor) kèm `imageUrl` theo bộ bài đang chọn | `SCR-M04`, `SCR-W03`, `SCR-W06` |
| **`API-05`** | `GET /api/v1/tarot/spreads` | Public (Redis Cache) | `?lang=vi\|en` | `[ { "id": 2, "code": "spread_3_action", "name": "Tình huống - Hành động - Kết quả", "cardCount": 3, "crystalCost": 10, "positions": [...] } ]` | `SCR-M02`, `SCR-W01`, `SCR-W02` |
| **`API-05A`** | `GET /api/v1/tarot/decks` | Public / User JWT | `?lang=vi\|en` | Danh sách **5 Bộ bài Tarot (`ED-01..ED-05`)** + **4 Mặt lưng bài (`CB-01..CB-04`)**, trạng thái `unlocked`, `isDefault`, `cardCount: 78` và 3 lá mẫu | `SCR-M02`, `SCR-M08`, `SCR-W06` |
| **`API-05B`** | `GET /api/v1/tarot/decks/{slug}/cards` | Public (Redis Cache) | Path `slug`, `?compareCardId=17` | Trả về toàn bộ **78 bản khắc lá bài** của bộ bài `slug` kèm ảnh so sánh lá bài mẫu trên cả 5 bộ | `SCR-M08`, `SCR-W06` |
| **`API-05C`** | `PATCH /api/v1/profile/mystic/preferred-deck` | User JWT | `{ "deckId": "ED-02", "cardBackId": "CB-02" }` | `{ "activeDeckId": "ED-02", "activeCardBackId": "CB-02", "updatedAt": "..." }` | `SCR-M02`, `SCR-M08`, `SCR-W06` |

### 2.3 Luồng Đọc bài Cốt lõi & AI Streaming SSE (`/api/v1/readings`)

| Mã API | Method & Endpoint | Phân quyền | Request Payload / Params | Cấu trúc Response | Màn hình sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-06`** | `POST /api/v1/readings/daily` | Guest / User | `{ "locale": "vi\|en", "clientSeed": "string" }` | `{ "date": "2026-10-31", "card": {...}, "isReversed": false, "keywords": [...], "dailyQuote": "...", "microIdea": "..." }` | `SCR-M01`, `SCR-W01` |
| **`API-07`** | `POST /api/v1/readings/sessions` | User JWT | `{ "spreadId": 2, "inputMode": "VIRTUAL\|MANUAL", "personaCode": "IDEA_SPARK", "question": "...", "drawnCards": [ { "positionIndex": 1, "cardId": 1, "isReversed": false } ] }` | **SSE Stream (`text/event-stream`)** phát các sự kiện: `energy_overview`, `position_analysis`, `core_synthesis`, `actionable_steps`, `done` | `SCR-M03`, `SCR-M04`, `SCR-M05`, `SCR-W02`, `SCR-W03` |
| **`API-08`** | `GET /api/v1/readings/sessions/{id}` | User JWT | Path param `id (UUID)` | Chi tiết `ReadingSessionDetailDto` (lá bài, bài giải, lịch sử hỏi thêm, ghi chú) | `SCR-M05`, `SCR-W02`, `SCR-W04` |
| **`API-09`** | `POST /api/v1/readings/sessions/{id}/clarifier` | User JWT | `{ "targetPositionIndex": 2, "inputMode": "VIRTUAL\|MANUAL", "cardId": 64, "isReversed": false }` | **SSE Stream (`text/event-stream`)** phát nội dung giải thích lá bài Clarifier | `SCR-M05`, `SCR-W02` |
| **`API-10`** | `POST /api/v1/readings/sessions/{id}/chat` | User JWT | `{ "question": "Bước đầu tiên cụ thể tôi nên làm trong tuần này là gì?" }` | **SSE Stream (`text/event-stream`)** phát câu trả lời đào sâu của AI (`followUpCount <= 3`) | `SCR-M05`, `SCR-W02` |

### 2.4 Nhật ký Tarot, Thống kê & Xuất Thẻ Chia Sẻ (`/api/v1/journal`, `/share-card`)

| Mã API | Method & Endpoint | Phân quyền | Request Payload / Params | Cấu trúc Response | Màn hình sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-11`** | `PUT /api/v1/readings/sessions/{id}/journal` | User JWT | `{ "reflectionNote": "string", "moodTags": ["INSPIRED", "FOCUSED"] }` | `{ "sessionId": "uuid", "reflectionNote": "...", "moodTags": [...], "updatedAt": "..." }` | `SCR-M05`, `SCR-M06`, `SCR-W04` |
| **`API-12`** | `GET /api/v1/journal/entries` | User JWT | `?page=0&size=20&tag=INSPIRED` | Danh sách phân trang `JournalEntrySummaryDto` | `SCR-M06`, `SCR-W04` |
| **`API-13`** | `GET /api/v1/journal/analytics` | User JWT | `?days=30` | `{ "totalReadings": 18, "stalkerCard": { "cardId": 9, "count": 4 }, "elementalRatio": { "FIRE": 40, "AIR": 30, "WATER": 20, "EARTH": 10 } }` | `SCR-M06`, `SCR-W04` |
| **`API-14`** | `POST /api/v1/readings/sessions/{id}/share-card` | User JWT | `{ "aspectRatio": "9:16\|1:1", "theme": "ARCHIVAL_CREAM\|BOTANICAL_SAGE", "includeQuestion": true }` | `{ "shareUrl": "https://aitarot.app/s/xyz", "imageUrl": "https://cdn.../card.png", "summaryQuote": "..." }` | `SCR-M06`, `SCR-W05` |

### 2.5 Ví Tín Dụng (Pha lê) & Thanh toán (`/api/v1/wallet`)

| Mã API | Method & Endpoint | Phân quyền | Request Payload / Params | Cấu trúc Response | Màn hình sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-15`** | `GET /api/v1/wallet/balance` | User JWT | — | `{ "crystalBalance": 45, "tier": "FREE\|PRO", "proExpiresAt": null, "dailyFreeAvailable": true }` | `SCR-M01`, `SCR-M02`, `SCR-M07`, `SCR-W01`, `SCR-W05` |
| **`API-16`** | `POST /api/v1/wallet/daily-reward` | User JWT | — | `{ "credited": 5, "newBalance": 50 }` | `SCR-M07`, `SCR-W05` |
| **`API-17`** | `POST /api/v1/wallet/checkout` | User JWT | `{ "productCode": "PACK_170\|PRO_MONTHLY\|PRO_YEARLY", "provider": "GOOGLE_PLAY\|STRIPE\|PAYOS_QR" }` | `{ "checkoutUrl": "...", "qrData": "...", "orderId": "uuid" }` | `SCR-M07`, `SCR-W05` |
| **`API-18`** | `GET /api/v1/wallet/transactions` | User JWT | `?page=0&size=20` | Danh sách lịch sử giao dịch bất biến `CrystalTransactionDto` | `SCR-M07`, `SCR-W05` |
