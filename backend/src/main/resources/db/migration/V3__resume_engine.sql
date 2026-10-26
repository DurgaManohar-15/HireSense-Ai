-- =========================================================================
-- HireSense AI Database Migration V3: Resume Management & AI Analysis
-- =========================================================================

-- 1. Resumes Master Table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    original_filename VARCHAR(255) NOT NULL,
    storage_filename VARCHAR(255) NOT NULL UNIQUE,
    file_size_bytes BIGINT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    page_count INT NOT NULL DEFAULT 1,
    raw_text LONGTEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user (user_id, is_active),
    INDEX idx_resumes_hash (user_id, file_hash_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Resume Analyses Table (Preserves immutable historical analysis records)
CREATE TABLE IF NOT EXISTS resume_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    target_role VARCHAR(150),
    target_company VARCHAR(150),
    ai_provider VARCHAR(50) NOT NULL, -- 'GEMINI', 'MOCK', 'HEURISTIC'
    ai_model VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    analysis_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    overall_score INT NOT NULL,
    ats_oriented_score INT NOT NULL,
    is_heuristic_fallback BOOLEAN NOT NULL DEFAULT FALSE,
    structured_analysis_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_analysis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_analysis_resume (resume_id),
    INDEX idx_analysis_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Extracted Skills Table
CREATE TABLE IF NOT EXISTS extracted_resume_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_analysis_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'TECHNICAL',
    is_verified_in_resume BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_extracted_analysis FOREIGN KEY (resume_analysis_id) REFERENCES resume_analyses(id) ON DELETE CASCADE,
    INDEX idx_extracted_skills_analysis (resume_analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
