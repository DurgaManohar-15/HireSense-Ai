# Chapter 5: System Architecture

## 5.1 Architecture Overview
HireSense AI is implemented as a secure, high-cohesion **Modular Monolith** comprising:
* **Presentation Tier:** React 18 SPA (Vite, Tailwind CSS, Lucide icons) served via Nginx with client-side SPA history routing.
* **Application Tier:** Spring Boot 3.3.5 running on Java 17/21 (Spring Security, Spring Data JPA, Spring Validation).
* **Intelligence Layer:** Deterministic scoring calculators, skill gap analyzers, adaptive roadmap schedulers, and `AIServiceRouter` (Mock AI & Google Gemini 1.5 Flash).
* **Data Tier:** MySQL 8.0 with versioned database migrations managed by Flyway (`V1` to `V6`).
* **Containerization Tier:** Multi-stage Docker containers orchestrated via `docker-compose.yml`.

## 5.2 Key Design Patterns
* **Router & Strategy Pattern:** `AIServiceRouter` dynamically routes requests between `MockAIService` (offline deterministic) and `GeminiAIService` (live LLM).
* **Builder & DTO Pattern:** Strict encapsulation separating database JPA entities from user-facing REST DTOs.
* **Audit Interceptor Pattern:** Administrative actions and research dataset exports are logged to immutable audit tables.
