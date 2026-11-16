# Quy Tắc Dự Án & Tài Liệu Nghiên Cứu Lỗi (`AITarotReader`)

> **BẮT BUỘC ĐỐI VỚI MỌI AI AGENT:**  
> Trước khi lập kế hoạch, chỉnh sửa mã nguồn hoặc đề xuất thay đổi trên dự án `AITarotReader`, bạn **PHẢI đọc và kiểm tra toàn bộ file `rules.md` này trước tiên**. Mọi thay đổi vi phạm các quy tắc dưới đây đều bị coi là không hợp lệ.

---

## 1. Quy Tắc Kiểm Tra Đầu Phiên (Pre-flight Checklist)

Trước khi bắt tay vào bất kỳ tác vụ nào (sửa bug, thêm tính năng, refactor UI, cấu hình backend):
1. **Xác định đúng phạm vi phiên bản:** Thay đổi này thuộc **Website Desktop (`SCR-W01..W09`)** hay **Mobile App (`/app/*`, `SCR-M01..M10`)**? Tuyệt đối không trộn lẫn Navigation Bar và Layout giữa 2 phiên bản.
2. **Kiểm tra đặc tả màn hình:** Đối chiếu route và API với `docs/SRS/Screen_and_API_Specification_v1.0_VI.md` và `docs/stitch/DESIGN_SYSTEM.md`.
3. **Kiểm tra quy tắc Git & DB:** Nhánh mới bắt buộc có tiền tố `feat/`; Database bắt buộc dùng Supabase Cloud PostgreSQL 17 (`supabase` profile), nghiêm cấm H2.
4. **Kiểm tra điều hướng nội bộ:** Đảm bảo các đường dẫn `<Link href="...">` không trỏ ra ngoài phạm vi phiên bản tương ứng hoặc trỏ tới route không tồn tại.
5. **Kiểm tra Prompt & Định dạng văn bản AI:** Mọi prompt gọi LLM và UI hiển thị luận giải phải tuân thủ Mục 4 (không xuất ký tự Markdown thô `###`/`**`, phân đoạn thoáng, thu gọn nội dung dài kèm nút "Xem thêm / Thu gọn").

---

## 2. Case Study: Sự Cố Website Hiển Thị Nhầm Navigation Bar Của Mobile App

### 2.1. Hiện tượng lỗi
- Khi truy cập phiên bản Website (cụ thể là trang chủ `/` — `SCR-W01`), giao diện hiển thị **đồng thời cả 2 thanh điều hướng**:
  - `<EditorialHeader />` (thanh điều hướng top của Website Desktop).
  - `<MobileBottomNav />` (thanh điều hướng đáy của Mobile App, chứa các tab `/app/home`, `/app/readings/new`, `/app/decks`, `/app/profile`, v.v.) dính cố định ở đáy màn hình ngay cả trên trình duyệt máy tính (Desktop).

### 2.2. Chuỗi nguyên nhân gốc rễ (Root Cause Timeline)
1. **Giai đoạn khởi tạo (`0470f10`, `b8ff495`):**
   - Trong `frontend/src/app/page.tsx` (trang chủ của Website), `<MobileBottomNav activeTab="home" />` đã bị import và render ở cuối trang song song với `<EditorialHeader activeTab="daily" />`.
   - Tuy nhiên, lúc đó `MobileBottomNav.tsx` có class `md:hidden`, nên khi mở Website trên màn hình Desktop (`>= 768px`), thanh điều hướng của App bị CSS ẩn đi, che giấu hoàn toàn lỗi cấu trúc.
2. **Đợt cập nhật cho App trên `main` (`8786156`, merge qua PR #4 `b9c65dd`):**
   - Khi cập nhật `MobileBottomNav.tsx` cho phiên bản Mobile App (chuyển sang `max-w-[430px] mx-auto` để đồng bộ khung giả lập Mobile và bổ sung nút Login), class `md:hidden` bị gỡ bỏ khỏi `<nav>` nhằm mục đích để khi mở các màn hình `/app/*` trên trình duyệt Desktop vẫn thấy được thanh Bottom Nav của App.
   - Hệ quả trực tiếp: `<MobileBottomNav activeTab="home" />` đang bị gắn nhầm trong `frontend/src/app/page.tsx` lập tức hiển thị công khai ở đáy trang chủ Website `/` trên mọi kích thước màn hình.
3. **Hệ lụy lan rộng trên các nhánh UI khác (`d36cdc4`, `3f1aa44`, `50c3081`):**
   - Vì thấy `<MobileBottomNav />` đã xuất hiện trong `page.tsx`, các lần chỉnh sửa UI sau đó trên nhánh phụ (`feat/improve-frontend-ui`, `feat/mock-data-toggle`) tiếp tục hiểu nhầm rằng `MobileBottomNav` là thanh điều hướng phụ cho Web và gắn thêm vào các trang Web khác như `/journal`, `/catalog-picker`, `/decks-archive`, `/workbench/[id]`.

### 2.3. Bài học rút ra & Cách khắc phục chuẩn
- **Nguyên tắc cốt lõi:** **Không bao giờ dùng CSS breakpoint (`md:hidden`, `lg:hidden`) để "giấu" một component của Mobile App bên trong một trang Website.**
- Nếu một component thuộc về kiến trúc Mobile App (`/app/*`), nó **không được phép tồn tại (import/render)** trong cây component của các trang Website.
- Cách xử lý đúng: Xóa hoàn toàn việc import và render `<MobileBottomNav />` khỏi `frontend/src/app/page.tsx` và toàn bộ các trang Web ngoài `/app/*`.

---

## 3. Quy Tắc Kiến Trúc Song Song 2 Phiên Bản (Web Edition vs Mobile App Edition)

Codebase `frontend/src/app/` phục vụ đồng thời **2 ứng dụng tách biệt về giao diện và trải nghiệm** (theo `docs/SRS/Screen_and_API_Specification_v1.0_VI.md`):

### 3.1. Bảng phân tách Route & Màn hình

#### A. Phiên bản Website Desktop (`SCR-W01` → `SCR-W09`)
- **Phạm vi route:** Các route nằm trực tiếp ở cấp gốc (ngoài `/app/*`).
- **Khung layout:** Rộng toàn màn hình hoặc `max-w-[1440px] mx-auto`.
- **Navigation bắt buộc:** Chỉ sử dụng **`<EditorialHeader />`** (`frontend/src/components/EditorialHeader.tsx`).

| Mã Màn Hình | Route | File Nguồn | Mô Tả |
| :--- | :--- | :--- | :--- |
| `SCR-W01` | `/` | `frontend/src/app/page.tsx` | Editorial Portal & Daily Index |
| `SCR-W02` | `/workbench/[id]` | `frontend/src/app/workbench/[id]/page.tsx` | Split-Pane Reading Workbench |
| `SCR-W03` | `/catalog-picker` | `frontend/src/app/catalog-picker/page.tsx` | 78-Card Reference & Manual Input |
| `SCR-W04` | `/journal` | `frontend/src/app/journal/page.tsx` | Archive Journal & Pattern Ledger |
| `SCR-W05` | `/studio-billing` | `frontend/src/app/studio-billing/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/pricing`)* |
| `SCR-W06` | `/decks-archive` | `frontend/src/app/decks-archive/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/`)* |
| `SCR-W07` | `/auth` | `frontend/src/app/auth/page.tsx` | Authentication & Mystic Onboarding |
| `SCR-W08` | `/settings/profile` | `frontend/src/app/settings/profile/page.tsx` | Seeker Profile, AI Memory & Settings |
| `SCR-W09` | `/pricing` | `frontend/src/app/pricing/page.tsx` | Pricing Plans, Pro & Credit Store |

#### B. Phiên bản Mobile App (`SCR-M01` → `SCR-M10` — Web Mobile & Capacitor Android APK)
- **Phạm vi route:** Toàn bộ các route nằm trong tiền tố **`/app/*`**.
- **Khung layout:** Mô phỏng kích thước di động `max-w-[430px] mx-auto` (hoặc `sm:max-w-md`).
- **Navigation bắt buộc:** Top header cục bộ của từng màn hình + **`<MobileBottomNav />`** (`frontend/src/components/MobileBottomNav.tsx`).

| Mã Màn Hình | Route | File Nguồn | Mô Tả |
| :--- | :--- | :--- | :--- |
| `SCR-M01` | `/app/home` | `frontend/src/app/app/home/page.tsx` | Daily Index & Sanctuary |
| `SCR-M02` | `/app/readings/new` | `frontend/src/app/app/readings/new/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/app/home`)* |
| `SCR-M03` | `/app/readings/draw` | `frontend/src/app/app/readings/draw/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/app/home`)* |
| `SCR-M04` | `/app/readings/manual` | `frontend/src/app/app/readings/manual/page.tsx` | 78-Card Reference Catalog |
| `SCR-M05` | `/app/readings/[id]` | `frontend/src/app/app/readings/[id]/page.tsx` | Synthesis Report & Clarifier (chỉ mở từ phiên thật, tối đa 10 lá/ngày) |
| `SCR-M06` | `/app/readings/[id]/share` | `frontend/src/app/app/readings/[id]/share/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/app/readings/[id]`)* |
| `SCR-M07` | `/app/billing` | `frontend/src/app/app/billing/page.tsx` | Credit Ledger & Pro Plan |
| `SCR-M08` | `/app/decks` | `frontend/src/app/app/decks/page.tsx` | *(Đã lược bỏ — chuyển hướng về `/app/home`)* |
| `SCR-M09` | `/app/auth` | `frontend/src/app/app/auth/page.tsx` | Sign In, Register & Mystic Onboarding |
| `SCR-M10` | `/app/profile` | `frontend/src/app/app/profile/page.tsx` | Seeker Profile & Mystic Settings |
| `SCR-M11` | `/app/journal` | `frontend/src/app/app/journal/page.tsx` | Calendar Journal & Daily Sessions |

### 3.2. Quy định cứng về Navigation & Routing
1. **Cấm rò rỉ `<MobileBottomNav />` sang Website:**
   - **TUYỆT ĐỐI KHÔNG** import hoặc render `<MobileBottomNav />` trong `frontend/src/app/page.tsx` hay bất kỳ trang Web nào (`SCR-W01..W09`).
   - Nếu Website cần hiển thị menu trên màn hình nhỏ (responsive mobile web), phải xây dựng menu responsive (hamburger/drawer/dropdown) **bên trong `<EditorialHeader />`**, không dùng thanh điều hướng của App.
2. **Cấm rò rỉ `<EditorialHeader />` vào Mobile App:**
   - Các trang trong `frontend/src/app/app/**` **TUYỆT ĐỐI KHÔNG** sử dụng `<EditorialHeader />`.
3. **Cô lập điều hướng nội bộ (Route Isolation) & Luồng 1 Ngày = 1 Phiên:**
   - Mọi phiên trải bài bắt đầu từ việc lật Lá Bài Hôm Nay tại `/` (Web) hoặc `/app/home` (App), rồi đi thẳng vào `/workbench/[id]` hoặc `/app/readings/[id]` theo `session.id` thật (hoặc mở lại từ Lịch Nhật Ký `/journal`, `/app/journal`). Không dùng đường dẫn `demo-session` hay tự động sinh phiên giả định.
   - Các trang thuộc Mobile App (`/app/*`) và `<MobileBottomNav />` chỉ được điều hướng tới các route `/app/*` hợp lệ (ví dụ: `/app/home`, `/app/readings/manual`, `/app/journal`, `/app/profile`, `/app/auth`, `/app/billing`). Tránh dẫn sang các route của Web hoặc các đường dẫn không tồn tại (như `/login`, `/profile`). Tính năng chọn Bộ Bài (`/decks-archive`, `/app/decks`) và Xuất Poster Nghệ Thuật (`/studio-billing`, `/app/readings/[id]/share`) đã được lược bỏ trên cả 2 nền tảng.
   - Các trang thuộc Website (`SCR-W*`) ưu tiên điều hướng trong các route Web (`/`, `/workbench/[id]`, `/catalog-picker`, `/journal`, `/pricing`, `/settings/profile`, `/auth`).

---

## 4. Quy Tắc Prompt & Định Dạng Đầu Ra Luận Giải AI (Editorial Anti-AI Copywriting Policy)

### 4.1. Bối cảnh vấn đề
- Các prompt trước đây yêu cầu Gemini AI trả lời *"dưới định dạng Markdown đẹp, có icon biểu tượng"* khiến kết quả luận giải (đặc biệt tại khối **AI Guidance** trên trang chủ `/` và màn hình đọc bài) bị dính dày đặc các ký tự thô `**`, `###`, `*`, dấu đầu dòng lộn xộn, không phân đoạn cách dòng hợp lý và mang nặng văn phong rập khuôn kiểu AI generated.

### 4.2. Quy tắc bắt buộc cho mọi Prompt & Service sinh luận giải (Backend & API Routes)
1. **Cấm ký tự Markdown thô & Spam Emoji:**
   - Mọi prompt gửi tới LLM (trong `GeminiService.java`, `frontend/src/app/api/**/route.ts`, hoặc bất kỳ endpoint/service AI mới nào) **BẮT BUỘC phải quy định rõ KHÔNG dùng** các ký tự Markdown (`###`, `##`, `#`, `**`, `*`, `__`, `---`, backtick) và **KHÔNG chèn emoji/icon**.
   - Các chuỗi fallback tĩnh (như trong `ReadingSessionService.java` hoặc `mockData.ts`) cũng **TUYỆT ĐỐI KHÔNG** chứa `###`, `**`, `✦`, `✨`.
2. **Văn phong biên tập tự nhiên (Human Editorial Tone):**
   - Viết trực diện, điềm tĩnh, sâu sắc và tinh tế theo tinh thần *Sunlit Botanical & Editorial Print*; tránh mở đầu/kết thúc sáo rỗng kiểu máy móc (*"Chào bạn..."*, *"Dưới đây là..."*, *"Tóm lại..."*, *"Hãy nhớ rằng..."*).
3. **Cấu trúc phân đoạn rõ ràng:**
   - Bắt buộc yêu cầu đầu ra là văn bản thuần túy được chia thành các đoạn văn ngắn (mỗi đoạn 2–3 câu), cách nhau bằng đúng một dòng trống (`\n\n`).
   - Với trải bài 1 lá / Hàng ngày (`S-01`): Chỉ viết đúng **2 đoạn ngắn (khoảng 60–90 từ)** — đoạn 1 nêu thông điệp trọng tâm, đoạn 2 gợi ý một hành động thực tế cho hôm nay.
   - Với trải bài nhiều lá: Mỗi vị trí là một đoạn văn ngắn mở đầu tự nhiên bằng tên vị trí và tên lá bài, kết thúc bằng một đoạn đúc kết hành động thực tế.
4. **Hậu xử lý an toàn ở Server:**
   - Kết quả từ LLM phải đi qua bộ lọc làm sạch (`sanitizeEditorialText` ở Backend / `cleanAiText` ở API Route) trước khi lưu DB hoặc trả cho Client.

### 4.3. Quy tắc hiển thị & Thu gọn văn bản AI trên Giao diện (Frontend UI)
1. **Làm sạch & Tách đoạn khi render:**
   - Mọi vị trí hiển thị văn bản luận giải từ AI (bao gồm dữ liệu cũ đã lưu trong Supabase) phải đi qua `cleanAiText` / `splitAiParagraphs` (`frontend/src/utils/formatAiText.ts`) để loại bỏ ký tự Markdown thô và render từng đoạn bằng thẻ `<p>` tách biệt (`space-y-2.5`, `leading-relaxed`).
2. **Bắt buộc có cơ chế "Xem thêm / Thu gọn" cho nội dung dài:**
   - Tại các thẻ tóm tắt như khối **AI Guidance** trên trang chủ `/` (`frontend/src/app/page.tsx`) và `/app/home` (`frontend/src/app/app/home/page.tsx`), nếu nội dung dài (sử dụng `getAiGuidancePreview`), mặc định chỉ hiển thị phần mở đầu súc tích và cung cấp nút **"Xem thêm / Thu gọn"** (`Read more / Show less`) để người dùng chủ động bấm xem toàn văn.

---

## 5. Tổng Hợp Các Quy Tắc Cốt Lõi Khác Của Dự Án

1. **Cơ sở dữ liệu (Database Policy):**
   - Cơ sở dữ liệu duy nhất là **Supabase Cloud PostgreSQL 17** với profile mặc định `SPRING_PROFILES_ACTIVE=supabase`.
   - **Nghiêm cấm tuyệt đối sử dụng H2 Database** (không thêm `com.h2database:h2` vào `pom.xml`, không cấu hình `jdbc:h2:mem:...`, không mở `/h2-console`, không fallback về H2 khi mất kết nối).
2. **Nhánh Git (Git Branch Policy):**
   - Mọi nhánh mới tạo để sửa lỗi hoặc phát triển tính năng **BẮT BUỘC phải có tiền tố `feat/`** (ví dụ: `feat/fix-web-app-navbar`, `feat/fix-<tên-bug>`). Không dùng tiền tố `fix/` đơn lẻ.
3. **Thiết kế giao diện (Design System Policy):**
   - Tuân thủ phong cách *Sunlit Botanical & Editorial Print (Light Mode)* trong `docs/stitch/DESIGN_SYSTEM.md`: nền sáng `#FAF9F6` / `#FFFFFF`, chữ mực `#0F172A`, viền mảnh `1px solid #E2E8F0`, màu nhấn Botanical Emerald `#059669`. Không dùng dark mode phù thủy hay neon glow.
4. **Ngôn ngữ & Giám sát tác vụ:**
   - Luôn phản hồi và giải thích bằng **tiếng Việt**.
   - Không để bất kỳ tiến trình, background command hay test script nào chạy treo quá **5 phút**.
