-- =========================================================================
-- HireSense AI Database Migration V9: Advanced Resume & JD Skill Gap Engine
-- =========================================================================

-- 1. Job Descriptions Table (Stores student-uploaded/pasted job descriptions)
CREATE TABLE IF NOT EXISTS job_descriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    location VARCHAR(100),
    raw_text LONGTEXT NOT NULL,
    extracted_json LONGTEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jd_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jd_user (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. JD-Resume Analyses Table (Preserves immutable snapshots of Resume + JD matching)
CREATE TABLE IF NOT EXISTS jd_resume_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    job_description_id BIGINT NULL,
    resume_analysis_id BIGINT NOT NULL,
    jd_match_score INT NOT NULL,
    strong_matches_count INT NOT NULL DEFAULT 0,
    partial_matches_count INT NOT NULL DEFAULT 0,
    weak_matches_count INT NOT NULL DEFAULT 0,
    missing_matches_count INT NOT NULL DEFAULT 0,
    structured_match_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jra_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_jra_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_jra_jd FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE SET NULL,
    CONSTRAINT fk_jra_analysis FOREIGN KEY (resume_analysis_id) REFERENCES resume_analyses(id) ON DELETE CASCADE,
    INDEX idx_jra_user (user_id, created_at),
    INDEX idx_jra_resume (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Resume Improvement Suggestions Table (Interactive Section-by-Section Review)
CREATE TABLE IF NOT EXISTS resume_improvement_suggestions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_analysis_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    current_content TEXT,
    suggestion_text TEXT NOT NULL,
    rationale TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'EDITED', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ris_analysis FOREIGN KEY (resume_analysis_id) REFERENCES resume_analyses(id) ON DELETE CASCADE,
    CONSTRAINT fk_ris_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ris_analysis (resume_analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
