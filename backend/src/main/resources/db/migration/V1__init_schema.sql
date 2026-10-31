-- AI Tarot Reader - PostgreSQL Schema V1.0

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    locale VARCHAR(10) NOT NULL DEFAULT 'vi',
    crystal_balance INT NOT NULL DEFAULT 20,
    tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mystic_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    zodiac_sign VARCHAR(50),
    life_path_number INT,
    preferred_deck_id VARCHAR(50) NOT NULL DEFAULT 'ED-01',
    preferred_back_id VARCHAR(50) NOT NULL DEFAULT 'classic-navy',
    allow_ai_context BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tarot_decks (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    unlock_tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
    credit_cost INT NOT NULL DEFAULT 0,
    card_count INT NOT NULL DEFAULT 78,
    description_en TEXT,
    description_vi TEXT,
    cover_image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tarot_cards (
    id INT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    arcana VARCHAR(20) NOT NULL, -- MAJOR, MINOR
    suit VARCHAR(20),            -- WANDS, CUPS, SWORDS, PENTACLES, NULL
    number INT NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    element VARCHAR(50),
    keywords_upright_en TEXT,
    keywords_upright_vi TEXT,
    keywords_reversed_en TEXT,
    keywords_reversed_vi TEXT,
    summary_en TEXT,
    summary_vi TEXT,
    image_slug VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS spread_templates (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    card_count INT NOT NULL,
    crystal_cost INT NOT NULL DEFAULT 0,
    description_en TEXT,
    description_vi TEXT,
    positions_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    spread_id VARCHAR(50) REFERENCES spread_templates(id),
    deck_id VARCHAR(50) REFERENCES tarot_decks(id),
    input_mode VARCHAR(20) NOT NULL, -- VIRTUAL, MANUAL
    persona_code VARCHAR(50) NOT NULL DEFAULT 'MYSTIC_SAGE',
    user_question VARCHAR(1000),
    ai_synthesis_result TEXT,
    follow_up_count INT NOT NULL DEFAULT 0,
    max_follow_ups INT NOT NULL DEFAULT 2,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drawn_cards (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
    card_id INT NOT NULL REFERENCES tarot_cards(id),
    position_index INT NOT NULL,
    position_name_en VARCHAR(255),
    position_name_vi VARCHAR(255),
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    is_clarifier BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- USER, AI
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entries (
    session_id UUID PRIMARY KEY REFERENCES reading_sessions(id) ON DELETE CASCADE,
    reflection_note TEXT,
    mood_tags_json TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crystal_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drawn_cards_session_id ON drawn_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_user_id ON crystal_transactions(user_id);
