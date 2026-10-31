# Design System: Sunlit Botanical & Editorial Print (Light Mode)

> **Stitch Project:** `AITarotReader — Web & Android UI (Light Editorial)`  
> **Project ID:** `9263024000499436445`  
> **Design System ID:** `assets/9053777410806225859`  
> **Target Platforms:** Web Application (Desktop 1280px+) & Android Mobile (390px / Capacitor Native Shell)

---

## 1. Anti-AI Negative Rules (Bắt buộc tuân thủ)

1. **NO Neon AI Gradients or Glows:**
   - Tuyệt đối KHÔNG dùng hiệu ứng phát sáng neon, viền tím/cyan cyberpunk, nền tối u ám kiểu phù thủy (witchcraft gloomy dark).
2. **NO Card Fatigue:**
   - KHÔNG bọc mọi thành phần, chỉ số hay đoạn văn vào các khối nổi `rounded-2xl shadow-xl`.
   - Dùng bố cục dạng báo chí / tạp chí sáng rõ (Editorial Print / Swiss Grid), ngăn cách bằng đường kẻ mảnh `1px solid #E2E8F0` và xen kẽ các hàng màu kem nhạt / trắng (`#FAF9F6` và `#FFFFFF`).
3. **NO Meaningless Decorative SVGs:**
   - Chỉ sử dụng nét khắc gỗ hoa lá / biểu tượng chiêm tinh trên mặt lá bài thật sự, không chèn các họa tiết trang trí vô nghĩa xung quanh UI.
4. **High-Contrast Daylight Legibility:**
   - Tất cả văn bản đạt chuẩn WCAG AA/AAA: Chữ mực đậm Slate-900 (`#0F172A`) trên nền sáng Alabaster (`#FAF9F6`) hoặc Pure White (`#FFFFFF`).

---

## 2. Color Palette & Token Architecture

| Token Name | Hex Code | Tailwind Token | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Canvas / Base Surface** | `#FAF9F6` | `bg-surface` | Nền ấm Alabaster / Sunlit Off-White toàn trang |
| **Pure Surface** | `#FFFFFF` | `bg-surface-pure` | Mặt bảng trải bài, trang đọc kết quả, form nhập liệu |
| **Subtle Surface** | `#F8FAFC` | `bg-surface-subtle` | Thanh tiêu đề phụ, dải thông số, bảng thống kê |
| **Variant Surface** | `#F1F5F9` | `bg-surface-variant` | Tab chưa kích hoạt, filter pill, header bảng |
| **Structural Hairline** | `#E2E8F0` | `border-outline-variant` | Viền kẻ mảnh `1px solid` định hình cột, dòng, header |
| **Primary Ink** | `#0F172A` | `text-on-surface` | Màu chữ chính (Deep Charcoal Slate / Editorial Ink) |
| **Secondary Ink** | `#475569` | `text-on-surface-variant` | Tiêu đề phụ, nhãn chỉ mục, mô tả |
| **Muted Ink** | `#64748B` | `text-ink-muted` | Thời gian, số La Mã, chú thích nhỏ |
| **Botanical Accent** | `#059669` | `text-primary`, `bg-primary` | Màu nhấn duy nhất: Trạng thái chọn, viền lá bài active, nút CTA |
| **Botanical Hover** | `#047857` | `bg-primary-hover` | Trạng thái hover nút chính |
| **Amber Tint** | `#FEF3C7` | `bg-amber-tint` | Nền huy hiệu số dư Credits / Pha lê |
| **Amber Ink** | `#B45309` | `text-amber-ink` | Chữ số dư Credits / Pha lê |

---

## 3. Typography Architecture

- **Display & Headlines:** `Newsreader` (Google Fonts: serif, bold, tight tracking `-0.025em`, font size 24px - 46px). Mang phong cách sách in cổ điển, trang trọng.
- **Body, UI & Data:** `Be Vietnam Pro` (Google Fonts: sans-serif, hỗ trợ 100% tiếng Việt chuẩn Unicode và tiếng Anh). Nhãn nhỏ dùng chữ in hoa `11px uppercase tracking-[0.06em]`.
- **Monospace / Indicators:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` cho số thứ tự (ví dụ: `01 PROTOCOL`, `RWS // 19`).
- **Corner Radius:** `rounded-lg` (8px / `ROUND_EIGHT`) đồng nhất cho toàn bộ nút bấm, khung nhập liệu, và viền lá bài.

---

## 4. Master Screen Mapping (14 Màn hình)

### A. Android Mobile (`deviceType: MOBILE` — 8 Màn hình)
1. **`SCR-M01`** (`ec3d9735211a410d8a23782765d20007`) — **Android — Daily Index & Sanctuary** (`/app/home`)
2. **`SCR-M02`** (`b924e509e4ce4fe39a494797eb7b82b7`) — **Android — Spread & Reader Configuration** (`/app/readings/new`)
3. **`SCR-M03`** (`67d3c8928ee649048953fb5bd25880ad`) — **Android — Tactile Deck Draw** (`/app/readings/draw`)
4. **`SCR-M04`** (`551f8de635c840ee92bf2c98e27d37bf`) — **Android — Physical Deck Index Picker** (`/app/readings/manual`)
5. **`SCR-M05`** (`a965422ea71c4ce88810ef5a90351fa6`) — **Android — Synthesis Report & Clarifier** (`/app/readings/[id]`)
6. **`SCR-M06`** (`beb4caef0fd545de83e6597801f509b1`) — **Android — Editorial Print & Share Studio** (`/app/readings/[id]/share`)
7. **`SCR-M07`** (`9b6c9a5dd970419d896c30ca6d9e99f8`) — **Android — Credit Ledger & Pro Plan** (`/app/billing`)
8. **`SCR-M08`** (`942adfdd75c84337a53d61a78d8e54a6`) — **Android — Deck Edition Gallery & Art Preview** (`/app/decks`)

### B. Web Desktop (`deviceType: DESKTOP` — 6 Màn hình)
1. **`SCR-W01`** (`355fb17c4dca42f2b52ebcc7748c6a9d`) — **Web — Editorial Portal & Daily Index** (`/`)
2. **`SCR-W02`** (`6c7e5dfbb8f6408eb6b115ed3ddd2936`) — **Web — Split-Pane Reading Workbench** (`/workbench/[id]`)
3. **`SCR-W03`** (`0bb9c7fb18304eb0a1356cadb8b88aa5`) — **Web — 78-Card Reference & Manual Input** (`/catalog-picker`)
4. **`SCR-W04`** (`91a5851e70e04282aadb656ed902745f`) — **Web — Archive Journal & Pattern Ledger** (`/journal`)
5. **`SCR-W05`** (`07bc70ee9b0f4c09a3c42c80c8860540`) — **Web — Print Export Studio & Billing** (`/studio-billing`)
6. **`SCR-W06`** (`f70f51f911c64ceda93a25a5e2c53e37`) — **Web — Curated Deck Editions & 78-Card Contact Sheet** (`/decks-archive`)

