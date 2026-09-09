import pandas as pd
import json
from db import fetch_df, get_engine

def run_compliance_engine():
    print("Running Compliance Engine...")
    
    rules_df = fetch_df("SELECT * FROM compliance_rules WHERE active = true")
    if rules_df.empty: return
    
    works_df = fetch_df("SELECT id, work_name, work_description, mp_name, financial_year, sanction_amount, work_status, image_uploaded FROM works")
    if works_df.empty: return
    
    # Pre-fetch other data if needed (like delay, duplicates, etc)
    features_df = fetch_df("SELECT work_id, sanction_delay_days, execution_delay_days, released_percentage, duplicate_max_sim FROM work_features")
    works_df = works_df.merge(features_df, left_on='id', right_on='work_id', how='left')
    
    # Calculate MP entitlements
    mp_entitlements = works_df.groupby(['mp_name', 'financial_year'])['sanction_amount'].sum().reset_index()
    mp_entitlements.rename(columns={'sanction_amount': 'total_sanctioned'}, inplace=True)
    works_df = works_df.merge(mp_entitlements, on=['mp_name', 'financial_year'], how='left')
    
    flags = []
    det_results = []
    
    for idx, row in works_df.iterrows():
        wid = row['id']
        max_severity_val = 0 # mapping LOW:30, MEDIUM:50, HIGH:80
        
        for r_idx, rule in rules_df.iterrows():
            rule_id = rule['rule_id']
            rtype = rule['rule_type']
            severity = rule['severity']
            kw = rule['keywords']
            keywords = kw if isinstance(kw, (list, tuple)) or (hasattr(kw, 'size') and kw.size > 0) else []
            
            triggered = False
            desc = ""
            obs = ""
            exp = ""
            conf = 0
            
            # CATEGORY (Keywords)
            if rtype == 'CATEGORY' and keywords:
                wname = str(row['work_name']).lower()
                wdesc = str(row['work_description']).lower()
                for kw in keywords:
                    if kw.lower() in wname or kw.lower() in wdesc:
                        triggered = True
                        desc = f"Found non-permissible keyword: '{kw}'"
                        obs = kw
                        exp = "None"
                        conf = 85
                        break
            
            # TIMELINE
            elif rule_id == 'SANCTION_DELAY':
                if pd.notna(row['sanction_delay_days']) and row['sanction_delay_days'] > 45:
                    triggered = True
                    desc = f"Sanction delayed by {int(row['sanction_delay_days'])} days"
                    obs = str(int(row['sanction_delay_days']))
                    exp = "<= 45"
                    conf = 90
            
            elif rule_id == 'COMPLETION_DELAY':
                if pd.notna(row['execution_delay_days']) and row['execution_delay_days'] > 0 and row['work_status'] != 'Completed':
                    triggered = True
                    desc = f"Execution delayed beyond 1 year norm"
                    obs = "Delayed"
                    exp = "On time"
                    conf = 85
                    
            # ENTITLEMENT
            elif rule_id == 'ENTITLEMENT_EXCEED':
                if pd.notna(row['total_sanctioned']) and row['total_sanctioned'] > 50000000:
                    triggered = True
                    desc = f"MP {row['mp_name']} exceeded ₹5Cr limit for {row['financial_year']}"
                    obs = str(row['total_sanctioned'])
                    exp = "<= 50000000"
                    conf = 95
                    
            # DATA_COMPLETENESS
            elif rule_id == 'MISSING_IMAGE':
                if row['work_status'] == 'Completed' and str(row['image_uploaded']).lower() != 'yes':
                    triggered = True
                    desc = "Completed work missing mandatory uploaded image"
                    obs = "No"
                    exp = "Yes"
                    conf = 100
                    
            # FINANCIAL
            elif rule_id == 'RELEASE_GT_SANCTION':
                if pd.notna(row['released_percentage']) and row['released_percentage'] > 100:
                    triggered = True
                    desc = f"Released amount is {row['released_percentage']:.1f}% of sanction"
                    obs = f"{row['released_percentage']:.1f}%"
                    exp = "<= 100%"
                    conf = 100
                    
            # RELATIONSHIP
            elif rule_id == 'DUPLICATE_FUNDING':
                if pd.notna(row['duplicate_max_sim']) and row['duplicate_max_sim'] > 0.85:
                    triggered = True
                    desc = "High similarity with another work"
                    obs = f"{row['duplicate_max_sim']*100:.1f}% match"
                    exp = "< 85%"
                    conf = 80
                    
            if triggered:
                flags.append({
                    'work_id': wid, 'rule_id': rule_id, 'triggered': True,
                    'severity': severity, 'description': desc,
                    'evidence': json.dumps({'observed': obs, 'expected': exp}),
                    'observed_value': obs, 'expected_value': exp, 'confidence': conf
                })
                sev_val = 80 if severity == 'HIGH' else 50 if severity == 'MEDIUM' else 30
                max_severity_val = max(max_severity_val, sev_val)
                
        if max_severity_val > 0:
            det_results.append({
                'work_id': wid, 'engine_type': 'COMPLIANCE', 'score': max_severity_val,
                'severity': 'HIGH' if max_severity_val >= 60 else 'MEDIUM' if max_severity_val >= 30 else 'LOW',
                'reason_code': 'COMPLIANCE_VIOLATION',
                'description': "One or more compliance rules violated",
                'evidence': json.dumps({}),
                'confidence': 90, 'model_version': '1.0'
            })
            
    if flags:
        pd.DataFrame(flags).to_sql('compliance_flags', get_engine(), if_exists='append', index=False)
    if det_results:
        pd.DataFrame(det_results).to_sql('detection_results', get_engine(), if_exists='append', index=False)
        
    print(f"Compliance Engine completed. Triggered {len(flags)} flags.")

if __name__ == "__main__":
    run_compliance_engine()
