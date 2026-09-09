import pandas as pd
import json
from rapidfuzz import fuzz
from db import fetch_df, get_engine

def run_duplicate_engine():
    print("Running Duplicate Engine...")
    
    # We need work name, desc, amount, agency, location, dates
    query = """
        SELECT id, work_name, work_description, implementing_district, 
               implementing_agency_name, sanction_amount, administrative_approval_date
        FROM works
    """
    df = fetch_df(query)
    if df.empty: return
    
    candidates = []
    
    # Block by district
    districts = df['implementing_district'].unique()
    
    for dist in districts:
        dist_works = df[df['implementing_district'] == dist]
        if len(dist_works) > 60:
            dist_works = dist_works.sort_values(by='sanction_amount', ascending=False).head(60)
        n = len(dist_works)
        
        # O(n^2) within district
        for i in range(n):
            for j in range(i + 1, n):
                rowA = dist_works.iloc[i]
                rowB = dist_works.iloc[j]
                
                # Text similarity
                name_sim = fuzz.token_set_ratio(str(rowA['work_name']).lower(), str(rowB['work_name']).lower()) / 100.0
                descA = str(rowA['work_description']).lower() if pd.notna(rowA['work_description']) else ""
                descB = str(rowB['work_description']).lower() if pd.notna(rowB['work_description']) else ""
                desc_sim = fuzz.token_set_ratio(descA, descB) / 100.0 if descA and descB else name_sim
                
                text_sim = max(name_sim, desc_sim)
                
                if text_sim < 0.50: continue # Early exit
                
                # Location similarity
                loc_sim = 1.0 # same district
                
                # Agency similarity
                agA = str(rowA['implementing_agency_name']).lower()
                agB = str(rowB['implementing_agency_name']).lower()
                ag_fuzz = fuzz.ratio(agA, agB)
                if ag_fuzz > 85: ag_sim = 1.0
                elif ag_fuzz > 60: ag_sim = 0.7
                else: ag_sim = 0.0
                
                # Amount similarity
                amtA = float(rowA['sanction_amount']) if pd.notna(rowA['sanction_amount']) else 0
                amtB = float(rowB['sanction_amount']) if pd.notna(rowB['sanction_amount']) else 0
                max_amt = max(amtA, amtB)
                amt_sim = 1 - (abs(amtA - amtB) / max_amt) if max_amt > 0 else 0
                amt_sim = max(0, min(1, amt_sim))
                
                # Date similarity
                dateA = pd.to_datetime(rowA['administrative_approval_date'])
                dateB = pd.to_datetime(rowB['administrative_approval_date'])
                
                if pd.notna(dateA) and pd.notna(dateB):
                    diff_days = abs((dateA - dateB).days)
                    if diff_days <= 30: date_sim = 1.0
                    elif diff_days <= 180: date_sim = max(0, 1 - (diff_days - 30) / 150.0)
                    else: date_sim = 0.0
                else:
                    date_sim = 0.5
                    
                # Overall
                overall = 0.40 * text_sim + 0.15 * loc_sim + 0.15 * ag_sim + 0.15 * amt_sim + 0.15 * date_sim
                
                if overall >= 0.75:
                    reason = f"{overall*100:.1f}% overall similarity match"
                    
                    # Store both directions or just one? Let's store one
                    candidates.append({
                        'work_id': rowA['id'],
                        'matched_work_id': rowB['id'],
                        'text_similarity': text_sim,
                        'location_similarity': loc_sim,
                        'agency_similarity': ag_sim,
                        'amount_similarity': amt_sim,
                        'date_similarity': date_sim,
                        'overall_similarity': overall,
                        'reason': reason,
                        'status': 'PENDING'
                    })
                    
    # Write to duplicate_candidates
    if candidates:
        df_cand = pd.DataFrame(candidates)
        df_cand.to_sql('duplicate_candidates', get_engine(), if_exists='append', index=False)
        
        # Now generate detection_results scores
        scores = []
        # Find max similarity for each work that appears in candidates
        all_ids = set([c['work_id'] for c in candidates] + [c['matched_work_id'] for c in candidates])
        
        for wid in all_ids:
            my_cands = [c for c in candidates if c['work_id'] == wid or c['matched_work_id'] == wid]
            max_sim = max([c['overall_similarity'] for c in my_cands])
            
            if max_sim >= 0.90: score = int(80 + (max_sim - 0.90) / 0.10 * 20)
            elif max_sim >= 0.80: score = int(50 + (max_sim - 0.80) / 0.10 * 30)
            elif max_sim >= 0.75: score = int(30 + (max_sim - 0.75) / 0.05 * 20)
            else: score = 0
            
            if score > 0:
                scores.append({
                    'work_id': wid,
                    'engine_type': 'DUPLICATE',
                    'score': min(100, score),
                    'severity': 'HIGH' if score >= 60 else 'MEDIUM',
                    'reason_code': 'DUPLICATE_FOUND',
                    'description': f"Potential duplicate work detected ({max_sim*100:.1f}% match)",
                    'evidence': json.dumps({'max_similarity': max_sim, 'matches': len(my_cands)}),
                    'confidence': 80,
                    'model_version': '1.0'
                })
                
        if scores:
            pd.DataFrame(scores).to_sql('detection_results', get_engine(), if_exists='append', index=False)
            
    print(f"Duplicate Engine completed. Found {len(candidates)} pairs.")

if __name__ == "__main__":
    run_duplicate_engine()
