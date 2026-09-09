import os
from generate_synthetic_data import generate_works, generate_funds_and_progress
from ingest.loader import run_loader
from ingest.data_quality import compute_data_quality
from features.feature_engine import compute_features
from engines.cost_engine import run_cost_engine
from engines.delay_engine import run_delay_engine
from engines.duplicate_engine import run_duplicate_engine
from engines.fund_flow_engine import run_fund_flow_engine
from engines.compliance_engine import run_compliance_engine
from risk.aggregator import run_aggregator
from seed_users import seed_users
from db import execute

def run_pipeline():
    print("=== NetraDhrishti ML Pipeline Started ===")
    
    # 1. Clear existing data (optional, but good for clean run)
    print("Clearing existing data...")
    try:
        execute("TRUNCATE TABLE works CASCADE")
        execute("TRUNCATE TABLE detection_results CASCADE")
        execute("TRUNCATE TABLE duplicate_candidates CASCADE")
        execute("TRUNCATE TABLE compliance_flags CASCADE")
        execute("TRUNCATE TABLE fund_anomalies CASCADE")
    except Exception as e:
        print(f"Truncate warning: {e}")
    
    # 2. Check if synthetic data exists, if not generate
    if not os.path.exists('../data/works_demo.csv'):
        print("Generating synthetic data...")
        df_works = generate_works()
        df_works, df_funds, df_prog = generate_funds_and_progress(df_works)
        df_works.to_csv('../data/works_demo.csv', index=False)
        df_funds.to_csv('../data/fund_releases_demo.csv', index=False)
        df_prog.to_csv('../data/work_progress_demo.csv', index=False)
        
    # 3. Ingest Data
    print("=== Phase 1: Ingestion ===")
    run_loader()
    
    # 4. Data Quality
    print("=== Phase 2: Data Quality ===")
    compute_data_quality()
    
    # 5. Features
    print("=== Phase 3: Feature Engineering ===")
    compute_features()
    
    # 6. Detection Engines
    print("=== Phase 4: Detection Engines ===")
    run_cost_engine()
    run_delay_engine()
    run_duplicate_engine()
    run_fund_flow_engine()
    run_compliance_engine()
    
    # 7. Aggregation
    print("=== Phase 5: Risk Aggregation ===")
    run_aggregator()
    
    # 8. Seed Users
    seed_users()
    
    print("=== Pipeline Completed Successfully ===")

if __name__ == "__main__":
    run_pipeline()
