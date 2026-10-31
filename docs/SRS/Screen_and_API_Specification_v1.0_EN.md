# Master Screen List & Spring Boot REST API Specification: AITarotReader

**Version:** 2.2 (Sunlit Botanical & Editorial Print — Multi-Deck 5 Editions & Complete 78-Card Contact Sheet)
**Stitch Project ID:** `9263024000499436445` (`AITarotReader — Web & Android UI (Light Editorial)`)
**Stitch Design System ID:** `assets/9053777410806225859` (`Sunlit Botanical & Editorial Print (Anti-AI Light)`)
**Design Language:** Bright, airy daylight editorial palette (`#FAF9F6` Warm Alabaster base, `#FFFFFF` Pure White structural containers, `1px solid #E2E8F0` Slate-200 borders, `#0F172A` Deep Ink typography, `#059669` Botanical Emerald Green accent, zero neon glows, zero floating card fatigue)
**Target Platforms:** Android Mobile (`MOBILE`) & Web Application (`DESKTOP`)
**Backend:** Spring Boot 3.x REST API (Java 21, PostgreSQL, Redis, Spring AI SSE)

---

## PART 1: MASTER SCREEN LIST (14 SCREENS MAPPED 1:1 TO STITCH & SRS)

### 1.1 Android Mobile Screens (`deviceType: MOBILE` — 8 Screens)

| Screen ID | Stitch Screen ID | Screen Title (Stitch) | Route / Path | SRS FR Mapping | Core UI Layout (Anti-AI Light Mode Border-First) | Mapped REST APIs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCR-M01`** | `ec3d9735211a410d8a23782765d20007` | **Android — Daily Index & Sanctuary** | `/app/home` | FR-1.2, FR-4.1, FR-6.1 | Sunlit editorial layout (`#FAF9F6` / `#FFFFFF`). Top `1px` bordered bar with Zodiac/Life Path, `EN/VI` toggle, and warm amber credit pill (`45 CR`). Split specimen block for Today's Drawn Card (`XIX The Sun`) with botanical line art, 3 uppercase tags, and bordered action rows (`Virtual Deck` \| `Manual Input`). | `GET /api/v1/profile/mystic`<br>`POST /api/v1/readings/daily`<br>`GET /api/v1/wallet/balance` |
| **`SCR-M02`** | `b924e509e4ce4fe39a494797eb7b82b7` | **Android — Spread & Reader Configuration** | `/app/readings/new` | FR-2.1, FR-2.4, FR-3.1 | 4-step daylight form with `1px solid #E2E8F0` hairlines: (01) Spread Architecture (*1, 3, 5, 10 Cards*), (02) Tarot Deck Edition Selector (*Sunlit Botanical, Rider-Waite 1909, Swiss Geometric* + `Browse All 5 Decks →`), (03) Reader Analytical Voice (*Classic Mystic, Idea Spark, Gentle Friend*), (04) Intention & Context (`<= 500 chars`). | `GET /api/v1/tarot/spreads`<br>`GET /api/v1/tarot/decks`<br>`GET /api/v1/wallet/balance` |
| **`SCR-M03`** | `67d3c8928ee649048953fb5bd25880ad` | **Android — Tactile Deck Draw** | `/app/readings/draw` | FR-2.2 | Bright linen drafting table (`#FAF9F6`). Top 3-column bordered slot bar (`01 SITUATION`, `02 ACTION [SELECTING]`, `03 OUTCOME`). Horizontal fan of crisp white-and-sage botanical tarot card backs (`1px` border). Card #27 elevated `16px` with `#059669` emerald border. | `POST /api/v1/readings/sessions` |
| **`SCR-M04`** | `551f8de635c840ee92bf2c98e27d37bf` | **Android — Physical Deck Index Picker** | `/app/readings/manual` | FR-2.3 | Daylight reference grid of all 78 cards for logging real-world physical draws (No camera). Pinned 3-slot assignment bar, white search input, suit filter pills (`ALL 78`, `MAJOR 22`, `WANDS 14`, `CUPS 14`, `SWORDS 14`, `PENTACLES 14`), 3-column botanical card grid, and docked bottom bar with `Upright / Reversed` switch. | `GET /api/v1/tarot/cards`<br>`POST /api/v1/readings/sessions` |
| **`SCR-M05`** | `a965422ea71c4ce88810ef5a90351fa6` | **Android — Synthesis Report & Clarifier** | `/app/readings/{id}` | FR-3.2, FR-3.3 | High-contrast magazine article view (`#FFFFFF`). Pinned 4-column summary strip of drawn cards + `+1 Clarifier`. Continuous `1px #E2E8F0` divided sections: Elemental Balance Bar, Position Analysis, Core Synthesis quote block, Actionable Checklist. Docked bottom bar for `Follow-up Q&A (2/3)` & `Draw Clarifier`. | `GET /api/v1/readings/sessions/{id}`<br>`POST /api/v1/readings/sessions/{id}/clarifier`<br>`POST /api/v1/readings/sessions/{id}/chat` |
| **`SCR-M06`** | `beb4caef0fd545de83e6597801f509b1` | **Android — Editorial Print & Share Studio** | `/app/readings/{id}/share` | FR-4.2, FR-5.1 | Sunlit print studio (`#F1F5F9` stage, `#FFFFFF` controls). Segmented header (`Share Print Studio` \| `Journal Entry`). Center `9:16` Swiss-editorial poster preview on warm archival paper stock (`#FAF9F6`). Aspect ratio switch (`9:16` / `1:1`), paper theme selector, and reflection note input. | `POST /api/v1/readings/sessions/{id}/share-card`<br>`PUT /api/v1/readings/sessions/{id}/journal` |
| **`SCR-M07`** | `9b6c9a5dd970419d896c30ca6d9e99f8` | **Android — Credit Ledger & Pro Plan** | `/app/billing` | FR-6.1, FR-6.2, FR-6.3 | Clean daylight ledger interface (`#FFFFFF`). Top balance summary row (`45 Credits` + `+5 CR Daily Reward`). Emerald-bordered `Archival Pro Membership ($6.99/mo)` checklist card, 3-row table of Pay-as-you-go Credit Packs (`50, 170, 480 CR`), and 3-column transparent cost schedule. | `GET /api/v1/wallet/balance`<br>`POST /api/v1/wallet/checkout`<br>`GET /api/v1/wallet/transactions` |
| **`SCR-M08`** | `942adfdd75c84337a53d61a78d8e54a6` | **Android — Deck Edition Gallery & Art Preview** | `/app/decks` | FR-2.4 | Curated 5-Deck Gallery (`78 Cards / Deck Verified`): Hero showcase for active `ED-01 Rider-Waite-Smith 1909` with 3 sample plates + linen card back, ledger rows for 4 alternate decks (*Sunlit Botanical, Swiss Geometric, Marseille 1760, Kyoto Sumi-e*) with Set Active / Unlock buttons, and 4 tactile Card Back Linen & Foil swatches. | `GET /api/v1/tarot/decks`<br>`POST /api/v1/tarot/decks/{id}/unlock`<br>`PATCH /api/v1/profile/mystic/preferred-deck` |

---

### 1.2 Web Desktop Screens (`deviceType: DESKTOP` — 6 Screens)

| Screen ID | Stitch Screen ID | Screen Title (Stitch) | Route / Path | SRS FR Mapping | Core UI Layout (Anti-AI Light Mode Border-First) | Mapped REST APIs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SCR-W01`** | `355fb17c4dca42f2b52ebcc7748c6a9d` | **Web — Editorial Portal & Daily Index** | `/` | FR-1.1, FR-1.2, FR-4.1 | Swiss-grid daylight portal (`1280x1024`) with `1px solid #E2E8F0` dividers. 2-column Hero (Left `#FAF9F6`: Editorial headline & CTAs; Right `#FFFFFF`: Today's Drawn Specimen `XIX The Sun` with elemental data table), and bottom 4-column spread specification grid. | `POST /api/v1/auth/google`<br>`POST /api/v1/readings/daily`<br>`GET /api/v1/tarot/spreads` |
| **`SCR-W02`** | `6c7e5dfbb8f6408eb6b115ed3ddd2936` | **Web — Split-Pane Reading Workbench** | `/workbench/{id}` | FR-2.2, FR-3.2, FR-3.3 | Bright 3-pane workbench separated by vertical `1px solid #E2E8F0` borders: Left Sidebar (`240px #F8FAFC` inquiry, persona radio & history), Center Linen Spread Table (`520px #FAF9F6` 5-card cross layout + Clarifier slot), Right Editorial Stream (`520px #FFFFFF` 4-part SSE synthesis + inline Q&A dock). | `POST /api/v1/readings/sessions`<br>`POST /api/v1/readings/sessions/{id}/clarifier`<br>`POST /api/v1/readings/sessions/{id}/chat` |
| **`SCR-W03`** | `0bb9c7fb18304eb0a1356cadb8b88aa5` | **Web — 78-Card Reference & Manual Input** | `/catalog-picker` | FR-2.3 | Daylight reference catalog & physical spread builder. Top pinned 3-slot assignment tray (`1px` bordered slots). Filter toolbar with search, Suit tabs, and orientation toggle. 5-column white botanical card grid + right-hand `380px` specification drawer showing bilingual EN/VI meanings. | `GET /api/v1/tarot/cards`<br>`POST /api/v1/readings/sessions` |
| **`SCR-W04`** | `91a5851e70e04282aadb656ed902745f` | **Web — Archive Journal & Pattern Ledger** | `/journal` | FR-4.2 | Bright analytics & archive ledger. Top 3-column bordered KPI strip (`Stalker Card: IX The Hermit`, `30-Day Elemental Synthesis Bar`, `Seeker Profile Context`). Master-detail split view: Left `480px` chronological reading log; Right `800px` session record & markdown reflection editor. | `GET /api/v1/journal/entries`<br>`GET /api/v1/journal/analytics`<br>`PUT /api/v1/readings/sessions/{id}/journal` |
| **`SCR-W05`** | `07bc70ee9b0f4c09a3c42c80c8860540` | **Web — Print Export Studio & Billing** | `/studio-billing` | FR-5.1, FR-6.1, FR-6.3 | Two-zone daylight workspace: Left/Center (`840px`) is the Share Print Studio showing side-by-side `9:16` and `1:1` archival cream Tarot posters; Right (`440px #FFFFFF`) is the Hybrid Credit Ledger & Instant Checkout panel supporting Stripe & Vietnam VietQR (`PayOS`). | `POST /api/v1/readings/sessions/{id}/share-card`<br>`POST /api/v1/wallet/checkout`<br>`GET /api/v1/wallet/transactions` |
| **`SCR-W06`** | `f70f51f911c64ceda93a25a5e2c53e37` | **Web — Curated Deck Editions & 78-Card Contact Sheet** | `/decks-archive` | FR-2.4 | 3-Zone Desktop Archival Workbench: Left Navigation Rail (`240px`), Center-Left 5 Curated Deck Editions Selector (`380px`, `ED-01..ED-05`), and Right Main Canvas featuring a **5-Deck Side-by-Side Plate Comparison Strip (`XVII • The Star` across all 5 art styles)** above a **6-column Complete 78-Card Archival Contact Sheet (`22 Major + 56 Minor = 78 Cards`)**. | `GET /api/v1/tarot/decks`<br>`GET /api/v1/tarot/decks/{slug}/cards`<br>`PATCH /api/v1/profile/mystic/preferred-deck` |

---

## PART 2: MASTER SPRING BOOT REST API SPECIFICATION (21 ENDPOINTS)

All endpoints follow RESTful conventions, return standard JSON (or `text/event-stream` for SSE), and enforce JWT Bearer authentication (`Authorization: Bearer <token>`) except public catalog/auth routes.

### 2.1 Authentication & Mystic Profile (`/api/v1/auth`, `/api/v1/profile`)

| API ID | Method & Path | Auth | Request Payload / Params | Response Structure | Mapped Screens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-01`** | `POST /api/v1/auth/google` | Public | `{ "idToken": "string", "locale": "vi\|en" }` | `{ "accessToken": "jwt", "refreshToken": "jwt", "user": {...} }` | `SCR-W01`, `SCR-M01` |
| **`API-02`** | `GET /api/v1/profile/mystic` | User JWT | — | `{ "displayName": "Aria", "locale": "en", "birthDate": "1998-04-12", "zodiacSign": "ARIES", "lifePathNumber": 7, "focusAreas": ["IDEAS", "CAREER"], "allowAiContext": true }` | `SCR-M01`, `SCR-W01`, `SCR-W04` |
| **`API-03`** | `PUT /api/v1/profile/mystic` | User JWT | `{ "displayName": "string", "locale": "vi\|en", "birthDate": "YYYY-MM-DD", "focusAreas": [...], "allowAiContext": true }` | Updated `MysticProfileDto` | `SCR-M01`, `SCR-W04` |

### 2.2 Tarot 78-Card Catalog, 5 Deck Editions & Spreads (`/api/v1/tarot`)

| API ID | Method & Path | Auth | Request Payload / Params | Response Structure | Mapped Screens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-04`** | `GET /api/v1/tarot/cards` | Public (Cached) | `?lang=vi\|en&deck=sunlit-botanical-herbarium&suit=MAJOR\|WANDS\|CUPS\|SWORDS\|PENTACLES&q=search` | Complete list of **78 canonical cards** (`00..77`: 22 Major + 56 Minor) with deck-specific `imageUrl` | `SCR-M04`, `SCR-W03`, `SCR-W06` |
| **`API-05`** | `GET /api/v1/tarot/spreads` | Public (Cached) | `?lang=vi\|en` | `[ { "id": 2, "code": "spread_3_action", "name": "Situation - Action - Outcome", "cardCount": 3, "crystalCost": 10, "positions": [...] } ]` | `SCR-M02`, `SCR-W01`, `SCR-W02` |
| **`API-05A`** | `GET /api/v1/tarot/decks` | Public / User JWT | `?lang=vi\|en` | List of **5 Curated Tarot Decks (`ED-01..ED-05`)** + **4 Tactile Card Backs (`CB-01..CB-04`)**, `unlocked` status, `isDefault`, `cardCount: 78`, and 3 preview plates | `SCR-M02`, `SCR-M08`, `SCR-W06` |
| **`API-05B`** | `GET /api/v1/tarot/decks/{slug}/cards` | Public (Cached) | Path `slug`, `?compareCardId=17` | Returns all **78 card plates** for deck `slug` plus side-by-side comparison plates across all 5 decks | `SCR-M08`, `SCR-W06` |
| **`API-05C`** | `PATCH /api/v1/profile/mystic/preferred-deck` | User JWT | `{ "deckId": "ED-02", "cardBackId": "CB-02" }` | `{ "activeDeckId": "ED-02", "activeCardBackId": "CB-02", "updatedAt": "..." }` | `SCR-M02`, `SCR-M08`, `SCR-W06` |

### 2.3 Core Reading Engine & SSE AI Synthesis (`/api/v1/readings`)

| API ID | Method & Path | Auth | Request Payload / Params | Response Structure | Mapped Screens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-06`** | `POST /api/v1/readings/daily` | Guest / User | `{ "locale": "vi\|en", "clientSeed": "string" }` | `{ "date": "2026-10-31", "card": {...}, "isReversed": false, "keywords": [...], "dailyQuote": "...", "microIdea": "..." }` | `SCR-M01`, `SCR-W01` |
| **`API-07`** | `POST /api/v1/readings/sessions` | User JWT | `{ "spreadId": 2, "inputMode": "VIRTUAL\|MANUAL", "personaCode": "IDEA_SPARK", "question": "...", "drawnCards": [ { "positionIndex": 1, "cardId": 1, "isReversed": false } ] }` | **SSE Stream (`text/event-stream`)** emitting structured events: `energy_overview`, `position_analysis`, `core_synthesis`, `actionable_steps`, `done` | `SCR-M03`, `SCR-M04`, `SCR-M05`, `SCR-W02`, `SCR-W03` |
| **`API-08`** | `GET /api/v1/readings/sessions/{id}` | User JWT | Path param `id (UUID)` | Full `ReadingSessionDetailDto` (cards, synthesis, follow-up messages, journal note) | `SCR-M05`, `SCR-W02`, `SCR-W04` |
| **`API-09`** | `POST /api/v1/readings/sessions/{id}/clarifier` | User JWT | `{ "targetPositionIndex": 2, "inputMode": "VIRTUAL\|MANUAL", "cardId": 64, "isReversed": false }` | **SSE Stream (`text/event-stream`)** streaming the Clarifier synthesis & updated session state | `SCR-M05`, `SCR-W02` |
| **`API-10`** | `POST /api/v1/readings/sessions/{id}/chat` | User JWT | `{ "question": "What should my first concrete step be this week?" }` | **SSE Stream (`text/event-stream`)** streaming the AI Reader's contextual answer (`followUpCount <= 3`) | `SCR-M05`, `SCR-W02` |

### 2.4 Tarot Journal, Analytics & Shareable Card Studio (`/api/v1/journal`, `/share-card`)

| API ID | Method & Path | Auth | Request Payload / Params | Response Structure | Mapped Screens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-11`** | `PUT /api/v1/readings/sessions/{id}/journal` | User JWT | `{ "reflectionNote": "string", "moodTags": ["INSPIRED", "FOCUSED"] }` | `{ "sessionId": "uuid", "reflectionNote": "...", "moodTags": [...], "updatedAt": "..." }` | `SCR-M05`, `SCR-M06`, `SCR-W04` |
| **`API-12`** | `GET /api/v1/journal/entries` | User JWT | `?page=0&size=20&tag=INSPIRED` | Paginated list of `JournalEntrySummaryDto` | `SCR-M06`, `SCR-W04` |
| **`API-13`** | `GET /api/v1/journal/analytics` | User JWT | `?days=30` | `{ "totalReadings": 18, "stalkerCard": { "cardId": 9, "count": 4 }, "elementalRatio": { "FIRE": 40, "AIR": 30, "WATER": 20, "EARTH": 10 } }` | `SCR-M06`, `SCR-W04` |
| **`API-14`** | `POST /api/v1/readings/sessions/{id}/share-card` | User JWT | `{ "aspectRatio": "9:16\|1:1", "theme": "ARCHIVAL_CREAM\|BOTANICAL_SAGE", "includeQuestion": true }` | `{ "shareUrl": "https://aitarot.app/s/xyz", "imageUrl": "https://cdn.../card.png", "summaryQuote": "..." }` | `SCR-M06`, `SCR-W05` |

### 2.5 Crystal Wallet & Hybrid Billing (`/api/v1/wallet`)

| API ID | Method & Path | Auth | Request Payload / Params | Response Structure | Mapped Screens |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`API-15`** | `GET /api/v1/wallet/balance` | User JWT | — | `{ "crystalBalance": 45, "tier": "FREE\|PRO", "proExpiresAt": null, "dailyFreeAvailable": true }` | `SCR-M01`, `SCR-M02`, `SCR-M07`, `SCR-W01`, `SCR-W05` |
| **`API-16`** | `POST /api/v1/wallet/daily-reward` | User JWT | — | `{ "credited": 5, "newBalance": 50 }` | `SCR-M07`, `SCR-W05` |
| **`API-17`** | `POST /api/v1/wallet/checkout` | User JWT | `{ "productCode": "PACK_170\|PRO_MONTHLY\|PRO_YEARLY", "provider": "GOOGLE_PLAY\|STRIPE\|PAYOS_QR" }` | `{ "checkoutUrl": "...", "qrData": "...", "orderId": "uuid" }` | `SCR-M07`, `SCR-W05` |
| **`API-18`** | `GET /api/v1/wallet/transactions` | User JWT | `?page=0&size=20` | Paginated list of immutable `CrystalTransactionDto` (`amount`, `reasonCode`, `createdAt`) | `SCR-M07`, `SCR-W05` |
