# HireSense AI

**Proposed Title:** *HireSense AI: An AI-Driven Personalized Placement Readiness Assessment and Career Guidance Platform*  
**Architecture:** Modular Monolith (Spring Boot 3.3.5, React 18, Tailwind CSS, MySQL 8.0, Flyway Migrations V1–V6, Docker)  

---

## 1. Project Overview

**HireSense AI** is an enterprise-grade placement readiness intelligence platform designed for engineering students, faculty placement cells, and institutional placement officers.

Unlike generic chatbots or static quiz apps, HireSense AI implements a **deterministic Placement Readiness Score (PRS)**, multi-source evidence calibration, and an adaptive roadmap generator.

### Key Capabilities:
* **Explainable Placement Readiness Score (PRS):** Deterministic weighted scoring ($0 - 100$) across Coding, Technical Knowledge, Aptitude, Resume ATS Fit, Mock Interview, and Communication.
* **Assessment Confidence Index:** Quantitative metric ($0 - 100\%$) indicating evidence coverage and recency.
* **Multi-Source Skill Gap Analyzer:** Calibrates demonstrated abilities against configured target company benchmarks.
* **Personalized Adaptive Preparation Roadmap:** Day-by-day customized study schedule with interactive completion tracking.
* **AI Mock Interview Simulation:** Turn-by-turn interactive technical and HR dialogue with rubric-based evaluation.
* **AI Resume Diagnostic Engine:** ATS parsability, skill depth scoring, and action verb impact analysis.
* **Contextual AI Career Assistant:** Data-grounded career advisor citing real student metrics.
* **Placement Officer & Admin Analytics:** Institutional cohort readiness distribution, common skill gap heatmaps, and sanitized research CSV exports.
* **Academic Thesis Infrastructure:** Automated calculation of Normalized Learning Gain ($g$) and Cohen's $d$ effect sizes.

---

## 2. Technology Stack

* **Backend:** Java 17/21, Spring Boot 3.3.5 (Spring Security, Spring Data JPA, Spring Validation)
* **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide Icons, Axios
* **Database:** MySQL 8.0 with Flyway schema migration versioning (`V1` to `V6`)
* **AI Engines:** Dual-Provider Architecture (`MockAIService` for offline simulation; `GeminiAIService` for Google Gemini 1.5 Flash)
* **Containerization:** Multi-stage Docker builds with Docker Compose orchestration
* **Security:** Stateless JWT authentication (HS256), BCrypt (cost factor 12), IDOR guards, and RBAC

---

## 3. Quick Start (One-Command Docker Deployment)

### Prerequisites:
* Docker Engine 20.10+ & Docker Compose v2+

### Step-by-Step Execution:
```bash
# 1. Clone repository
git clone https://github.com/your-username/HireSense-AI.git
cd HireSense-AI

# 2. Copy environment template
cp .env.example .env

# 3. Launch full-stack environment
docker compose up --build -d
```

### Access Points:
* **Student & Admin Web Portal:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
* **Actuator Health Endpoint:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 4. Local Development Setup

### Backend (Spring Boot):
```powershell
cd backend
$env:PATH = "C:\Users\Durga_4sd6kye\maven\apache-maven-3.9.9\bin;" + $env:PATH
mvn clean test
mvn spring-boot:run
```

### Frontend (React / Vite):
```powershell
cd frontend
npm install
npm run dev
```

---

## 5. Dual-Mode AI Configuration

HireSense AI supports two operational modes:

### Mode A: Mock AI Mode (Default / Offline)
* **Configuration:** `AI_PROVIDER=mock`
* **Behavior:** Deterministic, zero-cloud-cost simulation of resume diagnostics, mock interview turns, and career assistant recommendations.
* **Use Case:** Local development, offline viva presentations, and continuous integration testing.

### Mode B: Google Gemini Cloud AI Mode
* **Configuration:**
  ```env
  AI_PROVIDER=gemini
  GEMINI_API_KEY=your_actual_gemini_api_key
  GEMINI_MODEL=gemini-1.5-flash
  ```
* **Behavior:** Live cloud LLM evaluation with exponential backoff and timeout protection.

---

## 6. Automated Test Suite

Execute all 35 unit and integration tests:
```powershell
cd backend
mvn clean test
```

Execute frontend production build:
```powershell
cd frontend
npm run build
```

---

## 7. Thesis Documentation Suite

Complete academic thesis documentation is available in [`docs/thesis/`](docs/thesis/):
* `01_Introduction.md`
* `02_Literature_Review.md`
* `03_Problem_Statement.md`
* `04_Proposed_Methodology.md`
* `05_System_Architecture.md`
* `06_Implementation.md`
* `07_Evaluation_Methodology.md`
* `08_Results_Template.md`
* `09_Limitations.md`
* `10_Future_Work.md`
