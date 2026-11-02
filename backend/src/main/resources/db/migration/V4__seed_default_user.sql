-- AI Tarot Reader - Migration V4: Seed Default Seeker User & Mystic Profile for Live Database Access

INSERT INTO users (id, email, password_hash, full_name, locale, crystal_balance, tier, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'seeker@aitarotreader.com',
    '$2a$10$7Z8q2U6jB.4cZ4hZ8xUeG.tB2mF0oT5pL3rQ9sW8yV7uI6kO5mN1.',
    'Seeker of Truth',
    'vi',
    50,
    'FREE',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO mystic_profiles (user_id, birth_date, zodiac_sign, life_path_number, preferred_deck_id, preferred_back_id, allow_ai_context, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '1998-04-12',
    'ARIES',
    7,
    'ED-01',
    'classic-navy',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (user_id) DO NOTHING;
