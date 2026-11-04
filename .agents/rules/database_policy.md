---
trigger: always_on
description: Bắt buộc luôn luôn sử dụng Supabase PostgreSQL và tuyệt đối không bao giờ sử dụng H2 Database
---

# Database Policy (Chính sách Cơ sở Dữ liệu)

## 1. Bắt buộc luôn luôn sử dụng Supabase Cloud PostgreSQL
- **Nguồn dữ liệu thực tế duy nhất:** Mọi hoạt động đọc, ghi, truy vấn, lưu trữ phiên trải bài Tarot (`reading_sessions`), tài khoản và hồ sơ người dùng (`users`, `mystic_profiles`), danh mục bài Tarot (`tarot_cards`, `tarot_decks`, `spread_templates`), nhật ký (`journal_entries`) và số dư crystal (`crystal_transactions`) **BẮT BUỘC PHẢI LUÔN LUÔN KẾT NỐI VÀ LẤY TỪ SUPABASE CLOUD POSTGRESQL 17**.
- **Cấu hình Spring Boot & Tests:**
  - Profile hoạt động mặc định của ứng dụng và các bài test bắt buộc phải là `supabase` (`SPRING_PROFILES_ACTIVE=supabase`).
  - Datasource URL mặc định trỏ thẳng tới Supabase PostgreSQL: `jdbc:postgresql://aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`.
  - Cấu hình môi trường được lấy từ file `backend/.env`.

## 2. Tuyệt đối KHÔNG BAO GIỜ sử dụng H2 Database
- **Nghiêm cấm tuyệt đối:**
  - Không được thêm lại dependency `com.h2database:h2` vào `pom.xml`.
  - Không được tạo hoặc sử dụng cấu hình H2 in-memory (`jdbc:h2:mem:...`), không mở `/h2-console`, không cấu hình profile `local` chạy H2.
  - Không được âm thầm fallback về H2 khi gặp lỗi kết nối.
- Nếu gặp lỗi kết nối Supabase hoặc thiếu biến môi trường, agent phải báo cáo trực tiếp lỗi kết nối Supabase để người dùng kiểm tra thông số mạng hoặc credentials, tuyệt đối không tự ý chuyển sang database tạm thời H2.
