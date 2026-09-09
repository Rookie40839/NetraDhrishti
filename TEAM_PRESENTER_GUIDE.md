# NetraDhrishti — Team Presenter & Demo Guide

> **Cheat sheet for presenters**: You do NOT need Maven or Tomcat installed. The database is already live in the cloud.

---

## 1. The 30-Second Setup

### What You Need Installed on Your Computer:
1. **Java 17 or higher** (e.g. Eclipse Temurin or Oracle JDK 17/21). Check with `java -version`.
2. **Node.js 18 or higher**. Check with `node -v`.

### What You DO NOT Need:
- ❌ **No Maven**: The repo has `mvnw` (Maven Wrapper) included. It handles itself automatically.
- ❌ **No Tomcat**: Spring Boot has Tomcat **embedded directly inside it**.
- ❌ **No PostgreSQL or Python**: The database is already live on Supabase with all demo works, risk scores, and users pre-seeded.

---

## 2. How to Run (Choose Option A or Option B)

### Option A — 1-Click Launchers (Windows)
1. Double-click **`run_backend.bat`** (Starts Spring Boot on `http://localhost:8080`)
2. Double-click **`run_frontend.bat`** (Installs packages and starts Vite on `http://localhost:5173`)
3. Open your browser to **`http://localhost:5173`**.

---

### Option B — Run via Terminal

#### Terminal 1 (Backend):
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# Mac / Linux:
./mvnw spring-boot:run
```
*(Wait ~10 seconds until you see `Started ApiApplication in X.XX seconds`)*

#### Terminal 2 (Frontend):
```bash
cd frontend
npm install    # only needed the very first time
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 3. Where Do We Upload Datasets?

### If you just want to demo:
**You don't need to upload anything!**
The dataset (`works_demo.csv`, `fund_releases_demo.csv`, `work_progress_demo.csv`) is already processed through our ML pipeline into the Supabase database.

### If you have new CSV datasets to ingest:
1. Place your CSVs inside the `data/` folder:
   - `data/works_demo.csv` (all works and sanction details)
   - `data/fund_releases_demo.csv` (installment release dates & amounts)
   - `data/work_progress_demo.csv` (physical & financial milestones)
2. Run the end-to-end ML pipeline:
   ```bash
   cd ml
   python pipeline.py
   ```
   This automatically cleans the data, runs the 5 ML detection engines (Isolation Forest, Delay analysis, RapidFuzz duplicate detection, Fund anomalies, Rule compliance), and updates the database.

---

## 4. 3-Minute Presentation Demo Script

### 🎙️ Slide / Opening (15s):
> *"NetraDhrishti (नेत्र दृष्टि) is an AI-powered compliance and risk intelligence audit engine for MPLADS (Member of Parliament Local Area Development Scheme). It transitions audits from reactive post-mortems into proactive, risk-prioritized verification."*

### 📊 Step 1: Overview Dashboard (`/dashboard`) (45s):
1. Point to the **4 KPI Cards**: Total Works, Works Requiring Review, High Risk, Critical.
2. Show the **Advisory Disclaimer**: Emphasize that NetraDhrishti uses zero false-accusation terminology — it flags works for *"administrative verification"* rather than declaring fraud.
3. Show the **Risk Distribution** and **Primary Anomaly Drivers** (Cost, Delays, Duplicates, Fund Mismatches).
4. Highlight the **Top Works Requiring Immediate Attention** table sorted by Priority Score.

### 🔎 Step 2: Works Explorer (`/works`) (30s):
1. Click **Works Explorer** in the top navigation.
2. Open the **Filters** drawer: show filtering by State, District, Implementing Agency, and Risk Level.
3. Search for a specific work or click on **Work #1** to enter the deep audit dossier.

### 📁 Step 3: Work Detail Dossier (`/works/1`) (45s):
1. Show the **Composite Risk Card**: Composite score with 5 sub-score breakdowns (Cost, Timeline, Fund Flow, Duplicates, Compliance).
2. Point out the **8-Stage Lifecycle Timeline** (from Recommendation to Handover) highlighting exact delay days.
3. Show **"Why This Work Was Flagged"**: Observed vs expected guideline values.
4. Click **"Open Review Case"** button:
   - Select a decision (e.g. *"Needs physical verification"*).
   - Enter brief officer remarks and click **"Record Official Inspection"**.
   - Note: Real JWT authentication logs this immutably to the audit trail!

### 👤 Step 4: Role-based Persona Switcher (30s):
1. Look at the top banner: click **"Switch Persona"**.
2. Switch to **Member of Parliament** (Pune East):
   - Notice the scope dynamically locks to their constituency.
3. Switch to **MoSPI Admin**:
   - Notice the nationwide oversight view.

### 🧠 Step 5: Intelligence Suite (15s):
1. In the top nav under **Intelligence**, briefly show:
   - **Duplicate Detection**: Cosine text similarity + spatial proximity finding potential ghost works.
   - **Agency Intelligence**: Implementing agency delay track records.
2. Conclude: *"NetraDhrishti empowers officers at every administrative tier to protect public funds with objective, explainable AI intelligence."*
