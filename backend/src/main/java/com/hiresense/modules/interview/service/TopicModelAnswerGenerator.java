package com.hiresense.modules.interview.service;

import com.hiresense.modules.interview.model.InterviewDifficulty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TopicModelAnswerGenerator {

    public static class ModelAnswerResult {
        public final String modelAnswer;
        public final String practicalExample;
        public final List<String> keyTakeaways;

        public ModelAnswerResult(String modelAnswer, String practicalExample, List<String> keyTakeaways) {
            this.modelAnswer = modelAnswer;
            this.practicalExample = practicalExample;
            this.keyTakeaways = keyTakeaways;
        }
    }

    public ModelAnswerResult generate(String topic, String questionText, InterviewDifficulty diff) {
        String t = topic != null ? topic.toLowerCase().trim() : "";
        String q = questionText != null ? questionText.toLowerCase().trim() : "";

        // 1. HTML & CSS
        if (t.contains("html") || t.contains("css") || t.contains("web") || t.contains("frontend") || q.contains("html") || q.contains("css")) {
            if (q.contains("advantage") || q.contains("use case") || q.contains("feature")) {
                return new ModelAnswerResult(
                        "HTML and CSS provide the foundation of modern web development. HTML structures content semantically (headers, sections, articles, forms), while CSS handles styling, layout positioning, animations, and responsive adaptability across mobile and desktop devices. Modern CSS features like Flexbox and CSS Grid allow developers to create fluid, responsive layouts without relying on complex table structures or floats.",
                        """
                        /* Modern Responsive Card Layout using CSS Grid & Flexbox */
                        .card-grid {
                          display: grid;
                          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                          gap: 1.5rem;
                          padding: 1rem;
                        }
                        
                        .card {
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                          background: #ffffff;
                          border-radius: 12px;
                          padding: 1.25rem;
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        }
                        """,
                        List.of(
                                "HTML provides semantic document structure, improving accessibility and SEO.",
                                "CSS Grid is best for 2D multi-row layouts; Flexbox is best for 1D single-axis alignment.",
                                "Media queries (@media) and clamp() functions enable mobile-first responsive design."
                        )
                );
            } else if (q.contains("data type") || q.contains("interface") || q.contains("building block")) {
                return new ModelAnswerResult(
                        "The primary building blocks of HTML are semantic elements like <header>, <nav>, <main>, <section>, <article>, <aside>, and <footer>, as well as form inputs. The fundamental building blocks of CSS are the CSS Box Model (Content, Padding, Border, Margin), Selectors (class, id, attribute, pseudo-classes), and Display Modes (block, inline, inline-block, flex, grid).",
                        """
                        <!-- Semantic HTML5 Document Structure -->
                        <header>
                          <nav class="navbar">
                            <a href="/" class="logo">HireSense</a>
                          </nav>
                        </header>
                        <main class="content-container">
                          <section class="interview-panel">
                            <h1>Mock Interview Preparation</h1>
                            <p>Practice placement questions with real-time AI scoring.</p>
                          </section>
                        </main>
                        """,
                        List.of(
                                "Every HTML element is rendered according to the Box Model (Margin > Border > Padding > Content).",
                                "box-sizing: border-box ensures padding and border are included in total element width.",
                                "Semantic tags help screen readers, web crawlers, and future maintainers navigate the DOM."
                        )
                );
            } else {
                return new ModelAnswerResult(
                        "HTML (HyperText Markup Language) defines the semantic skeleton and structure of a webpage, while CSS (Cascading Style Sheets) specifies the visual design, typography, spacing, and layout. In standard web workflows, browsers parse HTML into the DOM (Document Object Model) and CSS into the CSSOM, combining them to render the visual webpage.",
                        """
                        <!-- Basic HTML with Embedded CSS Classes -->
                        <div class="user-badge">
                          <span class="status-dot"></span>
                          <span class="username">Alex Mercer</span>
                        </div>
                        
                        <style>
                          .user-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            padding: 6px 12px;
                            background: #f1f5f9;
                            border-radius: 9999px;
                          }
                          .status-dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background-color: #22c55e;
                          }
                        </style>
                        """,
                        List.of(
                                "HTML provides semantic meaning; CSS provides presentation.",
                                "Always link stylesheets using <link rel='stylesheet' href='style.css'> in the <head>.",
                                "Use CSS custom properties (--primary-color: #4f46e5;) for unified design tokens."
                        )
                );
            }
        }

        // 2. Java & OOP
        if (t.contains("java") || t.contains("oop") || t.contains("object") || q.contains("java") || q.contains("oop")) {
            if (q.contains("concurrency") || q.contains("thread") || q.contains("lock") || q.contains("bottleneck")) {
                return new ModelAnswerResult(
                        "In Java, multi-threading and concurrency are managed using the java.util.concurrent package, synchronized blocks, and atomic primitives. Thread safety is achieved by ensuring shared mutable state is protected with locks (ReentrantLock), synchronized blocks, or lock-free constructs (AtomicInteger, ConcurrentHashMap). The Java Memory Model guarantees visibility through the 'volatile' keyword and establishes happens-before relationships.",
                        """
                        // Thread-Safe Singleton / Resource Pool Example
                        import java.util.concurrent.ConcurrentHashMap;
                        import java.util.concurrent.atomic.AtomicInteger;
                        
                        public class InterviewMetricsTracker {
                            private final ConcurrentHashMap<String, AtomicInteger> scoreCounts = new ConcurrentHashMap<>();
                        
                            public void recordAttempt(String topic) {
                                scoreCounts.computeIfAbsent(topic, k -> new AtomicInteger(0)).incrementAndGet();
                            }
                        }
                        """,
                        List.of(
                                "ConcurrentHashMap uses segmented bucket locks rather than whole-table locking for high throughput.",
                                "'volatile' guarantees memory visibility across CPU caches but does not provide atomicity for compound operations (e.g. count++).",
                                "Prefer ExecutorService and CompletableFuture over manually creating raw Thread instances."
                        )
                );
            } else if (q.contains("error") || q.contains("exception") || q.contains("validation")) {
                return new ModelAnswerResult(
                        "Java divides exceptions into Checked Exceptions (which extend Exception and must be handled at compile-time with try-catch or 'throws') and Unchecked Exceptions (which extend RuntimeException and indicate programming errors like NullPointerException). Modern Java utilizes try-with-resources to automatically close AutoCloseable resources (database connections, file streams), preventing resource leaks.",
                        """
                        // Try-With-Resources and Custom Business Exception
                        public class UserService {
                            public User findUserById(Long id) {
                                if (id == null || id <= 0) {
                                    throw new IllegalArgumentException("User ID must be a positive integer.");
                                }
                                return userRepository.findById(id)
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
                            }
                        }
                        """,
                        List.of(
                                "Always use try-with-resources for streams, database connections, and sockets to guarantee resource release.",
                                "Catch specific exceptions rather than generic Exception or Throwable.",
                                "Create custom domain exceptions (e.g. ResourceNotFoundException) for clean API error reporting."
                        )
                );
            } else {
                return new ModelAnswerResult(
                        "Java is an object-oriented programming language centered around four fundamental OOP principles: Encapsulation (restricting direct variable access via private fields with public getters/setters), Abstraction (hiding implementation complexity through interfaces and abstract classes), Inheritance (inheriting properties and methods via 'extends'), and Polymorphism (method overriding for runtime dynamic dispatch and method overloading for compile-time flexibility).",
                        """
                        // Core Java OOP Example (Polymorphism & Encapsulation)
                        public interface AssessmentEvaluator {
                            int evaluateScore(String response);
                        }
                        
                        public class TechnicalEvaluator implements AssessmentEvaluator {
                            private final int baselineWeight; // Encapsulation
                        
                            public TechnicalEvaluator(int weight) {
                                this.baselineWeight = weight;
                            }
                        
                            @Override
                            public int evaluateScore(String response) {
                                return response != null && !response.isBlank() ? baselineWeight + 10 : 0;
                            }
                        }
                        """,
                        List.of(
                                "Encapsulation protects object state and enforces domain validation rules.",
                                "Interfaces define behavioral contracts, allowing loose coupling and easy unit testing/mocking.",
                                "Favor composition over inheritance for flexible, modular software architectures."
                        )
                );
            }
        }

        // 3. Spring Boot & Microservices
        if (t.contains("spring") || t.contains("microservice") || t.contains("rest") || q.contains("spring")) {
            return new ModelAnswerResult(
                    "Spring Boot simplifies enterprise Java applications through Dependency Injection (IoC Container), Autoconfiguration (@EnableAutoConfiguration), and Embedded Servers (Tomcat). Controllers handle HTTP routing (@RestController, @GetMapping, @PostMapping), Services contain business logic (@Service), and Repositories handle database interactions (@Repository with Spring Data JPA). Transactions are declaratively managed using @Transactional.",
                    """
                    // Spring Boot REST Controller & Service Example
                    @RestController
                    @RequestMapping("/api/v1/interviews")
                    @RequiredArgsConstructor
                    public class InterviewController {
                        private final InterviewService interviewService;
                    
                        @PostMapping
                        public ResponseEntity<InterviewDto> createSession(@Valid @RequestBody StartRequest req) {
                            InterviewDto session = interviewService.startSession(req);
                            return ResponseEntity.status(HttpStatus.CREATED).body(session);
                        }
                    }
                    """,
                    List.of(
                    "Dependency Injection via constructor injection ensures immutable, testable components.",
                    "@Transactional manages commit and rollback boundaries automatically across database operations.",
                    "Use DTOs (Data Transfer Objects) to separate external API contracts from internal JPA database entities."
                    )
            );
        }

        // 4. SQL & Databases
        if (t.contains("sql") || t.contains("database") || t.contains("query") || t.contains("index") || q.contains("sql")) {
            return new ModelAnswerResult(
                    "Relational databases (RDBMS) organize data into structured tables with primary and foreign keys to ensure ACID properties (Atomicity, Consistency, Isolation, Durability). B-Tree indexes speed up SELECT queries by reducing disk I/O from full table scans O(N) to logarithmic lookups O(log N). Database normalization (1NF, 2NF, 3NF) minimizes redundant data and update anomalies.",
                    """
                    -- SQL Index Creation and Optimized Query
                    CREATE INDEX idx_student_topic ON interviews(user_id, topic, status);
                    
                    SELECT i.id, i.topic, i.overall_score, i.started_at
                    FROM interviews i
                    WHERE i.user_id = 101 AND i.status = 'COMPLETED'
                    ORDER BY i.started_at DESC
                    LIMIT 10;
                    """,
                    List.of(
                            "Indexes speed up reads but add write overhead on INSERT, UPDATE, and DELETE operations.",
                            "Use composite indexes where column order matches the WHERE and ORDER BY clauses (Leftmost Prefix Rule).",
                            "Always use parameterized queries or PreparedStatements to prevent SQL injection vulnerabilities."
                    )
            );
        }

        // 5. Data Structures & Algorithms
        if (t.contains("tree") || t.contains("graph") || t.contains("dsa") || t.contains("algorithm") || t.contains("sort") || q.contains("algorithm")) {
            return new ModelAnswerResult(
                    "Data structures provide organized ways to store and retrieve data efficiently. Arrays and HashMaps provide O(1) average lookup times, Binary Search Trees provide O(log N) operations when balanced, and Graphs model pairwise relationships using Breadth-First Search (BFS for shortest path) and Depth-First Search (DFS for cycle detection and topological sorting).",
                    """
                    // Binary Tree In-Order Traversal Example (Left -> Root -> Right)
                    class TreeNode {
                        int val;
                        TreeNode left, right;
                        TreeNode(int val) { this.val = val; }
                    }
                    
                    public void inOrder(TreeNode root, List<Integer> result) {
                        if (root == null) return;
                        inOrder(root.left, result);
                        result.add(root.val);
                        inOrder(root.right, result);
                    }
                    """,
                    List.of(
                            "Always analyze and state Time Complexity (Big-O) and Auxiliary Space Complexity upfront.",
                            "Use HashMaps for fast key-value lookups; use Two-Pointer / Sliding Window for contiguous subarray problems.",
                            "Recursion requires O(H) call stack memory where H is the height of the recursion tree."
                    )
            );
        }

        String effectiveTopicName = topic != null && !topic.isBlank() ? topic : "the target technology";
        return new ModelAnswerResult(
                String.format(
                        "When working with %s in software engineering, the core objective is to build modular, maintainable, and scalable solutions. Candidates should define the foundational purpose of %s, explain how it integrates into production systems, discuss trade-offs (performance vs complexity), and follow standard industry design patterns.",
                        effectiveTopicName,
                        effectiveTopicName
                ),
                String.format(
                        """
                        // Practical Implementation Pattern for %s
                        public class %sHandler {
                            public boolean process() {
                                // 1. Input validation & boundary checks
                                // 2. Core business execution & state management
                                // 3. Structured logging and error recovery
                                return true;
                            }
                        }
                        """,
                        cleanIdentifier(topic),
                        cleanIdentifier(topic)
                ),
                List.of(
                        "Structure your interview answer: Concept Definition -> Architecture & Trade-offs -> Concrete Example.",
                        "Always discuss error handling, security, and edge-case resilience.",
                        "Highlight how this technology improves development velocity or system scalability in production."
                )
        );
    }

    private String cleanIdentifier(String topic) {
        if (topic == null || topic.isBlank()) return "Service";
        String clean = topic.replaceAll("[^a-zA-Z0-9]", "");
        if (clean.isEmpty()) return "Module";
        return Character.toUpperCase(clean.charAt(0)) + (clean.length() > 1 ? clean.substring(1) : "");
    }
}
