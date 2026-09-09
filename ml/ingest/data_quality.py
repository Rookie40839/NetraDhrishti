from db import fetch_df, execute
import pandas as pd

def compute_data_quality():
    print("Running Data Quality Engine...")
    
    # Fetch works
    works = fetch_df("SELECT * FROM works")
    results = []
    updates = []
    
    for idx, row in works.iterrows():
        wid = row['id']
        present_count = 0
        penalty = 0
        
        # 1. Missing Fields Check
        critical_fields = {
            'work_name': 'HIGH',
            'sanction_amount': 'HIGH',
            'implementing_district': 'MEDIUM',
            'state': 'MEDIUM',
            'mp_name': 'MEDIUM',
            'implementing_agency_name': 'MEDIUM',
            'administrative_approval_date': 'MEDIUM',
            'work_status': 'MEDIUM',
            'recommendation_date': 'LOW',
            'financial_year': 'LOW'
        }
        
        for field, severity in critical_fields.items():
            if pd.isna(row[field]) or str(row[field]).strip() == '':
                results.append({
                    'work_id': wid,
                    'field_name': field,
                    'issue_type': 'MISSING_FIELD',
                    'severity': severity,
                    'message': f"Missing critical field: {field}"
                })
            else:
                present_count += 1
                
        # 2. Validity Checks
        if pd.notna(row['administrative_approval_date']) and pd.notna(row['recommendation_date']):
            if row['administrative_approval_date'] < row['recommendation_date']:
                penalty += 10
                results.append({
                    'work_id': wid,
                    'field_name': 'administrative_approval_date',
                    'issue_type': 'INVALID_DATE',
                    'severity': 'HIGH',
                    'message': "Approval date cannot be before recommendation date"
                })
                
        if pd.notna(row['sanction_amount']) and row['sanction_amount'] <= 0:
            penalty += 10
            results.append({
                'work_id': wid,
                'field_name': 'sanction_amount',
                'issue_type': 'INVALID_AMOUNT',
                'severity': 'HIGH',
                'message': "Sanction amount must be positive"
            })
            
        if pd.notna(row['completion_date']) and row['work_status'] != 'Completed':
            penalty += 5
            results.append({
                'work_id': wid,
                'field_name': 'work_status',
                'issue_type': 'INCONSISTENT_DATA',
                'severity': 'MEDIUM',
                'message': "Completion date exists but status is not 'Completed'"
            })
            
        # Calculate overall confidence
        confidence = max(0, int((present_count / len(critical_fields)) * 100) - penalty)
        updates.append({'conf': confidence, 'wid': wid})
        
    from sqlalchemy import text
    from db import get_engine
    if updates:
        with get_engine().begin() as conn:
            conn.execute(text("UPDATE works SET data_confidence = :conf WHERE id = :wid"), updates)

    # Write results
    if results:
        df_res = pd.DataFrame(results)
        from db import get_engine
        df_res.to_sql('data_quality_results', get_engine(), if_exists='append', index=False, chunksize=100)
        
    print("Data Quality Engine finished.")

if __name__ == "__main__":
    compute_data_quality()
