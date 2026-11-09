# Hướng Dẫn & Quy Tắc Cốt Lõi Dự Án (Project Instructions)

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
