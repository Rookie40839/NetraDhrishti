import pandas as pd
import json
from db import fetch_df, get_engine, execute

def run_aggregator():
    print("Running Risk Aggregator...")
    
    # 1. Get weights
    weights_df = fetch_df("SELECT * FROM risk_weights ORDER BY id DESC LIMIT 1")
    if weights_df.empty:
        w_cost, w_delay, w_fund, w_dup, w_comp = 0.3, 0.25, 0.2, 0.15, 0.1
    else:
        row = weights_df.iloc[0]
        w_cost, w_delay, w_fund, w_dup, w_comp = row['cost_w'], row['delay_w'], row['fund_w'], row['duplicate_w'], row['compliance_w']
        
    # 2. Get works & detection results
    works_df = fetch_df("SELECT id, sanction_amount, data_confidence, work_status, work_category FROM works")
    if works_df.empty: return
    
    dets = fetch_df("SELECT work_id, engine_type, score, reason_code, severity, description FROM detection_results")
    
    # Pre-compute percentiles for impact
    if len(works_df) > 1:
        works_df['amount_pct'] = works_df['sanction_amount'].rank(pct=True) * 100
    else:
        works_df['amount_pct'] = 50.0
        
    risk_scores = []
    
    for idx, work in works_df.iterrows():
        wid = work['id']
        conf = work['data_confidence']
        sanc = work['sanction_amount'] if pd.notna(work['sanction_amount']) else 0
        status = work['work_status']
        cat = str(work['work_category']).lower()
        
        my_dets = dets[dets['work_id'] == wid]
        
        c_score = my_dets[my_dets['engine_type'] == 'COST']['score'].max() if not my_dets[my_dets['engine_type'] == 'COST'].empty else 0
        d_score = my_dets[my_dets['engine_type'] == 'DELAY']['score'].max() if not my_dets[my_dets['engine_type'] == 'DELAY'].empty else 0
        f_score = my_dets[my_dets['engine_type'] == 'FUND_FLOW']['score'].max() if not my_dets[my_dets['engine_type'] == 'FUND_FLOW'].empty else 0
        dup_score = my_dets[my_dets['engine_type'] == 'DUPLICATE']['score'].max() if not my_dets[my_dets['engine_type'] == 'DUPLICATE'].empty else 0
        cmp_score = my_dets[my_dets['engine_type'] == 'COMPLIANCE']['score'].max() if not my_dets[my_dets['engine_type'] == 'COMPLIANCE'].empty else 0
        
        if pd.isna(c_score): c_score = 0
        if pd.isna(d_score): d_score = 0
        if pd.isna(f_score): f_score = 0
        if pd.isna(dup_score): dup_score = 0
        if pd.isna(cmp_score): cmp_score = 0
        
        # Risk Score
        if conf < 40:
            r_score = None
            r_level = 'INSUFFICIENT_DATA'
        else:
            r_score = int(round(w_cost*c_score + w_delay*d_score + w_fund*f_score + w_dup*dup_score + w_comp*cmp_score))
            if r_score >= 80: r_level = 'CRITICAL'
            elif r_score >= 60: r_level = 'HIGH'
            elif r_score >= 30: r_level = 'MEDIUM'
            else: r_level = 'LOW'
            
        # Impact Score
        exp_bonus = 10 if status == 'Ongoing' and sanc > 1000000 else 0
        imp_bonus = 10 if any(x in cat for x in ['health', 'education', 'water', 'school']) else 0
        i_score = min(100, int(work['amount_pct'] + exp_bonus + imp_bonus))
        
        # Priority Score
        p_score = int(round((r_score or 0) * i_score / 100.0))
        
        # Reasons
        reasons = []
        for _, r in my_dets[my_dets['score'] >= 30].iterrows():
            reasons.append({
                'code': r['reason_code'],
                'severity': r['severity'],
                'message': r['description']
            })
            
        insp_mand = True if sanc >= 2500000 else False
        
        risk_scores.append({
            'work_id': wid,
            'risk_score': r_score,
            'impact_score': i_score,
            'priority_score': p_score,
            'risk_level': r_level,
            'cost_score': c_score,
            'delay_score': d_score,
            'fund_score': f_score,
            'duplicate_score': dup_score,
            'compliance_score': cmp_score,
            'data_confidence': conf,
            'reason_codes': json.dumps(reasons),
            'inspection_mandatory': insp_mand,
            'model_version': '1.0'
        })
        
    df_risk = pd.DataFrame(risk_scores)
    # Clear existing and insert
    execute("DELETE FROM risk_scores")
    df_risk.to_sql('risk_scores', get_engine(), if_exists='append', index=False)
    
    print(f"Risk Aggregator completed. Scored {len(df_risk)} works.")

if __name__ == "__main__":
    run_aggregator()
