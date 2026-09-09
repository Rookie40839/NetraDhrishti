import pandas as pd
import json
from db import fetch_df, get_engine

def run_fund_flow_engine():
    print("Running Fund-Flow Engine...")
    
    query = """
        SELECT w.id, w.sanction_amount, f.released_percentage, f.expenditure_percentage, f.progress_gap
        FROM works w
        JOIN work_features f ON w.id = f.work_id
    """
    works = fetch_df(query)
    if works.empty: return
    
    releases = fetch_df("SELECT work_id, amount, release_date FROM fund_releases")
    
    anomalies = []
    det_results = []
    
    for idx, row in works.iterrows():
        wid = row['id']
        sanc = row['sanction_amount'] if pd.notna(row['sanction_amount']) else 0
        rel_pct = row['released_percentage']
        exp_pct = row['expenditure_percentage']
        gap = row['progress_gap']
        
        my_rels = releases[releases['work_id'] == wid]
        total_rel = my_rels['amount'].sum()
        
        max_score = 0
        
        # Type 1: Release > Sanction
        if total_rel > sanc and sanc > 0:
            score = min(100, int(((total_rel - sanc) / sanc) * 200))
            max_score = max(max_score, score)
            anomalies.append({
                'work_id': wid, 'anomaly_type': 'RELEASE_EXCEEDS_SANCTION', 'score': score,
                'severity': 'HIGH', 'expected_value': sanc, 'actual_value': total_rel,
                'amount_involved': total_rel - sanc, 'reason_code': 'RELEASE_GT_SANCTION',
                'description': f"Released amount (₹{total_rel}) exceeds sanctioned amount (₹{sanc})",
                'confidence': 95
            })
            
        # Type 2: High Release Low Progress
        phys_prog = exp_pct # proxy
        if rel_pct > 60 and phys_prog < 30:
            score = min(100, int((rel_pct - phys_prog) * 2))
            max_score = max(max_score, score)
            anomalies.append({
                'work_id': wid, 'anomaly_type': 'HIGH_RELEASE_LOW_PROGRESS', 'score': score,
                'severity': 'HIGH' if score >= 60 else 'MEDIUM', 'expected_value': rel_pct, 'actual_value': phys_prog,
                'amount_involved': 0, 'reason_code': 'HIGH_REL_LOW_PROG',
                'description': f"High release ({rel_pct:.1f}%) but low progress ({phys_prog:.1f}%)",
                'confidence': 85
            })
            
        # Type 5: End of Year Spending
        if not my_rels.empty:
            my_rels = my_rels.copy()
            my_rels['month'] = pd.to_datetime(my_rels['release_date']).dt.month
            march_rels = my_rels[my_rels['month'] == 3]['amount'].sum()
            if march_rels / total_rel > 0.50 and total_rel > 0:
                score = int((march_rels / total_rel) * 100)
                max_score = max(max_score, score)
                anomalies.append({
                    'work_id': wid, 'anomaly_type': 'END_OF_YEAR_SPENDING', 'score': score,
                    'severity': 'MEDIUM', 'expected_value': total_rel * 0.2, 'actual_value': march_rels,
                    'amount_involved': march_rels, 'reason_code': 'MARCH_SPENDING',
                    'description': f"{score}% of funds released in March",
                    'confidence': 90
                })
                
        if max_score > 0:
            det_results.append({
                'work_id': wid,
                'engine_type': 'FUND_FLOW',
                'score': max_score,
                'severity': 'HIGH' if max_score >= 60 else 'MEDIUM',
                'reason_code': 'FUND_ANOMALY',
                'description': "Fund flow anomalies detected",
                'evidence': json.dumps({'max_score': max_score}),
                'confidence': 90,
                'model_version': '1.0'
            })
            
    if anomalies:
        pd.DataFrame(anomalies).to_sql('fund_anomalies', get_engine(), if_exists='append', index=False)
    if det_results:
        pd.DataFrame(det_results).to_sql('detection_results', get_engine(), if_exists='append', index=False)
        
    print(f"Fund-Flow Engine completed. Detected {len(anomalies)} anomalies.")

if __name__ == "__main__":
    run_fund_flow_engine()
