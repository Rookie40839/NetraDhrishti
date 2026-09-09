import pandas as pd
import json
from db import fetch_df, get_engine

def run_cost_engine():
    print("Running Cost Engine...")
    
    query = """
        SELECT w.id, w.sanction_amount, f.cost_deviation, f.cost_peer_median, f.cost_peer_mad, f.cost_z_score
        FROM works w
        JOIN work_features f ON w.id = f.work_id
    """
    df = fetch_df(query)
    if df.empty: return
    
    results = []
    
    for idx, row in df.iterrows():
        dev = row['cost_deviation']
        amt = row['sanction_amount']
        med = row['cost_peer_median']
        
        if pd.isna(dev): continue
        
        raw_score = max(0, min(100, (abs(dev) - 1.0) * 33))
        
        if amt < med:
            raw_score *= 0.3
            
        score = int(round(raw_score))
        
        if score >= 60: sev = 'HIGH'
        elif score >= 30: sev = 'MEDIUM'
        else: sev = 'LOW'
        
        if abs(dev) > 3.0: rcode = 'COST_EXTREME_OUTLIER'
        elif abs(dev) > 2.0: rcode = 'COST_ABOVE_PEER_MEDIAN'
        else: rcode = 'COST_NORMAL'
        
        pct_above = ((amt - med) / med * 100) if med > 0 else 0
        desc = f"Sanction amount is {pct_above:.1f}% above peer median ({dev:.1f} MADs)"
        
        evid = {
            'work_amount': float(amt) if pd.notna(amt) else 0,
            'peer_median': float(med),
            'peer_mad': float(row['cost_peer_mad']),
            'deviation_mads': float(dev),
            'z_score': float(row['cost_z_score'])
        }
        
        results.append({
            'work_id': row['id'],
            'engine_type': 'COST',
            'score': score,
            'severity': sev,
            'reason_code': rcode,
            'description': desc,
            'evidence': json.dumps(evid),
            'confidence': 90,
            'model_version': '1.0'
        })
        
    df_res = pd.DataFrame(results)
    
    # Store evidence as JSON string, but SQLAlchemy might need it as object if column is JSONB. 
    # Since we are using df.to_sql, pandas sends string. We might need to cast in Postgres or let psycopg2 handle it.
    df_res.to_sql('detection_results', get_engine(), if_exists='append', index=False)
    print(f"Cost Engine completed. Generated {len(df_res)} scores.")

if __name__ == "__main__":
    run_cost_engine()
