# COMPLETE 78-CARD TAROT & 5 CURATED DECKS MASTER CATALOG (v1.2)

**Project:** AITarotReader (Web & Android)  
**Version:** 1.2 (Multi-Deck Architecture & Complete 78-Card Canonical Specification)  
**Last Updated:** October 31, 2026  
**UI Design System:** Sunlit Botanical & Editorial Print (Anti-AI Light Mode `#FAF9F6`)  
**Canonical Seed Data:** `docs/SRS/seed/tarot_78_cards_and_decks_seed.json`

---

## 1. CURATED TAROT DECK EDITIONS (5 COMPLETE 78-CARD DECKS)

The platform supports a full **Multi-Deck Architecture**. Every curated deck edition contains **all 78 canonical cards** (22 Major Arcana + 56 Minor Arcana) mapped to `card_id (0..77)` via the `DECK_CARD_ARTWORKS` table. Users can switch their active deck in **Spread & Reader Configuration (`SCR-M02`)**, the **Android Deck Edition Gallery (`SCR-M08`)**, or the **Web Curated Deck Editions & 78-Card Contact Sheet (`SCR-W06`)**.

| Deck ID | Edition Name (EN / VI) | Artist / Attribution | Art Direction & Medium | Cards | Unlock Tier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ED-01` | **Rider-Waite-Smith 1909 (Centennial Lithograph)**<br>*(Rider-Waite-Smith 1909 (Bản Khắc Đá Nguyên Bản))* | Pamela Colman Smith & A.E. Waite (1909) | Restored 1909 halftone lithograph linework & vintage warm paper tint | **78/78** | Free (Default) |
| `ED-02` | **Sunlit Botanical Herbarium (2025 Archival Edition)**<br>*(Sunlit Botanical Herbarium (Bản Khắc Thực Vật Học Nắng Sớm))* | AITarot Archival Studio (2025) | Fine-line botanical ink engraving & pressed flora specimens on #FAF9F6 alabaster paper | **78/78** | Free (Included) |
| `ED-03` | **Swiss Geometric Bauhaus (Minimalist Grid)**<br>*(Swiss Geometric Bauhaus (Hình Học Tối Giản Thụy Sĩ))* | Zürich Constructivist Press (2024) | Architectural grid coordinates, primary geometric forms & typographic clarity | **78/78** | Free (Included) |
| `ED-04` | **Ancien Tarot de Marseille 1760 (Nicolas Conver Restoration)**<br>*(Tarot de Marseille Cổ Điển 1760 (Phục Chế Khắc Gỗ Nicolas Conver))* | Nicolas Conver (Marseille) (1760) | 18th-century French woodblock print with vermilion, indigo & ochre pigments | **78/78** | Pro or 30 Credits |
| `ED-05` | **Kyoto Washed Sumi-e & Mineral Watercolor**<br>*(Kyoto Thủy Mặc & Màu Nước Khoáng Chất (Sumi-e))* | Kamo River Atelier (2025) | Hand-brushed sumi ink & mineral watercolor washes on handmade mulberry washi paper | **78/78** | Pro or 45 Credits |

### 1.1. Tactile Card Back Linen & Foil Finishes

| Back ID | Finish Name (EN / VI) | Paper Grain & Surface Treatment | Tier |
| :--- | :--- | :--- | :--- |
| `CB-01` | **Natural Flax Linen Weave**<br>*(Vải Lanh Tự Nhiên (Natural Flax))* | Matte Woven Paper (#FAF9F6 / #E2E8F0) | FREE |
| `CB-02` | **Botanical Emerald Pressed Foil**<br>*(Nhũ Ngọc Lục Bảo Thực Vật (#059669))* | Deep Forest Linen with Emerald Botanical Seal | FREE |
| `CB-03` | **Terracotta Clay Wax Seal**<br>*(Dấu Sáp Đất Nung (Terracotta Seal))* | Warm Earth Ochre with Embossed Ring (#D97706) | PRO_OR_CREDITS |
| `CB-04` | **Classic 1909 Tudor Rose & Lily**<br>*(Hoa Hồng Tudor & Hoa Huệ Cổ Điển 1909)* | Archival Monochrome Linework (#0F172A) | FREE |

---

## 2. COMPLETE 78-CARD CANONICAL TAROT INDEX (`card_id` 00 – 77)

Total: **78 Canonical Cards** = **22 Major Arcana (`00..21`)** + **56 Minor Arcana (`22..77` across 4 suits: 14 Wands, 14 Cups, 14 Swords, 14 Pentacles)**.

### 2.1. Major Arcana (22 Cards: `card_id` 00 – 21)

| ID | Code | Numeral | Card Name (EN — VI) | Element / Astrology | Upright Keywords | Reversed Keywords |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `00` | `MAJ-00` | **0** | **The Fool**<br>*(Chàng Khờ (Kẻ Lữ Hành))* | Air / Uranus (Khí / Thiên Vương Tinh) | New beginnings, spontaneity, leap of faith, creative innocence | Recklessness, hesitation, naivety, lack of direction |
| `01` | `MAJ-01` | **I** | **The Magician**<br>*(Nhà Ảo Thuật (Đạo Sĩ))* | Air / Mercury (Khí / Thủy Tinh) | Manifestation, resourcefulness, willpower, skill mastery | Manipulation, untapped talent, scattered energy, illusion |
| `02` | `MAJ-02` | **II** | **The High Priestess**<br>*(Nữ Tư Tế Tối Cao)* | Water / Moon (Nước / Mặt Trăng) | Intuition, sacred mystery, subconscious wisdom, stillness | Ignored intuition, secrets, superficiality, emotional block |
| `03` | `MAJ-03` | **III** | **The Empress**<br>*(Hoàng Hậu)* | Earth / Venus (Đất / Kim Tinh) | Abundance, nurturing, creative fertility, sensory beauty | Creative block, dependence, burnout, neglect of self |
| `04` | `MAJ-04` | **IV** | **The Emperor**<br>*(Hoàng Đế)* | Fire / Aries (Lửa / Bạch Dương) | Structure, authority, strategic foundation, discipline | Rigidity, micromanagement, domination, lack of discipline |
| `05` | `MAJ-05` | **V** | **The Hierophant**<br>*(Giáo Hoàng)* | Earth / Taurus (Đất / Kim Ngưu) | Tradition, mentorship, spiritual system, shared values | Challenging convention, personal freedom, outdated dogma |
| `06` | `MAJ-06` | **VI** | **The Lovers**<br>*(Tình Nhân (Sự Lựa Chọn))* | Air / Gemini (Khí / Song Tử) | Alignment of values, conscious choice, harmony, partnership | Disharmony, misalignment, indecision, conflicted values |
| `07` | `MAJ-07` | **VII** | **The Chariot**<br>*(Cỗ Xe Chiến Thắng)* | Water / Cancer (Nước / Cự Giải) | Directed willpower, momentum, determination, triumph | Loss of control, scattered direction, aggression, stalled drive |
| `08` | `MAJ-08` | **VIII** | **Strength**<br>*(Sức Mạnh Nội Tâm)* | Fire / Leo (Lửa / Sư Tử) | Courage, compassionate mastery, patience, inner resilience | Self-doubt, reactivity, exhaustion, raw insecurity |
| `09` | `MAJ-09` | **IX** | **The Hermit**<br>*(Ẩn Sĩ)* | Earth / Virgo (Đất / Xử Nữ) | Solitude, introspection, inner lantern, focused inquiry | Isolation, withdrawal, over-analysis, loneliness |
| `10` | `MAJ-10` | **X** | **Wheel of Fortune**<br>*(Bánh Xe Số Phận)* | Fire / Jupiter (Lửa / Mộc Tinh) | Turning point, cycles of change, synchronicity, destiny | Resistance to change, temporary setback, breaking a cycle |
| `11` | `MAJ-11` | **XI** | **Justice**<br>*(Công Lý)* | Air / Libra (Khí / Thiên Bình) | Fairness, truth, cause and effect, objective clarity | Imbalance, bias, avoidance of accountability, unfairness |
| `12` | `MAJ-12` | **XII** | **The Hanged Man**<br>*(Người Treo Ngược)* | Water / Neptune (Nước / Hải Vương Tinh) | Perspective shift, intentional pause, surrender, insight | Stalling, needless martyrdom, resistance, indecision |
| `13` | `MAJ-13` | **XIII** | **Death**<br>*(Tử Thần (Sự Chuyển Hóa))* | Water / Scorpio (Nước / Thiên Yết) | Transformation, natural ending, clearing space, renewal | Clinging to the past, fear of change, stagnation |
| `14` | `MAJ-14` | **XIV** | **Temperance**<br>*(Tiết Độ (Sự Cân Bằng))* | Fire / Sagittarius (Lửa / Nhân Mã) | Alchemy, moderation, harmonious synthesis, patience | Imbalance, excess, haste, clashing priorities |
| `15` | `MAJ-15` | **XV** | **The Devil**<br>*(Ác Quỷ (Sự Ràng Buộc))* | Earth / Capricorn (Đất / Ma Kết) | Shadow awareness, attachment, materialism, hidden impulses | Liberation, breaking chains, reclaiming agency, detachment |
| `16` | `MAJ-16` | **XVI** | **The Tower**<br>*(Tòa Tháp Sụp Đổ)* | Fire / Mars (Lửa / Hỏa Tinh) | Sudden awakening, dismantling false structures, breakthrough | Averting disaster, delayed upheaval, fear of necessary change |
| `17` | `MAJ-17` | **XVII** | **The Star**<br>*(Ngôi Sao Hy Vọng)* | Air / Aquarius (Khí / Bảo Bình) | Hope, serene inspiration, spiritual renewal, clarity | Discouragement, creative depletion, disconnection, pessimism |
| `18` | `MAJ-18` | **XVIII** | **The Moon**<br>*(Mặt Trăng)* | Water / Pisces (Nước / Song Ngư) | Dreams, subconscious depths, illusion, navigating uncertainty | Lifting of confusion, revealed truth, overcoming anxiety |
| `19` | `MAJ-19` | **XIX** | **The Sun**<br>*(Mặt Trời)* | Fire / Sun (Lửa / Mặt Trời) | Vitality, joy, radiant success, warmth, illumination | Temporary cloudiness, unrealistic expectations, ego |
| `20` | `MAJ-20` | **XX** | **Judgement**<br>*(Phán Xét (Tiếng Gọi Thức Tỉnh))* | Fire / Pluto (Lửa / Diêm Vương Tinh) | Awakening, higher calling, absolution, decisive evaluation | Self-doubt, harsh inner critic, ignoring the call |
| `21` | `MAJ-21` | **XXI** | **The World**<br>*(Thế Giới (Sự Viên Mãn))* | Earth / Saturn (Đất / Thổ Tinh) | Completion, integration, wholeness, accomplishment | Incompletion, seeking closure, shortcuts, delayed finale |

### 2.2. Suit of Wands (14 Cards: `card_id` 22 – 35 | Element: Fire — Creativity, Initiative & Will)

| ID | Code | Rank | Card Name (EN — VI) | Upright Keywords | Reversed Keywords |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `22` | `WAN-01` | **I** | **Ace of Wands**<br>*(Ách Gậy (Ace of Wands))* | Creative spark, bold initiative, raw inspiration, potential | Delays, lack of motivation, hesitant start, creative block |
| `23` | `WAN-02` | **II** | **Two of Wands**<br>*(Hai Gậy (Two of Wands))* | Future planning, expanding horizons, strategic choice | Fear of the unknown, playing it safe, lack of planning |
| `24` | `WAN-03` | **III** | **Three of Wands**<br>*(Ba Gậy (Three of Wands))* | Momentum, foresight, expansion, ships coming in | Obstacles in expansion, delays, frustration, narrow view |
| `25` | `WAN-04` | **IV** | **Four of Wands**<br>*(Bốn Gậy (Four of Wands))* | Celebration, harmony, milestone achieved, homecoming | Transition tension, lack of stability, postponed celebration |
| `26` | `WAN-05` | **V** | **Five of Wands**<br>*(Năm Gậy (Five of Wands))* | Creative friction, competition, brainstorming debate | Conflict avoidance, resolving tension, internal contradiction |
| `27` | `WAN-06` | **VI** | **Six of Wands**<br>*(Sáu Gậy (Six of Wands))* | Public recognition, victory, confidence, progress | Ego check, private achievement, seeking external validation |
| `28` | `WAN-07` | **VII** | **Seven of Wands**<br>*(Bảy Gậy (Seven of Wands))* | Holding your ground, perseverance, defending convictions | Feeling overwhelmed, giving up ground, defensive exhaustion |
| `29` | `WAN-08` | **VIII** | **Eight of Wands**<br>*(Tám Gậy (Eight of Wands))* | Swift movement, rapid communication, alignment, velocity | Delays, miscommunication, rushing without clarity, resisting flow |
| `30` | `WAN-09` | **IX** | **Nine of Wands**<br>*(Chín Gậy (Nine of Wands))* | Resilience, grit, boundaries, near completion | Exhaustion, paranoia, stubbornness, needing rest |
| `31` | `WAN-10` | **X** | **Ten of Wands**<br>*(Mười Gậy (Ten of Wands))* | Heavy responsibility, culmination of effort, overextension | Delegation, releasing burdens, burnout recovery |
| `32` | `WAN-11` | **PAGE** | **Page of Wands**<br>*(Thị Đồng Gậy (Page of Wands))* | Curious explorer, fresh enthusiasm, discovery, free spirit | Scattered enthusiasm, impatience, half-finished ideas |
| `33` | `WAN-12` | **KNIGHT** | **Knight of Wands**<br>*(Hiệp Sĩ Gậy (Knight of Wands))* | Passionate action, adventure, charisma, fearless pursuit | Haste, impulsiveness, scattered energy, frustration |
| `34` | `WAN-13` | **QUEEN** | **Queen of Wands**<br>*(Hoàng Hậu Gậy (Queen of Wands))* | Magnetic confidence, warmth, creative leadership, authenticity | Self-doubt, jealousy, domineering temper, dimmed confidence |
| `35` | `WAN-14` | **KING** | **King of Wands**<br>*(Nhà Vua Gậy (King of Wands))* | Visionary leadership, entrepreneurship, bold direction, honor | Arrogance, impulsive leadership, unrealistic expectations |

### 2.3. Suit of Cups (14 Cards: `card_id` 36 – 49 | Element: Water — Emotion, Intuition & Connection)

| ID | Code | Rank | Card Name (EN — VI) | Upright Keywords | Reversed Keywords |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `36` | `CUP-01` | **I** | **Ace of Cups**<br>*(Ách Ly (Ace of Cups))* | Emotional renewal, compassion, creative overflow, open heart | Emotional drain, repressed feelings, guarded heart |
| `37` | `CUP-02` | **II** | **Two of Cups**<br>*(Hai Ly (Two of Cups))* | Mutual connection, partnership, kindred spirits, harmony | Miscommunication, imbalance in giving, emotional distance |
| `38` | `CUP-03` | **III** | **Three of Cups**<br>*(Ba Ly (Three of Cups))* | Friendship, community celebration, creative collaboration, joy | Overindulgence, social fatigue, needing quiet solitude |
| `39` | `CUP-04` | **IV** | **Four of Cups**<br>*(Bốn Ly (Four of Cups))* | Contemplation, apathy, re-evaluating options, inward focus | Sudden awareness, seizing a new opportunity, breaking stagnation |
| `40` | `CUP-05` | **V** | **Five of Cups**<br>*(Năm Ly (Five of Cups))* | Grief, disappointment, focusing on loss, emotional processing | Acceptance, moving forward, noticing what remains intact |
| `41` | `CUP-06` | **VI** | **Six of Cups**<br>*(Sáu Ly (Six of Cups))* | Nostalgia, childhood memories, kindness, simple joy | Living in the past, outgrowing old patterns, moving into present |
| `42` | `CUP-07` | **VII** | **Seven of Cups**<br>*(Bảy Ly (Seven of Cups))* | Multiple possibilities, imagination, wishful thinking, choices | Clarity of choice, grounding, cutting through illusion |
| `43` | `CUP-08` | **VIII** | **Eight of Cups**<br>*(Tám Ly (Eight of Cups))* | Walking away, seeking deeper meaning, courageous transition | Fear of leaving, staying in comfort zone, aimless drifting |
| `44` | `CUP-09` | **IX** | **Nine of Cups**<br>*(Chín Ly (Nine of Cups))* | Contentment, wish fulfilled, gratitude, emotional satisfaction | Superficial satisfaction, materialism, unspoken dissatisfaction |
| `45` | `CUP-10` | **X** | **Ten of Cups**<br>*(Mười Ly (Ten of Cups))* | Emotional fulfillment, lasting harmony, shared peace, belonging | Disrupted harmony, domestic tension, misaligned expectations |
| `46` | `CUP-11` | **PAGE** | **Page of Cups**<br>*(Thị Đồng Ly (Page of Cups))* | Gentle curiosity, intuitive message, artistic sensitivity | Emotional vulnerability, escapism, creative insecurity |
| `47` | `CUP-12` | **KNIGHT** | **Knight of Cups**<br>*(Hiệp Sĩ Ly (Knight of Cups))* | Romantic idealism, following the heart, diplomatic grace | Moodiness, unrealistic expectations, disappointment |
| `48` | `CUP-13` | **QUEEN** | **Queen of Cups**<br>*(Hoàng Hậu Ly (Queen of Cups))* | Deep empathy, intuitive wisdom, emotional sanctuary, care | Emotional overwhelm, co-dependency, neglecting boundaries |
| `49` | `CUP-14` | **KING** | **King of Cups**<br>*(Nhà Vua Ly (King of Cups))* | Emotional maturity, calm diplomacy, compassionate composure | Emotional suppression, quiet manipulation, inner turbulence |

### 2.4. Suit of Swords (14 Cards: `card_id` 50 – 63 | Element: Air — Intellect, Truth & Decision)

| ID | Code | Rank | Card Name (EN — VI) | Upright Keywords | Reversed Keywords |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `50` | `SWO-01` | **I** | **Ace of Swords**<br>*(Ách Kiếm (Ace of Swords))* | Mental breakthrough, sharp clarity, truth, decisive cut | Confusion, clouded judgment, harsh words, mental fog |
| `51` | `SWO-02` | **II** | **Two of Swords**<br>*(Hai Kiếm (Two of Swords))* | Crossroads, stalemate, weighing options, guarded neutrality | Information overload, indecision, truth finally surfacing |
| `52` | `SWO-03` | **III** | **Three of Swords**<br>*(Ba Kiếm (Three of Swords))* | Heartbreak, painful truth, emotional release, clarity through sorrow | Healing, forgiveness, releasing old pain, recovery |
| `53` | `SWO-04` | **IV** | **Four of Swords**<br>*(Bốn Kiếm (Four of Swords))* | Rest, mental sanctuary, recuperation, quiet contemplation | Restlessness, burnout, returning to action after pause |
| `54` | `SWO-05` | **V** | **Five of Swords**<br>*(Năm Kiếm (Five of Swords))* | Hollow victory, ego conflict, tension, choosing your battles | Reconciliation, moving past resentment, ending a pointless feud |
| `55` | `SWO-06` | **VI** | **Six of Swords**<br>*(Sáu Kiếm (Six of Swords))* | Transition, moving toward calmer waters, gradual healing | Baggage slowing transition, reluctance to move on |
| `56` | `SWO-07` | **VII** | **Seven of Swords**<br>*(Bảy Kiếm (Seven of Swords))* | Strategy, independent tact, discretion, unconventional path | Imposter syndrome, coming clean, rethinking a risky shortcut |
| `57` | `SWO-08` | **VIII** | **Eight of Swords**<br>*(Tám Kiếm (Eight of Swords))* | Self-imposed restriction, overthinking, feeling trapped | Removing the blindfold, new perspective, reclaiming agency |
| `58` | `SWO-09` | **IX** | **Nine of Swords**<br>*(Chín Kiếm (Nine of Swords))* | Anxiety, late-night worry, catastrophizing, mental stress | Reaching out for support, dawn breaking, releasing guilt |
| `59` | `SWO-10` | **X** | **Ten of Swords**<br>*(Mười Kiếm (Ten of Swords))* | Final ending, rock bottom, mental exhaustion, dawn ahead | Recovery, regeneration, surviving the worst, fresh horizon |
| `60` | `SWO-11` | **PAGE** | **Page of Swords**<br>*(Thị Đồng Kiếm (Page of Swords))* | Intellectual curiosity, vigilance, agile mind, new ideas | Gossip, all talk no action,scattered thoughts, cynicism |
| `61` | `SWO-12` | **KNIGHT** | **Knight of Swords**<br>*(Hiệp Sĩ Kiếm (Knight of Swords))* | Focused ambition, fast execution, directness, intellectual drive | Tactlessness, tunnel vision, haste, mental restlessness |
| `62` | `SWO-13` | **QUEEN** | **Queen of Swords**<br>*(Hoàng Hậu Kiếm (Queen of Swords))* | Clear boundaries, independent intellect, candid truth, discernment | Coldness, overly critical, bitterness, isolation |
| `63` | `SWO-14` | **KING** | **King of Swords**<br>*(Nhà Vua Kiếm (King of Swords))* | Intellectual authority, ethical clarity, strategic logic, truth | Mental rigidity, harsh judgment, misuse of intellect |

### 2.5. Suit of Pentacles (14 Cards: `card_id` 64 – 77 | Element: Earth — Craft, Resources & Material Reality)

| ID | Code | Rank | Card Name (EN — VI) | Upright Keywords | Reversed Keywords |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `64` | `PEN-01` | **I** | **Ace of Pentacles**<br>*(Ách Tiền (Ace of Pentacles))* | Tangible opportunity, prosperity seed, grounding, new venture | Missed chance, poor financial planning, scarcity mindset |
| `65` | `PEN-02` | **II** | **Two of Pentacles**<br>*(Hai Tiền (Two of Pentacles))* | Juggling priorities, adaptability, resource flow, balance | Overcommitting, disorganized finances, dropping the ball |
| `66` | `PEN-03` | **III** | **Three of Pentacles**<br>*(Ba Tiền (Three of Pentacles))* | Craftsmanship, teamwork, mastery, constructive feedback | Lack of coordination, working in silos, cutting corners |
| `67` | `PEN-04` | **IV** | **Four of Pentacles**<br>*(Bốn Tiền (Four of Pentacles))* | Security, conservation, financial stability, boundaries | Greed, fear of loss, rigidity, or healthy generosity |
| `68` | `PEN-05` | **V** | **Five of Pentacles**<br>*(Năm Tiền (Five of Pentacles))* | Temporary hardship, feeling left out, resource strain | Recovery, finding help, welcoming support, renewed hope |
| `69` | `PEN-06` | **VI** | **Six of Pentacles**<br>*(Sáu Tiền (Six of Pentacles))* | Generosity, fair exchange, mentorship, patronage, reciprocity | Strings attached, unequal power dynamic, debt or over-giving |
| `70` | `PEN-07` | **VII** | **Seven of Pentacles**<br>*(Bảy Tiền (Seven of Pentacles))* | Long-term investment, patience, assessing harvest, perseverance | Impatience with results, wasted effort, pivoting strategy |
| `71` | `PEN-08` | **VIII** | **Eight of Pentacles**<br>*(Tám Tiền (Eight of Pentacles))* | Diligence, skill refinement, deep focus, artisanal dedication | Perfectionism, repetitive drudgery, lack of inspiration |
| `72` | `PEN-09` | **IX** | **Nine of Pentacles**<br>*(Chín Tiền (Nine of Pentacles))* | Self-sufficiency, refined abundance, independence, earned reward | Overworking for status, financial dependence, hollow luxury |
| `73` | `PEN-10` | **X** | **Ten of Pentacles**<br>*(Mười Tiền (Ten of Pentacles))* | Legacy, long-term wealth, generational stability, solid foundation | Short-term thinking, dispute over resources, unstable foundation |
| `74` | `PEN-11` | **PAGE** | **Page of Pentacles**<br>*(Thị Đồng Tiền (Page of Pentacles))* | Practical student, new skill, grounded ambition, diligence | Procrastination, lack of follow-through, missed practical detail |
| `75` | `PEN-12` | **KNIGHT** | **Knight of Pentacles**<br>*(Hiệp Sĩ Tiền (Knight of Pentacles))* | Reliability, methodical progress, unwavering discipline, routine | Stagnation, stubbornness, overly conservative, workaholism |
| `76` | `PEN-13` | **QUEEN** | **Queen of Pentacles**<br>*(Hoàng Hậu Tiền (Queen of Pentacles))* | Practical care, grounded abundance, resourceful stewardship | Imbalance between work and self-care, financial anxiety |
| `77` | `PEN-14` | **KING** | **King of Pentacles**<br>*(Nhà Vua Tiền (King of Pentacles))* | Mastery of material realm, abundant provider, steadfast leadership | Material obsession, stubbornness, resistance to innovation |
