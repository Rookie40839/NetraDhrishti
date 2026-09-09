import pandas as pd
import numpy as np
from datetime import datetime
from db import get_engine, fetch_df

def compute_features():
    print("Running Feature Engine...")
    
    works = fetch_df("SELECT * FROM works")
    if works.empty:
        return
        
    features = []
    today = pd.to_datetime('today')
    
    # Pre-compute agency and district stats
    agency_counts = works['implementing_agency_name'].value_counts().to_dict()
    district_totals = works['implementing_district'].value_counts().to_dict()
    district_agency_counts = works.groupby(['implementing_district', 'implementing_agency_name']).size().to_dict()
    total_works = len(works)
    
    # Try fetching latest physical progress from work_progress table
    latest_progress = {}
    try:
        prog_df = fetch_df("SELECT work_id, physical_progress FROM work_progress ORDER BY progress_date DESC")
        if not prog_df.empty:
            for _, p_row in prog_df.iterrows():
                w_id = p_row['work_id']
                if w_id not in latest_progress and pd.notna(p_row['physical_progress']):
                    latest_progress[w_id] = float(p_row['physical_progress'])
    except Exception as e:
        print(f"Notice: Could not fetch work_progress, using fallback: {e}")

    # Pre-calculate temporary execution delay per work to compute agency average delay
    temp_delays = []
    for _, r in works.iterrows():
        s_date = pd.to_datetime(r['sanction_date']) if pd.notna(r.get('sanction_date')) else pd.NaT
        c_date = pd.to_datetime(r['completion_date']) if pd.notna(r.get('completion_date')) else pd.NaT
        if pd.notna(s_date):
            if r.get('work_status') != 'Completed':
                d_days = max(0, (today - s_date).days - 365)
            else:
                d_days = max(0, (c_date - s_date).days - 365) if pd.notna(c_date) else 0
        else:
            d_days = 0
        temp_delays.append(d_days)
    works['calc_delay'] = temp_delays
    agency_avg_delays = works.groupby('implementing_agency_name')['calc_delay'].mean().to_dict()
    agency_high_risk = works.groupby('implementing_agency_name')['calc_delay'].apply(lambda x: (x > 90).mean()).to_dict()

    for idx, row in works.iterrows():
        wid = row['id']
        
        # --- COST FEATURES ---
        peer_group = works[(works['implementing_district'] == row['implementing_district']) & 
                           (works['work_category'] == row['work_category'])]
                           
        if len(peer_group) < 5:
            # Fallback to state level
            peer_group = works[(works['state'] == row['state']) & 
                               (works['work_category'] == row['work_category'])]
                               
        if len(peer_group) < 3:
            # Fallback to all
            peer_group = works[works['work_category'] == row['work_category']]
            
        peer_amounts = peer_group['sanction_amount'].dropna()
        median_cost = peer_amounts.median() if not peer_amounts.empty else row['sanction_amount']
        mad_cost = max(1.0, (peer_amounts - median_cost).abs().median()) if not peer_amounts.empty else 1.0
        
        cost_dev = (row['sanction_amount'] - median_cost) / mad_cost if pd.notna(row['sanction_amount']) else 0
        cost_z = (row['sanction_amount'] - peer_amounts.mean()) / max(1.0, peer_amounts.std()) if len(peer_amounts) > 1 and pd.notna(row['sanction_amount']) else 0
        
        # --- DELAY FEATURES ---
        rec_d = pd.to_datetime(row['recommendation_date'])
        app_d = pd.to_datetime(row['administrative_approval_date'])
        san_d = pd.to_datetime(row['sanction_date'])
        com_d = pd.to_datetime(row['commencement_date'])
        cmp_d = pd.to_datetime(row['completion_date'])
        pay_d = pd.to_datetime(row.get('final_payment_date')) if pd.notna(row.get('final_payment_date')) else pd.NaT
        mark_d = pd.to_datetime(row.get('completion_marking_date')) if pd.notna(row.get('completion_marking_date')) else pd.NaT
        hand_d = pd.to_datetime(row.get('handover_date')) if pd.notna(row.get('handover_date')) else pd.NaT
        
        sanc_delay = (app_d - rec_d).days if pd.notna(rec_d) and pd.notna(app_d) else 0
        start_delay = (com_d - san_d).days if pd.notna(san_d) and pd.notna(com_d) else 0
        
        age_days = (today - san_d).days if pd.notna(san_d) else 0
        
        if row['work_status'] != 'Completed':
            exec_delay = max(0, age_days - 365)
        else:
            exec_delay = max(0, (cmp_d - san_d).days - 365) if pd.notna(cmp_d) and pd.notna(san_d) else 0

        # Payment delay: between completion and final payment (or current age if completed without payment)
        payment_delay = 0
        if pd.notna(cmp_d):
            if pd.notna(pay_d):
                payment_delay = max(0, (pay_d - cmp_d).days)
            elif row.get('work_status') == 'Completed':
                payment_delay = max(0, (today - cmp_d).days)

        # Closure delay: between completion and handover / marking
        closure_delay = 0
        closure_target = hand_d if pd.notna(hand_d) else mark_d
        if pd.notna(cmp_d):
            if pd.notna(closure_target):
                closure_delay = max(0, (closure_target - cmp_d).days)
            elif row.get('work_status') == 'Completed':
                closure_delay = max(0, (today - cmp_d).days)
            
        # --- FUND FEATURES ---
        sanc_amt = row['sanction_amount'] if pd.notna(row['sanction_amount']) and row['sanction_amount'] > 0 else 1
        rel_pct = (row['released_amount'] / sanc_amt) * 100 if pd.notna(row['released_amount']) else 0
        exp_pct = (row['actual_expenditure'] / sanc_amt) * 100 if pd.notna(row['actual_expenditure']) else 0
        
        # Real physical progress from work_progress table if available, else exp_pct * 0.9 fallback
        if wid in latest_progress:
            phys_prog = latest_progress[wid]
        else:
            phys_prog = exp_pct * 0.9
        prog_gap = min(100, (age_days / 365) * 100) - phys_prog
        
        # --- AGENCY FEATURES ---
        agency = row['implementing_agency_name']
        agency_share = agency_counts.get(agency, 1) / max(1, total_works)
        district = row['implementing_district']
        dist_total = district_totals.get(district, 1)
        dist_agency_cnt = district_agency_counts.get((district, agency), 1)
        agency_dist_share = dist_agency_cnt / max(1, dist_total)
        agency_avg_delay = agency_avg_delays.get(agency, 0)
        agency_high_risk_pct = agency_high_risk.get(agency, 0)
        
        features.append({
            'work_id': wid,
            'cost_peer_median': median_cost,
            'cost_peer_mad': mad_cost,
            'cost_deviation': cost_dev,
            'cost_z_score': cost_z,
            'project_age_days': age_days,
            'sanction_delay_days': sanc_delay,
            'start_delay_days': start_delay,
            'execution_delay_days': exec_delay,
            'payment_delay_days': payment_delay,
            'closure_delay_days': closure_delay,
            'released_percentage': rel_pct,
            'expenditure_percentage': exp_pct,
            'progress_gap': prog_gap,
            'duplicate_max_sim': 0, # computed later
            'agency_work_share': agency_share,
            'agency_district_share': agency_dist_share,
            'agency_avg_delay': agency_avg_delay,
            'agency_high_risk_pct': agency_high_risk_pct,
            'financial_year': row['financial_year'],
            'feature_version': '1.0'
        })
        
    df_feat = pd.DataFrame(features)
    from sqlalchemy import text
    with get_engine().connect() as conn:
        conn.execute(text("DELETE FROM work_features"))
        conn.commit()
    df_feat.to_sql('work_features', get_engine(), if_exists='append', index=False)
    print(f"Generated features for {len(df_feat)} works.")

if __name__ == "__main__":
    compute_features()
