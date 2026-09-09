import sys
import os
import time

sys.path.insert(0, os.path.dirname(__file__))
from db import execute

print("=== STARTING FAST ML PIPELINE ON SIH DATASET ===")
t0 = time.time()

# 1. Data Quality
print("\n[1/8] Data Quality...")
from ingest.data_quality import compute_data_quality
compute_data_quality()

# 2. Features
print("\n[2/8] Feature Engineering...")
from features.feature_engine import compute_features
compute_features()

# 3. Cost Engine (Isolation Forest)
print("\n[3/8] Cost Engine (Isolation Forest)...")
from engines.cost_engine import run_cost_engine
run_cost_engine()

# 4. Delay Engine
print("\n[4/8] Delay Engine...")
from engines.delay_engine import run_delay_engine
run_delay_engine()

# 5. Duplicate Engine
print("\n[5/8] Duplicate Engine...")
from engines.duplicate_engine import run_duplicate_engine
run_duplicate_engine()

# 6. Fund Flow Engine
print("\n[6/8] Fund Flow Engine...")
from engines.fund_flow_engine import run_fund_flow_engine
run_fund_flow_engine()

# 7. Compliance Engine
print("\n[7/8] Compliance Engine...")
from engines.compliance_engine import run_compliance_engine
run_compliance_engine()

# 8. Risk Aggregator
print("\n[8/8] Risk Aggregator...")
from risk.aggregator import run_aggregator
run_aggregator()

# Seed demo users
from seed_users import seed_users
seed_users()

print(f"\n=== ML PIPELINE COMPLETED IN {time.time() - t0:.1f}s ===")
