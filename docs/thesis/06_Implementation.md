# Chapter 6: Implementation Details

## 6.1 Backend Module Breakdown
The backend architecture is partitioned into cohesive domain modules:
* `com.hiresense.modules.auth`: Stateless JWT authentication (HS256), refresh token rotation, and Role-Based Access Control (`ROLE_STUDENT`, `ROLE_PLACEMENT_OFFICER`, `ROLE_ADMIN`).
* `com.hiresense.modules.profile`: Student academic profiles, target preparation companies, and benchmark configurations.
* `com.hiresense.modules.assessment`: Timed diagnostic MCQ test engine, server-authoritative timer expiration, and topic-level analytics.
* `com.hiresense.modules.resume`: Apache PDFBox text extraction, PII masking, and ATS parsability diagnostics.
* `com.hiresense.modules.interview`: Turn-by-turn conversational AI simulation, rubric grading, and comprehensive report generation.
* `com.hiresense.modules.intelligence`: Deterministic Placement Readiness Score (PRS), multi-source skill gap analyzer, adaptive roadmap generator, and longitudinal snapshot logger.
* `com.hiresense.modules.platform`: Unified dashboard aggregator, in-app alert notifications, broadcast announcements, target roles catalog, and audit logging.
* `com.hiresense.modules.assistant`: Contextual AI Career Assistant advisor.
