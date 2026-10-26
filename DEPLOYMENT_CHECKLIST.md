# HireSense AI — Production Deployment Checklist

## 1. Pre-Deployment Verification
- [x] All 35 backend automated unit and integration tests passing (`mvn clean test`).
- [x] React frontend build compiles with zero errors (`npm run build`).
- [x] Flyway migrations `V1` through `V6` execute in sequence without errors.
- [x] Environment variable template (`.env.example`) updated without committing real secrets.
- [x] Production configuration profile (`application-prod.yml`) enforces fail-fast secret checks.
- [x] CORS allowed origins configured to match the production frontend domain.
- [x] Storage directories configured with appropriate permissions.

---

## 2. Docker Deployment Procedure

### Local & Staging One-Command Startup
```powershell
# 1. Clone repository and copy environment configuration
cp .env.example .env

# 2. Edit .env with your environment values
# (Configure JWT_SECRET, INITIAL_ADMIN_PASSWORD, DB_PASSWORD)

# 3. Build and launch all multi-stage containers
docker compose up --build -d

# 4. Verify running container health
docker compose ps
```

### Access URLs
* **Frontend Application:** `http://localhost:3000`
* **Backend REST API:** `http://localhost:8080/api/v1`
* **Actuator Health Check:** `http://localhost:8080/actuator/health`

---

## 3. Database Backup & Disaster Recovery Strategy

### Automated Backup Command (MySQL Container)
```bash
# Create timestamped SQL dump
docker exec hiresense-mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" hiresense_db > backup_hiresense_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Procedure
```bash
# Restore database from SQL dump file
docker exec -i hiresense-mysql mysql -u root -p"$DB_ROOT_PASSWORD" hiresense_db < backup_hiresense_YYYYMMDD_HHMMSS.sql
```

---

## 4. Post-Deployment Verification (Smoke Testing)
- [ ] Check `GET /actuator/health` returns `{"status":"UP"}`.
- [ ] Verify administrator login at `/login` using `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`.
- [ ] Verify student registration at `/register`.
- [ ] Complete diagnostic assessment and confirm score calculation.
- [ ] Upload and analyze test PDF resume.
- [ ] Conduct 2-turn AI mock interview session.
- [ ] Trigger Placement Readiness Score recalculation and confirm snapshot persistence.
- [ ] Test AI Career Assistant chat in Mock and Gemini modes.
- [ ] Export anonymized research CSV from Admin panel and verify zero PII leakage.
