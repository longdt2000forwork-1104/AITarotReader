---
trigger: always_on
description: Bắt buộc mọi Agent phải đọc và tuân thủ file rules.md ở thư mục gốc dự án trước khi làm việc (bao gồm quy tắc tách biệt Navigation Bar giữa Website và Mobile App)
---

# Quy Tắc Bắt Buộc Khi Làm Việc Với Dự Án AITarotReader

## 1. Bắt buộc đọc `rules.md` trước mọi tác vụ
- Trước khi phân tích, lập kế hoạch hoặc chỉnh sửa bất kỳ file nào trong dự án `AITarotReader`, **BẮT BUỘC phải đọc và kiểm tra file `rules.md` tại thư mục gốc của repository (`./rules.md`)**.
- File `rules.md` lưu giữ toàn bộ quy tắc kiến trúc, bài học sự cố (Case Study) và các ràng buộc không được phép vi phạm.

## 2. Quy tắc tách biệt Navigation Bar & Route giữa Website và Mobile App
Dự án chạy song song 2 phiên bản trên cùng một Next.js App Router:
- **Website Desktop (`SCR-W01..W09`):** Các route cấp gốc (`/`, `/workbench/[id]`, `/catalog-picker`, `/journal`, `/pricing`, `/settings/profile`, `/auth`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`).
  - **CHỈ dùng `<EditorialHeader />`**.
  - **TUYỆT ĐỐI CẤM** import hoặc gắn `<MobileBottomNav />` vào bất kỳ trang Website nào (kể cả ẩn bằng CSS như `md:hidden` / `lg:hidden`). Nếu cần menu cho màn hình nhỏ trên Web, xử lý bên trong `EditorialHeader.tsx`.
- **Mobile App (`SCR-M01..M11`):** Toàn bộ các route nằm dưới `/app/*` (`/app/home`, `/app/readings/[id]`, `/app/readings/manual`, `/app/journal`, `/app/billing`, `/app/profile`, `/app/auth`, `/app/auth/verify-email`, `/app/auth/forgot-password`, `/app/auth/reset-password`). Tính năng chọn Bộ Bài (`/decks-archive`, `/app/decks`), Xuất Poster Nghệ Thuật (`/studio-billing`, `/app/readings/[id]/share`), và luồng `demo-session` đã được lược bỏ ở cả Web và App; mỗi ngày chỉ có 1 phiên trải bài bắt đầu từ Lá Bài Hôm Nay.
  - **CHỈ dùng `<MobileBottomNav />`** và header cục bộ của App; **KHÔNG** dùng `<EditorialHeader />`.
  - Mọi liên kết bên trong `/app/*` và `MobileBottomNav` phải trỏ tới route `/app/*` hợp lệ, tránh trỏ nhầm sang route Website hoặc route không tồn tại (`/login`, `/profile`).
- **Triển khai đồng thời Web ↔ App:** Mọi tính năng mới, luồng xác thực và guard bảo vệ route phải triển khai song song trên cả Website và Mobile App.

## 3. Quy tắc Prompt & Văn phong Luận giải AI (Editorial Anti-AI Copywriting)
- **Cấm ký tự Markdown thô trong đầu ra luận giải:** Mọi prompt gửi tới LLM (Gemini AI) và fallback text bắt buộc phải chỉ định rõ **KHÔNG** dùng `###`, `##`, `#`, `**`, `*`, `__`, `---` hoặc spam emoji. Đầu ra phải là văn bản thuần túy chia thành các đoạn ngắn (2–3 câu/đoạn), phân tách bằng một dòng trống (`\n\n`).
- **Văn phong biên tập tự nhiên:** Viết điềm tĩnh, sâu sắc, trực diện theo tinh thần *Sunlit Botanical & Editorial Print*; tránh văn phong sáo rỗng hay liệt kê máy móc kiểu AI generated.
- **Hiển thị phân đoạn & "Xem thêm / Thu gọn":** Mọi UI hiển thị kết quả AI phải làm sạch chuỗi qua `cleanAiText` / `splitAiParagraphs` (`frontend/src/utils/formatAiText.ts`), render các đoạn văn có khoảng cách dòng rõ ràng (`leading-relaxed`, `space-y-2.5`), và thu gọn khi quá dài kèm nút **"Xem thêm / Thu gọn"**.

## 4. Quy tắc Git, Database & Ngôn ngữ
- Nhánh mới phục vụ sửa lỗi hoặc tính năng **bắt buộc có tiền tố `feat/`** (ví dụ `feat/fix-...`).
- Cơ sở dữ liệu duy nhất là **Supabase Cloud PostgreSQL 17** (`SPRING_PROFILES_ACTIVE=supabase`); nghiêm cấm H2.
- Luôn phản hồi bằng **tiếng Việt** và không để tác vụ chạy treo quá **5 phút**.
