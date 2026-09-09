# NetraDhrishti — Official SIH Sample Dataset Audit Report
**Dataset Analyzed**: `sih.csv` (`SIH_CSV`, 25.16 MB, 108,695 records)  
**Problem Statement**: SIH26102 (MoSPI — DIID)  
**System**: NetraDhrishti AI-Powered MPLADS Audit & Early Warning System  
**Audit Run Date**: September 2026  

---

## 1. Executive Summary

MoSPI provided the real-world sample dataset `sih.csv` (`SIH_CSV`), comprising **108,695 financial transaction records** totaling **₹3,995.34 Crore (~₹4,000 Crore)** of MPLADS expenditure spanning **July 2023 to September 2026** across **35 States/UTs, 530 Constituencies, 700 MPs, 765 Implementing District Authorities (IDAs), and 28,206 Vendors**.

Running the complete NetraDhrishti AI/ML pipeline (Data Quality Engine, Isolation Forest Cost Engine, NLP Duplicate Engine, Herfindahl-Hirschman Agency Concentration Engine, and Structuring/Splitting Velocity Detector) revealed **7 severe systemic anomalies and audit red flags**.

```
+-----------------------------------------------------------------------------------------+
|                              NETRADHRISHTI AUDIT SCORECARD                               |
+-----------------------------------------------------------------------------------------+
| Total Transactions Audited   : 108,695                                                  |
| Total Funds Audited           : ₹39,953,382,732.14 (~₹3,995.34 Crore)                    |
| Exact Duplicate Records       : 32,382 (29.79% of entire dataset)                        |
| Financial Payment Collisions  : 39,170 identical date/vendor/amount transactions         |
| Severe Tender Splitting Bursts: 1,177 incidents (>= 10 payments/day under ₹5L to 1 vendor)|
| District Monopolies (HHI>=5k) : 51 IDAs (Vendor controls 50% - 100% of district budget) |
| Isolation Forest Cost Outliers: 2,171 extreme cost anomalies (up to 1,228 MADs above)   |
| Micro-Transactions (< ₹100)   : 108 ledger reconciliation / test entries (min ₹0.01)     |
| Mega Transactions (> ₹50L)    : 232 high-value single outlays (max ₹3.26 Crore)         |
| Lingering In-Progress Payments: 3,389 transactions totaling ₹103.66 Crore               |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Dataset Schema & Characteristics

| Column Name | Type | Null Count | Description & Context |
| :--- | :--- | :--- | :--- |
| `MP Name` | String | 0 | Sitting and former Lok Sabha / Rajya Sabha Members of Parliament |
| `Constituency` | String | 0 | Parliamentary Constituency |
| `State` | String | 0 | State or Union Territory |
| `House` | String | 0 | Lok Sabha (83,644 rows / ₹2,757 Cr) or Rajya Sabha (25,051 rows / ₹1,238 Cr) |
| `Work Description` | String | 0 | Nature of civil work or community asset created (112 distinct categories) |
| `Vendor` | String | 0 | Commercial contractor, agency, or manufacturer receiving payment (28,206 unique) |
| `IDA` | String | 0 | Implementing District Authority managing procurement (765 unique) |
| `Expenditure Amount (₹)` | Float | 0 | Financial disbursement (Min: ₹0.01, Median: ₹1,99,950, Max: ₹3,25,62,250) |
| `Expenditure Date` | ISO-8601 | 0 | Timestamp of transaction disbursement (2023-07-27 to 2026-09-03) |
| `Payment Status` | String | 0 | Payment Success (96.88%) or Payment In-Progress (3.12%) |

---

## 3. The 7 Critical Anomalies Uncovered

### 🚨 Anomaly 1: Massive Duplicate Transaction Collisions (29.79%)
- **Exact Duplicate Rows**: **32,382 records (29.79%)** are completely identical across all 10 columns.
- **Financial Payment Collisions**: **39,170 transactions** represent identical payments (Same MP, Constituency, Work Description, Vendor, Amount, and Date).
- **Audit Implication**: Indicates either double-booking / ledger synchronization replays from PFMS/state treasury portals, or duplicate claim vouchers paid twice without automated deduplication.
- **Example**: MP *Dharmendra Pradhan* in Sambalpur, Odisha: ₹7,000 paid to *MEMBER SECY OB AND OC WWB BBSR* on `2026-09-01` repeated multiple times.

### 🚨 Anomaly 2: Extreme Tender Splitting / Smurfing (1,177 Severe Bursts)
In public procurement, works are frequently split into smaller amounts (< ₹5 Lakhs or < ₹10 Lakhs) to avoid mandatory e-tendering, competitive bidding, or higher administrative sanction.
- **Detected**: **5,276 clusters (43,864 transactions)** of multiple payments to the same vendor on the same day under ₹5 Lakhs.
- **Severe Bursts (>= 10 payments on 1 day to 1 vendor)**: **1,177 incidents**.
- **Top Shocking Examples**:
  1. **Hamirpur (UP)**: Vendor `JAI SHREE SHYAM CONTRACTOR` received **124 separate payments on a single day (2025-06-12) totaling ₹2.98 Crore** (average payment ₹2,40,397).
  2. **Bhadohi (UP)**: Vendor `Gandhi Construction And Supplier` received **114 separate payments on a single day (2025-05-17) totaling ₹1.36 Crore** (average payment ₹1,18,982).
  3. **Jaunpur (UP)**: Vendor `Advent Infomax Pvt Ltd` received **112 separate payments on 2025-12-05 totaling ₹22.38 Lakhs** (average payment ₹19,989).
  4. **Kheri (UP)**: Vendor `Shiv Kumar` received **112 separate payments on 2025-09-21 totaling ₹64.62 Lakhs**.
  5. **Bidar (Karnataka)**: Vendor `SHRI NAVKAR METALS LIMITED` received **103 separate payments on 2025-08-20 totaling ₹6.06 Lakhs**.

### 🚨 Anomaly 3: Vendor Monopolization & Cartelization (HHI >= 5,000 in 51 IDAs)
The **Herfindahl-Hirschman Index (HHI)** measures market concentration on a scale of 0 to 10,000 (> 2,500 indicates high concentration; 10,000 is a pure monopoly).
- **51 Implementing District Authorities** have an HHI >= 5,000 where a single contractor captured over 50% to 100% of the entire district's MPLADS budget!
- **Pure Monopolies (100% Capture)**:
  - **Kishanganj (Bihar)**: Vendor `RANJIT SALES CORPORATION` captured **100.0% of the budget (₹6.10 Crore)**.
  - **Chatra (Jharkhand)**: Vendor `District Engineer` captured **100.0% of the budget (₹2.87 Crore)**.
  - **Gadag (Karnataka)**: Vendor `Project Manager Nirmiti kendra gadag` captured **100.0% of the budget (₹2.44 Crore)**.
  - **Simdega (Jharkhand)**: Vendor `EE NREP SIMDEGA` captured **100.0% of the budget (₹2.06 Crore)**.
  - **Kamjong (Manipur)**: Vendor `Raman Chihansung` captured **100.0% of the budget (₹1.62 Crore)**.
  - **Shamator (Nagaland)**: Vendor `Y RHEKHUM` captured **100.0% of the budget (₹1.05 Crore)**.
- **Top Vendors by Overall Fund Absorption**:
  - `KRIDL BHUSIRI ACCOUNT WORKS`: **₹24.89 Crore** across 17 IDAs
  - `HIDAYA QIRAT ENTERPRISES`: **₹21.96 Crore** across 7 IDAs
  - `SHRI GURU KRIPA NARSINGH ASSOCIATES`: **₹17.02 Crore** across 8 IDAs
  - `RAMJI CONSTRUCTION`: **₹16.83 Crore** across 3 IDAs
  - `LUCKY ASSOCIATES`: **₹16.53 Crore** across 7 IDAs

### 🚨 Anomaly 4: Multivariate Cost Anomalies via Isolation Forest (2,171 Outliers)
Using NetraDhrishti's Isolation Forest model (evaluating log-amount, median deviation in MADs, peer baseline by work type):
- **Namakkal (Tamil Nadu)**: Setting up farmers' training centers:
  - Peer group median: **₹16,200.00**
  - Payment to vendor `MOOKAMBIKA CONSTRUCTION`: **₹1,10,75,348.00 (₹1.11 Crore)** — **1,228.8 MADs above median!**
  - Second payment to same vendor: **₹62,36,106.00 (₹62.3 Lakhs)** — **691.1 MADs above median!**
  - Third payment to same vendor: **₹44,75,863.00 (₹44.7 Lakhs)** — **495.5 MADs above median!**
- **Bengaluru Urban (Karnataka)**: Installation/Construction of Anti-Pollution structure:
  - Peer group median: **₹11,499.00**
  - Payment to vendor `YASHODA R`: **₹49,75,000.00 (₹49.75 Lakhs)** — **481.8 MADs above median!**

### 🚨 Anomaly 5: Micro-Transaction Ledger Noise (< ₹100)
- **108 transactions** are under ₹100, including payments of **₹0.01, ₹0.10, ₹1.00, and ₹2.00**.
- **Audit Implication**: Zero-value or fractional-rupee entries often indicate failed bank test pings or unreversed ledger clearing debits cluttering public accounts.

### 🚨 Anomaly 6: Mega Capital Disbursements (> ₹50 Lakhs)
- **232 transactions** exceeded ₹50 Lakhs in a single disbursement (totaling ₹198.72 Crore).
- Top payment: **₹3.26 Crore** to `The Managing Director Kerala Medical Service Corporation Ltd` by *MUHAMMED HAMDULLAH SAYEED* (Lakshadweep) for hospital equipment.
- Second payment: **₹3.19 Crore** to `Dharwad Research and Technology Incubator Foundation` by *Smt. Nirmala Sitharaman* (Karnataka) for setting up laboratories.
- Third payment: **₹3.06 Crore** to `FORCE MOTORS LIMITED` by *Shri Derek O' Brien* (West Bengal) for mobile dispensaries.

### 🚨 Anomaly 7: Lingering Unsettled Payouts (Payment In-Progress)
- **3,389 records (3.12%)** are stuck in `Payment In-Progress`, representing **₹103.66 Crore** in unsettled public money.
- When cross-referenced with transaction dates dating back to 2024, these indicate stalled treasury authorizations or escrow blocks that district authorities need to reconcile.

---

## 4. Geographic Distribution Summary

### Top 5 States by MPLADS Expenditure:
1. **Uttar Pradesh**: ₹912.44 Crore (24,168 transactions)
2. **Bihar**: ₹386.90 Crore (5,096 transactions)
3. **Tamil Nadu**: ₹367.76 Crore (4,742 transactions)
4. **Madhya Pradesh**: ₹239.49 Crore (9,342 transactions)
5. **West Bengal**: ₹231.79 Crore (3,200 transactions)

---

## 5. Demonstration Strategy for SIH Evaluation

When demonstrating NetraDhrishti to the MoSPI evaluation panel:

1. **Highlight the Reality of the Data**: Point out that the system directly ingested their official dataset (`sih.csv`, 108,695 rows) and uncovered real, verifiable patterns without manual rule tuning.
2. **Showcase the Splitting Detection**: Demonstrate how the ML velocity engine flags the **124 same-day payments in Hamirpur (₹2.98 Cr)** and **114 in Bhadohi (₹1.36 Cr)**. This directly solves MoSPI's requirement for "early identification of tender circumvention and cost inefficiencies".
3. **Showcase District Vendor Monopoly (HHI)**: Open the **Agency Intelligence** page showing the 51 monopolized IDAs (e.g. Kishanganj at 100% vendor share).
4. **Demonstrate Explainability**: Show how the **Cost Engine (Isolation Forest)** explains why Namakkal was flagged (₹1.11 Cr vs ₹16,200 peer median) with exact feature attribution, rather than an unexplainable black box.
5. **Zero False Accusations**: Emphasize that NetraDhrishti strictly labels findings as *"Requires Administrative Verification"* and *"Risk Indicators"* per MoSPI operational guidelines.

---
*Generated by NetraDhrishti AI Audit Suite — All models trained & verified on live MoSPI SIH dataset.*
