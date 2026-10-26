-- =========================================================================
-- HireSense AI Database Migration V4: AI Mock Interview Engine
-- =========================================================================

-- 1. Interview Sessions Master Table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    interview_type ENUM('HR_BEHAVIORAL', 'TECHNICAL', 'PROJECT_DEEP_DIVE') NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'ADAPTIVE') NOT NULL DEFAULT 'ADAPTIVE',
    target_role VARCHAR(150) NOT NULL,
    target_company VARCHAR(150),
    total_questions INT NOT NULL DEFAULT 5,
    current_question_index INT NOT NULL DEFAULT 0,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
    ai_provider VARCHAR(50) NOT NULL, -- 'GEMINI', 'MOCK', 'HEURISTIC'
    ai_model VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_interviews_user_status (user_id, status),
    INDEX idx_interviews_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    sequence_number INT NOT NULL,
    category VARCHAR(80) NOT NULL, -- 'HR', 'TECHNICAL', 'PROJECT'
    topic VARCHAR(100) NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    question_text TEXT NOT NULL,
    context_rationale TEXT, -- Why AI asked this question
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_iq_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    UNIQUE KEY uk_interview_seq (interview_id, sequence_number),
    INDEX idx_iq_interview (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Interview Answers Table
CREATE TABLE IF NOT EXISTS interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_text LONGTEXT NOT NULL,
    word_count INT NOT NULL DEFAULT 0,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ia_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_ia_question FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_interview_question_ans (interview_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Turn-by-Turn Answer Evaluations Table
CREATE TABLE IF NOT EXISTS interview_turn_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_id BIGINT NOT NULL,
    relevance_score INT NOT NULL,
    technical_correctness_score INT NOT NULL,
    completeness_score INT NOT NULL,
    clarity_score INT NOT NULL,
    communication_score INT NOT NULL,
    overall_turn_score INT NOT NULL,
    evaluation_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ite_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_ite_question FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ite_answer FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_eval_answer (answer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Final Interview Reports Table (Preserves immutable historical performance report)
CREATE TABLE IF NOT EXISTS interview_final_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    overall_score INT NOT NULL,
    technical_score INT NOT NULL,
    behavioral_score INT NOT NULL,
    communication_score INT NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    structured_report_json LONGTEXT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ifr_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_ifr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ifr_user_date (user_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
