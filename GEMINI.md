# Hướng Dẫn & Quy Tắc Cốt Lõi Dự Án (Project Instructions)

## Quy Tắc Bắt Buộc Đầu Tiên: Kiểm Tra `rules.md`
1. **Luôn chạy qua `rules.md` trước khi làm việc:**
   - Trước khi phân tích, sửa lỗi hoặc phát triển tính năng trên `AITarotReader`, mọi Agent **BẮT BUỘC phải đọc và tuân thủ file @[rules.md](./rules.md)** ở thư mục gốc dự án (đồng bộ với `.agents/rules/rules.md`).
2. **Tách biệt giao diện Website (`SCR-W*`) và Mobile App (`/app/*`, `SCR-M*`):**
   - Website (`/`, `/workbench/*`, `/catalog-picker`, `/decks-archive`, `/journal`, `/studio-billing`, `/pricing`, `/settings/profile`, `/auth`) **chỉ dùng `<EditorialHeader />`**, **TUYỆT ĐỐI KHÔNG** import hoặc render `<MobileBottomNav />` (kể cả ẩn bằng CSS breakpoint).
   - Mobile App (`/app/*`) **chỉ dùng `<MobileBottomNav />`** và header cục bộ của App, **KHÔNG** dùng `<EditorialHeader />`.
3. **Quy Tắc Prompt & Định Dạng Đầu Ra Luận Giải AI (Editorial Anti-AI Copywriting):**
   - Mọi prompt gửi tới LLM (Gemini AI) và chuỗi fallback **TUYỆT ĐỐI KHÔNG** yêu cầu hoặc xuất ký tự Markdown thô (`###`, `##`, `#`, `**`, `*`, `__`, `---`) hay spam emoji/icon; phải viết tự nhiên, điềm tĩnh như biên tập viên và chia thành từng đoạn ngắn (2–3 câu/đoạn) cách nhau bằng dòng trống (`\n\n`).
   - Trên UI, mọi khối luận giải/AI Guidance phải làm sạch qua `cleanAiText` / `splitAiParagraphs` (`frontend/src/utils/formatAiText.ts`), phân đoạn rõ ràng, và thu gọn nội dung dài kèm nút **"Xem thêm / Thu gọn"**.
4. **Triển Khai Đồng Bộ Web ↔ Mobile App (Feature Parity):**
   - Mọi tính năng mới hoặc luồng xác thực/bảo vệ route bắt buộc phải được triển khai **đồng thời** trên cả Website (`SCR-W*`, bao gồm `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`) và Mobile App (`/app/*`, bao gồm `/app/auth/verify-email`, `/app/auth/forgot-password`, `/app/auth/reset-password`).

## Quy Tắc Cơ Sở Dữ Liệu: Supabase Cloud PostgreSQL 17
1. **Luôn luôn sử dụng Supabase:**
   - Cơ sở dữ liệu duy nhất của toàn bộ hệ thống là Supabase Cloud PostgreSQL 17.
   - Profile mặc định của Spring Boot và các bài kiểm thử bắt buộc là `supabase` (`SPRING_PROFILES_ACTIVE=supabase`).
   - Mọi dữ liệu (cards, decks, spreads, users, sessions, journal) phải được đọc/ghi trực tiếp từ Supabase.

2. **Nghiêm cấm tuyệt đối sử dụng H2 Database:**
   - Không thêm dependency `h2` vào `pom.xml`.
   - Không cấu hình database in-memory H2, không mở `h2-console`, không tạo profile fallback về H2.
   - Nếu gặp lỗi kết nối tới Supabase, báo cáo trực tiếp cho người dùng, không bao giờ chuyển hướng sang dùng H2.

## Quy Tắc Nhánh Git (Git Branch Policy)
- Mọi nhánh mới được tạo phục vụ việc sửa lỗi hoặc tính năng **BẮT BUỘC** phải có tiền tố `feat/` (ví dụ: `feat/fix-<tên-bug>`), không dùng `fix/` đơn lẻ.

## Quy Tắc Ngôn Ngữ & Giám Sát Task
- Luôn phản hồi bằng tiếng Việt.
- Giám sát các tiến trình, không để task chạy treo quá 5 phút.
