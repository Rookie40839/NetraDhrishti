# NetraDhrishti: Complete Specification Alignment Walkthrough

The NetraDhrishti system has been updated and fully aligned with the official specification documents:
- `Backend_Specification_MPLADS.docx`
- `UI_Specification_MPLADS.docx`
- `System_Design_SIH_Revision2.docx`
*(Reference: [`uiandbackendspec.md`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/uiandbackendspec.md))*

---

## 1. Accomplishments Overview

### Phase 1: ML Engine Fixes
- **File**: [`feature_engine.py`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/ml/features/feature_engine.py)
- **Resolved**:
  - `payment_delay_days`: Computes delay between completion and final payment.
  - `closure_delay_days`: Computes delay between completion and handover / marking.
  - `agency_district_share`: Computes agency's market share within specific district.
  - `agency_avg_delay` and `agency_high_risk_pct`: Computes agency track record.
  - `physical_progress`: Retrieves latest progress from `work_progress` table before applying fallback.

---

### Phase 2 & 3: Spring Boot Backend
- **Dependencies**: Added `spring-boot-starter-security` and `io.jsonwebtoken:jjwt` (0.12.6).
- **Security & Authentication**:
  - [`SecurityConfig.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/config/SecurityConfig.java): CORS origin filtering, BCrypt password encoder, stateless JWT filter chain.
  - [`JwtUtil.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/security/JwtUtil.java): 256-bit token signing, claims extraction (`userId`, `role`, `constituencyId`, `districtId`, `stateId`).
  - [`JwtAuthenticationFilter.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/security/JwtAuthenticationFilter.java): Bearer token validator.
  - [`CustomUserDetailsService.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/security/CustomUserDetailsService.java): User loading from `users` table.
  - [`AuthController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/AuthController.java): `POST /api/auth/login`, `GET /api/auth/me`.
- **Complete Entity-Repository Layer (14 pairs)**:
  - [`Work.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/Work.java) & [`WorkRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/WorkRepository.java): Mapped all ~30 columns + `JpaSpecificationExecutor` for dynamic multi-criteria filtering.
  - [`RiskScore.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/RiskScore.java) & [`RiskScoreRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/RiskScoreRepository.java): Impact score, priority score, 5 sub-scores, reason codes.
  - [`Inspection.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/Inspection.java) & [`InspectionRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/InspectionRepository.java): Aligned with DB schema.
  - [`ComplianceFlag.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/ComplianceFlag.java) & [`ComplianceFlagRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/ComplianceFlagRepository.java): Triggered flag, evidence, observed/expected values.
  - [`User.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/User.java) & [`UserRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/UserRepository.java)
  - [`FundRelease.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/FundRelease.java) & [`FundReleaseRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/FundReleaseRepository.java)
  - [`WorkProgress.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/WorkProgress.java) & [`WorkProgressRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/WorkProgressRepository.java)
  - [`DataQualityResult.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/DataQualityResult.java) & [`DataQualityResultRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/DataQualityResultRepository.java)
  - [`DetectionResult.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/DetectionResult.java) & [`DetectionResultRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/DetectionResultRepository.java)
  - [`DuplicateCandidate.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/DuplicateCandidate.java) & [`DuplicateCandidateRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/DuplicateCandidateRepository.java)
  - [`FundAnomaly.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/FundAnomaly.java) & [`FundAnomalyRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/FundAnomalyRepository.java)
  - [`ComplianceRule.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/ComplianceRule.java) & [`ComplianceRuleRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/ComplianceRuleRepository.java)
  - [`AuditLog.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/AuditLog.java) & [`AuditLogRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/AuditLogRepository.java)
  - [`RiskWeight.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/models/RiskWeight.java) & [`RiskWeightRepository.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/repositories/RiskWeightRepository.java)
- **REST API Controllers**:
  - [`WorksController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/WorksController.java): `/api/works` (pagination, multi-parameter filtering, sorting, search), `/api/works/{id}/details` (comprehensive 8-part dossier), `/api/works/filters`.
  - [`DashboardController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/DashboardController.java): `/api/dashboard/stats` (4 KPIs + scope filtering), `/api/dashboard/risk-distribution`, `/api/dashboard/top-priority`, `/api/dashboard/flagging-reasons`.
  - [`InspectionController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/InspectionController.java): `/api/inspections/priority` (priority rank queue), `POST /api/inspections`, `PUT /api/inspections/{id}`.
  - [`DuplicatesController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/DuplicatesController.java): Candidate matches and status update workflow.
  - [`DataQualityController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/DataQualityController.java): Completeness score and issue breakdown.
  - [`AuditLogController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/AuditLogController.java): Paginated audit history.
  - [`SettingsController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/SettingsController.java): Dynamic risk weights configuration with sum validation.
  - [`AnalyticsController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/AnalyticsController.java): District, MP, and agency performance analytics.
  - [`ComplianceController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/ComplianceController.java): 15 rules with live flagged counts.
  - [`ReportsController.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/controllers/ReportsController.java): Live report preview and RFC 4180 CSV export.
  - [`AuditLogService.java`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/backend/src/main/java/com/netradhrishti/api/services/AuditLogService.java): Centralized logging for all write operations.

---

### Phase 4: React UI & Design System
- **State & Service Layer**:
  - [`api.js`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/services/api.js): Axios client with Bearer JWT interceptor and 401 handling.
  - [`AuthContext.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/context/AuthContext.jsx): Persona switching, scope management, login/logout.
- **Global Layout**:
  - [`Header.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/components/Header.jsx): Government portal header with national banner, navigation links, quick persona switcher (District Officer, MP, State Admin, MoSPI Admin), and utility shortcuts.
  - [`Footer.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/components/Footer.jsx): Advisory disclaimer and guideline citations.
- **Pages**:
  - [`Login.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/Login.jsx): Formal credentials form + 1-click role test switches.
  - [`DashboardPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/DashboardPage.jsx): 4 KPI cards, risk distribution chart, primary anomaly drivers, top priority inspection table, and advisory banner.
  - [`WorksExplorer.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/WorksExplorer.jsx): Multi-parameter collapsible filter drawer, instant search, server pagination, sortable columns.
  - [`WorkDetailPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/WorkDetailPage.jsx): 8 spec sections (Risk Card, Data Confidence, Why Flagged, 8-Stage Lifecycle Timeline, Fund Flow & Tranches, Duplicates, Review History, and Officer Review Modal).
  - [`InspectionsPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/InspectionsPage.jsx): Priority rank queue with Critical, High, Pending, and Completed review tabs.
  - [`ComplianceCentre.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/ComplianceCentre.jsx): 15 official MPLADS 2023 rule cards with live flagged work counts and drill-down inspection.
  - [`RiskIntelligence.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/RiskIntelligence.jsx): Risk distribution clustering.
  - [`AgencyIntelligence.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/AgencyIntelligence.jsx): Agency leaderboard with delay and risk metrics.
  - [`DuplicatesPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/DuplicatesPage.jsx): Duplicate candidates inspection with disposition actions.
  - [`DistrictAnalytics.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/DistrictAnalytics.jsx): District and Parliamentary constituency comparative performance.
  - [`DataQualityPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/DataQualityPage.jsx): Data completeness gauge and deficiency breakdown.
  - [`AuditLogPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/AuditLogPage.jsx): Immutable system audit trail.
  - [`SettingsPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/SettingsPage.jsx): Dynamic risk scoring weight calibration with 100% sum verification.
  - [`ReportsPage.jsx`](file:///c:/Users/Shrit/OneDrive/Desktop/CODING/VS%20CODE/.vscode/NetraDhrishti/frontend/src/pages/ReportsPage.jsx): Audit briefs generator with live preview and CSV export.

---

## 2. Verification Results

### Backend Build Verification
```powershell
.\mvnw.cmd compile
[INFO] Compiling 45 source files with javac to target\classes
[INFO] BUILD SUCCESS
[INFO] Total time: 5.563 s
```

### Frontend Build Verification
```bash
npm run build
vite v8.2.2 building client environment for production...
✓ 1929 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-BwJkC_gu.css   43.20 kB
dist/assets/index-CPmcJkQw.js   408.54 kB
✓ built in 654ms
```

---

## 3. How to Run Locally

### Start Spring Boot Backend:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
Backend will start on `http://localhost:8080`.

### Start React Frontend:
```powershell
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`.
You can use the **Switch Persona** dropdown in the top navigation bar to seamlessly test the application from the perspective of a **District Officer**, **Member of Parliament**, **State Admin**, or **MoSPI Admin**.
