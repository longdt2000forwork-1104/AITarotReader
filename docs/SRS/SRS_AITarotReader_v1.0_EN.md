# Software Requirements Specification (SRS) & Market Feasibility Study: AITarotReader

**Version:** 1.1 (Updated with Full Architecture & UML Diagrams)
**Target Platforms:** Web Application & Android Mobile App
**Supported Languages:** English (EN) & Vietnamese (VI)
**Approved Technology Stack (Option 1):**
- **Frontend:** Next.js (App Router, TypeScript, TailwindCSS, Framer Motion) + Capacitor (Android Native Packaging `.apk`/`.aab`)
- **Backend:** Spring Boot 3.x REST API (Java 21, Spring Security JWT/OAuth2, Spring AI / SSE Streaming, PostgreSQL, Redis)

---

## PART A: MARKET RESEARCH & FEASIBILITY ANALYSIS

### 1. Competitive Landscape Analysis

The global digital mysticism and Tarot app market is shifting rapidly from static dictionary apps toward personalized, AI-driven interactive experiences. Below is a direct comparison between **AITarotReader** and the top 4 competitors in the market:

| Criteria | Labyrinthos | Tarotap | Mystic Mondays | Co-Star | AITarotReader (Your App) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Positioning** | Tarot education & traditional reference dictionary | Conversational AI tarot reading | Daily habit tracking & modern visual art | Astrology charts & social connectivity | **Mystical Tarot Master + Daily Companion for ideas, inspiration & guidance** |
| **AI Depth** | Moderate (AI acts as an optional helper to static database) | High (Conversational chat, multiple personas) | Low (Pre-written static interpretations) | High (Generates sharp, tailored daily transit updates) | **High & Structured (Holistic card synthesis + Capped follow-up Q&A + Clarifier cards)** |
| **Physical Deck Input** | Yes (Manual input for study logging) | Limited | No | Does not support 78-card Tarot | **Yes (Fast Manual Card Picker for AI interpretation of physical spreads)** |
| **Profile & Journal** | Yes (Focused on study notes) | Basic chat history | Short reflection notes | Natal chart profile | **Mystic Profile + Smart Tarot Journal (AI retains context across sessions)** |
| **Social Sharing (Viral Loop)** | Weak | Moderate | Good (Vibrant deck art) | **Very Strong** (Viral cards & memes) | **Strong (Auto-generates high-aesthetic Shareable Cards for readings & Daily Draw)** |
| **Bilingual EN/VI Support** | English only | Machine-translated VI (unnatural phrasing) | English only | English only | **Native Bilingual English & Vietnamese (Authentic mystical tone in both languages)** |
| **Monetization Model** | Physical merch + AI reading microtransactions | Freemium + Credit packs / Subscription | Paid app / Digital deck IAP | Freemium + Paid detailed reports | **Hybrid: Freemium + Crystal/Energy Wallet (Pay-as-you-go) + Pro Subscription** |

### 2. Unique Selling Proposition (USP)

1. **Solving the "Static Text" vs. "Soulless Chatbot" Dilemma:**
   - Traditional apps (*Labyrinthos, Mystic Mondays*) display isolated card meanings, leaving users to figure out how Card 1 (Past) connects to Card 3 (Future).
   - Generic AI chatbots (*ChatGPT*) provide fluent text but lack the **sacred ritual of shuffling/drawing**, structured **Clarifier Card mechanics**, and visual **Tarot Journaling**.
   - **AITarotReader** blends an immersive card-drawing ritual with holistic AI synthesis, allowing 1–3 structured follow-up questions and Clarifier Card draws just like a real Tarot Master session.
2. **Bridging Physical Decks with Digital AI Wisdom (Manual Physical Spread Input):**
   - Many Tarot believers own physical Rider-Waite or indie decks and love the tactile feel of shuffling real cards, but struggle to synthesize complex spreads (e.g., Creative Idea Spread or Celtic Cross). Our **Manual Card Picker** lets users quickly input the exact cards and orientations (Upright/Reversed) they drew in real life to receive deep AI synthesis and log them into their journal.
3. **Bicultural & Hybrid Monetization Advantage:**
   - Combines global English reach with deeply authentic Vietnamese mystical phrasing, backed by a flexible Hybrid Monetization model (one-off Crystal packs for casual seekers + Pro Subscription for daily enthusiasts).

---

### 3. Approved Technical Architecture: Next.js + Capacitor (Android) & Spring Boot REST API

Based on our evaluation, **Option 1: Next.js (Web) + Capacitor (Android Native Shell)** paired with **Spring Boot 3.x REST API** is selected as the official architecture.

| Layer | Selected Technology | Rationale & Role |
| :--- | :--- | :--- |
| **Web & Mobile UI** | **Next.js (App Router) + TypeScript + TailwindCSS + Framer Motion** | Single unified codebase for both Web and Android; smooth 60fps 2D/3D card shuffle and flip animations; superior SEO and dynamic OG/Shareable Card image generation. |
| **Android Packaging** | **Capacitor 6+** | Wraps the Next.js application into a native Android package (`.apk`/`.aab`) with access to Native APIs: Haptic Feedback (subtle vibration during shuffling/drawing), Push Notifications (Daily Card reminders), and Native Share Sheet / Google Play Billing. |
| **Backend API** | **Spring Boot 3.x (Java 21)** | Enterprise-grade REST API, stateless JWT/OAuth2 security, high concurrency via Virtual Threads, and Server-Sent Events (SSE) for real-time AI reading streaming. |
| **Database & Cache** | **PostgreSQL + Redis + Flyway** | PostgreSQL stores users, mystic profiles, reading history, and immutable Crystal ledger transactions (ACID). Redis caches the 78-card bilingual catalog and enforces AI rate limiting. |
| **AI Engine** | **Spring AI / Gemini 2.5 Flash API** | Fast Time-To-First-Byte (TTFB < 2s), cost-effective token usage, and exceptional fluency in both English and Vietnamese mystical terminology. |

---

## PART B: SOFTWARE REQUIREMENTS SPECIFICATION (SRS - IEEE 830 / ISO 29148)

### 1. Introduction
- **1.1 Purpose:** This document defines the complete business, functional, non-functional, and architectural requirements for the **AITarotReader** application on Web and Android platforms.
- **1.2 Product Scope:**
  - Full 78-card Tarot deck catalog (Rider-Waite-Smith standard) in English and Vietnamese.
  - Two reading input modes: Virtual Deck Ritual (interactive shuffle/draw) and Manual Physical Deck Input (selecting cards drawn offline).
  - Context-aware AI Tarot Master engine providing holistic spread synthesis, capped follow-up Q&A, and Clarifier card draws.
  - Daily Companion features: Daily Card draw, Mystic Profile (Zodiac & Life Path Number), Tarot Journal with mood/reflection tracking, and Shareable Social Cards.
  - Hybrid monetization system: Crystal Wallet (Pay-as-you-go) and Pro Subscription tier.
- **1.3 Out of Scope:**
  - Camera-based card scanning / Computer Vision OCR is explicitly excluded.
  - Clinical mental health therapy or crisis counseling is excluded.
  - Live marketplace or video calls with human tarot readers are excluded.

---

### 2. User Classes and System Use Case Diagram

| User Class | Description & Core Privileges |
| :--- | :--- |
| **Guest** | Try 1 Daily Card draw on Web, browse the 78-card library, and view public Shareable Card links. |
| **Free Member** | Registered user; receives daily free allowance (1 Daily Card + 1 basic 3-card reading/day); stores up to 10 recent Tarot Journal entries; exports Shareable Cards with watermark. |
| **Crystal Buyer** | Purchases Crystal packs (Pay-as-you-go) to unlock advanced spreads (5–10 cards), ask follow-up questions, or draw Clarifier cards without a recurring subscription. |
| **Pro Subscriber** | Unlimited Tarot Journal storage; daily Crystal stipend; access to all AI Reader Personas, advanced spreads, monthly AI pattern reflections, and watermark-free Shareable Cards. |
| **System Admin** | Manages the 78-card bilingual database, spread templates, AI Persona system prompts, pricing rules, and token usage analytics. |

#### Diagram 1: System Use Case Diagram

---

### 3. Functional Requirements

#### Module 1: Authentication & Mystic Profile
- **FR-1.1 (Authentication):** Support Google OAuth2 and Email/OTP authentication via Spring Security + JWT (Access Token & Refresh Token).
- **FR-1.2 (Mystic Profile Onboarding):** During onboarding, users configure:
  - Display Name, Preferred Language (`en` or `vi`).
  - Date of Birth (system automatically computes Sun Zodiac Sign & Numerology Life Path Number).
  - Primary Focus Areas (Career & Ideas, Romance, Personal Growth, Finance).
- **FR-1.3 (AI Context Toggle):** Users can toggle whether the AI Reader is allowed to incorporate their Mystic Profile and recent Journal themes into readings.

#### Module 2: Virtual Deck Ritual & Manual Physical Input
- **FR-2.1 (Spread Selection):** Provide structured spread templates tailored to user goals:
  - *1-Card Spread (Daily Message / Yes-No / Quick Idea Spark)*
  - *3-Card Spread (Past - Present - Future / Situation - Action - Outcome / Mind - Body - Spirit)*
  - *5-Card Creative & Direction Spread (Core Idea - Obstacle - Hidden Resource - First Step - Potential)*
  - *10-Card Celtic Cross (Deep holistic analysis)*
- **FR-2.2 (Mode A - Virtual Deck Ritual):**
  - Interactive shuffling, deck cutting, and fan-out selection animations (with native haptic feedback on Android).
  - Cryptographically secure randomization (`SecureRandom` / Web Crypto) combined with user tap timestamps to determine drawn cards and **Upright / Reversed** orientation.
- **FR-2.3 (Mode B - Manual Physical Deck Input):**
  - Designed for users drawing with physical cards at home: fast search and filter interface across all 78 cards categorized by Suit (*22 Major Arcana, 14 Wands, 14 Cups, 14 Swords, 14 Pentacles*).
  - Users assign specific cards to each spread position and toggle **Upright / Reversed** orientation.
- **FR-2.4 (Multi-Deck System — 5 Complete 78-Card Editions & Card Back Finishes):**
  - Provides 5 complete curated Tarot deck editions (each verified with all **78/78 cards**):
    1. `ED-01`: *Rider-Waite-Smith 1909 (Centennial Lithograph)* — Free (Default)
    2. `ED-02`: *Sunlit Botanical Herbarium (2025 Archival Edition)* — Free
    3. `ED-03`: *Swiss Geometric Bauhaus (Minimalist Grid)* — Free
    4. `ED-04`: *Ancien Tarot de Marseille 1760 (Nicolas Conver Woodcut)* — Pro or 30 Credits
    5. `ED-05`: *Kyoto Washed Sumi-e & Mineral Watercolor* — Pro or 45 Credits
  - Supports 4 tactile Card Back finishes (*Natural Flax, Botanical Emerald Foil, Terracotta Wax Seal, Classic 1909 Tudor Rose*) plus a **78-Card Contact Sheet & Side-by-Side 5-Deck Plate Comparator**.

#### Module 3: AI Tarot Master & Interactive Session Engine
- **FR-3.1 (AI Reader Personas):** Users select a Reader persona before interpretation:
  1. *The Classic Mystic (Traditional, symbolic, esoteric depth).*
  2. *The Idea Spark (Creative, action-oriented, brainstorming & direction focused).*
  3. *The Gentle Friend (Warm, empathetic, encouraging).*
- **FR-3.2 (Holistic Synthesis Reading via SSE):** The AI streams a structured 4-part reading in real time:
  1. **Spread Energy Overview** (Elemental balance: Fire/Water/Air/Earth and Major/Minor Arcana ratio).
  2. **Position-by-Position Contextual Breakdown.**
  3. **Core Synthesis:** How the cards interact and tell a unified story.
  4. **Actionable Ideas & Next Steps.**
- **FR-3.3 (Follow-up Q&A & Clarifier Cards):**
  - Users can ask up to **3 follow-up questions** within the context of the active reading session.
  - Users can trigger **"Draw Clarifier Card"** (1–2 cards per session, via virtual draw or manual picker) to clarify an ambiguous position.

#### Module 4: Daily Companion & Tarot Journal (Retention Loop)
- **FR-4.1 (Daily Card of the Day):** Free daily 1-card pull featuring a concise message, daily energy keywords, and one actionable micro-idea for the day.
- **FR-4.2 (Tarot Journal & Pattern Analytics):**
  - Automatically saves reading sessions to the user's timeline.
  - Users can append personal reflection notes and mood tags.
  - Monthly Insights dashboard: *"Your Stalker Card (Most Frequently Drawn Card)"*, *"30-Day Elemental Energy Chart"*.

#### Module 5: Shareable Card Generator (Viral Growth Engine)
- **FR-5.1 (Social Card Rendering):** After any Daily Card or Spread reading, users can generate a high-resolution image in `9:16` (Stories/Reels/TikTok) or `1:1` (Feed) aspect ratio containing the card art, question/theme, a punchy `< 40-word` AI takeaway quote, and app branding.

#### Module 6: Crystal Wallet & Hybrid Monetization
- **FR-6.1 (Crystal Ledger):** Immutable PostgreSQL transaction ledger tracking Crystal credits and debits.
- **FR-6.2 (Configurable Action Costs):** Dynamic pricing table (e.g., 3-Card Reading = 10 Crystals, Clarifier Card = 5 Crystals, Follow-up Question = 3 Crystals).
- **FR-6.3 (Payment Integration):** Google Play Billing for Android app and Stripe / PayOS / VNPay QR for Web.

---

### 4. System Architecture, Process Flows & Database Design

#### Diagram 2: Overall System Architecture Diagram

#### Diagram 3: End-to-End Reading & AI Synthesis Sequence Diagram

#### Diagram 4: Reading Session Lifecycle State Machine

#### Diagram 5: Database Entity-Relationship Diagram (ERD)

#### 4.1 Core PostgreSQL Schema Overview

| Table Name | Key Columns | Description |
| :--- | :--- | :--- |
| `users` | `id (UUID)`, `email`, `locale (vi/en)`, `crystal_balance`, `tier (FREE/PRO)`, `created_at` | User account and current Crystal wallet balance |
| `mystic_profiles` | `user_id (FK)`, `birth_date`, `zodiac_sign`, `life_path_number`, `preferred_deck_id (FK)`, `preferred_back_id`, `allow_ai_context` | Personal astrological/numerological context and active Tarot deck/back preference |
| `tarot_decks` | `id (ED-01..05)`, `slug`, `name_i18n (JSONB)`, `artist`, `unlock_tier`, `credit_cost`, `card_count (78)` | Catalog of 5 complete curated Tarot deck editions (78 cards each) |
| `tarot_cards` | `id (0..77)`, `code`, `arcana (MAJOR/MINOR)`, `suit`, `name_i18n (JSONB)`, `keywords_upright_i18n`, `keywords_reversed_i18n` | Bilingual 78-card canonical master catalog (22 Major + 56 Minor) |
| `deck_card_artworks` | `deck_id (FK)`, `card_id (FK 0..77)`, `image_url`, `artist_note_i18n` | Artwork plate mapping per deck (`78 cards x 5 decks = 390 plates`) |
| `spread_templates` | `id`, `code`, `card_count`, `crystal_cost`, `positions_i18n (JSONB)` | Spread layouts and position definitions |
| `reading_sessions` | `id (UUID)`, `user_id (FK)`, `spread_id (FK)`, `input_mode (VIRTUAL/MANUAL)`, `persona_code`, `user_question`, `ai_synthesis_result`, `follow_up_count` | Master record for each reading session |
| `drawn_cards` | `id (UUID)`, `session_id (FK)`, `card_id (FK)`, `position_index`, `is_reversed`, `is_clarifier` | Cards drawn or manually entered in a session |
| `session_messages` | `id (UUID)`, `session_id (FK)`, `role (USER/AI)`, `content`, `created_at` | Follow-up Q&A dialogue history |
| `journal_entries` | `session_id (PK, FK)`, `reflection_note`, `mood_tags (JSONB)`, `updated_at` | User reflections and mood tracking |
| `crystal_transactions` | `id (UUID)`, `user_id (FK)`, `amount (+/-)`, `reason_code`, `reference_id`, `created_at` | Immutable ledger for Crystal balance changes |

#### 4.2 Core Spring Boot REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/google` | Authenticate via Google OAuth2 and issue JWT |
| `GET/PUT` | `/api/v1/profile/mystic` | Retrieve or update Mystic Profile & language preference (`en`/`vi`) |
| `GET` | `/api/v1/tarot/cards` | Fetch bilingual 78-card catalog (Redis cached) |
| `GET` | `/api/v1/tarot/spreads` | List spread templates and Crystal costs |
| `POST` | `/api/v1/readings/daily` | Perform Daily Card draw (1 free per day) |
| `POST` | `/api/v1/readings/sessions` | Create reading session (Virtual or Manual) & stream AI reading via SSE |
| `POST` | `/api/v1/readings/sessions/{id}/clarifier` | Draw a Clarifier card within an active session |
| `POST` | `/api/v1/readings/sessions/{id}/chat` | Send a follow-up question to the AI Reader |
| `PUT` | `/api/v1/readings/sessions/{id}/journal` | Save personal journal reflection notes and mood tags |
| `POST` | `/api/v1/readings/sessions/{id}/share-card` | Generate Shareable Card metadata & image |
| `GET` | `/api/v1/wallet/balance` | Check Crystal balance & Pro subscription status |

---

### 5. Non-Functional Requirements
1. **AI Streaming Latency:** Time-To-First-Byte (TTFB) for SSE AI reading responses must be `< 2.0 seconds`.
2. **Safety & Cost Guardrails:** User question input capped at `500 characters`; system prompts enforce domain boundaries (Tarot, creative ideation, personal guidance) and reject medical, legal, or harmful queries.
3. **Full Localization (i18n):** Seamless runtime switching between English (`en`) and Vietnamese (`vi`) across UI components, card meanings, and AI output language.

---

## PART C: IMPLEMENTATION ROADMAP

| Phase | Core Objective | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1: Foundation & Core Data (Weeks 1–2)** | Spring Boot Backend + Database + 78-Card Bilingual Catalog | - Spring Boot 3 setup (PostgreSQL, Redis, Flyway, JWT Auth).<br>- Bilingual seed data for 78 Tarot cards & 5 core spreads.<br>- Next.js + TailwindCSS + Capacitor project initialization. |
| **Phase 2: Core Reading & AI Engine (Weeks 3–4)** | Virtual Ritual + Manual Picker + AI Streaming Synthesis | - Interactive card shuffle/flip UI & Manual Card Picker.<br>- Spring AI SSE Streaming with 3 Reader Personas.<br>- Follow-up Q&A & Clarifier Card mechanics. |
| **Phase 3: Daily Companion, Journal & Share Card (Week 5)** | Retention & Viral Loops | - Daily Draw + Mystic Profile onboarding.<br>- Tarot Journal timeline & monthly elemental analytics.<br>- Shareable Card generator (`9:16` & `1:1`). |
| **Phase 4: Monetization & Android Release (Week 6)** | Hybrid Billing & Production Launch | - Crystal Wallet ledger + Pro Subscription.<br>- Web Payment Gateway & Google Play Billing via Capacitor.<br>- End-to-end testing, Android `.aab` build & Web deployment. |
