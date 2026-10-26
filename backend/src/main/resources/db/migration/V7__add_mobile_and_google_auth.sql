-- =========================================================================
-- HireSense AI Database Migration V7: Mobile Phone & Google OAuth Support
-- =========================================================================

ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30) NULL AFTER email,
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL AFTER phone_number,
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL' AFTER google_id,
    ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500) NULL AFTER auth_provider;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
