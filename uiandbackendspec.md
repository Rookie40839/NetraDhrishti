# MPLADS Intelligence – Comprehensive UI & Backend Specification  
**Version:** 1.0 (Hackathon MVP – Detailed)  
**Reference:** System Design Revision 2  
**Stack:** Python + pandas + scikit‑learn → PostgreSQL → Spring Boot + Spring Security → React  

***

## 1. Product Vision & Scope

### 1.1 Problem Context

MPLADS (Members of Parliament Local Area Development Scheme) funds numerous public works across constituencies in India. Current oversight relies heavily on manual scrutiny of sanction records, fund releases, and progress reports. This creates challenges:

- Large volume of works with limited human capacity for detailed review  
- Subtle anomalies (cost outliers, delays, duplicate works, fund-flow irregularities, compliance violations) are hard to detect systematically  
- Risk of both false accusations (if automated systems claim “fraud”) and missed issues (if oversight is purely manual)

### 1.2 Solution Vision

Build an **AI-powered risk triage and monitoring platform** that:

- Ingests MPLADS and related data (eSAKSHI, etc.)  
- Applies multiple detection engines:
  - Cost Anomaly  
  - Duplicate / Near-Duplicate  
  - Delay / Lifecycle  
  - Fund-Flow Anomaly  
  - Compliance Rules  
- Produces **explainable risk assessments**:
  - Risk Score (likelihood of issue)  
  - Impact Score (financial / programmatic consequence)  
  - Priority Score (inspection ordering metric)  
  - Reason Codes (human-readable explanations)  
  - Data Confidence (how reliable is this assessment?)  
- Provides **role-based dashboards** for:
  - MPs (constituency view)  
  - District Officers (district view, inspection workflow)  
  - State Administrators (state-level oversight)  
  - MoSPI Admins (national analytics, audit, policy insights)  
- Enables a structured **inspection and review workflow**:
  - Inspection queue  
  - Case review  
  - Decision (confirm, false positive, request more info, escalate)  
  - Audit trail of all actions  

**Key principle:** The system never declares “fraud”. It flags **works requiring verification** and supports human decision-making.

***

## 2. User Roles, Access Model & Security Principles

### 2.1 Roles

1. **MP**
   - Scope: Own constituency only  
   - Can view:
     - Works in constituency  
     - Risk summaries for those works  
     - Fund utilization for own entitlement  
     - Works requiring attention in own constituency  
   - Cannot:
     - View other constituencies  
     - Modify inspection assignments (unless also designated as district officer, which should be a separate role in practice)

2. **District Officer**
   - Scope: Own district  
   - Can view:
     - All works in district (all MPs)  
     - Risk, compliance, fund-flow, duplicates, lifecycle details  
     - Inspection queue for district  
     - Agency performance within district  
   - Can:
     - Assign inspections  
     - Record review decisions  
     - Add remarks and evidence  

3. **State Administrator**
   - Scope: Entire state  
   - Can view:
     - State-level analytics (district comparisons, MP performance, agency patterns)  
     - All works, risk, compliance, fund-flow in state  
     - Inspection status across districts  
   - Can:
     - Configure certain risk parameters (e.g., risk weights) if allowed by policy  
     - Access audit logs for state  

4. **MoSPI Administrator**
   - Scope: National  
   - Can view:
     - National analytics (state comparisons, hotspot districts/MPs)  
     - Aggregated risk, compliance, fund-flow, duplication patterns  
     - Audit logs across all states  
   - Can:
     - Configure system-wide settings (risk weights, thresholds)  
     - Export national reports  

### 2.2 Access Control Principles

- All data access is **role-based and scope-filtered**:
  - MPs: `constituency_id` filter  
  - District officers: `district_id` filter  
  - State admins: `state_id` filter  
  - MoSPI: no geographic filter (national)  
- All **write operations** (review decisions, inspection updates, risk configuration changes, compliance overrides) are:
  - Protected by Spring Security  
  - Logged in `audit_log` with:
    - Actor user ID  
    - Action type  
    - Target type & ID  
    - Details (JSON)  
    - Timestamp, IP address  

### 2.3 Security Requirements

- Authentication via JWT (or session-based, but JWT recommended for hackathon clarity).  
- Passwords stored as secure hashes (e.g., BCrypt).  
- API endpoints protected with role-based authorities (`ROLE_MP`, `ROLE_DISTRICT_OFFICER`, etc.).  
- CORS configured to allow only the React frontend origin.  
- Sensitive configuration endpoints (e.g., `/settings/risk-weights`) restricted to state_admin/mospi_admin.  

***

## 3. Comprehensive UI Specification

### 3.1 Global Navigation & Layout

**Top Navigation Bar:**

- Logo / Product Name: “MPLADS Intelligence”  
- Main Nav Items:
  - Overview (`/dashboard`)  
  - Works (`/works`)  
  - Inspections (`/inspections`)  
  - Intelligence (dropdown):
    - Risk Overview (`/intelligence/risk`)  
    - Fund Flow (`/intelligence/fund-flow`)  
    - Duplicate Works (`/intelligence/duplicates`)  
    - Agency Intelligence (`/intelligence/agencies`)  
    - District / State Analytics (`/intelligence/analytics`)  
  - Compliance (`/compliance`)  
  - Reviews (`/reviews`)  
  - Reports (`/reports`)  

**Secondary / Footer Nav:**

- Data Quality (`/data-quality`)  
- Audit Log (`/audit-log`)  
- Settings (`/settings`)  
- User profile & logout  

**Layout Principles:**

- Consistent header and sidebar (or top nav) across all pages.  
- Role-aware nav:
  - MPs see simplified nav (Overview, My Works, Reviews, Reports, Settings).  
  - District/State/MoSPI see full nav.  
- Breadcrumbs on deep pages (e.g., Works → Work Detail → Review Case).  
- Global search bar (optional advanced feature) to search by work ID, agency, MP name.

***

### 3.2 Authentication & Onboarding

#### 3.2.1 Login Page – `/login`

**Elements:**

- Email input  
- Password input  
- “Login” button  
- Error message area (invalid credentials, account inactive, etc.)  

**Behavior:**

- On successful login:
  - Store JWT token (in memory or secure httpOnly cookie, depending on implementation choice).  
  - Redirect to `/dashboard`.  
- On failure:
  - Show generic error message (do not reveal whether email or password was wrong).  

#### 3.2.2 First-Time Experience (Optional for Hackathon)

- If desired, a simple “welcome” screen after first login explaining:
  - This is a decision-support tool, not a fraud detection system.  
  - How to interpret risk scores and data confidence.  
- Can be skipped for MVP if time-constrained.

***

### 3.3 Overview Dashboard – `/dashboard`

**Purpose:** Provide an at-a-glance view of where attention is needed most.

#### 3.3.1 Header Controls

- Scope selector:
  - For MoSPI: All India / State dropdown  
  - For State Admin: State (fixed) / District dropdown  
  - For District Officer: District (fixed)  
  - For MP: Constituency (fixed)  
- Financial Year selector (e.g., FY 2025–26).  
- “Last updated” timestamp (from backend metadata).

#### 3.3.2 KPI Row

Four primary KPI cards:

1. **Total Works**
   - Count of works in scope for selected FY.  
2. **High Risk**
   - Count of works with `risk_level` = HIGH or CRITICAL.  
3. **Critical**
   - Count of works with `risk_level` = CRITICAL (or top decile of priority, depending on final definition).  
4. **Need Review** (or “Unreviewed”)
   - Count of works flagged as high/critical risk with no review/inspection decision yet.

**Design Notes:**

- Each KPI card clickable (optional) to filter Works Explorer by that category.  
- Use color coding:
  - Total Works: neutral  
  - High Risk: orange  
  - Critical: red  
  - Need Review: amber  

#### 3.3.3 Risk Overview Section

**Title:** “Risk Distribution”

**Visualization:**

- Bar chart or stacked bar showing counts for:
  - Critical  
  - High  
  - Medium  
  - Low  
  - Insufficient Data  

**Key Behavior:**

- Clicking a bar filters the Works Explorer to that risk level.  
- “Insufficient Data” shown distinctly (e.g., gray bar) to emphasize it’s not “low risk”.

**Disclaimer Banner:**

Positioned near risk overview or at top of dashboard:

> Risk indicates records requiring verification. It is not a finding of fraud or wrongdoing.

Tone: subtle, non-alarming, but visible.

#### 3.3.4 Inspection Priority Section

**Title:** “Top Works Requiring Attention”

**Table Columns:**

- # (rank by priority)  
- Work (name + ID)  
- District (or Constituency for MP view)  
- MP  
- Agency  
- Sanction Amount  
- Status (Ongoing / Completed / Delayed / etc.)  
- **Risk** (score + level badge)  
- **Impact** (score + label, e.g., High/Medium/Low)  
- **Priority** (score)  
- Action (button: “Inspect”, “Verify”, “Review”)  

**Behavior:**

- Sorted by Priority (descending) by default.  
- “Action” button navigates to Review Case or Inspection detail.  
- Optional: show small reason-code chips under Risk (e.g., “Cost”, “Delay”) on hover.

#### 3.3.5 Why Works Are Flagged Section

**Title:** “Primary Reasons for Flagging”

**Visualization:**

- Horizontal bar chart or donut chart showing proportion of flagged works by primary reason:
  - Cost Anomaly  
  - Delay  
  - Fund Flow  
  - Duplicate  
  - Compliance  

**Behavior:**

- Clicking a reason filters Works Explorer to works where that reason is dominant.  
- Tooltip shows brief definition of each reason type.

***

### 3.4 Works Explorer – `/works`

**Purpose:** Browse, filter, and search all works in scope.

#### 3.4.1 Search & Filters

**Search Bar:**

- Placeholder: “Search work ID, work name, agency, district…”  
- Supports:
  - Partial match on work name  
  - Exact match on work ID  
  - Agency name, district name, MP name (as advanced filters)  

**Filter Panel:**

Collapsible filter panel with:

- State (for MoSPI/State Admin)  
- District  
- Financial Year  
- Work Status (Ongoing, Completed, Delayed, etc.)  
- Work Category (e.g., roads, buildings, water, etc.)  
- MP (dropdown, for state/MoSPI)  
- Agency  
- Risk Reason (Cost, Delay, Fund Flow, Duplicate, Compliance)  
- Risk Level (Critical / High / Medium / Low / Insufficient Data)  

**Behavior:**

- Applying filters updates the table without full page reload (React routing + query params).  
- Filters reflected in URL for shareability (e.g., `/works?district=12&riskLevel=HIGH`).

#### 3.4.2 Works Table

**Columns:**

1. Work Name (with work ID underneath or as secondary line)  
2. District  
3. MP  
4. Agency  
5. Sanction Amount  
6. Status  
7. Risk (score + level badge)  
8. Data Confidence (score + label, e.g., “82% – High” or “Insufficient progress data”)  

**Row Behavior:**

- Clicking a row navigates to Work Detail (`/works/:id`).  
- Hover row shows quick tooltip with top reason codes (optional).  

#### 3.4.3 Pagination & Sorting

- Server-side pagination (e.g., 25/50/100 rows per page).  
- Sortable columns:
  - Sanction Amount  
  - Risk Score  
  - Priority Score  
  - Data Confidence  
- Default sort: Priority (descending) or Risk (descending).

***

### 3.5 Work Detail – `/works/:id`

**Purpose:** Provide a comprehensive, explainable view of a single work’s risk profile, data quality, lifecycle, and compliance status. This is the most important screen.

#### 3.5.1 Header Section

**Content:**

- Breadcrumb: Works → Work Detail  
- Work Name (large heading)  
- Work ID (`unique_work_number`)  
- Key metadata row:
  - State  
  - District  
  - MP  
  - Agency  
  - Work Category  
  - Financial Year  

**Risk Card:**

Prominent card on right side of header:

- Large numeric score: `87 / 100`  
- Risk Level badge: `HIGH` or `CRITICAL` or `INSUFFICIENT DATA`  
- Subtext: “⚠ Requires human verification”  

**Optional:**

- Small “Priority: 94 – High” indicator.  

#### 3.5.2 Risk Breakdown Section

**Title:** “Risk Breakdown”

**Visualization:**

Horizontal bar chart with five bars:

- Cost Anomaly (score)  
- Delay (score)  
- Fund Flow (score)  
- Duplicate Candidate (score)  
- Compliance (score)  

Each bar:

- Color-coded (green → yellow → red) based on score ranges.  
- Tooltip shows brief explanation (e.g., “Cost is 47% above peer median”).

**Behavior:**

- Clicking a bar scrolls to or opens the corresponding “Why flagged” card.

#### 3.5.3 Data Confidence Section

**Title:** “Data Confidence”

**Content:**

- Overall confidence score (0–100) with label (High / Medium / Low / Insufficient).  
- Checklist:
  - ✓ Work information complete  
  - ✓ Sanction information complete  
  - ✓ Agency information complete  
  - ⚠ Progress history incomplete  
  - ⚠ Payment details partial  

**Behavior:**

- Each item can have a tooltip explaining what fields are missing or partial.  
- If confidence is low, show a banner:
  > Data confidence is low. Risk assessment may be unreliable due to missing information.

#### 3.5.4 Why This Work Was Flagged Section

**Title:** “Why This Work Was Flagged”

**Layout:**

Vertical stack of cards, one per triggered reason (Cost, Delay, Fund Flow, Duplicate, Compliance).

**Each Card Includes:**

- Icon + severity color:
  - 🔴 High severity  
  - 🟠 Medium  
  - 🟡 Low  
- Title (e.g., “Cost Anomaly”)  
- Plain-language explanation:
  - “Sanction amount is 47% above the peer benchmark.”  
- Key numbers:
  - “This work: ₹50.0 L”  
  - “District-category median: ₹34.0 L”  
  - “Peer works: 38”  
- Link:
  - “View comparable works” → opens a modal or side panel with peer works.  

**Delay Card Example:**

- “Current stage exceeds the expected completion timeline.”  
- Timeline summary:
  - Sanction → Commencement: 21 days  
  - Commencement → Latest: 143 days  
  - Expected completion: ~1 year  
- Link: “View timeline” → scrolls to Work Lifecycle section.

**Fund Flow Card Example:**

- “High fund release with low physical progress.”  
- Numbers:
  - Released: ₹45 L  
  - Physical progress: 32%  
  - Expected progress at this stage: 60%  

**Duplicate Card Example:**

- “94% description similarity with another work in the same district.”  
- Matched work summary:
  - Work name, ID, district, agency, amount, sanction date  
- Link: “Compare works” → side-by-side view.

**Compliance Card Example:**

- “Potentially impermissible work category: Religious Works.”  
- Evidence:
  - Work name includes “Temple Hall”  
  - Category: Public Building  
- Link: “View compliance rule” → Compliance Rule Detail.

#### 3.5.5 Work Lifecycle Section

**Title:** “Work Lifecycle”

**Visualization:**

Horizontal or vertical timeline with stages:

1. Recommendation  
2. District Action  
3. Sanction  
4. Agency Assigned  
5. Commencement  
6. Execution  
7. Payment  
8. Completion  
9. Handover  

**Each Stage Shows:**

- Status icon:
  - ✓ Completed  
  - ⚠ Delayed / Issue  
  - ○ Not yet reached  
- Date (if available)  
- On hover/click: tooltip or side panel with details.

**Clicking a Stage:**

Opens a panel with:

- Expected timeline vs actual  
- Delay (if any) in days  
- Status explanation (e.g., “Execution delay: 38% progress gap”).  

**Example: Execution Stage**

- Expected progress: 70%  
- Recorded progress: 32%  
- Gap: 38%  
- Reason (if available from data): “Agency change”, “Land acquisition delay”, etc.

#### 3.5.6 Fund Flow Section

**Title:** “Fund Flow”

**Content:**

- Summary cards:
  - Sanctioned Amount  
  - Released Amount  
  - Expenditure (if available)  
  - Unutilized Balance  

**Visualization:**

- Flow diagram:
  - Entitlement → Available → Sanctioned → Released → Expended → Completed Works  
- Bar chart or step chart showing releases over time.

**Alerts:**

If any fund-flow anomalies detected:

- “⚠ Released amount exceeds sanctioned amount.”  
- “⚠ High release with low physical progress.”  
- “⚠ Repeated installments without progress.”  

Each alert can link to Fund Flow Intelligence page with more context.

#### 3.5.7 Compliance Flags Section

**Title:** “Compliance Flags”

**Content:**

- List of triggered compliance rules:
  - Rule name (e.g., “Religious Works”)  
  - Severity (High/Medium/Low)  
  - Short reason  
  - Confidence  

**Behavior:**

- Clicking a rule opens Compliance Rule Detail (modal or separate page).  

#### 3.5.8 Possible Duplicates Section

**Title:** “Possible Duplicates”

**Content:**

- If duplicate candidates exist:
  - Show top 1–3 matches.  
  - For each:
    - Work name & ID  
    - District, Agency  
    - Amount  
    - Similarity score (overall + breakdown: text, location, agency, amount, date)  

**Behavior:**

- “Compare Works” button → side-by-side comparison view.  
- Actions (for authorized users):
  - Confirm Possible Duplicate  
  - Not a Duplicate  
  - Review Later  

These actions update `duplicate_candidates.status` and log to `audit_log`.

#### 3.5.9 Inspection & Review Section

**Title:** “Inspection & Review”

**If No Inspection Exists:**

- Button: “Open Review Case” → creates inspection record and navigates to `/reviews/:id`.

**If Inspection Exists:**

- Show:
  - Status (Pending / InProgress / Completed)  
  - Assigned To (officer name)  
  - Last Updated  
  - Review Decision (if any)  
- Button: “View / Update Review” → navigates to Review Case.

***

### 3.6 Inspections – `/inspections`

**Purpose:** Central action centre for officers to manage inspection queue.

#### 3.6.1 Filters & Tabs

**Tabs:**

- Critical  
- High  
- Due (e.g., mandated inspections approaching deadline)  
- Unassigned  
- Reviewed  

**Filters:**

- District (for state/MoSPI)  
- Risk Level  
- Priority range  
- Agency  
- Work Category  

#### 3.6.2 Inspection Queue Table

**Columns:**

- Priority Rank  
- Work (name + ID)  
- District  
- MP  
- Agency  
- Risk Score & Level  
- Impact Score & Label  
- Priority Score  
- Action (Inspect / Verify / Review)  

**Behavior:**

- Clicking a row opens Review Case.  
- “Action” button directly opens review form with pre-selected decision type.

***

### 3.7 Review Case – `/reviews/:id`

**Purpose:** Structured human review workflow for a flagged work.

#### 3.7.1 Case Header

- Case ID (e.g., `#RV-002841`)  
- Work summary (name, ID, risk level)  
- Current status (Under Review / Escalated / Closed, etc.)  

#### 3.7.2 System Findings Section

- List of triggered reasons:
  - Cost Anomaly  
  - Execution Delay  
  - Possible Duplicate  
  - Fund-Flow Mismatch  
  - Compliance Flag  
- Each with severity badge and short summary.

#### 3.7.3 Data Used Section

- Checklist of data fields used in assessment:
  - ✓ Sanction amount  
  - ✓ District  
  - ✓ Agency  
  - ✓ Work description  
  - ✓ Approval date  
  - ⚠ Progress data incomplete  
  - ⚠ Payment details partial  

#### 3.7.4 Officer Decision Section

**Radio Options:**

- Confirm for inspection  
- Request additional documents  
- False positive  
- No action required  
- Escalate (to state/MoSPI)  

**If “Escalate” selected:**

- Dropdown to select escalation target (state_admin, mospi_admin, specific user).  

#### 3.7.5 Evidence & Remarks Section

- File upload area (documents, images if in scope).  
- Text area for official remarks.  

#### 3.7.6 Actions

- “Save Review” → creates/updates inspection record, writes to `audit_log`.  
- “Escalate Case” → updates status, assigns to escalation target, logs action.

***

### 3.8 Intelligence Pages

#### 3.8.1 Risk Overview – `/intelligence/risk` (Optional)

- Aggregated risk distribution by state/district/MP.  
- Top high-risk works list.  
- Trends over time (if multi-year data available).

#### 3.8.2 Fund Flow – `/intelligence/fund-flow`

- Aggregates: sanctioned, released, expended, unutilized.  
- Flow visualization.  
- Fund-flow alerts list (released > sanctioned, high release/low progress, etc.).  
- Drill-down by district/MP.

#### 3.8.3 Duplicate Works – `/intelligence/duplicates`

- List of confirmed / high-similarity duplicate clusters.  
- Each cluster shows:
  - Number of works  
  - Total amount involved  
  - Districts/MPs involved  
- Clicking a cluster → side-by-side work comparison.

#### 3.8.4 Agency Intelligence – `/intelligence/agencies`

- Table: Agency, Works, Avg Delay, High-Risk %, Districts Served.  
- Agency detail page:
  - Completion %  
  - Avg Delay  
  - High-Risk %  
  - Systemic patterns (high delay, high risk, concentration, repeated unresolved delays).  

#### 3.8.5 District / State Analytics – `/intelligence/analytics`

- Scope selector: State / District.  
- Tables: Works, Completion %, Avg Delay, High-Risk count.  
- Drill-down: State → District → Work.

***

### 3.9 Compliance Centre – `/compliance`

#### 3.9.1 Landing Page

- Cards per rule type:
  - Religious Works  
  - Land Acquisition  
  - Residential Construction  
  - Commercial Establishment  
  - Recurring Expenditure  
  - Grants / Loans  
  - Unauthorized Colony Works  
  - Sanction / Entitlement Violation  
  - Timeline Violation  
  - Missing Required Information  
  - Duplicate Funding Indicator  
- Each card: rule name, flagged works count, short description, “View works” link.

#### 3.9.2 Rule Detail – `/compliance/:ruleId`

- Rule description, severity, source reference.  
- List of flagged works:
  - Work name, ID, district, MP  
  - Brief evidence snippet  
  - Confidence  
- “Open Work” link for each.

***

### 3.10 Data Quality – `/data-quality`

**Sections:**

1. **Overall Completeness**
   - Percentage (0–100)  
   - Total records analyzed  

2. **Issue Breakdown**
   - Missing progress data (%)  
   - Missing agency (%)  
   - Invalid dates (%)  
   - Amount inconsistencies (%)  
   - Duplicate work IDs (%)  
   - Unmatched districts (%)  

3. **Model Coverage**
   - Cost anomaly (%)  
   - Delay detection (%)  
   - Duplicate detection (%)  
   - Fund-flow analysis (%)  
   - Compliance rules (%)  

4. **Model Validation (Optional)**
   - Precision/Recall/F1 for duplicates  
   - Detection rates for injected anomalies  
   - Delay classification accuracy  

***

### 3.11 Audit Log – `/audit-log`

**Table Columns:**

- Time  
- Officer (name + role)  
- Action (Review Decision, Evidence Upload, Escalation, Flag Override, Risk Config Change, Inspection Assignment/Status Change)  
- Target Type (Work / Inspection / Review / Compliance / Settings)  
- Target ID (work ID, case ID, etc.)  
- Details (JSON summary)  

**Filters:**

- Scope (state/district/MP)  
- Date range  
- Action type  
- User  

***

### 3.12 Reports – `/reports`

**Form Fields:**

- Report Type:
  - Inspection Priority  
  - Compliance Summary  
  - Risk Summary  
  - Fund-Flow Summary  
- Scope:
  - District / State / National  
- Filters:
  - Risk level  
  - Status  
  - FY  
  - Category  
- Include Checkboxes:
  - Reason codes  
  - Financial information  
  - Timeline  
  - Compliance flags  
  - Review history  

**Action:**

- “Generate Report” → backend generates PDF/CSV, frontend triggers download.

***

### 3.13 Settings – `/settings`

#### 3.13.1 Risk Weights – `/settings/risk-weights`

- Inputs:
  - Cost weight (0–1)  
  - Delay weight  
  - Fund weight  
  - Duplicate weight  
  - Compliance weight  
- Sum must equal 1 (validated on frontend).  
- “Save” → calls `PUT /settings/risk-weights`.  
- Only authorized roles (state_admin/mospi_admin) can modify.  
- All changes logged in `audit_log`.

***

## 4. Backend Specification – In Depth

### 4.1 Technology Stack & Architectural Boundaries

- **Data Ingestion & ML Layer (Python):**
  - Responsible for:
    - Reading raw data (CSV, APIs, etc.)  
    - Validating schema  
    - Cleaning and normalizing data  
    - Computing features  
    - Running detection models (Cost, Duplicate, Delay, Fund-Flow, Compliance)  
    - Writing results to PostgreSQL (`detection_results`, `risk_scores`, `compliance_flags`, etc.)  
  - Runs as:
    - Batch jobs (scheduled) or  
    - On-demand analysis triggered via internal API (not exposed to frontend).  

- **Application & API Layer (Spring Boot):**
  - Responsible for:
    - User authentication & authorization  
    - Exposing REST APIs for frontend  
    - Enforcing role-based access control  
    - Aggregating data from multiple tables for UI responses  
    - Managing inspection workflow and audit logging  

- **Frontend (React):**
  - Consumes only Spring Boot APIs.  
  - No direct calls to Python ML services.  

- **Database (PostgreSQL):**
  - Single source of truth for:
    - Works, users, detections, risk scores, inspections, audit logs, etc.  

***

### 4.2 Database Schema – Detailed

#### 4.2.1 `works`

**Purpose:** Core table storing all work records.

**Fields:**

- `id` (BIGINT, PK, auto-increment)  
- `unique_work_number` (VARCHAR, unique, indexed) – external identifier used in UI and APIs.  
- `work_name` (VARCHAR)  
- `work_category` (VARCHAR)  
- `state` (VARCHAR or FK to states table if normalized)  
- `implementing_district` (VARCHAR or FK)  
- `nodal_district` (VARCHAR or FK)  
- `mp_id` (FK → users or separate MPs table)  
- `house_name` (VARCHAR, e.g., Lok Sabha / Rajya Sabha)  
- `implementing_agency_id` (FK → agencies table if normalized)  
- `sanction_amount` (DECIMAL)  
- `actual_expenditure` (DECIMAL, nullable)  
- `released_amount` (DECIMAL)  
- `recommendation_date` (DATE)  
- `administrative_approval_date` (DATE)  
- `sanction_date` (DATE)  
- `commencement_date` (DATE)  
- `latest_progress_date` (DATE)  
- `completion_date` (DATE)  
- `final_payment_date` (DATE)  
- `completion_marking_date` (DATE)  
- `handover_date` (DATE)  
- `work_status` (VARCHAR: Ongoing, Completed, Delayed, etc.)  
- `financial_year` (VARCHAR, e.g., “2025–26”)  
- `latitude` (DECIMAL, nullable)  
- `longitude` (DECIMAL, nullable)  
- `data_confidence` (INT, 0–100)  
- `created_at` (TIMESTAMP)  
- `updated_at` (TIMESTAMP)  

**Indexes:**

- `unique_work_number` (unique)  
- `state`, `implementing_district`, `mp_id`, `financial_year` (for filtering)  
- `risk_level` (if denormalized from `risk_scores`) – optional.

***

#### 4.2.2 `fund_releases`

**Purpose:** Track individual fund release installments per work.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `installment_number` (INT)  
- `amount` (DECIMAL)  
- `release_date` (DATE)  
- `transaction_type` (VARCHAR, e.g., “Release”, “Refund”, etc.)  
- `source_reference` (VARCHAR, optional reference to external system)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `release_date`  

***

#### 4.2.3 `work_progress`

**Purpose:** Store periodic progress updates (physical/financial).

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `progress_date` (DATE)  
- `physical_progress` (DECIMAL, nullable, 0–100)  
- `financial_progress` (DECIMAL, nullable, 0–100)  
- `work_status` (VARCHAR)  
- `remarks` (TEXT)  
- `source_reference` (VARCHAR)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `progress_date`  

***

#### 4.2.4 `users`

**Purpose:** Store system users (MPs, officers, admins).

**Fields:**

- `user_id` (BIGINT, PK)  
- `name` (VARCHAR)  
- `email` (VARCHAR, unique)  
- `password_hash` (VARCHAR)  
- `role` (VARCHAR: MP, district_officer, state_admin, mospi_admin)  
- `constituency_id` (VARCHAR, nullable)  
- `district_id` (VARCHAR, nullable)  
- `state_id` (VARCHAR, nullable)  
- `active` (BOOLEAN)  
- `created_at`, `updated_at` (TIMESTAMP)  

**Indexes:**

- `email`, `role`, `constituency_id`, `district_id`, `state_id`  

***

#### 4.2.5 `data_quality_results`

**Purpose:** Store per-field data quality issues.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `field_name` (VARCHAR, e.g., “commencement_date”, “agency_id”)  
- `issue_type` (VARCHAR: MISSING_FIELD, INVALID_DATE, INVALID_AMOUNT, etc.)  
- `severity` (VARCHAR: LOW, MEDIUM, HIGH)  
- `message` (TEXT)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `issue_type`  

***

#### 4.2.6 `work_features`

**Purpose:** Precomputed features for ML models.

**Fields:**

- `work_id` (BIGINT, PK, FK → works.id)  
- `cost_peer_median` (DECIMAL)  
- `cost_peer_mad` (DECIMAL)  
- `cost_deviation` (DECIMAL)  
- `project_age_days` (INT)  
- `sanction_delay_days` (INT)  
- `start_delay_days` (INT)  
- `execution_delay_days` (INT)  
- `payment_delay_days` (INT)  
- `closure_delay_days` (INT)  
- `released_percentage` (DECIMAL)  
- `expenditure_percentage` (DECIMAL)  
- `duplicate_text_similarity` (DECIMAL)  
- `agency_work_share` (DECIMAL)  
- `agency_district_share` (DECIMAL)  
- `agency_concentration` (DECIMAL)  
- `financial_year` (VARCHAR)  
- `feature_version` (VARCHAR)  
- `generated_at` (TIMESTAMP)  

**Indexes:**

- `work_id`  

***

#### 4.2.7 `detection_results`

**Purpose:** Store outputs from each detection engine.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `engine_type` (VARCHAR: COST, DUPLICATE, DELAY, FUND_FLOW, COMPLIANCE)  
- `score` (INT, 0–100)  
- `severity` (VARCHAR: LOW, MEDIUM, HIGH)  
- `reason_code` (VARCHAR)  
- `description` (TEXT)  
- `evidence` (JSONB or TEXT)  
- `confidence` (INT, 0–100)  
- `model_version` (VARCHAR)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `engine_type`  

***

#### 4.2.8 `risk_scores`

**Purpose:** Store aggregated risk, impact, priority scores.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id, unique constraint)  
- `risk_score` (INT, 0–100, nullable if INSUFFICIENT_DATA)  
- `impact_score` (INT, 0–100)  
- `priority_score` (INT, 0–100)  
- `risk_level` (VARCHAR: LOW, MEDIUM, HIGH, CRITICAL, INSUFFICIENT_DATA)  
- `cost_score` (INT)  
- `delay_score` (INT)  
- `fund_score` (INT)  
- `duplicate_score` (INT)  
- `compliance_score` (INT)  
- `data_confidence` (INT, 0–100)  
- `reason_codes` (JSONB array of objects: code, severity, message)  
- `inspection_mandatory` (BOOLEAN, optional)  
- `generated_at` (TIMESTAMP)  
- `model_version` (VARCHAR)  

**Indexes:**

- `work_id`, `risk_level`, `priority_score`  

***

#### 4.2.9 `compliance_rules`

**Purpose:** Define deterministic compliance rules.

**Fields:**

- `rule_id` (VARCHAR, PK)  
- `rule_name` (VARCHAR)  
- `rule_type` (VARCHAR: CATEGORY, TIMELINE, ENTITLEMENT, DATA_COMPLETENESS, FINANCIAL, RELATIONSHIP)  
- `description` (TEXT)  
- `source_reference` (VARCHAR)  
- `severity` (VARCHAR: LOW, MEDIUM, HIGH)  
- `active` (BOOLEAN)  

**Indexes:**

- `rule_type`, `active`  

***

#### 4.2.10 `compliance_flags`

**Purpose:** Store per-work compliance rule triggers.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `rule_id` (FK → compliance_rules.rule_id)  
- `triggered` (BOOLEAN)  
- `severity` (VARCHAR)  
- `description` (TEXT)  
- `evidence` (JSONB/TEXT)  
- `observed_value` (VARCHAR/JSONB)  
- `expected_value` (VARCHAR/JSONB)  
- `confidence` (INT, 0–100)  
- `review_status` (VARCHAR: PENDING, VERIFIED, OVERRIDDEN, DISMISSED)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `rule_id`, `triggered`, `review_status`  

***

#### 4.2.11 `duplicate_candidates`

**Purpose:** Store potential duplicate work pairs.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `matched_work_id` (FK → works.id)  
- `text_similarity` (DECIMAL, 0–1)  
- `location_similarity` (DECIMAL, 0–1)  
- `agency_similarity` (DECIMAL, 0–1)  
- `amount_similarity` (DECIMAL, 0–1)  
- `date_similarity` (DECIMAL, 0–1)  
- `overall_similarity` (DECIMAL, 0–1)  
- `reason` (TEXT)  
- `status` (VARCHAR: PENDING, CONFIRMED, REJECTED, ESCALATED)  
- `reviewed_by` (FK → users.user_id, nullable)  
- `reviewed_at` (TIMESTAMP, nullable)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `matched_work_id`, `status`, `overall_similarity`  

***

#### 4.2.12 `fund_anomalies`

**Purpose:** Store fund-flow anomaly detections.

**Fields:**

- `id` (BIGINT, PK)  
- `work_id` (FK → works.id)  
- `anomaly_type` (VARCHAR, e.g., RELEASE_EXCEEDS_SANCTION, HIGH_RELEASE_LOW_PROGRESS, etc.)  
- `score` (INT, 0–100)  
- `severity` (VARCHAR)  
- `expected_value` (DECIMAL/JSONB)  
- `actual_value` (DECIMAL/JSONB)  
- `amount_involved` (DECIMAL)  
- `reason_code` (VARCHAR)  
- `confidence` (INT, 0–100)  
- `created_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `anomaly_type`, `severity`  

***

#### 4.2.13 `inspections`

**Purpose:** Track inspection workflow per work.

**Fields:**

- `inspection_id` (BIGINT, PK)  
- `work_id` (FK → works.id, unique or one-to-many if multiple inspections allowed)  
- `assigned_to` (FK → users.user_id)  
- `status` (VARCHAR: Pending, InProgress, Completed)  
- `remarks` (TEXT)  
- `findings` (TEXT)  
- `evidence_references` (JSONB array of file refs/URLs)  
- `review_decision` (VARCHAR: Confirmed, Needs verification, False positive, No action)  
- `created_at`, `updated_at`, `completed_at` (TIMESTAMP)  

**Indexes:**

- `work_id`, `assigned_to`, `status`, `review_decision`  

***

#### 4.2.14 `audit_log`

**Purpose:** Immutable log of all significant actions.

**Fields:**

- `id` (BIGINT, PK)  
- `actor_user_id` (FK → users.user_id)  
- `action_type` (VARCHAR: REVIEW_DECISION, EVIDENCE_UPLOAD, ESCALATION, FLAG_OVERRIDE, RISK_CONFIG_CHANGE, INSPECTION_ASSIGNMENT, INSPECTION_STATUS_CHANGE, etc.)  
- `target_type` (VARCHAR: WORK, INSPECTION, REVIEW, COMPLIANCE, SETTINGS)  
- `target_id` (VARCHAR: work_id, inspection_id, etc.)  
- `details` (JSONB)  
- `timestamp` (TIMESTAMP)  
- `ip_address` (VARCHAR, nullable)  

**Indexes:**

- `actor_user_id`, `action_type`, `target_type`, `timestamp`  

***

### 4.3 API Specification – Detailed

#### 4.3.1 Authentication

**POST `/auth/login`**

- Request:
  ```json
  {
    "email": "officer@example.gov.in",
    "password": "securePassword"
  }
  ```
- Response (success):
  ```json
  {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "District Officer",
      "role": "district_officer",
      "district_id": "12",
      "state_id": "01"
    }
  }
  ```
- Response (failure):
  - HTTP 401  
  - Body: `{ "error": "Invalid credentials" }`

***

#### 4.3.2 Works

**GET `/works`**

- Query params:
  - `constituencyId`, `districtId`, `stateId`  
  - `riskLevel`, `priority`, `status`, `agency`, `financialYear`, `category`  
  - `page`, `size`, `sort`  

- Response:
  ```json
  {
    "content": [
      {
        "id": 1001,
        "unique_work_number": "MPLADS/AP/2025/XXXXX",
        "work_name": "Construction of Community Hall",
        "district": "Guntur",
        "mp": "MP A",
        "agency": "Agency X",
        "sanction_amount": 5000000,
        "status": "Ongoing",
        "risk_score": 87,
        "risk_level": "HIGH",
        "priority_score": 94,
        "data_confidence": 82
      }
    ],
    "page": 0,
    "size": 25,
    "totalElements": 1240,
    "totalPages": 50
  }
  ```

**GET `/works/{workId}`**

- Returns combined payload:
  ```json
  {
    "work": { ... },
    "risk": { ... },
    "lifecycle": { ... },
    "fundFlow": { ... },
    "compliance": [ ... ],
    "duplicates": [ ... ],
    "dataQuality": { ... },
    "inspection": { ... }
  }
  ```

***

#### 4.3.3 Risk & Intelligence

**GET `/works/{workId}/risk`**

- Returns `risk_scores` row with reason_codes.

**GET `/works/{workId}/compliance`**

- Returns list of `compliance_flags` for the work.

**GET `/works/{workId}/fund-flow`**

- Returns fund releases + anomalies.

**GET `/works/{workId}/lifecycle`**

- Returns lifecycle dates + per-stage delay flags.

**GET `/duplicates/{workId}`**

- Returns duplicate candidates for the work.

***

#### 4.3.4 Inspections

**GET `/inspections/priority`**

- Query: `scope` (district/state/national), filters.  
- Returns list of works with risk/impact/priority.

**POST `/inspections`**

- Creates new inspection record.

**PUT `/inspections/{inspectionId}`**

- Updates inspection (status, decision, remarks).

***

#### 4.3.5 Data Quality

**GET `/data-quality/summary`**

- Query: `scope`  
- Returns overall completeness, issue breakdown, model coverage.

***

#### 4.3.6 Audit

**GET `/audit-log`**

- Query: `scope`, `from`, `to`, `actionType`, `userId`  
- Returns paginated audit entries.

***

#### 4.3.7 Settings

**GET `/settings/risk-weights`**

- Returns current weights.

**PUT `/settings/risk-weights`**

- Request:
  ```json
  {
    "cost": 0.30,
    "delay": 0.25,
    "fund": 0.20,
    "duplicate": 0.15,
    "compliance": 0.10
  }
  ```
- Restricted to state_admin/mospi_admin.  
- Logs change to `audit_log`.

***

#### 4.3.8 Analytics

**GET `/analytics/state`**, `/district`, `/mp`, `/agency`, `/financial-year`

- Returns aggregated metrics:
  - total_works  
  - completed_works  
  - ongoing_works  
  - delayed_works  
  - high_risk_works  
  - average_delay  
  - completion_rate  
  - fund_utilization  
  - average_risk  

***

## 5. Risk & Priority Logic – Detailed

### 5.1 Engine Scores

Each engine outputs a 0–100 score:

- `cost_score`  
- `delay_score`  
- `fund_score`  
- `duplicate_score`  
- `compliance_score`  

### 5.2 Risk Score

Configurable weighted sum:

\[
\text{risk\_score} = w_{\text{cost}} \cdot \text{cost\_score} + w_{\text{delay}} \cdot \text{delay\_score} + w_{\text{fund}} \cdot \text{fund\_score} + w_{\text{duplicate}} \cdot \text{duplicate\_score} + w_{\text{compliance}} \cdot \text{compliance\_score}
\]

Default weights (example):

- \(w_{\text{cost}} = 0.30\)  
- \(w_{\text{delay}} = 0.25\)  
- \(w_{\text{fund}} = 0.20\)  
- \(w_{\text{duplicate}} = 0.15\)  
- \(w_{\text{compliance}} = 0.10\)  

If `data_confidence` < threshold (e.g., 40), `risk_score` may be set to null and `risk_level` = `INSUFFICIENT_DATA`.

### 5.3 Impact Score

Based on:

- Sanction amount (normalized)  
- Financial exposure (released – expended, if available)  
- Work importance (if categorized, e.g., school/clinic vs minor work)  

Normalized to 0–100.

### 5.4 Priority Score

\[
\text{priority\_score} = \frac{\text{risk\_score} \times \text{impact\_score}}{100}
\]

Used to sort inspection queue.

### 5.5 Risk Levels

- 0–29: LOW  
- 30–59: MEDIUM  
- 60–79: HIGH  
- 80–100: CRITICAL  
- `data_confidence` low → `INSUFFICIENT_DATA` (separate state).

***

## 6. Implementation Phases (MVP Roadmap)

1. **Phase 1 – Foundation**
   - PostgreSQL schema  
   - Spring Boot project setup  
   - User model + auth (login, JWT)  

2. **Phase 2 – Data Ingestion**
   - Python scripts to read CSV → clean → load into `works`, `fund_releases`, `work_progress`.  

3. **Phase 3 – Detection Engines**
   - Implement Cost, Delay, Duplicate, Fund-Flow, Compliance in Python.  
   - Write results to `detection_results`, `compliance_flags`, `fund_anomalies`, `duplicate_candidates`.  

4. **Phase 4 – Risk Aggregation**
   - Compute risk/impact/priority, reason_codes.  
   - Populate `risk_scores`.  

5. **Phase 5 – Inspection & Audit**
   - Implement inspections workflow.  
   - Implement audit logging for all write actions.  

6. **Phase 6 – Frontend**
   - Build React pages per UI spec.  
   - Integrate with Spring Boot APIs.  

***