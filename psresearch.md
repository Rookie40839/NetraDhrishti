## In‑depth research and understanding of SIH26102 (PS 102)

Below is a consolidated, reference‑backed breakdown of the problem statement, its context, the data landscape, and the real operational constraints you should design for.

***

## 1. Official problem statement (SIH26102) – what MoSPI actually asks for

**Title:**  
*Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation regd.* [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

**Organization:** MoSPI – Data Informatics & Innovation Division (DIID)  
**Category:** Software  
**Theme:** Smart Automation  
**Deadline:** 30 September 2026 [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

### 1.1 Background (paraphrased + key quotes)

MPLADS is a Central Sector Scheme under which MPs recommend developmental works to create durable community assets and basic civic amenities. The scheme involves:

- Large-scale fund utilization.
- Thousands of works across the country.
- Multiple implementing agencies and administrative authorities.

Given the **volume and complexity** of financial and project-related data, MoSPI states:

> “there is a need for an AI-powered solution that can leverage machine learning and advanced analytics to detect trends and anomalies in expenditure patterns, fund utilization, cost estimates, and work execution, thereby enabling early identification of potential fraud, inefficiencies, and non-compliance while enhancing transparency, accountability, and effective monitoring of MPLADS works.” [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

### 1.2 Description (what the solution must do)

MoSPI’s description explicitly requires a platform that:

- Leverages **ML/AI/advanced analytics**.
- Identifies **trends, anomalies, irregularities, and potential fraud** in:
  - Fund utilization
  - Project execution
- Analyzes data relating to:
  - Sanctions
  - Expenditures
  - Cost estimates
  - Work progress
  - Payments
  - Asset creation
- Detects:
  - Unusual patterns
  - Cost overruns
  - Duplicate works
  - Delayed projects
  - Deviations from established norms
- Generates:
  - **Risk-based alerts**
  - **Predictive insights**
  - **Decision-support dashboards** for:
    - MPs
    - State Nodal Authorities
    - District Authorities
    - Ministry
- Facilitates:
  - Automated compliance monitoring
  - Trend analysis
  - Early warning mechanisms
- Goals:
  - Improve **transparency**, **accountability**, and **efficiency** in MPLADS implementation. [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

### 1.3 Expected solution (how they want it to behave)

The “Expected Solution” section frames this as a **monitoring and decision-support tool**, not a legal fraud-determination engine:

- Analyze data on:
  - Project approvals
  - Expenditures
  - Payments
  - Work progress
  - Completion status
- Identify:
  - Unusual patterns
  - Delays
  - Cost overruns
  - Duplicate works
  - Potential misuse of funds
- Automatically:
  - Generate alerts
  - Highlight high-risk cases needing attention
- Provide:
  - Easy-to-understand dashboards and insights for MPs, State/District authorities, and Ministry
- Use AI/analytics to:
  - Enhance transparency
  - Strengthen accountability
  - Reduce manual monitoring effort
  - Support more effective implementation of MPLADS works. [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

**Key takeaway:**  
The PS is explicitly about **AI-enabled monitoring, risk scoring, and early-warning**, not about automatically declaring fraud. Your system must be explainable, actionable, and aligned with how MoSPI and district authorities actually monitor works.

***

## 2. MPLADS scheme – operational context you must respect

### 2.1 Basic scheme mechanics

- MPLADS is a **Central Sector Scheme**, fully funded by GoI. 
- Each MP can recommend works up to **₹5 crore per annum** in their constituency/allowed region. 
- Works must create **durable community assets** and address locally felt needs. 
- The scheme has been revised multiple times; current guidelines are from **April 2023**. 

### 2.2 Stakeholders and roles (critical for dashboards and alerts)

From the 2023 Guidelines:

- **MoSPI**: Prescribes guidelines; overall monitoring; annual reports; meetings with States/UTs. 
- **Central Nodal Agency (PMU-MPLADS under MoSPI)**:
  - Reviews physical & financial progress.
  - Manages revised fund flow.
  - Monitors audit & utilization certificates.
  - Engages auditors.
  - Conducts third-party evaluations in sample districts.
  - Organizes training and awareness. 
- **State Nodal Authority**:
  - Coordinates and monitors MPLADS in the State/UT.
  - Inspects at least **1% of works by value** in every district annually.
  - Conducts third-party inspection:
    - All works **≥ ₹25 lakh** compulsorily.
    - **50%** of works between **₹15–25 lakh**.
    - At least **50 other works** sampled using parameters like cost, SC/ST areas, trusts/societies, bar associations.
  - Submits inspection reports to Central Nodal Agency annually. [mplads.gov](https://www.mplads.gov.in/MPLADS/UploadedFiles/MPLADSGuidelinesApril2023.pdf)
- **District Authority (Nodal/Implementing)**:
  - Overall monitoring and supervision at district level.
  - Inspects at least **10% of works under implementation** every year.
  - Maintains work registers with photos for each MP and tenure.
  - Inspects **all works executed for societies/trusts**.
  - Maintains asset register and posts data publicly.
  - Reviews implementation with agencies monthly; invites MP. 
- **Implementing Agencies**:
  - Execute works as per specifications and time schedule.
  - Maintain work registers with physical & financial progress.
  - Must inspect **100% of works**. 
- **User Agencies**:
  - Custodians of created assets; responsible for operation and maintenance. 

**Implication for your system:**  
Your risk engine and dashboards must map to these roles and inspection mandates. For example:

- District-level dashboard should surface a **monthly inspection priority list** that helps them meet their 10% target efficiently.
- State dashboard should highlight works that qualify for mandatory third-party inspection (≥ ₹25 lakh, 15–25 lakh band, etc.).
- Ministry dashboard should show systemic patterns: districts/agencies/MPs with repeated high-risk works.

***

## 3. Timelines and norms that define “anomaly” and “delay”

These are crucial because they give you **ground-truth rules** to detect non-compliance.

### 3.1 Sanction timeline

From the 2023 Guidelines (Para 3.2.4):

> “The sanction/rejection in respect of all recommendations made by the Member of Parliament shall be issued by the Implementing District Authority **within 45 days** from the date of receipt of the recommendations.” [mplads.mospi.gov](https://mplads.mospi.gov.in/)

So you can define:

- **Sanction delay anomaly** if:
  - `date_of_administrative_approval` − `date_of_receipt_of_work_proposal_from_mp` > 45 days (excluding model code of conduct periods, if that data is available).

### 3.2 Completion timeline

From Para 3.2.12:

> “The sanction letter … shall stipulate a time limit for completion of the work by the Implementing Agency, which should **generally not exceed one year** from the date of sanction. In exceptional cases (e.g., difficult/hilly terrain), specific justification shall be incorporated in the sanction letter.” [scribd](https://www.scribd.com/document/957462135/Mplads-Monitoring)

So you can define:

- **Delay anomaly** if:
  - Work status is not “Completed” and elapsed time since `date_of_administrative_approval` exceeds ~1 year without a recorded justification.
- **Stalled project** if:
  - Long elapsed time + low or no financial progress + no completion date.

These are explicit, policy-backed thresholds you can cite in your solution.

***

## 4. Permissible vs non-permissible works – rule-based compliance layer

Your system should include a **rules engine** based on Chapter 5 of the 2023 Guidelines.

### 4.1 Permissible purposes (high level)

MPLADS funds can be used for:

- Public and community buildings.
- Public conveniences, safety, and security.
- Education.
- Public health.
- Drinking water and sanitation.
- Irrigation, drainage, flood control.
- Animal husbandry, dairy, fisheries.
- Agriculture and farmer welfare.
- Energy supply and distribution.
- Railways, roads, bridges, pathways.
- Environment, forests, natural resources.
- Public recreational facilities, sports, parks. 

There is also an **indicative list** in Annexure-VIII (not exhaustive). 

### 4.2 Not permissible (critical for rule flags)

MPLADS funds **shall not** be used for:

- Operation and maintenance.
- Residential buildings (for Govt/PSU/others).
- Commercial and private establishments.
- Naming assets after any person (living or dead).
- Grants and loans.
- Contributions to relief funds.
- **Acquisition of land or compensation for land.**
- Reimbursement for completed/partly completed works.
- Assets for individual/family benefits (except specified assistive devices).
- Pooling with CSR funds.
- **Works of religious nature**, or within places/premises of religious worship, or on land owned by religious faith/group.
- Swagat Dwars / Welcome Gates.
- Works in unauthorized colonies.
- Recurring expenditure of any kind. [sansad](https://sansad.in/getFile/lsapps/loksabhaquestions/annex/188/AS44_hNPX9H.pdf?source)

**Implication:**  
You can implement a **compliance-score** based on:

- Keywords in `work_name` / `work_description` (e.g., “temple”, “mosque”, “church”, “land acquisition”, “compensation”, “residential”, “grant”, “loan”, “O&M”, “recurring”).
- Work category mappings (if available).
- Flagging works that likely violate these prohibitions as **“Potential non-permissible work – requires verification”**.

This is a very strong, explainable component that aligns directly with the guidelines.

***

## 5. Data landscape – what datasets actually exist and their fields

You have multiple public datasets from **data.gov.in** and **dataful.in**, derived from MoSPI/eSAKSHI.

### 5.1 Core work-level datasets

Examples:

- **“MPLADS: Year-, State- and MP-wise List of Works and Funds sanctioned … (Rajya Sabha)”** [jharkhand.gov](https://www.jharkhand.gov.in/PDepartment/ViewDocument?id=D024DO002SD00115012019032020209)
- **“17th Lok Sabha MPLADS: Year-, State-, District-, Constituency- and MP-wise List of Works …”** [mospi.gov](https://mospi.gov.in/sites/default/files/reports_and_publication/annual_report_of_ministry/2003_2004/arep_2003_04_chapterX.pdf)
- **“18th Lok Sabha MPLADS: State, Lok Sabha Constituency wise Work Name wise total amount spent on works completed …”** [dataful](https://dataful.in/datasets/18539/)

Common fields in work-level datasets include:

- `data_as_on`
- `state`
- `nodal_district` / `nodal_district_per_source` / `nodal_district_per_lgd`
- `implementing_district` / variants
- `constituency`
- `house_name` (Lok Sabha / Rajya Sabha)
- `member_type`
- `mp_name`
- `sanction_amount`
- `date_of_administrative_approval`
- `work_name`
- `unique_work_number`
- `implementing_agency_name`
- `work_status` (e.g., “New Recommendation”, “Financial Sanction Approved”, “Completed”, etc.)
- `date_of_receipt_of_work_proposal_from_mp`
- `unit` / `note` [jharkhand.gov](https://www.jharkhand.gov.in/PDepartment/ViewDocument?id=D024DO002SD00115012019032020209)

For 18th Lok Sabha completed works, additional fields include:

- `work_category`
- `work_description`
- `date_of_completion`
- `image_uploaded` (Yes/No)
- `amount` (spent on completed works) [dataful](https://dataful.in/datasets/18539/)

### 5.2 Fund-release and summary datasets

Other datasets cover:

- State-wise summary of funds released, sanctioned, spent, unspent. [dataful](https://dataful.in/datasets/18533/)
- MP-wise entitlement, released, sanctioned, expenditure, utilization percentage, unspent balance. [dataful](https://dataful.in/datasets/22566/)
- Year-, state-, district-, MP-wise fund releases with:
  - `fiscal_year`
  - `fund_release_date`
  - `installment_number`
  - `released_amount` [dataful](https://dataful.in/datasets/18542/)

These enable:

- Fund utilization analysis.
- Detection of high unspent balances.
- Correlation between fund release patterns and work progress.

### 5.3 eSAKSHI portal data model (conceptual)

From the eSAKSHI description:

- MPs recommend works and earmark funds from their annual entitlement.
- District Authorities sanction/execute works.
- Implementing Agencies:
  - Raise vendor payment requests at various stages.
  - Update progress.
  - Mark work as “complete” upon final payment.
- Dashboard shows:
  - Works recommended.
  - Works sanctioned.
  - Works completed.
  - Expenditure on completed and ongoing works.
  - Amounts consented for calamities. [mplads.gov](https://www.mplads.gov.in/MPLADS/UploadedFiles/HTML/RS/rsstat00.htm)

The portal also supports uploading:

- Images of assets.
- Relevant documents at each payment stage. [mplads.gov](https://www.mplads.gov.in/MPLADS/UploadedFiles/HTML/RS/rsstat00.htm)

However, **public access** to all these attachments and detailed payment-stage data is not guaranteed in a structured, bulk format. Your solution must assume:

- Work-level sanctions and statuses are reliably available.
- Detailed payment-stage and document-level data may be partial or require special access.

***

## 6. Monitoring and inspection regime – where your system adds value

The guidelines define specific inspection obligations that your system can directly optimize.

### 6.1 District-level inspections

- District Authorities must inspect **at least 10% of works under implementation every year**, involving the MP where feasible. 

Your system can:

- Rank ongoing works by risk.
- Suggest a **monthly/quarterly inspection plan** that:
  - Covers high-risk works early.
  - Ensures 10% target is met efficiently.
  - Prioritizes works with:
    - High cost.
    - Long delays.
    - Repeated implementing agency issues.
    - Potential non-permissible categories.

### 6.2 State-level and third-party inspections

State Nodal Authorities must:

- Inspect minimum **1% of works by value** in every district annually.
- Carry out third-party inspection:
  - All works **≥ ₹25 lakh**.
  - **50%** of works between **₹15–25 lakh**.
  - At least **50 other works** sampled using multiple parameters. [mplads.gov](https://www.mplads.gov.in/MPLADS/UploadedFiles/MPLADSGuidelinesApril2023.pdf)

Your system can:

- Auto-tag works that fall into mandatory third-party inspection categories.
- Generate a **state-level inspection queue**:
  - Compulsory high-value works.
  - High-risk works in the 15–25 lakh band.
  - Additional sampled works based on risk scores.

This directly operationalizes the guidelines into a data-driven workflow.

***

## 7. Types of anomalies and inefficiencies implied by the PS

Combining the PS text and guidelines, the following anomaly classes are clearly in scope:

### 7.1 Cost-related anomalies

- Cost overruns relative to:
  - Work category.
  - District/state norms.
  - Historical patterns.
- Outliers in `sanction_amount` or `amount` for similar `work_name`/`work_category`.
- Repeated high-cost works by specific agencies or districts.

Data fields used:

- `sanction_amount`, `amount`
- `work_name`, `work_category`
- `implementing_district`, `state`
- `implementing_agency_name`
- `date_of_administrative_approval` (for time-based normalization)

### 7.2 Duplicate or near-duplicate works

- Same work recommended/sanctioned multiple times under slightly different names.
- Possible double funding or data-entry duplication.

Signals:

- High text similarity between `work_name` / `work_description`.
- Same `implementing_district`, `implementing_agency_name`, `mp_name`.
- Similar `sanction_amount`.
- Close `date_of_administrative_approval` or `date_of_receipt_of_work_proposal_from_mp`.
- Same or similar `unique_work_number` patterns (if any).

### 7.3 Delay and stalled-project anomalies

- Sanction delays (> 45 days from receipt to approval). [mplads.mospi.gov](https://mplads.mospi.gov.in/)
- Completion delays (> 1 year from sanction without justification). [scribd](https://www.scribd.com/document/957462135/Mplads-Monitoring)
- Works with:
  - Old sanction dates.
  - Status not “Completed”.
  - Low or no expenditure relative to sanction amount.

### 7.4 Fund utilization inefficiencies

- High released funds but low sanctioned works.
- High sanctioned amount but low expenditure.
- MPs/districts with persistently high unspent balances.
- Irregular fund release patterns (e.g., heavy end-of-year spending).

Data fields:

- `released_amount`, `installment_number`, `fund_release_date`
- `sanction_amount`, `work_status`
- Aggregate summaries by MP/district/state/year.

### 7.5 Compliance deviations (non-permissible works)

- Works that appear to violate:
  - Religious-work prohibition.
  - Land acquisition/compensation prohibition.
  - Residential/commercial use prohibitions.
  - Recurring expenditure, grants, loans, etc.

This is primarily a **rule-based NLP + category mapping** problem.

### 7.6 Systemic inefficiencies and concentration risks

- Implementing agencies with:
  - Consistently high delays.
  - High share of high-risk works.
  - Dominance in a particular MP’s or district’s portfolio.
- Districts/states with:
  - Repeated sanction delays.
  - Low completion rates.
  - High proportion of non-compliant work categories.

These require aggregation and ranking at agency/district/MP/state levels.

***

## 8. What the PS does *not* explicitly require (but you must be careful about)

- **Automatic fraud declaration**: The PS talks about “potential fraud” and “early identification,” not final determination. Your system should present **risk indicators**, not verdicts. [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)
- **Legal or disciplinary action automation**: The guidelines state that State/UT governments fix responsibility and take disciplinary action in case of material breach. Your system supports that process; it does not replace it. 
- **Reliance on data that is not publicly available**: Detailed vendor bills, internal inspection reports, full geotagged photo sets, and complete payment-stage data may not be fully accessible in bulk. Design core features around fields that are known to exist in public datasets. [jharkhand.gov](https://www.jharkhand.gov.in/PDepartment/ViewDocument?id=D024DO002SD00115012019032020209)

***

## 9. How this maps to your current solution document

Your existing solution already aligns well with the PS in several ways:

- Focus on **cost anomalies, duplicates, delays, composite risk scores, and role-based dashboards**. 
- Use of public MPLADS data from data.gov.in/dataful.in. 
- Emphasis on **explainability** (reason codes, benchmarking). 
- Realistic scoping of future features (payment-progress mismatch, photo verification) as pending richer data. 

Gaps relative to the deeper PS understanding:

1. **Explicit rule-based compliance engine** tied to the 2023 Guidelines (permissible/non-permissible works, sanction/completion timelines). [mplads.mospi.gov](https://mplads.mospi.gov.in/)
2. **Fund utilization and release pattern analysis** as a first-class module, not just a side note. [dataful](https://dataful.in/datasets/22566/)
3. **Inspection-prioritization workflows** that directly help District/State authorities meet their 10% / 1% / third-party inspection mandates. [mplads.gov](https://www.mplads.gov.in/MPLADS/UploadedFiles/MPLADSGuidelinesApril2023.pdf)
4. Clearer separation between:
   - **Risk of anomaly/non-compliance** (your system’s output).
   - **Fraud/misuse determination** (human/authority decision). [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

***

## 10. Concise problem framing you can use in your solution

You can frame SIH26102 as:

> Build an AI- and rules-based monitoring platform for MPLADS that ingests public work, fund, and progress data; applies policy rules (sanction/completion timelines, permissible works) and statistical/ML models (cost outliers, duplicates, delays, fund-utilization anomalies); and produces explainable risk scores and inspection-priority lists for MPs, District/State authorities, and MoSPI to improve transparency, accountability, and efficiency in scheme implementation. [sih2026.vuce](https://sih2026.vuce.in/ps/SIH26102)

If you want, next I can:  
- Redraft your solution document’s “Problem Understanding” and “Proposed Solution” sections to reflect this deeper PS analysis, or  
- Design a concrete feature-to-guideline mapping table (each feature ↔ specific MPLADS rule/PS requirement).