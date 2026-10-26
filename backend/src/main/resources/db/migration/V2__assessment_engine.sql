-- =========================================================================
-- HireSense AI Database Migration V2: Assessment Engine & Question Bank
-- =========================================================================

-- 1. Assessment Definitions / Test Templates
CREATE TABLE IF NOT EXISTS assessment_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category ENUM('QUANTITATIVE_APTITUDE', 'LOGICAL_REASONING', 'VERBAL_ABILITY', 'CORE_CS_TECHNICAL', 'COMPREHENSIVE_MOCK') NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'MIXED') NOT NULL DEFAULT 'MIXED',
    duration_minutes INT NOT NULL DEFAULT 30,
    total_questions INT NOT NULL DEFAULT 15,
    passing_percentage DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assessment_category (category),
    INDEX idx_assessment_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Questions Master Table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('QUANTITATIVE_APTITUDE', 'LOGICAL_REASONING', 'VERBAL_ABILITY', 'CORE_CS_TECHNICAL') NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    question_text TEXT NOT NULL,
    explanation TEXT,
    marks INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_questions_cat_topic (category, topic),
    INDEX idx_questions_difficulty (difficulty),
    INDEX idx_questions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_label VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_options_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Assessment Sessions Table
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    assessment_id BIGINT,
    assessment_title VARCHAR(200) NOT NULL,
    category ENUM('QUANTITATIVE_APTITUDE', 'LOGICAL_REASONING', 'VERBAL_ABILITY', 'CORE_CS_TECHNICAL', 'COMPREHENSIVE_MOCK') NOT NULL,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
    total_questions INT NOT NULL,
    duration_minutes INT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_assessment FOREIGN KEY (assessment_id) REFERENCES assessment_definitions(id) ON DELETE SET NULL,
    INDEX idx_session_user_status (user_id, status),
    INDEX idx_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Session Questions Join Table (Preserves order of questions presented to each student)
CREATE TABLE IF NOT EXISTS session_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    question_order INT NOT NULL,
    CONSTRAINT fk_sq_session FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_question (session_id, question_id),
    INDEX idx_sq_session_order (session_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Student Responses Table
CREATE TABLE IF NOT EXISTS student_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resp_session FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_resp_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_resp_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL,
    UNIQUE KEY uk_session_question_resp (session_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Assessment Results Table (Preserves immutable historical performance records)
CREATE TABLE IF NOT EXISTS assessment_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    assessment_id BIGINT,
    assessment_title VARCHAR(200) NOT NULL,
    category ENUM('QUANTITATIVE_APTITUDE', 'LOGICAL_REASONING', 'VERBAL_ABILITY', 'CORE_CS_TECHNICAL', 'COMPREHENSIVE_MOCK') NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    unanswered_count INT NOT NULL,
    total_marks_obtained DECIMAL(6,2) NOT NULL,
    max_marks DECIMAL(6,2) NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    time_taken_seconds INT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_session FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_assessment FOREIGN KEY (assessment_id) REFERENCES assessment_definitions(id) ON DELETE SET NULL,
    INDEX idx_result_user_date (user_id, completed_at),
    INDEX idx_result_score (score_percentage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Topic Performance Analytics Table
CREATE TABLE IF NOT EXISTS topic_performance_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    result_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tpa_result FOREIGN KEY (result_id) REFERENCES assessment_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_tpa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tpa_user_topic (user_id, topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Difficulty Performance Analytics Table
CREATE TABLE IF NOT EXISTS difficulty_performance_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    result_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dpa_result FOREIGN KEY (result_id) REFERENCES assessment_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_dpa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_dpa_user_diff (user_id, difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA: Assessment Definitions
-- =========================================================================
INSERT INTO assessment_definitions (title, slug, description, category, difficulty, duration_minutes, total_questions, passing_percentage) VALUES
('Core Computer Science Diagnostic Test', 'core-cs-diagnostic-test', 'Evaluates core CS fundamental competencies including Java OOP, DBMS, OS, Computer Networks, and DSA.', 'CORE_CS_TECHNICAL', 'MIXED', 20, 10, 60.00),
('Quantitative Aptitude Foundations', 'quantitative-aptitude-foundations', 'Assesses numerical problem-solving, percentages, ratios, probability, and time & work.', 'QUANTITATIVE_APTITUDE', 'MIXED', 15, 8, 60.00),
('Logical Reasoning Assessment', 'logical-reasoning-assessment', 'Evaluates pattern recognition, coding-decoding, syllogisms, and deductive reasoning.', 'LOGICAL_REASONING', 'MIXED', 15, 8, 60.00),
('Verbal Ability & Grammar Evaluation', 'verbal-ability-grammar-evaluation', 'Assesses reading comprehension, sentence correction, and vocabulary standards.', 'VERBAL_ABILITY', 'MIXED', 15, 8, 60.00),
('Comprehensive Campus Placement Mock Pre-Test', 'campus-placement-comprehensive-mock', 'Full diagnostic simulation covering Aptitude, Reasoning, Verbal, and Core CS Fundamentals.', 'COMPREHENSIVE_MOCK', 'MIXED', 30, 20, 65.00)
ON DUPLICATE KEY UPDATE title=title;

-- =========================================================================
-- SEED DATA: Question Bank (Technically verified questions with 4 options)
-- =========================================================================

-- Q1: Core CS - OOP
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'OOP', 'EASY', 'Which of the following OOP principles refers to bundling data and methods that operate on that data into a single unit and restricting direct access to some of the object components?', 'Encapsulation is the mechanism of wrapping data (variables) and code acting on the data (methods) together as a single unit, usually achieved using access specifiers like private and public getters/setters.', 1);
SET @q1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q1, 'A', 'Polymorphism', FALSE),
(@q1, 'B', 'Encapsulation', TRUE),
(@q1, 'C', 'Inheritance', FALSE),
(@q1, 'D', 'Abstraction', FALSE);

-- Q2: Core CS - Java
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'Java', 'MEDIUM', 'In Java, which memory area stores method definitions and static variables shared across all instances of a class?', 'In Java (HotSpot JVM), static variables and class metadata are stored in the Metaspace (formerly PermGen in Java 7 and earlier).', 1);
SET @q2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q2, 'A', 'Stack Memory', FALSE),
(@q2, 'B', 'Metaspace / Method Area', TRUE),
(@q2, 'C', 'Garbage Collector Heap Eden space', FALSE),
(@q2, 'D', 'Program Counter Register', FALSE);

-- Q3: Core CS - DBMS & SQL
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'DBMS', 'MEDIUM', 'Which normal form eliminates partial dependency where a non-prime attribute depends on a proper subset of a composite candidate key?', 'Second Normal Form (2NF) requires that the table is in 1NF and no non-prime attribute is partially dependent on any candidate key of the table.', 1);
SET @q3 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q3, 'A', 'First Normal Form (1NF)', FALSE),
(@q3, 'B', 'Second Normal Form (2NF)', TRUE),
(@q3, 'C', 'Third Normal Form (3NF)', FALSE),
(@q3, 'D', 'Boyce-Codd Normal Form (BCNF)', FALSE);

-- Q4: Core CS - Operating Systems
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'Operating Systems', 'HARD', 'Which of the following is NOT one of Coffman''s four necessary conditions for a deadlock to occur in an operating system?', 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive resource allocation breaks deadlock rather than causing it.', 1);
SET @q4 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q4, 'A', 'Mutual Exclusion', FALSE),
(@q4, 'B', 'Hold and Wait', FALSE),
(@q4, 'C', 'Preemptive Resource Allocation', TRUE),
(@q4, 'D', 'Circular Wait', FALSE);

-- Q5: Core CS - Computer Networks
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'Computer Networks', 'MEDIUM', 'In the TCP/IP suite, which protocol is responsible for mapping an IP address to a physical MAC address on a local area network?', 'Address Resolution Protocol (ARP) resolves network layer IPv4 addresses to link layer physical MAC addresses.', 1);
SET @q5 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q5, 'A', 'DNS', FALSE),
(@q5, 'B', 'DHCP', FALSE),
(@q5, 'C', 'ARP (Address Resolution Protocol)', TRUE),
(@q5, 'D', 'ICMP', FALSE);

-- Q6: Core CS - Data Structures
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('CORE_CS_TECHNICAL', 'Data Structures', 'MEDIUM', 'What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (such as an AVL or Red-Black Tree) containing N nodes?', 'In a balanced BST, height is strictly logarithmic O(log N). Thus, search, insertion, and deletion all execute in O(log N) in the worst case.', 1);
SET @q6 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q6, 'A', 'O(1)', FALSE),
(@q6, 'B', 'O(log N)', TRUE),
(@q6, 'C', 'O(N)', FALSE),
(@q6, 'D', 'O(N log N)', FALSE);

-- Q7: Quantitative Aptitude - Percentages
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('QUANTITATIVE_APTITUDE', 'Percentages', 'EASY', 'If the price of a laptop increases by 20% and then decreases by 20%, what is the net percentage change in the price?', 'Let initial price = 100. After 20% increase: 120. After 20% decrease on 120: 120 - 24 = 96. Net change = (96 - 100) = -4% (4% decrease). Formula: -x^2/100 = -400/100 = -4%.', 1);
SET @q7 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q7, 'A', '0% (No change)', FALSE),
(@q7, 'B', '4% increase', FALSE),
(@q7, 'C', '4% decrease', TRUE),
(@q7, 'D', '2% decrease', FALSE);

-- Q8: Quantitative Aptitude - Time and Work
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('QUANTITATIVE_APTITUDE', 'Time and Work', 'MEDIUM', 'Pipe A can fill a tank in 12 hours and Pipe B can fill the same tank in 18 hours. If both pipes are opened together, in how many hours will the tank be full?', '1/A + 1/B = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Total time = 36/5 = 7.2 hours (7 hours 12 minutes).', 1);
SET @q8 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q8, 'A', '6.0 hours', FALSE),
(@q8, 'B', '7.2 hours', TRUE),
(@q8, 'C', '8.4 hours', FALSE),
(@q8, 'D', '9.0 hours', FALSE);

-- Q9: Quantitative Aptitude - Probability
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('QUANTITATIVE_APTITUDE', 'Probability', 'MEDIUM', 'Two standard unbiased 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on top is equal to 8?', 'Total outcomes = 36. Favorable outcomes with sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes. Probability = 5/36.', 1);
SET @q9 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q9, 'A', '1/6 (6/36)', FALSE),
(@q9, 'B', '5/36', TRUE),
(@q9, 'C', '7/36', FALSE),
(@q9, 'D', '1/9 (4/36)', FALSE);

-- Q10: Logical Reasoning - Number Series
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('LOGICAL_REASONING', 'Series', 'EASY', 'Find the missing number in the following sequence: 2, 6, 12, 20, 30, ?', 'Differences between terms: 6-2=4, 12-6=6, 20-12=8, 30-20=10. The next difference must be 12. Next term = 30 + 12 = 42 (also n^2 + n formula: 6^2 + 6 = 42).', 1);
SET @q10 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q10, 'A', '40', FALSE),
(@q10, 'B', '42', TRUE),
(@q10, 'C', '44', FALSE),
(@q10, 'D', '48', FALSE);

-- Q11: Logical Reasoning - Coding-Decoding
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('LOGICAL_REASONING', 'Coding-Decoding', 'MEDIUM', 'If in a certain code language, ''SPRING'' is coded as ''UQTKPI'', how will ''CLOUD'' be coded in that same system?', 'Each letter is shifted forward by +2 positions in the alphabet: C(+2)->E, L(+2)->N, O(+2)->Q, U(+2)->W, D(+2)->F. Result = ENQWF.', 1);
SET @q11 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q11, 'A', 'ENQWF', TRUE),
(@q11, 'B', 'DMQVF', FALSE),
(@q11, 'C', 'EMRVG', FALSE),
(@q11, 'D', 'FNQXG', FALSE);

-- Q12: Logical Reasoning - Syllogisms
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('LOGICAL_REASONING', 'Syllogisms', 'MEDIUM', 'Statements:\n1. All engineers are innovators.\n2. Some innovators are leaders.\n\nConclusions:\nI. Some engineers are leaders.\nII. Some innovators are engineers.\n\nWhich conclusion(s) logically follow?', 'From Statement 1: All A are B implies Some B are A (Some innovators are engineers), so Conclusion II definitely follows. We cannot guarantee an overlap between engineers and leaders from the premises, so Conclusion I does not necessarily follow.', 1);
SET @q12 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q12, 'A', 'Only Conclusion I follows', FALSE),
(@q12, 'B', 'Only Conclusion II follows', TRUE),
(@q12, 'C', 'Both Conclusion I and II follow', FALSE),
(@q12, 'D', 'Neither Conclusion I nor II follows', FALSE);

-- Q13: Verbal Ability - Grammar & Sentence Correction
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('VERBAL_ABILITY', 'Sentence Correction', 'MEDIUM', 'Select the grammatically correct sentence:', '''Neither the principal nor the teachers were present'' is correct because when subjects are connected by ''neither... nor'', the verb agrees with the closer subject (teachers -> were).', 1);
SET @q13 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q13, 'A', 'Neither the principal nor the teachers was present in the meeting.', FALSE),
(@q13, 'B', 'Neither the principal nor the teachers were present in the meeting.', TRUE),
(@q13, 'C', 'Neither the principal or the teachers was present in the meeting.', FALSE),
(@q13, 'D', 'Neither the principal nor the teachers is present in the meeting yesterday.', FALSE);

-- Q14: Verbal Ability - Synonyms
INSERT INTO questions (category, topic, difficulty, question_text, explanation, marks) VALUES
('VERBAL_ABILITY', 'Vocabulary', 'EASY', 'Choose the word that is most nearly SYNONYMOUS in meaning to ''METICULOUS'':', '''Meticulous'' means showing great attention to detail, very careful and precise. Diligent/Precise/Careful is the direct synonym.', 1);
SET @q14 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q14, 'A', 'Careless', FALSE),
(@q14, 'B', 'Fastidious / Precise', TRUE),
(@q14, 'C', 'Hasty', FALSE),
(@q14, 'D', 'Ambiguous', FALSE);
