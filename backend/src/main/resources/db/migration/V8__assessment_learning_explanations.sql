-- =========================================================================
-- HireSense AI Database Migration V8: Assessment Learning Explanations & Expanded Question Bank
-- Adds Educational Columns (example, use_case) and Enriches Question Bank
-- =========================================================================

-- 1. Extend questions table with example and use_case
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS example TEXT AFTER explanation,
ADD COLUMN IF NOT EXISTS use_case TEXT AFTER example;

-- 2. Backfill existing V2 Seed Questions with Rich Educational Examples & Use Cases

UPDATE questions 
SET example = 'Class `BankAccount` has private variable `balance`. Access is only granted via `deposit()` and `getBalance()` methods with validation.',
    use_case = 'Data protection in financial and security-critical systems to prevent unauthorized state mutations.'
WHERE topic = 'OOP' AND question_text LIKE '%bundling data and methods%';

UPDATE questions 
SET example = 'The definition of class `String` and static constant `Math.PI` are loaded once by the JVM into Metaspace.',
    use_case = 'Optimizes JVM performance and memory footprint by sharing immutable bytecode and class constants across threads.'
WHERE topic = 'Java' AND question_text LIKE '%stores method definitions%';

UPDATE questions 
SET example = 'In a `(StudentID, CourseID) -> (CourseName, Grade)` table, `CourseName` depends only on `CourseID`. Splitting into `Courses` and `StudentGrades` achieves 2NF.',
    use_case = 'Eliminates data redundancy and update anomalies in relational schemas like E-commerce order items and University registries.'
WHERE topic = 'DBMS' AND question_text LIKE '%eliminates partial dependency%';

UPDATE questions 
SET example = 'Deadlock occurs when Thread 1 holds Lock A and waits for Lock B, while Thread 2 holds Lock B and waits for Lock A without timeouts.',
    use_case = 'Operating system process scheduling, distributed database transaction locking, and concurrency managers.'
WHERE topic = 'Operating Systems' AND question_text LIKE '%Coffman%';

UPDATE questions 
SET example = 'When host 192.168.1.10 wants to send a frame to 192.168.1.20 on Ethernet, it broadcasts an ARP request: "Who has 192.168.1.20? Tell 192.168.1.10".',
    use_case = 'Core LAN communication in Ethernet and Wi-Fi networks to resolve Layer 3 IP to Layer 2 MAC addresses.'
WHERE topic = 'Computer Networks' AND question_text LIKE '%mapping an IP address to a physical MAC%';

UPDATE questions 
SET example = 'In an AVL tree with 1,000,000 items, search requires at most ceil(1.44 * log2(1,000,000)) ≈ 29 comparisons.',
    use_case = 'Database indexing (B-Trees/AVL Trees), in-memory lookup sets (`std::set`, `TreeSet`), and IP routing tables.'
WHERE topic = 'Data Structures' AND question_text LIKE '%Binary Search Tree%';

UPDATE questions 
SET example = 'Initial price $100 -> 20% increase to $120 -> 20% decrease ($24) to $96 -> Net loss of 4%.',
    use_case = 'Financial calculations, stock market volatility analysis, and retail discount strategies.'
WHERE topic = 'Percentages' AND question_text LIKE '%price of a laptop%';

UPDATE questions 
SET example = 'A does 1/12 unit/hr, B does 1/18 unit/hr. Combined rate = 5/36 units/hr. Total time = 36/5 = 7.2 hrs.',
    use_case = 'Capacity planning, parallel batch processing throughput, and resource allocation in operations.'
WHERE topic = 'Time and Work' AND question_text LIKE '%Pipe A can fill a tank%';

UPDATE questions 
SET example = 'Rolling (2,6), (3,5), (4,4), (5,3), (6,2) out of 36 pairs gives 5/36 ≈ 13.88% chance.',
    use_case = 'Risk modeling in fintech, randomized load balancing, and Monte Carlo game simulations.'
WHERE topic = 'Probability' AND question_text LIKE '%Two standard unbiased 6-sided dice%';

UPDATE questions 
SET example = 'Pattern: 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42.',
    use_case = 'Pattern recognition in machine learning feature engineering, IQ tests, and algorithmic sequence prediction.'
WHERE topic = 'Series' AND question_text LIKE '%missing number in the following sequence%';

UPDATE questions 
SET example = 'Letter shift: C (+2) -> E, L (+2) -> N, O (+2) -> Q, U (+2) -> W, D (+2) -> F.',
    use_case = 'Foundations of classical cryptography, Caesar ciphers, and encoding schemes.'
WHERE topic = 'Coding-Decoding' AND question_text LIKE '%SPRING%';

UPDATE questions 
SET example = 'If all Dogs are Mammals, then Some Mammals are Dogs (valid converse).',
    use_case = 'Automated theorem provers, knowledge graphs, and logical decision engines.'
WHERE topic = 'Syllogisms' AND question_text LIKE '%All engineers are innovators%';

UPDATE questions 
SET example = 'Rule: In "neither... nor", the verb agrees with the closer subject ("neither the teacher nor the students were").',
    use_case = 'Professional business correspondence, technical documentation, and communication skills.'
WHERE topic = 'Sentence Correction' AND question_text LIKE '%Select the grammatically correct sentence%';

UPDATE questions 
SET example = 'A meticulous software engineer writes unit tests covering all boundary conditions and edge cases.',
    use_case = 'Professional vocabulary comprehension for global placement communication and interview evaluation.'
WHERE topic = 'Vocabulary' AND question_text LIKE '%METICULOUS%';

-- 3. Insert Expanded High-Quality Questions across Core Topics & Difficulties

-- Java Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Java', 'EASY', 'Which of the following is true about the String class in Java?', 
'String objects in Java are immutable once created. Any modification creates a new String instance in the String Constant Pool or Heap.',
'String s = "Hire"; s.concat("Sense"); // s still contains "Hire" unless reassigned.',
'Ensures thread safety, security in network/database connections, and caching in the JVM String Constant Pool.', 1);
SET @q_j1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_j1, 'A', 'String objects are mutable and can be modified in-place', FALSE),
(@q_j1, 'B', 'String objects are immutable and stored in the String Pool / Heap', TRUE),
(@q_j1, 'C', 'String extends the StringBuilder class', FALSE),
(@q_j1, 'D', 'String is a primitive data type in Java', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Java', 'MEDIUM', 'What happens when two distinct objects produce the same hashCode() in a java.util.HashMap?', 
'A hash collision occurs. The HashMap stores both entries in the same bucket using a linked list (or balanced red-black tree when bucket size exceeds 8).',
'Map<Employee, String> map = new HashMap<>(); if Emp1 and Emp2 have hash 42, both reside in bucket[42] and are distinguished by equals().',
'Core to understanding HashMap internal mechanics, high-throughput caching, and preventing denial-of-service hash collision vulnerabilities.', 1);
SET @q_j2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_j2, 'A', 'The previous entry is immediately overwritten', FALSE),
(@q_j2, 'B', 'A NullPointerException is thrown by the JVM', FALSE),
(@q_j2, 'C', 'A hash collision occurs and entries are chained via a linked list or red-black tree', TRUE),
(@q_j2, 'D', 'The HashMap automatically resizes immediately', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Java', 'HARD', 'In Java Concurrency, what is the key guarantee provided by the volatile keyword on a variable?', 
'The volatile keyword guarantees visibility (all reads/writes go directly to main memory, bypassing CPU cache) and prevents instruction reordering around reads/writes via memory barriers. It does NOT guarantee atomicity of compound operations (like count++).',
'private volatile boolean running = true; // when one thread sets running = false, other threads see it immediately.',
'Lightweight thread coordination, lock-free status flags, and single-check initialization patterns.', 1);
SET @q_j3 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_j3, 'A', 'It guarantees atomicity of compound operations like counter++', FALSE),
(@q_j3, 'B', 'It creates a synchronized lock around all methods of the class', FALSE),
(@q_j3, 'C', 'It guarantees visibility across CPU caches and prevents memory instruction reordering', TRUE),
(@q_j3, 'D', 'It moves the variable into the Garbage Collection tenured space', FALSE);

-- OOP Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'OOP', 'EASY', 'Which OOP concept allows a subclass to provide a specific implementation of a method that is already defined in its superclass?', 
'Method Overriding (Runtime Polymorphism) allows a child class to provide a specialized implementation of an inherited parent method using the same method signature.',
'Superclass `Payment` has method `process()`. Subclass `CreditCardPayment` overrides `process()` with credit card gateway logic.',
'Extensibility in frameworks, plugin architectures, and dynamic method dispatch.', 1);
SET @q_oop1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_oop1, 'A', 'Method Overloading', FALSE),
(@q_oop1, 'B', 'Method Overriding', TRUE),
(@q_oop1, 'C', 'Encapsulation', FALSE),
(@q_oop1, 'D', 'Composition', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'OOP', 'MEDIUM', 'According to the SOLID principles, what does the Liskov Substitution Principle (LSP) dictate?', 
'Objects of a superclass should be replaceable with objects of its subclasses without breaking the application or violating expected behavior.',
'If `Square` inherits from `Rectangle`, modifying the width of a Square also alters height, which violates Rectangle contracts if callers expect independent dimensions.',
'Clean API design, maintaining subclass behavioral invariants, and robust inheritance hierarchies.', 1);
SET @q_oop2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_oop2, 'A', 'A class should have only one reason to change', FALSE),
(@q_oop2, 'B', 'Subtypes must be substitutable for their base types without altering program correctness', TRUE),
(@q_oop2, 'C', 'High-level modules should not depend on low-level modules directly', FALSE),
(@q_oop2, 'D', 'Interfaces should be segregated into smaller client-specific interfaces', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'OOP', 'HARD', 'Why is composition often favored over class inheritance ("Favor object composition over class inheritance")?', 
'Composition provides looser coupling, allows behavior to be swapped dynamically at runtime, and avoids fragile base-class problems where parent changes inadvertently break child classes.',
'Instead of `Robot extends Worker`, use `Robot has-a CleaningBehavior` where behavior can be swapped to `WeldingBehavior` at runtime.',
'Design patterns such as Strategy, Decorator, and dependency injection in modern microservices.', 1);
SET @q_oop3 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_oop3, 'A', 'Composition increases memory usage by allocating multiple superclasses', FALSE),
(@q_oop3, 'B', 'Composition provides loose coupling and dynamic runtime behavior modification', TRUE),
(@q_oop3, 'C', 'Inheritance allows private fields to be accessed directly by child classes', FALSE),
(@q_oop3, 'D', 'Composition allows multiple inheritance of state in Java', FALSE);

-- DBMS Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'DBMS', 'EASY', 'Which SQL clause is used to filter the groups created by the GROUP BY clause?', 
'The HAVING clause is used to filter records after aggregation/grouping, whereas the WHERE clause filters rows before aggregation.',
'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
'Generating departmental salary summaries, sales aggregates, and analytics queries.', 1);
SET @q_db1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_db1, 'A', 'WHERE', FALSE),
(@q_db1, 'B', 'HAVING', TRUE),
(@q_db1, 'C', 'ORDER BY', FALSE),
(@q_db1, 'D', 'FILTER', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'DBMS', 'MEDIUM', 'Which ACID property ensures that the concurrent execution of transactions results in a system state that would be obtained if transactions were executed sequentially?', 
'Isolation guarantees that concurrent transactions do not interfere with each other and are isolated from uncommitted state changes.',
'Two users transferring money simultaneously from Account A are prevented from creating a double-spending race condition via isolation levels.',
'Banking transaction engines, inventory checkout systems, and reservation platforms.', 1);
SET @q_db2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_db2, 'A', 'Atomicity', FALSE),
(@q_db2, 'B', 'Consistency', FALSE),
(@q_db2, 'C', 'Isolation', TRUE),
(@q_db2, 'D', 'Durability', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'DBMS', 'HARD', 'What is the primary difference between a Clustered Index and a Non-Clustered Index in relational databases like MySQL (InnoDB)?', 
'A Clustered Index physically orders the actual table data rows on disk (leaf nodes contain the table data rows, usually based on the Primary Key), while a Non-Clustered Index stores index keys with pointers to the data rows.',
'In InnoDB, the Primary Key forms the clustered index B+Tree where data is stored. Secondary indexes contain the indexed column and the primary key value.',
'Query optimization, database performance tuning, and designing fast range-scan lookups.', 1);
SET @q_db3 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_db3, 'A', 'A table can have multiple clustered indexes but only one non-clustered index', FALSE),
(@q_db3, 'B', 'A clustered index physically sorts table rows on disk, while a non-clustered index stores pointers to rows', TRUE),
(@q_db3, 'C', 'Non-clustered indexes are stored in RAM while clustered indexes are stored on disk only', FALSE),
(@q_db3, 'D', 'Clustered indexes cannot be created on primary keys', FALSE);

-- Operating Systems Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Operating Systems', 'EASY', 'Which CPU scheduling algorithm gives the lowest average waiting time for a given set of processes?', 
'Shortest Job First (SJF) / Shortest Remaining Time First (SRTF) is mathematically provably optimal in minimizing average waiting time.',
'If P1 (8ms), P2 (4ms), P3 (2ms) arrive at t=0, scheduling P3 -> P2 -> P1 gives waiting times (0 + 2 + 6)/3 = 2.67ms compared to FCFS (0 + 8 + 12)/3 = 6.67ms.',
'Batch operating systems, job dispatchers, and print queues.', 1);
SET @q_os1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_os1, 'A', 'First-Come, First-Served (FCFS)', FALSE),
(@q_os1, 'B', 'Shortest Job First (SJF)', TRUE),
(@q_os1, 'C', 'Round Robin (RR)', FALSE),
(@q_os1, 'D', 'Priority Scheduling', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Operating Systems', 'MEDIUM', 'What is "Thrashing" in an operating system virtual memory management system?', 
'Thrashing occurs when the CPU spends significantly more time swapping virtual memory pages into and out of disk than executing user instructions due to insufficient physical frames.',
'When 10 heavy apps run on 4GB RAM, the OS constantly page-faults, causing CPU utilization to plummet to near zero.',
'Server capacity sizing, memory allocation profiling, and container memory limit configuration.', 1);
SET @q_os2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_os2, 'A', 'The CPU running at maximum thermal clock speed', FALSE),
(@q_os2, 'B', 'The OS spending most of its time swapping pages in/out of disk due to high page fault frequency', TRUE),
(@q_os2, 'C', 'A hardware deadlock between GPU and CPU cache buses', FALSE),
(@q_os2, 'D', 'Excessive fragmentation inside the kernel file allocation table', FALSE);

-- Computer Networks Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Computer Networks', 'EASY', 'Which layer of the OSI reference model is responsible for end-to-end reliability, flow control, and error recovery via TCP?', 
'The Transport Layer (Layer 4) manages point-to-point data transmission between end hosts using protocols like TCP and UDP.',
'TCP handshake, packet sequence numbering, acknowledgment packets (ACK), and window size flow control.',
'Web browsers, REST APIs, streaming video protocols, and socket programming.', 1);
SET @q_cn1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_cn1, 'A', 'Network Layer', FALSE),
(@q_cn1, 'B', 'Transport Layer', TRUE),
(@q_cn1, 'C', 'Data Link Layer', FALSE),
(@q_cn1, 'D', 'Session Layer', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'Computer Networks', 'HARD', 'How does the TCP 3-Way Handshake establish a reliable connection between client and server?', 
'1. Client sends SYN (seq=x). 2. Server replies with SYN-ACK (seq=y, ack=x+1). 3. Client sends ACK (seq=x+1, ack=y+1). This synchronizes sequence numbers and allocates buffers.',
'When connecting to https://google.com, browser and server complete SYN -> SYN-ACK -> ACK before TLS handshake and HTTP data transmission.',
'Network packet analysis (Wireshark), firewall rule configuration, and socket API development.', 1);
SET @q_cn2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_cn2, 'A', 'Client sends ACK, Server sends SYN, Client sends FIN', FALSE),
(@q_cn2, 'B', 'Client sends SYN, Server sends SYN-ACK, Client sends ACK', TRUE),
(@q_cn2, 'C', 'Server broadcasts UDP ping, Client sends IP handshake', FALSE),
(@q_cn2, 'D', 'Client sends RST, Server sends ACK, Client sends DATA', FALSE);

-- Data Structures & Algorithms
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'DSA', 'EASY', 'Which data structure follows the Last-In, First-Out (LIFO) principle and is commonly used for function call stacks?', 
'A Stack follows LIFO ordering where elements are pushed and popped from the top of the stack.',
'Web browser back button history, text editor Undo/Redo, and recursion call stack management.',
'Call stack frames, syntax expression parsing (balanced parentheses), and depth-first search (DFS).', 1);
SET @q_dsa1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_dsa1, 'A', 'Queue', FALSE),
(@q_dsa1, 'B', 'Stack', TRUE),
(@q_dsa1, 'C', 'Heap', FALSE),
(@q_dsa1, 'D', 'Hash Table', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('CORE_CS_TECHNICAL', 'DSA', 'HARD', 'What is the time complexity of finding the shortest path from a single source to all vertices in a weighted graph with non-negative edge weights using Dijkstra''s algorithm with a Min-Heap / Priority Queue?', 
'With V vertices and E edges, using a Min-Heap yields O((V + E) log V) time complexity as each edge relaxation takes O(log V) priority queue decrease-key operations.',
'Finding the quickest route from City A to all other cities on a roadmap with road distance weights.',
'GPS navigation systems (Google Maps), OSPF routing protocol in networking, and game AI pathfinding.', 1);
SET @q_dsa2 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_dsa2, 'A', 'O(V^3)', FALSE),
(@q_dsa2, 'B', 'O((V + E) log V)', TRUE),
(@q_dsa2, 'C', 'O(V * E)', FALSE),
(@q_dsa2, 'D', 'O(E^2)', FALSE);

-- Aptitude & Reasoning Questions
INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('QUANTITATIVE_APTITUDE', 'Aptitude', 'EASY', 'A train 180 meters long is traveling at 54 km/h. How many seconds will it take to pass a stationary telegraph post?', 
'Speed = 54 * (5/18) = 15 m/s. Distance to cross post = length of train = 180m. Time = Distance / Speed = 180 / 15 = 12 seconds.',
'180 meters / 15 meters per second = 12 seconds.',
'Campus placement quantitative screening, velocity calculations, and relative speed physics.', 1);
SET @q_apt1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_apt1, 'A', '10 seconds', FALSE),
(@q_apt1, 'B', '12 seconds', TRUE),
(@q_apt1, 'C', '15 seconds', FALSE),
(@q_apt1, 'D', '18 seconds', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('LOGICAL_REASONING', 'Logical Reasoning', 'EASY', 'Pointing to a photograph of a boy, Suresh said, "He is the only son of my mother''s only daughter." How is Suresh related to that boy?', 
'Suresh''s mother''s only daughter is Suresh''s sister. The boy is the only son of Suresh''s sister. Therefore, Suresh is the maternal uncle of the boy.',
'Mother''s daughter = Sister. Sister''s son = Nephew to Suresh (Suresh is Maternal Uncle).',
'Aptitude test blood relations, logical graph hierarchy traversal.', 1);
SET @q_lr1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_lr1, 'A', 'Father', FALSE),
(@q_lr1, 'B', 'Maternal Uncle', TRUE),
(@q_lr1, 'C', 'Brother', FALSE),
(@q_lr1, 'D', 'Cousin', FALSE);

INSERT INTO questions (category, topic, difficulty, question_text, explanation, example, use_case, marks) VALUES
('VERBAL_ABILITY', 'Verbal Ability', 'EASY', 'Identify the correct idiom meaning: "To burn the midnight oil"', 
'The idiom "to burn the midnight oil" means to work or study late into the night.',
'During final placement exams, students burn the midnight oil to solve Data Structures problems.',
'Communication and workplace terminology assessment.', 1);
SET @q_va1 = LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_label, option_text, is_correct) VALUES
(@q_va1, 'A', 'To waste valuable fuel and electricity', FALSE),
(@q_va1, 'B', 'To work or study late into the night', TRUE),
(@q_va1, 'C', 'To cause an accidental kitchen fire', FALSE),
(@q_va1, 'D', 'To wake up before sunrise', FALSE);
