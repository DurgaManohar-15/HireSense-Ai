-- =========================================================================
-- HireSense AI Database Migration V5: Explainable Placement Readiness Intelligence Engine
-- =========================================================================

-- 1. Placement Readiness Snapshots Table (Immutable Historical Logs)
CREATE TABLE IF NOT EXISTS placement_readiness_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prs_score INT NOT NULL,
    confidence_score INT NOT NULL,
    readiness_band VARCHAR(50) NOT NULL, -- 'EXCELLENT', 'GOOD', 'DEVELOPING', 'NEEDS_IMPROVEMENT'
    scoring_version VARCHAR(50) NOT NULL DEFAULT 'PRS_v1.0.0',
    target_role VARCHAR(150),
    target_company VARCHAR(150),
    company_readiness_score INT NULL,
    coding_score INT NULL,
    technical_score INT NULL,
    aptitude_score INT NULL,
    resume_score INT NULL,
    interview_score INT NULL,
    communication_score INT NULL,
    component_breakdown_json LONGTEXT NOT NULL,
    explanation_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prs_user_date (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Skill Gap Assessments Table
CREATE TABLE IF NOT EXISTS skill_gap_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'TECHNICAL',
    status VARCHAR(50) NOT NULL, -- 'STRONG', 'MODERATE', 'NEEDS_IMPROVEMENT', 'MISSING'
    observed_proficiency INT NOT NULL DEFAULT 0,
    required_proficiency INT NOT NULL DEFAULT 70,
    gap_score INT NOT NULL DEFAULT 0,
    evidence_sources VARCHAR(255) NOT NULL, -- 'RESUME,ASSESSMENT,INTERVIEW'
    last_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_skill (user_id, skill_name),
    INDEX idx_sga_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Personalized Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    target_role VARCHAR(150) NOT NULL,
    target_company VARCHAR(150),
    duration_days INT NOT NULL DEFAULT 30,
    hours_per_day INT NOT NULL DEFAULT 2,
    total_tasks INT NOT NULL DEFAULT 0,
    completed_tasks INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ai_provider VARCHAR(50) NOT NULL DEFAULT 'MOCK',
    ai_model VARCHAR(100) NOT NULL DEFAULT 'rule-based-v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roadmap_user (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Roadmap Daily Tasks Table
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    topic VARCHAR(150) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'LEARN', 'PRACTICE', 'QUIZ', 'CODING', 'MOCK_INTERVIEW', 'RESUME_POLISH'
    estimated_duration_minutes INT NOT NULL DEFAULT 60,
    priority VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'HIGH', 'MEDIUM', 'LOW'
    learning_objective TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    INDEX idx_task_roadmap_day (roadmap_id, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
