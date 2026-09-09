-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id       BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role          VARCHAR(50)  NOT NULL
                    CHECK (role IN ('MP','district_officer','state_admin','mospi_admin')),
    constituency_id VARCHAR(50),
    district_id     VARCHAR(50),
    state_id        VARCHAR(50),
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state_id);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district_id);

-- ============================================================
-- TABLE 2: works
-- ============================================================
CREATE TABLE IF NOT EXISTS works (
    id                        BIGSERIAL PRIMARY KEY,
    unique_work_number        VARCHAR(100) UNIQUE NOT NULL,
    work_name                 VARCHAR(500) NOT NULL,
    work_description          TEXT,
    work_category             VARCHAR(200),
    state                     VARCHAR(100),
    implementing_district     VARCHAR(100),
    nodal_district            VARCHAR(100),
    constituency              VARCHAR(200),
    house_name                VARCHAR(50),
    mp_name                   VARCHAR(200),
    implementing_agency_name  VARCHAR(300),
    sanction_amount           DECIMAL(15,2),
    actual_expenditure        DECIMAL(15,2),
    released_amount           DECIMAL(15,2),
    recommendation_date       DATE,
    administrative_approval_date DATE,
    sanction_date             DATE,
    commencement_date         DATE,
    latest_progress_date      DATE,
    completion_date           DATE,
    final_payment_date        DATE,
    completion_marking_date   DATE,
    handover_date             DATE,
    work_status               VARCHAR(100),
    financial_year            VARCHAR(20),
    image_uploaded            VARCHAR(10),
    latitude                  DECIMAL(10,7),
    longitude                 DECIMAL(10,7),
    data_confidence           INT DEFAULT 0,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_works_state ON works(state);
CREATE INDEX IF NOT EXISTS idx_works_district ON works(implementing_district);
CREATE INDEX IF NOT EXISTS idx_works_constituency ON works(constituency);
CREATE INDEX IF NOT EXISTS idx_works_mp ON works(mp_name);
CREATE INDEX IF NOT EXISTS idx_works_fy ON works(financial_year);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(work_status);
CREATE INDEX IF NOT EXISTS idx_works_agency ON works(implementing_agency_name);

-- ============================================================
-- TABLE 3: fund_releases
-- ============================================================
CREATE TABLE IF NOT EXISTS fund_releases (
    id                 BIGSERIAL PRIMARY KEY,
    work_id            BIGINT REFERENCES works(id) ON DELETE CASCADE,
    installment_number INT,
    amount             DECIMAL(15,2),
    release_date       DATE,
    transaction_type   VARCHAR(50) DEFAULT 'Release',
    source_reference   VARCHAR(200),
    created_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fr_work ON fund_releases(work_id);
CREATE INDEX IF NOT EXISTS idx_fr_date ON fund_releases(release_date);

-- ============================================================
-- TABLE 4: work_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS work_progress (
    id                  BIGSERIAL PRIMARY KEY,
    work_id             BIGINT REFERENCES works(id) ON DELETE CASCADE,
    progress_date       DATE,
    physical_progress   DECIMAL(5,2),
    financial_progress  DECIMAL(5,2),
    work_status         VARCHAR(100),
    remarks             TEXT,
    source_reference    VARCHAR(200),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_work ON work_progress(work_id);
CREATE INDEX IF NOT EXISTS idx_wp_date ON work_progress(progress_date);

-- ============================================================
-- TABLE 5: data_quality_results
-- ============================================================
CREATE TABLE IF NOT EXISTS data_quality_results (
    id          BIGSERIAL PRIMARY KEY,
    work_id     BIGINT REFERENCES works(id) ON DELETE CASCADE,
    field_name  VARCHAR(100),
    issue_type  VARCHAR(50)
                  CHECK (issue_type IN ('MISSING_FIELD','INVALID_DATE','INVALID_AMOUNT',
                                        'INCONSISTENT_DATA','DUPLICATE_ID','UNMATCHED_REF')),
    severity    VARCHAR(10) CHECK (severity IN ('LOW','MEDIUM','HIGH')),
    message     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dq_work ON data_quality_results(work_id);
CREATE INDEX IF NOT EXISTS idx_dq_type ON data_quality_results(issue_type);

-- ============================================================
-- TABLE 6: work_features
-- ============================================================
CREATE TABLE IF NOT EXISTS work_features (
    work_id                BIGINT PRIMARY KEY REFERENCES works(id) ON DELETE CASCADE,
    cost_peer_median       DECIMAL(15,2),
    cost_peer_mad          DECIMAL(15,2),
    cost_deviation         DECIMAL(10,4),
    cost_z_score           DECIMAL(10,4),
    project_age_days       INT,
    sanction_delay_days    INT,
    start_delay_days       INT,
    execution_delay_days   INT,
    payment_delay_days     INT,
    closure_delay_days     INT,
    released_percentage    DECIMAL(7,2),
    expenditure_percentage DECIMAL(7,2),
    progress_gap           DECIMAL(7,2),
    duplicate_max_sim      DECIMAL(5,4),
    agency_work_share      DECIMAL(7,4),
    agency_district_share  DECIMAL(7,4),
    agency_avg_delay       DECIMAL(10,2),
    agency_high_risk_pct   DECIMAL(7,4),
    financial_year         VARCHAR(20),
    feature_version        VARCHAR(20),
    generated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 7: detection_results
-- ============================================================
CREATE TABLE IF NOT EXISTS detection_results (
    id            BIGSERIAL PRIMARY KEY,
    work_id       BIGINT REFERENCES works(id) ON DELETE CASCADE,
    engine_type   VARCHAR(20) NOT NULL
                    CHECK (engine_type IN ('COST','DUPLICATE','DELAY','FUND_FLOW','COMPLIANCE')),
    score         INT CHECK (score BETWEEN 0 AND 100),
    severity      VARCHAR(10) CHECK (severity IN ('LOW','MEDIUM','HIGH')),
    reason_code   VARCHAR(100),
    description   TEXT,
    evidence      JSONB,
    confidence    INT CHECK (confidence BETWEEN 0 AND 100),
    model_version VARCHAR(20),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_det_work ON detection_results(work_id);
CREATE INDEX IF NOT EXISTS idx_det_engine ON detection_results(engine_type);

-- ============================================================
-- TABLE 8: risk_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_scores (
    id                   BIGSERIAL PRIMARY KEY,
    work_id              BIGINT UNIQUE REFERENCES works(id) ON DELETE CASCADE,
    risk_score           INT,
    impact_score         INT,
    priority_score       INT,
    risk_level           VARCHAR(20)
                           CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL','INSUFFICIENT_DATA')),
    cost_score           INT DEFAULT 0,
    delay_score          INT DEFAULT 0,
    fund_score           INT DEFAULT 0,
    duplicate_score      INT DEFAULT 0,
    compliance_score     INT DEFAULT 0,
    data_confidence      INT DEFAULT 0,
    reason_codes         JSONB,
    inspection_mandatory BOOLEAN DEFAULT FALSE,
    generated_at         TIMESTAMPTZ DEFAULT NOW(),
    model_version        VARCHAR(20)
);
CREATE INDEX IF NOT EXISTS idx_risk_work ON risk_scores(work_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_priority ON risk_scores(priority_score DESC);

-- ============================================================
-- TABLE 9: compliance_rules (reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_rules (
    rule_id          VARCHAR(50) PRIMARY KEY,
    rule_name        VARCHAR(200) NOT NULL,
    rule_type        VARCHAR(50)
                       CHECK (rule_type IN ('CATEGORY','TIMELINE','ENTITLEMENT',
                                            'DATA_COMPLETENESS','FINANCIAL','RELATIONSHIP')),
    description      TEXT,
    source_reference VARCHAR(200),
    severity         VARCHAR(10) CHECK (severity IN ('LOW','MEDIUM','HIGH')),
    keywords         TEXT[],
    active           BOOLEAN DEFAULT TRUE
);

-- Seed 15 compliance rules
INSERT INTO compliance_rules (rule_id, rule_name, rule_type, description, source_reference, severity, keywords) VALUES
('RELIGIOUS_WORKS',    'Religious Works',             'CATEGORY',          'Works of religious nature or within religious premises are not permissible.',            'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['temple','mosque','church','gurudwara','masjid','mandir','prayer hall','religious','worship','shrine','dargah','pagoda','chapel']),
('LAND_ACQUISITION',   'Land Acquisition',            'CATEGORY',          'MPLADS funds shall not be used for acquisition of land or compensation.',              'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['land acquisition','land compensation','land purchase','property acquisition']),
('RESIDENTIAL',        'Residential Construction',    'CATEGORY',          'Residential buildings for Govt/PSU/others are not permissible.',                        'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['residential building','residential quarter','staff quarter','housing colony','residential complex']),
('COMMERCIAL',         'Commercial Establishment',    'CATEGORY',          'Commercial and private establishments are not permissible.',                             'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['commercial','private establishment','shop complex','mall','showroom']),
('RECURRING_EXP',      'Recurring Expenditure',       'CATEGORY',          'Recurring expenditure of any kind is not permissible.',                                  'Guidelines 2023, Ch.5', 'MEDIUM', ARRAY['recurring','salary','wages','maintenance contract','annual maintenance','operation and maintenance']),
('GRANTS_LOANS',       'Grants and Loans',            'CATEGORY',          'Grants and loans are not permissible under MPLADS.',                                     'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['grant','loan','financial assistance','subsidy','contribution to fund','relief fund']),
('WELCOME_GATES',      'Welcome Gates',               'CATEGORY',          'Swagat Dwars / Welcome Gates are not permissible.',                                      'Guidelines 2023, Ch.5', 'MEDIUM', ARRAY['swagat dwar','welcome gate','entry gate','pravesh dwar']),
('UNAUTHORIZED_COLONY','Unauthorized Colony Works',   'CATEGORY',          'Works in unauthorized colonies are not permissible.',                                     'Guidelines 2023, Ch.5', 'HIGH',   ARRAY['unauthorized colony','illegal colony','encroachment']),
('NAMED_ASSETS',       'Named Assets',                'CATEGORY',          'Naming assets after any person (living or dead) is not permissible.',                     'Guidelines 2023, Ch.5', 'MEDIUM', ARRAY[]::TEXT[]),
('SANCTION_DELAY',     'Sanction Timeline Violation', 'TIMELINE',          'Sanction must be issued within 45 days of receipt of MP recommendation.',                'Para 3.2.4',            'MEDIUM', ARRAY[]::TEXT[]),
('COMPLETION_DELAY',   'Completion Timeline Violation','TIMELINE',         'Works should generally be completed within 1 year of sanction.',                          'Para 3.2.12',           'MEDIUM', ARRAY[]::TEXT[]),
('ENTITLEMENT_EXCEED', 'Entitlement Exceeded',        'ENTITLEMENT',       'Total sanctioned works for an MP must not exceed ₹5 crore per annum.',                  'Guidelines 2023',       'HIGH',   ARRAY[]::TEXT[]),
('MISSING_IMAGE',      'Missing Completion Image',    'DATA_COMPLETENESS', 'Completed works should have uploaded images.',                                            'Guidelines 2023',       'LOW',    ARRAY[]::TEXT[]),
('RELEASE_GT_SANCTION','Release > Sanction',          'FINANCIAL',         'Released amount should not exceed sanctioned amount.',                                    'Guidelines 2023',       'HIGH',   ARRAY[]::TEXT[]),
('DUPLICATE_FUNDING',  'Duplicate Funding Indicator', 'RELATIONSHIP',      'Highly similar works in same district may indicate double funding.',                      'Guidelines 2023',       'HIGH',   ARRAY[]::TEXT[])
ON CONFLICT (rule_id) DO NOTHING;

-- ============================================================
-- TABLE 10: compliance_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_flags (
    id              BIGSERIAL PRIMARY KEY,
    work_id         BIGINT REFERENCES works(id) ON DELETE CASCADE,
    rule_id         VARCHAR(50) REFERENCES compliance_rules(rule_id),
    triggered       BOOLEAN DEFAULT FALSE,
    severity        VARCHAR(10),
    description     TEXT,
    evidence        JSONB,
    observed_value  TEXT,
    expected_value  TEXT,
    confidence      INT CHECK (confidence BETWEEN 0 AND 100),
    review_status   VARCHAR(20) DEFAULT 'PENDING'
                      CHECK (review_status IN ('PENDING','VERIFIED','OVERRIDDEN','DISMISSED')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cf_work ON compliance_flags(work_id);
CREATE INDEX IF NOT EXISTS idx_cf_rule ON compliance_flags(rule_id);
CREATE INDEX IF NOT EXISTS idx_cf_triggered ON compliance_flags(triggered);

-- ============================================================
-- TABLE 11: duplicate_candidates
-- ============================================================
CREATE TABLE IF NOT EXISTS duplicate_candidates (
    id                  BIGSERIAL PRIMARY KEY,
    work_id             BIGINT REFERENCES works(id) ON DELETE CASCADE,
    matched_work_id     BIGINT REFERENCES works(id) ON DELETE CASCADE,
    text_similarity     DECIMAL(5,4),
    location_similarity DECIMAL(5,4),
    agency_similarity   DECIMAL(5,4),
    amount_similarity   DECIMAL(5,4),
    date_similarity     DECIMAL(5,4),
    overall_similarity  DECIMAL(5,4),
    reason              TEXT,
    status              VARCHAR(20) DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING','CONFIRMED','REJECTED','ESCALATED')),
    reviewed_by         BIGINT REFERENCES users(user_id),
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dup_work ON duplicate_candidates(work_id);
CREATE INDEX IF NOT EXISTS idx_dup_matched ON duplicate_candidates(matched_work_id);
CREATE INDEX IF NOT EXISTS idx_dup_sim ON duplicate_candidates(overall_similarity DESC);

-- ============================================================
-- TABLE 12: fund_anomalies
-- ============================================================
CREATE TABLE IF NOT EXISTS fund_anomalies (
    id              BIGSERIAL PRIMARY KEY,
    work_id         BIGINT REFERENCES works(id) ON DELETE CASCADE,
    anomaly_type    VARCHAR(50) NOT NULL,
    score           INT CHECK (score BETWEEN 0 AND 100),
    severity        VARCHAR(10),
    expected_value  DECIMAL(15,2),
    actual_value    DECIMAL(15,2),
    amount_involved DECIMAL(15,2),
    reason_code     VARCHAR(100),
    description     TEXT,
    confidence      INT CHECK (confidence BETWEEN 0 AND 100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fa_work ON fund_anomalies(work_id);
CREATE INDEX IF NOT EXISTS idx_fa_type ON fund_anomalies(anomaly_type);

-- ============================================================
-- TABLE 13: inspections
-- ============================================================
CREATE TABLE IF NOT EXISTS inspections (
    inspection_id       BIGSERIAL PRIMARY KEY,
    work_id             BIGINT REFERENCES works(id) ON DELETE CASCADE,
    assigned_to         BIGINT REFERENCES users(user_id),
    status              VARCHAR(20) DEFAULT 'Pending'
                          CHECK (status IN ('Pending','InProgress','Completed')),
    remarks             TEXT,
    findings            TEXT,
    evidence_references JSONB,
    review_decision     VARCHAR(30)
                          CHECK (review_decision IS NULL OR review_decision IN
                            ('Confirmed','Needs verification','False positive','No action','Escalated')),
    escalated_to        BIGINT REFERENCES users(user_id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_insp_work ON inspections(work_id);
CREATE INDEX IF NOT EXISTS idx_insp_status ON inspections(status);

-- ============================================================
-- TABLE 14: audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_user_id   BIGINT REFERENCES users(user_id),
    action_type     VARCHAR(50) NOT NULL,
    target_type     VARCHAR(30),
    target_id       VARCHAR(100),
    details         JSONB,
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    ip_address      VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(timestamp DESC);

-- ============================================================
-- TABLE 15: risk_weights (singleton settings row)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_weights (
    id           SERIAL PRIMARY KEY,
    cost_w       DECIMAL(4,2) DEFAULT 0.30,
    delay_w      DECIMAL(4,2) DEFAULT 0.25,
    fund_w       DECIMAL(4,2) DEFAULT 0.20,
    duplicate_w  DECIMAL(4,2) DEFAULT 0.15,
    compliance_w DECIMAL(4,2) DEFAULT 0.10,
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_by   BIGINT REFERENCES users(user_id)
);
INSERT INTO risk_weights (cost_w, delay_w, fund_w, duplicate_w, compliance_w)
VALUES (0.30, 0.25, 0.20, 0.15, 0.10)
ON CONFLICT DO NOTHING;
