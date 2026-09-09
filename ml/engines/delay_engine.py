import pandas as pd
import json
from db import fetch_df, get_engine

def run_delay_engine():
    print("Running Delay Engine...")
    
    query = """
        SELECT w.id, w.work_status, f.sanction_delay_days, f.execution_delay_days, 
               f.project_age_days, f.expenditure_percentage, f.progress_gap
        FROM works w
        JOIN work_features f ON w.id = f.work_id
    """
    df = fetch_df(query)
    if df.empty: return
    
    results = []
    
    for idx, row in df.iterrows():
        sanc_delay = row['sanction_delay_days']
        exec_delay = row['execution_delay_days']
        age = row['project_age_days']
        exp_pct = row['expenditure_percentage']
        gap = row['progress_gap']
        
        # Signal 1: Sanction Delay
        sig1 = 0
        if sanc_delay > 45:
            sig1 = max(0, min(100, ((sanc_delay - 45) / 90) * 100))
            
        # Signal 2: Execution Delay
        sig2 = 0
        if row['work_status'] != 'Completed' and exec_delay > 0:
            sig2 = max(0, min(100, (exec_delay / 365) * 100))
        elif row['work_status'] == 'Completed' and exec_delay > 0:
            sig2 = max(0, min(100, (exec_delay / 365) * 50)) # Past issues count half
            
        # Signal 3: Stalled
        sig3 = 0
        if age > 365 and (exp_pct < 20 or gap > 50):
            sig3 = max(0, min(100, gap * 2))
            
        score = int(round(0.3 * sig1 + 0.5 * sig2 + 0.2 * sig3))
        
        if score >= 60: sev = 'HIGH'
        elif score >= 30: sev = 'MEDIUM'
        else: sev = 'LOW'
        
        reasons = []
        if sig1 > 50: reasons.append(f"Sanction took {int(sanc_delay)} days")
        if sig2 > 50: reasons.append(f"Execution delayed by {int(exec_delay)} days")
        if sig3 > 50: reasons.append(f"Progress gap {int(gap)}%")
        
        desc = " | ".join(reasons) if reasons else "No major delays"
        rcode = "DELAY_CRITICAL" if score >= 80 else "DELAY_WARNING" if score >= 40 else "DELAY_NORMAL"
        
        evid = {
            'sanction_delay_days': int(sanc_delay),
            'execution_delay_days': int(exec_delay),
            'progress_gap': float(gap),
            'signals': {'sig1': float(sig1), 'sig2': float(sig2), 'sig3': float(sig3)}
        }
        
        results.append({
            'work_id': row['id'],
            'engine_type': 'DELAY',
            'score': score,
            'severity': sev,
            'reason_code': rcode,
            'description': desc,
            'evidence': json.dumps(evid),
            'confidence': 85,
            'model_version': '1.0'
        })
        
    df_res = pd.DataFrame(results)
    df_res.to_sql('detection_results', get_engine(), if_exists='append', index=False)
    print(f"Delay Engine completed. Generated {len(df_res)} scores.")

if __name__ == "__main__":
    run_delay_engine()
