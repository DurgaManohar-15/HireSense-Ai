-- =========================================================================
-- HireSense AI Database Migration V6: Complete Platform, Admin Analytics & AI Career Assistant
-- =========================================================================

-- 1. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM', -- 'ASSESSMENT', 'ROADMAP', 'INTERVIEW', 'RESUME', 'ANNOUNCEMENT', 'SYSTEM'
    action_url VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Platform Broadcast Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by_user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL_STUDENTS', -- 'ALL_STUDENTS', 'FINAL_YEAR', 'PRE_FINAL_YEAR'
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    CONSTRAINT fk_ann_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ann_active (is_active, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI Career Assistant Conversations Table
CREATE TABLE IF NOT EXISTS career_assistant_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL DEFAULT 'Career Guidance Session',
    target_role VARCHAR(150) NULL,
    target_company VARCHAR(150) NULL,
    ai_provider VARCHAR(50) NOT NULL DEFAULT 'MOCK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cac_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cac_user (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. AI Career Assistant Messages Table
CREATE TABLE IF NOT EXISTS career_assistant_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'USER', 'ASSISTANT', 'SYSTEM'
    message_text LONGTEXT NOT NULL,
    evidence_context_json LONGTEXT NULL,
    action_suggestions_json LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cam_conversation FOREIGN KEY (conversation_id) REFERENCES career_assistant_conversations(id) ON DELETE CASCADE,
    INDEX idx_cam_conv (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Target Roles Catalog Table
CREATE TABLE IF NOT EXISTS target_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL DEFAULT 'ENGINEERING',
    description TEXT NULL,
    expected_core_skills TEXT NULL, -- comma separated or JSON
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action_type VARCHAR(80) NOT NULL, -- 'COMPANY_CREATE', 'BENCHMARK_UPDATE', 'STUDENT_VIEW', 'ANNOUNCEMENT_CREATE', 'RESEARCH_EXPORT'
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NULL,
    details TEXT NULL,
    ip_address VARCHAR(80) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_admin (admin_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Target Roles
INSERT IGNORE INTO target_roles (name, category, description, expected_core_skills) VALUES
('Java Backend Developer', 'ENGINEERING', 'Specializes in backend services, Spring Boot, microservices, and distributed databases.', 'Java,Spring Boot,DBMS,SQL,Data Structures,Algorithms,OOP,REST APIs'),
('Full Stack Software Engineer', 'ENGINEERING', 'Develops end-to-end applications spanning React frontend and Java/Node backend.', 'Java,React,JavaScript,DBMS,SQL,HTML,CSS,Data Structures,System Design'),
('Frontend Developer', 'ENGINEERING', 'Crafts modern interactive web user interfaces and single-page client applications.', 'React,JavaScript,TypeScript,HTML,CSS,Redux,Web Performance'),
('Data Analyst & BI Engineer', 'ANALYTICS', 'Transforms raw datasets into business intelligence visualizations and SQL pipelines.', 'SQL,Python,Data Structures,Statistics,Database Modeling,PowerBI'),
('Cloud & DevOps Engineer', 'INFRASTRUCTURE', 'Architects CI/CD pipelines, container orchestration, and cloud infrastructure.', 'Linux,Docker,Kubernetes,AWS,Networking,Operating Systems,CI/CD');
