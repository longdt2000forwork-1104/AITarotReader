# DANH MỤC ĐẦY ĐỦ 78 LÁ BÀI TAROT & BỘ SƯU TẬP 5 BỘ BÀI (MASTER CATALOG v1.2)

**Dự án:** AITarotReader (Web & Android)  
**Phiên bản:** 1.2 (Bổ sung Hệ thống Đa Bộ Bài & Đầy đủ 78 Lá Bài Chuẩn)  
**Ngày cập nhật:** 31/10/2026  
**Phong cách Thiết kế UI:** Sunlit Botanical & Editorial Print (Anti-AI Light Mode `#FAF9F6`)  
**File Seed JSON gốc:** `docs/SRS/seed/tarot_78_cards_and_decks_seed.json`

---

## 1. BỘ SƯU TẬP 5 BỘ BÀI TAROT ĐƯỢC TUYỂN CHỌN (CURATED TAROT DECK EDITIONS)

Hệ thống hỗ trợ kiến trúc **Multi-Deck (Đa Bộ Bài)**. Mỗi bộ bài đều bao gồm **đầy đủ 78 lá bài** (22 lá Ẩn Chính + 56 lá Ẩn Phụ) được ánh xạ chuẩn xác qua khóa chính `card_id (0..77)` và bảng `DECK_CARD_ARTWORKS`. Người dùng có thể đổi bộ bài bất kỳ lúc nào tại màn hình **Cấu hình Trải bài (`SCR-M02`)**, **Thư viện Bộ bài Android (`SCR-M08`)** hoặc **Contact Sheet 78 Lá trên Web (`SCR-W06`)**.

| Mã Bộ Bài | Tên Bộ Bài (VI / EN) | Họa Sĩ / Nguồn Gốc | Phong Cách Nghệ Thuật (Art Direction) | Số Lá | Phân Hạng Mở Khóa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ED-01` | **Rider-Waite-Smith 1909 (Bản Khắc Đá Nguyên Bản)**<br>*(Rider-Waite-Smith 1909 (Centennial Lithograph))* | Pamela Colman Smith & A.E. Waite (1909) | Nét khắc đá thạch bản phục chế năm 1909 trên nền giấy ngà cổ điển | **78/78** | Miễn phí (Mặc định) |
| `ED-02` | **Sunlit Botanical Herbarium (Bản Khắc Thực Vật Học Nắng Sớm)**<br>*(Sunlit Botanical Herbarium (2025 Archival Edition))* | AITarot Archival Studio (2025) | Nét mực khắc thực vật học thanh mảnh & tiêu bản hoa lá ép trên giấy trắng ngà #FAF9F6 | **78/78** | Miễn phí (Free) |
| `ED-03` | **Swiss Geometric Bauhaus (Hình Học Tối Giản Thụy Sĩ)**<br>*(Swiss Geometric Bauhaus (Minimalist Grid))* | Zürich Constructivist Press (2024) | Hệ lưới kiến trúc chuẩn xác, hình khối cơ bản & nghệ thuật sắp chữ tối giản | **78/78** | Miễn phí (Free) |
| `ED-04` | **Tarot de Marseille Cổ Điển 1760 (Phục Chế Khắc Gỗ Nicolas Conver)**<br>*(Ancien Tarot de Marseille 1760 (Nicolas Conver Restoration))* | Nicolas Conver (Marseille) (1760) | Bản in khắc gỗ Pháp thế kỷ 18 với sắc đỏ chu sa, chàm và vàng đất | **78/78** | Pro hoặc 30 Credits |
| `ED-05` | **Kyoto Thủy Mặc & Màu Nước Khoáng Chất (Sumi-e)**<br>*(Kyoto Washed Sumi-e & Mineral Watercolor)* | Kamo River Atelier (2025) | Nét cọ mực tàu thủy mặc kết hợp màu khoáng tự nhiên trên giấy dó Washi thủ công | **78/78** | Pro hoặc 45 Credits |

### 1.1. Tùy Chọn Chất Liệu Mặt Lưng Bài (Tactile Card Back Finishes)

| Mã Lưng Bài | Tên Chất Liệu (VI / EN) | Đặc Điểm Bề Mặt & Màu Sắc | Phân Hạng |
| :--- | :--- | :--- | :--- |
| `CB-01` | **Vải Lanh Tự Nhiên (Natural Flax)**<br>*(Natural Flax Linen Weave)* | Matte Woven Paper (#FAF9F6 / #E2E8F0) | FREE |
| `CB-02` | **Nhũ Ngọc Lục Bảo Thực Vật (#059669)**<br>*(Botanical Emerald Pressed Foil)* | Deep Forest Linen with Emerald Botanical Seal | FREE |
| `CB-03` | **Dấu Sáp Đất Nung (Terracotta Seal)**<br>*(Terracotta Clay Wax Seal)* | Warm Earth Ochre with Embossed Ring (#D97706) | PRO_OR_CREDITS |
| `CB-04` | **Hoa Hồng Tudor & Hoa Huệ Cổ Điển 1909**<br>*(Classic 1909 Tudor Rose & Lily)* | Archival Monochrome Linework (#0F172A) | FREE |

---

## 2. DANH MỤC CHI TIẾT ĐẦY ĐỦ 78 LÁ BÀI TAROT (COMPLETE 78-CARD CANONICAL INDEX)

Tổng cộng: **78 Lá Bài** = **22 Lá Ẩn Chính (Major Arcana `00..21`)** + **56 Lá Ẩn Phụ (Minor Arcana `22..77` chia đều 4 chất: 14 Gậy, 14 Ly, 14 Kiếm, 14 Tiền)**.

### 2.1. Bộ Ẩn Chính — Major Arcana (22 Lá: `card_id` 00 – 21)

| ID | Mã Lá | Số La Mã | Tên Lá Bài (EN — VI) | Nguyên Tố / Chiêm Tinh | Từ Khóa Nghĩa Xuôi (Upright) | Từ Khóa Nghĩa Ngược (Reversed) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `00` | `MAJ-00` | **0** | **The Fool**<br>*(Lá Chàng Khờ (Kẻ Lữ Hành))* | Air / Uranus (Khí / Thiên Vương Tinh) | Khởi đầu mới, tự do, bước nhảy niềm tin, sự vô tư sáng tạo | Liều lĩnh thiếu suy nghĩ, do dự, cả tin, mất phương hướng |
| `01` | `MAJ-01` | **I** | **The Magician**<br>*(Lá Nhà Ảo Thuật (Đạo Sĩ))* | Air / Mercury (Khí / Thủy Tinh) | Hiện thực hóa ý tưởng, tháo vát, ý chí, làm chủ kỹ năng | Thao túng, tài năng bỏ phí, phân tán năng lượng, ảo tưởng |
| `02` | `MAJ-02` | **II** | **The High Priestess**<br>*(Lá Nữ Tư Tế Tối Cao)* | Water / Moon (Nước / Mặt Trăng) | Trực giác nhạy bén, bí ẩn nội tâm, trí tuệ tiềm thức, tĩnh lặng | Bỏ qua trực giác, bí mật che giấu, hời hợt, tắc nghẽn cảm xúc |
| `03` | `MAJ-03` | **III** | **The Empress**<br>*(Lá Hoàng Hậu)* | Earth / Venus (Đất / Kim Tinh) | Trù phú, nuôi dưỡng, sáng tạo dồi dào, vẻ đẹp tự nhiên | Tắc nghẽn sáng tạo, phụ thuộc, kiệt sức, quên chăm sóc bản thân |
| `04` | `MAJ-04` | **IV** | **The Emperor**<br>*(Lá Hoàng Đế)* | Fire / Aries (Lửa / Bạch Dương) | Cấu trúc vững chắc, uy quyền, nền tảng chiến lược, kỷ luật | Cứng nhắc, kiểm soát thái quá, áp đặt, thiếu kỷ luật |
| `05` | `MAJ-05` | **V** | **The Hierophant**<br>*(Lá Giáo Hoàng)* | Earth / Taurus (Đất / Kim Ngưu) | Truyền thống, người dẫn dắt, hệ giá trị chuẩn mực, học hỏi | Phá vỡ lối mòn, tự do cá nhân, giáo điều lỗi thời |
| `06` | `MAJ-06` | **VI** | **The Lovers**<br>*(Lá Tình Nhân (Sự Lựa Chọn))* | Air / Gemini (Khí / Song Tử) | Đồng điệu giá trị, lựa chọn có ý thức, hòa hợp, gắn kết | Bất hòa, lệch pha giá trị, do dự, mâu thuẫn nội tâm |
| `07` | `MAJ-07` | **VII** | **The Chariot**<br>*(Lá Cỗ Xe Chiến Thắng)* | Water / Cancer (Nước / Cự Giải) | Ý chí định hướng, đà tiến mạnh mẽ, quyết tâm, chiến thắng | Mất kiểm soát, chệch hướng, nóng vội, đình trệ |
| `08` | `MAJ-08` | **VIII** | **Strength**<br>*(Lá Sức Mạnh Nội Tâm)* | Fire / Leo (Lửa / Sư Tử) | Lòng dũng cảm, chế ngự bằng sự dịu dàng, kiên nhẫn, bền bỉ | Nghi ngờ bản thân, phản ứng bốc đồng, mệt mỏi, bất an |
| `09` | `MAJ-09` | **IX** | **The Hermit**<br>*(Lá Ẩn Sĩ)* | Earth / Virgo (Đất / Xử Nữ) | Chiêm nghiệm độc lập, soi chiếu nội tâm, trí tuệ sâu sắc | Cô lập quá mức, thu mình, suy nghĩ cực đoan, cô đơn |
| `10` | `MAJ-10` | **X** | **Wheel of Fortune**<br>*(Lá Bánh Xe Số Phận)* | Fire / Jupiter (Lửa / Mộc Tinh) | Bước ngoặt, chu kỳ xoay chuyển, cơ duyên, vận hội mới | Chống lại sự thay đổi, chững lại tạm thời, cần phá vòng lặp |
| `11` | `MAJ-11` | **XI** | **Justice**<br>*(Lá Công Lý)* | Air / Libra (Khí / Thiên Bình) | Công bằng, sự thật, nhân quả minh bạch, khách quan | Mất cân bằng, thiên vị, né tránh trách nhiệm, thiếu công tâm |
| `12` | `MAJ-12` | **XII** | **The Hanged Man**<br>*(Lá Người Treo Ngược)* | Water / Neptune (Nước / Hải Vương Tinh) | Đổi góc nhìn mới, tạm dừng chủ động, buông bỏ để thấu suốt | Trì hoãn vô ích, hy sinh mù quáng, kháng cự thực tại |
| `13` | `MAJ-13` | **XIII** | **Death**<br>*(Lá Tử Thần (Sự Chuyển Hóa))* | Water / Scorpio (Nước / Thiên Yết) | Chuyển hóa sâu sắc, khép lại chu kỳ cũ, tái sinh mạnh mẽ | Bám chấp quá khứ, sợ thay đổi, trì trệ không chịu buông |
| `14` | `MAJ-14` | **XIV** | **Temperance**<br>*(Lá Tiết Độ (Sự Cân Bằng))* | Fire / Sagittarius (Lửa / Nhân Mã) | Dung hòa, điều độ, kết hợp hài hòa, kiên nhẫn chữa lành | Mất cân bằng, thái quá, nóng vội, xung đột ưu tiên |
| `15` | `MAJ-15` | **XV** | **The Devil**<br>*(Lá Ác Quỷ (Sự Ràng Buộc))* | Earth / Capricorn (Đất / Ma Kết) | Nhận diện góc khuất, sự ràng buộc, cám dỗ vật chất, ám ảnh | Giải phóng, bứt phá xiềng xích, lấy lại chủ quyền bản thân |
| `16` | `MAJ-16` | **XVI** | **The Tower**<br>*(Lá Tòa Tháp Sụp Đổ)* | Fire / Mars (Lửa / Hỏa Tinh) | Thức tỉnh bất ngờ, phá vỡ cấu trúc giả tạo, đột phá lớn | Trì hoãn sự thay đổi tất yếu, sợ sụp đổ, chấn động ngầm |
| `17` | `MAJ-17` | **XVII** | **The Star**<br>*(Lá Ngôi Sao Hy Vọng)* | Air / Aquarius (Khí / Bảo Bình) | Hy vọng, cảm hứng trong trẻo, phục hồi năng lượng, sáng tỏ | Nản lòng, cạn kiệt cảm hứng, mất kết nối, bi quan |
| `18` | `MAJ-18` | **XVIII** | **The Moon**<br>*(Lá Mặt Trăng)* | Water / Pisces (Nước / Song Ngư) | Giấc mơ, chiều sâu vô thức, ảo ảnh, đi qua vùng mờ sương | Tan màn sương mù, sự thật hé lộ, vượt qua nỗi lo vô hình |
| `19` | `MAJ-19` | **XIX** | **The Sun**<br>*(Lá Mặt Trời)* | Fire / Sun (Lửa / Mặt Trời) | Sinh lực dồi dào, niềm vui, thành công rực rỡ, minh bạch | Mây mù tạm thời, kỳ vọng quá mức, cái tôi che khuất |
| `20` | `MAJ-20` | **XX** | **Judgement**<br>*(Lá Phán Xét (Tiếng Gọi Thức Tỉnh))* | Fire / Pluto (Lửa / Diêm Vương Tinh) | Thức tỉnh, tiếng gọi sứ mệnh, tự tha thứ, tổng kết quyết định | Tự phán xét khắt khe, nghi ngờ bản thân, lờ đi tiếng gọi |
| `21` | `MAJ-21` | **XXI** | **The World**<br>*(Lá Thế Giới (Sự Viên Mãn))* | Earth / Saturn (Đất / Thổ Tinh) | Hoàn thành trọn vẹn, hợp nhất, viên mãn, mở ra tầm cao mới | Chưa trọn vẹn, thiếu bước khép lại, đi đường tắt |

### 2.2. Bộ Gậy — Suit of Wands (14 Lá: `card_id` 22 – 35 | Nguyên tố Lửa — Sáng Tạo, Hành Động & Nhiệt Huyết)

| ID | Mã Lá | Cấp Bậc | Tên Lá Bài (EN — VI) | Từ Khóa Nghĩa Xuôi (Upright) | Từ Khóa Nghĩa Ngược (Reversed) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `22` | `WAN-01` | **I** | **Ace of Wands**<br>*(Ách Gậy (Ace of Wands))* | Tia lửa sáng tạo, khởi xướng táo bạo, cảm hứng nguyên bản | Trì hoãn, thiếu động lực, khởi đầu ngập ngừng, bí ý tưởng |
| `23` | `WAN-02` | **II** | **Two of Wands**<br>*(Hai Gậy (Two of Wands))* | Hoạch định tương lai, mở rộng tầm nhìn, lựa chọn chiến lược | Sợ bước ra khỏi vùng an toàn, thiếu kế hoạch dài hạn |
| `24` | `WAN-03` | **III** | **Three of Wands**<br>*(Ba Gậy (Three of Wands))* | Đà phát triển, tầm nhìn xa, mở rộng quy mô, chờ đón thành quả | Trở ngại khi mở rộng, chậm trễ, tầm nhìn hạn hẹp |
| `25` | `WAN-04` | **IV** | **Four of Wands**<br>*(Bốn Gậy (Four of Wands))* | Ăn mừng cột mốc, hòa hợp, nền tảng ấm áp, sum vầy | Căng thẳng giai đoạn chuyển tiếp, cảm giác chưa ổn định |
| `26` | `WAN-05` | **V** | **Five of Wands**<br>*(Năm Gậy (Five of Wands))* | Va chạm ý tưởng, cạnh tranh sôi nổi, tranh luận đa chiều | Né tránh xung đột, hóa giải bất đồng, mâu thuẫn ngầm |
| `27` | `WAN-06` | **VI** | **Six of Wands**<br>*(Sáu Gậy (Six of Wands))* | Được ghi nhận, chiến thắng, tự tin tỏa sáng, tiến bộ rõ rệt | Cần tiết chế cái tôi, thành tựu thầm lặng, phụ thuộc lời khen |
| `28` | `WAN-07` | **VII** | **Seven of Wands**<br>*(Bảy Gậy (Seven of Wands))* | Giữ vững lập trường, kiên trì bảo vệ giá trị, bản lĩnh | Quá tải, muốn buông xuôi, mệt mỏi vì phải phòng thủ |
| `29` | `WAN-08` | **VIII** | **Eight of Wands**<br>*(Tám Gậy (Eight of Wands))* | Chuyển động thần tốc, tin tức nhanh, guồng quay thuận lợi | Chậm trễ, hiểu lầm thông tin, hấp tấp thiếu chuẩn bị |
| `30` | `WAN-09` | **IX** | **Nine of Wands**<br>*(Chín Gậy (Nine of Wands))* | Bền bỉ đến cùng, cảnh giác, thiết lập ranh giới, sát đích đến | Kiệt sức, đa nghi quá mức, cứng đầu, cần nghỉ ngơi |
| `31` | `WAN-10` | **X** | **Ten of Wands**<br>*(Mười Gậy (Ten of Wands))* | Gánh nặng trách nhiệm, ôm đồm công việc, nỗ lực chặng cuối | Chia sẻ bớt việc, buông bỏ gánh nặng không cần thiết |
| `32` | `WAN-11` | **PAGE** | **Page of Wands**<br>*(Thị Đồng Gậy (Page of Wands))* | Người khám phá tò mò, nhiệt huyết mới, tin vui sáng tạo | Nhiệt tình cả thèm chóng chán, thiếu kiên nhẫn, ý tưởng dở dang |
| `33` | `WAN-12` | **KNIGHT** | **Knight of Wands**<br>*(Hiệp Sĩ Gậy (Knight of Wands))* | Hành động đầy đam mê, phiêu lưu, cuốn hút, dám nghĩ dám làm | Nóng vội, bốc đồng, đốt cháy giai đoạn, dễ nổi nóng |
| `34` | `WAN-13` | **QUEEN** | **Queen of Wands**<br>*(Hoàng Hậu Gậy (Queen of Wands))* | Tự tin cuốn hút, ấm áp, truyền cảm hứng, sống đúng bản sắc | Thu mình, ghen tị, kiểm soát cảm xúc kém, giảm sự tự tin |
| `35` | `WAN-14` | **KING** | **King of Wands**<br>*(Nhà Vua Gậy (King of Wands))* | Lãnh đạo tầm nhìn, tinh thần khởi nghiệp, dẫn dắt quyết đoán | Độc đoán, áp đặt tầm nhìn, kỳ vọng thiếu thực tế |

### 2.3. Bộ Ly — Suit of Cups (14 Lá: `card_id` 36 – 49 | Nguyên tố Nước — Cảm Xúc, Trực Giác & Kết Nối)

| ID | Mã Lá | Cấp Bậc | Tên Lá Bài (EN — VI) | Từ Khóa Nghĩa Xuôi (Upright) | Từ Khóa Nghĩa Ngược (Reversed) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `36` | `CUP-01` | **I** | **Ace of Cups**<br>*(Ách Ly (Ace of Cups))* | Tràn đầy cảm xúc mới, lòng trắc ẩn, mở lòng, cảm hứng nghệ thuật | Cạn kiệt cảm xúc, kìm nén tình cảm, khép lòng |
| `37` | `CUP-02` | **II** | **Two of Cups**<br>*(Hai Ly (Two of Cups))* | Kết nối tâm giao, hợp tác ăn ý, thấu hiểu và tôn trọng lẫn nhau | Lệch nhịp giao tiếp, cho-nhận chưa cân bằng, khoảng cách |
| `38` | `CUP-03` | **III** | **Three of Cups**<br>*(Ba Ly (Three of Cups))* | Tình bạn, niềm vui hội ngộ, cộng đồng nâng đỡ, đồng sáng tạo | Quá đà trong tiệc tùng, mệt mỏi xã giao, cần không gian riêng |
| `39` | `CUP-04` | **IV** | **Four of Cups**<br>*(Bốn Ly (Four of Cups))* | Trầm tư, thờ ơ, đánh giá lại các lựa chọn, hướng vào bên trong | Chợt nhận ra cơ hội mới, bước ra khỏi sự trì trệ cảm xúc |
| `40` | `CUP-05` | **V** | **Five of Cups**<br>*(Năm Ly (Five of Cups))* | Tiếc nuối, thất vọng, nhìn vào mất mát, cần thời gian lắng dịu | Chấp nhận, hướng về phía trước, trân trọng những gì còn lại |
| `41` | `CUP-06` | **VI** | **Six of Cups**<br>*(Sáu Ly (Six of Cups))* | Hoài niệm đẹp, ký ức trong trẻo, sự tử tế, niềm vui giản dị | Mắc kẹt trong quá khứ, trưởng thành vượt qua khuôn mẫu cũ |
| `42` | `CUP-07` | **VII** | **Seven of Cups**<br>*(Bảy Ly (Seven of Cups))* | Nhiều lựa chọn, trí tưởng tượng phong phú, mơ mộng, phân vân | Sáng tỏ lựa chọn, thực tế hóa, gạt bỏ ảo tưởng lan man |
| `43` | `CUP-08` | **VIII** | **Eight of Cups**<br>*(Tám Ly (Eight of Cups))* | Rời bỏ điều không còn phù hợp, đi tìm ý nghĩa sâu sắc hơn | Ngại thay đổi, níu kéo vùng an toàn cũ, đi-ở lưỡng lự |
| `44` | `CUP-09` | **IX** | **Nine of Cups**<br>*(Chín Ly (Nine of Cups))* | Mãn nguyện, ước nguyện thành hiện thực, biết ơn, hài lòng | Thỏa mãn bề ngoài, đòi hỏi quá mức, thiếu chiều sâu nội tâm |
| `45` | `CUP-10` | **X** | **Ten of Cups**<br>*(Mười Ly (Ten of Cups))* | Hạnh phúc trọn vẹn, bình yên bền vững, gắn kết gia đình/đội nhóm | Căng thẳng ngầm, kỳ vọng lệch nhau về sự hòa hợp |
| `46` | `CUP-11` | **PAGE** | **Page of Cups**<br>*(Thị Đồng Ly (Page of Cups))* | Tâm hồn nhạy cảm, thông điệp trực giác, cảm hứng thơ mộng | Nhạy cảm quá mức, trốn tránh thực tế, thiếu tự tin sáng tạo |
| `47` | `CUP-12` | **KNIGHT** | **Knight of Cups**<br>*(Hiệp Sĩ Ly (Knight of Cups))* | Lý tưởng lãng mạn, đi theo tiếng gọi trái tim, tinh tế, nghệ sĩ | Thất thường theo cảm xúc, lý tưởng hóa quá mức |
| `48` | `CUP-13` | **QUEEN** | **Queen of Cups**<br>*(Hoàng Hậu Ly (Queen of Cups))* | Thấu cảm sâu sắc, trí tuệ trực giác, điểm tựa dịu dàng | Ngập lụt cảm xúc, dễ bị ảnh hưởng bởi người khác, quên ranh giới |
| `49` | `CUP-14` | **KING** | **King of Cups**<br>*(Nhà Vua Ly (King of Cups))* | Bản lĩnh cảm xúc, điềm tĩnh, bao dung, cố vấn đáng tin cậy | Kìm nén cảm xúc quá mức, sóng ngầm bên trong, lạnh lùng |

### 2.4. Bộ Kiếm — Suit of Swords (14 Lá: `card_id` 50 – 63 | Nguyên tố Khí — Tư Duy, Sự Thật & Quyết Định)

| ID | Mã Lá | Cấp Bậc | Tên Lá Bài (EN — VI) | Từ Khóa Nghĩa Xuôi (Upright) | Từ Khóa Nghĩa Ngược (Reversed) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `50` | `SWO-01` | **I** | **Ace of Swords**<br>*(Ách Kiếm (Ace of Swords))* | Đột phá tư duy, sáng tỏ sự thật, sắc bén, quyết định dứt khoát | Rối bời, phán đoán thiếu chính xác, lời nói gây tổn thương |
| `51` | `SWO-02` | **II** | **Two of Swords**<br>*(Hai Kiếm (Two of Swords))* | Ngã rẽ lưỡng lự, thế giằng co, cân nhắc lý-tình, tạm khóa lòng | Quá tải thông tin, buộc phải đưa ra lựa chọn, sự thật lộ diện |
| `52` | `SWO-03` | **III** | **Three of Swords**<br>*(Ba Kiếm (Three of Swords))* | Tổn thương, sự thật mất lòng, giải tỏa nỗi buồn để sáng mắt | Chữa lành vết thương, tha thứ, buông bỏ nỗi đau cũ |
| `53` | `SWO-04` | **IV** | **Four of Swords**<br>*(Bốn Kiếm (Four of Swords))* | Nghỉ ngơi tĩnh dưỡng, tạm ngắt kết nối, phục hồi tâm trí | Trằn trọc, kiệt sức vì không chịu nghỉ, hoặc đã sẵn sàng trở lại |
| `54` | `SWO-05` | **V** | **Five of Swords**<br>*(Năm Kiếm (Five of Swords))* | Chiến thắng bằng mọi giá, tranh cãi thắng-thua, căng thẳng | Hòa giải, buông bỏ hơn thua, chấm dứt tranh cãi vô bổ |
| `55` | `SWO-06` | **VI** | **Six of Swords**<br>*(Sáu Kiếm (Six of Swords))* | Chuyển dịch sang vùng bình yên hơn, vượt qua giai đoạn khó | Hành lý quá khứ cản bước, ngập ngừng chưa dứt khoát rời đi |
| `56` | `SWO-07` | **VII** | **Seven of Swords**<br>*(Bảy Kiếm (Seven of Swords))* | Chiến thuật khéo léo, hành động độc lập, giữ kín kế hoạch | Hội chứng kẻ mạo danh, thẳng thắn đối diện, bỏ lối đi tắt rủi ro |
| `57` | `SWO-08` | **VIII** | **Eight of Swords**<br>*(Tám Kiếm (Eight of Swords))* | Tự giới hạn bản thân, suy diễn tạo áp lực, cảm giác bế tắc | Tháo băng bịt mắt, nhận ra lối thoát, lấy lại quyền chủ động |
| `58` | `SWO-09` | **IX** | **Nine of Swords**<br>*(Chín Kiếm (Nine of Swords))* | Lo âu, suy nghĩ quá mức ban đêm, phóng đại nỗi sợ | Chia sẻ để nhẹ lòng, bình minh sau cơn ác mộng, bớt tự trách |
| `59` | `SWO-10` | **X** | **Ten of Swords**<br>*(Mười Kiếm (Ten of Swords))* | Khép lại hoàn toàn, chạm đáy để bật lên, kết thúc chu kỳ mệt mỏi | Hồi phục, tái tạo sức lực, vượt qua giai đoạn căng thẳng nhất |
| `60` | `SWO-11` | **PAGE** | **Page of Swords**<br>*(Thị Đồng Kiếm (Page of Swords))* | Tư duy nhạy bén, ham học hỏi, quan sát sắc sảo, ý tưởng mới | Nói nhiều làm ít, suy nghĩ phân tán, lời nói thiếu cân nhắc |
| `61` | `SWO-12` | **KNIGHT** | **Knight of Swords**<br>*(Hiệp Sĩ Kiếm (Knight of Swords))* | Hành động quyết liệt, tốc độ cao, thẳng thắn, sắc sảo | Nóng vội thiếu tinh tế, bảo thủ góc nhìn hẹp, hấp tấp |
| `62` | `SWO-13` | **QUEEN** | **Queen of Swords**<br>*(Hoàng Hậu Kiếm (Queen of Swords))* | Trí tuệ độc lập, ranh giới rõ ràng, thẳng thắn, sắc sảo công tâm | Lạnh lùng, khắt khe quá mức, dựng tường rào cảm xúc |
| `63` | `SWO-14` | **KING** | **King of Swords**<br>*(Nhà Vua Kiếm (King of Swords))* | Tư duy chiến lược, chuẩn mực đạo đức, phân tích khách quan | Cứng nhắc lý thuyết, phán xét lạnh lùng, áp đặt lý lẽ |

### 2.5. Bộ Tiền / Xu — Suit of Pentacles (14 Lá: `card_id` 64 – 77 | Nguyên tố Đất — Công Việc, Tài Chính & Thực Tế)

| ID | Mã Lá | Cấp Bậc | Tên Lá Bài (EN — VI) | Từ Khóa Nghĩa Xuôi (Upright) | Từ Khóa Nghĩa Ngược (Reversed) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `64` | `PEN-01` | **I** | **Ace of Pentacles**<br>*(Ách Tiền (Ace of Pentacles))* | Cơ hội thực tế, hạt mầm thịnh vượng, dự án mới vững chắc | Bỏ lỡ cơ hội thực tế, thiếu chuẩn bị nguồn lực, lo thiếu hụt |
| `65` | `PEN-02` | **II** | **Two of Pentacles**<br>*(Hai Tiền (Two of Pentacles))* | Cân bằng nhiều đầu việc, linh hoạt thích ứng, xoay xở khéo léo | Ôm đồm quá sức, mất cân đối thời gian và chi tiêu |
| `66` | `PEN-03` | **III** | **Three of Pentacles**<br>*(Ba Tiền (Three of Pentacles))* | Hợp tác chuyên môn, tay nghề tinh xảo, học hỏi cùng phát triển | Phối hợp rời rạc, làm việc thiếu tiêu chuẩn, cái tôi cá nhân |
| `67` | `PEN-04` | **IV** | **Four of Pentacles**<br>*(Bốn Tiền (Four of Pentacles))* | An toàn tài chính, tiết kiệm, giữ gìn nguồn lực, cẩn trọng | Giữ khư khư vì sợ mất, cứng nhắc, hoặc bắt đầu biết mở lòng chia sẻ |
| `68` | `PEN-05` | **V** | **Five of Pentacles**<br>*(Năm Tiền (Five of Pentacles))* | Khó khăn tạm thời, cảm giác cô độc, áp lực nguồn lực | Vượt qua giai đoạn thiếu hụt, tìm thấy sự hỗ trợ kịp thời |
| `69` | `PEN-06` | **VI** | **Six of Pentacles**<br>*(Sáu Tiền (Six of Pentacles))* | Cho và nhận công bằng, sẻ chia nguồn lực, nâng đỡ đúng lúc | Giúp đỡ có điều kiện, mất cân bằng quyền lực, cho đi quá sức |
| `70` | `PEN-07` | **VII** | **Seven of Pentacles**<br>*(Bảy Tiền (Seven of Pentacles))* | Đầu tư dài hạn, kiên nhẫn chờ quả ngọt, đánh giá lại tiến độ | Nóng ruột vì kết quả chậm, cần điều chỉnh lại hướng đầu tư |
| `71` | `PEN-08` | **VIII** | **Eight of Pentacles**<br>*(Tám Tiền (Eight of Pentacles))* | Chăm chỉ rèn luyện, nâng cao tay nghề, tập trung tỉ mỉ | Cầu toàn thái quá, làm việc máy móc thiếu cảm hứng |
| `72` | `PEN-09` | **IX** | **Nine of Pentacles**<br>*(Chín Tiền (Nine of Pentacles))* | Độc lập tự chủ, thành quả xứng đáng, tận hưởng cuộc sống tinh tế | Làm việc quên nghỉ ngơi, hoặc phụ thuộc vào giá trị bề nổi |
| `73` | `PEN-10` | **X** | **Ten of Pentacles**<br>*(Mười Tiền (Ten of Pentacles))* | Di sản bền vững, sung túc lâu dài, nền tảng gia đình/tổ chức vững | Tư duy ngắn hạn, bất đồng về tài sản hoặc định hướng lâu dài |
| `74` | `PEN-11` | **PAGE** | **Page of Pentacles**<br>*(Thị Đồng Tiền (Page of Pentacles))* | Tinh thần cầu tiến, học kỹ năng thực tế, khởi đầu chăm chỉ | Trì hoãn, thiếu tập trung thực hành, bỏ sót chi tiết thực tế |
| `75` | `PEN-12` | **KNIGHT** | **Knight of Pentacles**<br>*(Hiệp Sĩ Tiền (Knight of Pentacles))* | Đáng tin cậy, tiến từng bước chắc chắn, kỷ luật bền bỉ | Bảo thủ, chậm chạp, ngại đổi mới, cuồng công việc |
| `76` | `PEN-13` | **QUEEN** | **Queen of Pentacles**<br>*(Hoàng Hậu Tiền (Queen of Pentacles))* | Chăm sóc thiết thực, quản lý tài nguyên khéo léo, ấm áp vững chãi | Lo lắng vật chất, chăm lo cho người khác mà quên bản thân |
| `77` | `PEN-14` | **KING** | **King of Pentacles**<br>*(Nhà Vua Tiền (King of Pentacles))* | Làm chủ tài chính và sự nghiệp, lãnh đạo điềm đạm, thịnh vượng | Quá đặt nặng vật chất, cứng nhắc, ngại thay đổi phương pháp |
