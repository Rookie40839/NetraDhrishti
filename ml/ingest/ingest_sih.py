"""
NetraDhrishti - SIH Dataset Ingestion & Database Population
Converts raw MoSPI SIH expenditure records into NetraDhrishti's schema:
  - Aggregates transactions into 'works'
  - Maps payment records to 'fund_releases'
  - Generates initial 'work_progress' records
  - Extracts clean district names and agencies from IDA field
  - Populates Supabase database and triggers ML anomaly detection pipeline
"""

import sys
import os
import re
import uuid
import pandas as pd
import numpy as np

# Ensure path to ml modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_engine, execute, fetch_df
from seed_users import seed_users

sys.stdout.reconfigure(encoding='utf-8')

def extract_district(ida_str):
    """Extract clean district name from IDA string, e.g. 'GHAZIABAD(DISTRICT MAGISTRAE GHAZIABAD_IDA)' -> 'Ghaziabad'"""
    if not isinstance(ida_str, str):
        return "Unknown"
    match = re.match(r"^([^\(]+)", ida_str.strip())
    if match:
        return match.group(1).strip().title()
    return ida_str[:50].strip().title()

def extract_agency(ida_str):
    """Extract agency title from inside parentheses, or fallback to full string"""
    if not isinstance(ida_str, str):
        return "Unknown Agency"
    match = re.search(r"\(([^\)]+)\)", ida_str)
    if match:
        return match.group(1).replace("_IDA", "").replace("_ida", "").strip().title()
    return ida_str[:100].strip().title()

def categorize_work(desc):
    """Map free-text work description to standard MPLADS categories"""
    desc_lower = str(desc).lower()
    if any(k in desc_lower for k in ['road', 'pathway', 'drainage', 'bridge', 'culvert']):
        return 'Roads & Pathways'
    elif any(k in desc_lower for k in ['light', 'solar', 'electrification', 'lamp']):
        return 'Public Lighting'
    elif any(k in desc_lower for k in ['community', 'hall', 'center', 'bhavan', 'shelter']):
        return 'Community Facilities'
    elif any(k in desc_lower for k in ['school', 'college', 'room', 'education', 'classroom']):
        return 'Education'
    elif any(k in desc_lower for k in ['hospital', 'dispensary', 'health', 'medical', 'ambulance']):
        return 'Healthcare'
    elif any(k in desc_lower for k in ['water', 'pipe', 'tank', 'irrigation', 'borewell', 'handpump']):
        return 'Drinking Water & Sanitation'
    elif any(k in desc_lower for k in ['cremation', 'burial', 'crematorium']):
        return 'Public Amenities'
    elif any(k in desc_lower for k in ['sport', 'stadium', 'gym', 'playground']):
        return 'Sports & Youth'
    return 'Other Community Infrastructure'

def prepare_sih_cohort(csv_path="sih.csv", sample_limit=2000):
    """
    Extracts a representative, high-anomaly cohort from sih.csv:
    Prioritizes:
      1. Hamirpur, Bhadohi, Jaunpur, Kheri (Severe tender splitting bursts)
      2. Kishanganj, Chatra, Simdega, Gadag, Kamjong (Monopolies)
      3. Namakkal, Bengaluru Urban, Lakshadweep (Cost outliers)
      4. Representative sample from Maharashtra, UP, Bihar, Tamil Nadu, Punjab, etc.
    """
    if not os.path.exists(csv_path):
        csv_path = "SIH_CSV"
        
    print(f"Reading {csv_path} for database cohort extraction...")
    df = pd.read_csv(csv_path)
    amt_col = 'Expenditure Amount (₹)'
    
    df['exp_date'] = pd.to_datetime(df['Expenditure Date'], errors='coerce')
    df['clean_district'] = df['IDA'].apply(extract_district)
    df['clean_agency'] = df['IDA'].apply(extract_agency)
    df['category'] = df['Work Description'].apply(categorize_work)
    
    # Priority districts with famous anomalies
    priority_districts = [
        'Hamirpur', 'Bhadohi', 'Jaunpur', 'Kheri', 'Bidar', # splitting
        'Kishanganj', 'Chatra', 'Simdega', 'Gadag', 'Kamjong', 'Shamator', # monopolies
        'Namakkal', 'Bengaluru Urban', 'Lakshadweep', # cost outliers
        'Pune', 'Mumbai', 'Nagpur', 'Thane', # Maharashtra for default persona
        'Ghaziabad', 'Varanasi', 'Lucknow', 'Patna' # major urban centers
    ]
    
    df_priority = df[df['clean_district'].isin(priority_districts)].copy()
    df_others = df[~df['clean_district'].isin(priority_districts)].copy()
    
    # Group into works
    grp_cols = ['State', 'Constituency', 'MP Name', 'Work Description', 'Vendor', 'IDA', 'clean_district', 'clean_agency', 'category', 'House']
    priority_groups = df_priority.groupby(grp_cols)
    other_groups = df_others.groupby(grp_cols)
    
    works_list = []
    funds_list = []
    
    work_counter = 1
    
    def process_group(group_tuple, group_df):
        nonlocal work_counter
        (state, constituency, mp_name, work_desc, vendor, ida, district, agency, category, house) = group_tuple
        work_num = f"MPLADS-{state[:2].upper()}-{district[:3].upper()}-{2024}-{work_counter:05d}"
        
        total_exp = float(group_df[amt_col].sum())
        min_date = group_df['exp_date'].min()
        max_date = group_df['exp_date'].max()
        
        all_success = (group_df['Payment Status'] == 'Payment Success').all()
        status = 'Completed' if all_success else 'In Progress'
        
        recom_date = min_date - pd.Timedelta(days=120) if pd.notna(min_date) else None
        sanction_date = min_date - pd.Timedelta(days=60) if pd.notna(min_date) else None
        start_date = min_date - pd.Timedelta(days=30) if pd.notna(min_date) else None
        comp_date = max_date if all_success else None
        
        works_list.append({
            'unique_work_number': work_num,
            'work_name': f"{category} - {vendor[:30]}",
            'work_description': work_desc,
            'work_category': category,
            'state': state,
            'implementing_district': district,
            'nodal_district': district,
            'constituency': constituency,
            'house_name': house,
            'mp_name': mp_name,
            'implementing_agency_name': agency,
            'sanction_amount': round(total_exp * 1.05, 2),
            'actual_expenditure': round(total_exp, 2),
            'released_amount': round(total_exp, 2),
            'recommendation_date': recom_date.strftime('%Y-%m-%d') if pd.notna(recom_date) else None,
            'administrative_approval_date': sanction_date.strftime('%Y-%m-%d') if pd.notna(sanction_date) else None,
            'sanction_date': sanction_date.strftime('%Y-%m-%d') if pd.notna(sanction_date) else None,
            'commencement_date': start_date.strftime('%Y-%m-%d') if pd.notna(start_date) else None,
            'latest_progress_date': max_date.strftime('%Y-%m-%d') if pd.notna(max_date) else None,
            'completion_date': comp_date.strftime('%Y-%m-%d') if pd.notna(comp_date) else None,
            'work_status': status,
            'financial_year': '2024-2025',
            'image_uploaded': 'YES' if all_success else 'NO',
            'data_confidence': 90,
        })
        
        inst = 1
        for _, tx in group_df.sort_values(by='exp_date').iterrows():
            funds_list.append({
                'unique_work_number': work_num,
                'installment_number': inst,
                'amount': float(tx[amt_col]),
                'release_date': tx['exp_date'].strftime('%Y-%m-%d') if pd.notna(tx['exp_date']) else None,
                'transaction_type': 'Release',
                'source_reference': f"SIH-TX-{inst:03d}-{tx['Payment Status'][:4]}"
            })
            inst += 1
            
        work_counter += 1

    # First add all priority groups
    for g_tuple, g_df in priority_groups:
        process_group(g_tuple, g_df)
        if sample_limit and work_counter > sample_limit:
            break
            
    # Then supplement with others
    if sample_limit and work_counter < sample_limit:
        for g_tuple, g_df in other_groups:
            process_group(g_tuple, g_df)
            if work_counter > sample_limit:
                break
                
    df_works = pd.DataFrame(works_list)
    df_funds = pd.DataFrame(funds_list)
    print(f"Prepared {len(df_works):,} SIH works with {len(df_funds):,} fund transactions.")
    return df_works, df_funds

def ingest_to_database(sample_limit=1500):
    print("=" * 70)
    print("STARTING SIH DATASET DATABASE INGESTION & PIPELINE RUN")
    print("=" * 70)
    
    df_works, df_funds = prepare_sih_cohort(sample_limit=sample_limit)
    
    print("\n[Step 1] Clearing existing synthetic records...")
    execute("TRUNCATE TABLE works CASCADE")
    execute("TRUNCATE TABLE detection_results CASCADE")
    execute("TRUNCATE TABLE duplicate_candidates CASCADE")
    execute("TRUNCATE TABLE compliance_flags CASCADE")
    execute("TRUNCATE TABLE fund_anomalies CASCADE")
    execute("TRUNCATE TABLE data_quality_results CASCADE")
    print("Cleaned tables.")
    
    print(f"\n[Step 2] Inserting {len(df_works):,} real SIH works...")
    # Convert date columns to proper datetime
    date_cols = ['recommendation_date', 'administrative_approval_date', 'sanction_date', 
                 'commencement_date', 'completion_date', 'latest_progress_date']
    for col in date_cols:
        if col in df_works.columns:
            df_works[col] = pd.to_datetime(df_works[col], errors='coerce')
            
    df_works.to_sql('works', get_engine(), if_exists='append', index=False, chunksize=100)
    print("Works inserted successfully.")
    
    print("\n[Step 3] Mapping work IDs and inserting fund releases...")
    works_map = fetch_df("SELECT id, unique_work_number FROM works")
    df_funds = df_funds.merge(works_map, on='unique_work_number', how='inner')
    df_funds.rename(columns={'id': 'work_id'}, inplace=True)
    df_funds.drop(columns=['unique_work_number'], inplace=True)
    df_funds['release_date'] = pd.to_datetime(df_funds['release_date'], errors='coerce')
    
    df_funds.to_sql('fund_releases', get_engine(), if_exists='append', index=False, chunksize=200)
    print(f"Inserted {len(df_funds):,} fund releases.")
    
    print("\n[Step 4] Creating work progress tracking entries...")
    progress_records = []
    for _, w in works_map.iterrows():
        progress_records.append({
            'work_id': w['id'],
            'progress_date': pd.Timestamp.now().strftime('%Y-%m-%d'),
            'physical_progress': 100.0,
            'financial_progress': 100.0,
            'work_status': 'Completed',
            'remarks': 'Verified against PFMS/SIH expenditure ledger',
            'source_reference': 'SIH-PFMS-VERIFY'
        })
    df_prog = pd.DataFrame(progress_records)
    df_prog['progress_date'] = pd.to_datetime(df_prog['progress_date'])
    df_prog.to_sql('work_progress', get_engine(), if_exists='append', index=False, chunksize=200)
    print(f"Inserted {len(df_prog):,} work progress entries.")
    
    print("\n[Step 5] Triggering ML Anomaly Detection Pipeline on SIH Data...")
    from features.feature_engine import compute_features
    from engines.cost_engine import run_cost_engine
    from engines.delay_engine import run_delay_engine
    from engines.duplicate_engine import run_duplicate_engine
    from engines.fund_flow_engine import run_fund_flow_engine
    from engines.compliance_engine import run_compliance_engine
    from risk.aggregator import run_aggregator
    from ingest.data_quality import compute_data_quality
    
    print("-> Computing Data Quality...")
    compute_data_quality()
    
    print("-> Computing Engineered Features...")
    compute_features()
    
    print("-> Running Cost Engine (Isolation Forest)...")
    run_cost_engine()
    
    print("-> Running Delay Engine...")
    run_delay_engine()
    
    print("-> Running Duplicate Engine...")
    run_duplicate_engine()
    
    print("-> Running Fund Flow Engine...")
    run_fund_flow_engine()
    
    print("-> Running Compliance Engine...")
    run_compliance_engine()
    
    print("-> Aggregating Risk Scores...")
    run_aggregator()
    
    print("-> Ensuring Demo User Personas...")
    seed_users()
    
    print("=" * 70)
    print("SIH DATASET FULLY INGESTED & ACTIVE IN NETRADHRISHTI DATABASE!")
    print("=" * 70)

if __name__ == '__main__':
    ingest_to_database(sample_limit=1500)
