-- =========================================================================
-- HireSense AI Database Migration V1: Core Authentication & Profile Schema
-- =========================================================================

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert core application roles
INSERT INTO roles (name, description) VALUES
('ROLE_STUDENT', 'Undergraduate student preparing for campus placements'),
('ROLE_ADMIN', 'Platform Administrator with system-wide analytics access'),
('ROLE_PLACEMENT_OFFICER', 'College placement department faculty/officer')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Roles Join Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Refresh Tokens Table (with Rotation and Revocation Support)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Target Companies Table
CREATE TABLE IF NOT EXISTS target_companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    tier ENUM('TIER_1_PRODUCT', 'TIER_2_TECH', 'SERVICE_MASS_HIRING') NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed verified baseline target companies
INSERT INTO target_companies (name, tier, description) VALUES
('Amazon', 'TIER_1_PRODUCT', 'Global technology company focusing on e-commerce, cloud computing, and AI'),
('Microsoft', 'TIER_1_PRODUCT', 'Global technology corporation developing software, systems, and cloud platforms'),
('Deloitte', 'TIER_2_TECH', 'Professional services and technology consulting network'),
('Accenture', 'TIER_2_TECH', 'Global professional services and digital transformation company'),
('TCS', 'SERVICE_MASS_HIRING', 'Leading multinational IT services and consulting company'),
('Infosys', 'SERVICE_MASS_HIRING', 'Global leader in next-generation digital services and consulting'),
('Wipro', 'SERVICE_MASS_HIRING', 'Global information technology, consulting and business process services company')
ON DUPLICATE KEY UPDATE name=name;

-- 6. Company Skill Benchmarks Table
CREATE TABLE IF NOT EXISTS company_skill_benchmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category ENUM('CODING', 'TECHNICAL', 'APTITUDE', 'COMMUNICATION', 'SYSTEM_DESIGN') NOT NULL,
    minimum_proficiency DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    weight DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_benchmark_company FOREIGN KEY (company_id) REFERENCES target_companies(id) ON DELETE CASCADE,
    INDEX idx_benchmark_comp_cat (company_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed company benchmarks for Amazon
INSERT INTO company_skill_benchmarks (company_id, skill_name, category, minimum_proficiency, weight) VALUES
((SELECT id FROM target_companies WHERE name='Amazon'), 'Data Structures & Algorithms', 'CODING', 85.00, 1.50),
((SELECT id FROM target_companies WHERE name='Amazon'), 'System Design & Architecture', 'SYSTEM_DESIGN', 75.00, 1.20),
((SELECT id FROM target_companies WHERE name='Amazon'), 'Object Oriented Programming', 'TECHNICAL', 80.00, 1.00),
((SELECT id FROM target_companies WHERE name='Amazon'), 'Problem Solving & Logical Reasoning', 'APTITUDE', 80.00, 1.00);

-- Seed company benchmarks for TCS
INSERT INTO company_skill_benchmarks (company_id, skill_name, category, minimum_proficiency, weight) VALUES
((SELECT id FROM target_companies WHERE name='TCS'), 'Quantitative Aptitude', 'APTITUDE', 65.00, 1.30),
((SELECT id FROM target_companies WHERE name='TCS'), 'Logical Reasoning & Verbal', 'APTITUDE', 65.00, 1.20),
((SELECT id FROM target_companies WHERE name='TCS'), 'Core Java / C++ Fundamentals', 'TECHNICAL', 60.00, 1.00),
((SELECT id FROM target_companies WHERE name='TCS'), 'DBMS & SQL', 'TECHNICAL', 60.00, 1.00);

-- 7. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    college_name VARCHAR(180),
    degree VARCHAR(100),
    branch VARCHAR(100),
    graduation_year INT,
    cgpa DECIMAL(4, 2),
    target_role VARCHAR(100),
    target_company_id BIGINT,
    target_timeline_weeks INT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_target_comp FOREIGN KEY (target_company_id) REFERENCES target_companies(id) ON DELETE SET NULL,
    INDEX idx_profile_grad_year (graduation_year),
    INDEX idx_profile_target_comp (target_company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Skills Master Table
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default skills
INSERT INTO skills (name, category) VALUES
('Java', 'PROGRAMMING_LANGUAGE'),
('Python', 'PROGRAMMING_LANGUAGE'),
('C++', 'PROGRAMMING_LANGUAGE'),
('Data Structures', 'COMPUTER_SCIENCE'),
('Algorithms', 'COMPUTER_SCIENCE'),
('DBMS & SQL', 'DATABASE'),
('Operating Systems', 'COMPUTER_SCIENCE'),
('Computer Networks', 'COMPUTER_SCIENCE'),
('Spring Boot', 'FRAMEWORK'),
('React.js', 'FRAMEWORK'),
('Git & Version Control', 'TOOLS')
ON DUPLICATE KEY UPDATE name=name;

-- 9. Student Skills Join Table
CREATE TABLE IF NOT EXISTS student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    verified_by_assessment BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_skills_profile FOREIGN KEY (profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uk_profile_skill (profile_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Student Projects Table
CREATE TABLE IF NOT EXISTS student_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    technologies_used VARCHAR(255) NOT NULL,
    github_link VARCHAR(255),
    live_demo_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_projects_profile FOREIGN KEY (profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Student Certifications Table
CREATE TABLE IF NOT EXISTS student_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    issue_date DATE,
    credential_id VARCHAR(150),
    credential_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_certs_profile FOREIGN KEY (profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Audit Logs Table (For tracking events, security, and research snapshots)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    event_type VARCHAR(80) NOT NULL,
    event_description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_event (event_type),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
