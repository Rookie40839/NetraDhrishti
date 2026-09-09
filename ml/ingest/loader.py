import pandas as pd
from db import get_engine, fetch_df

def load_works(csv_path):
    print("Loading works...")
    df = pd.read_csv(csv_path)
    
    date_cols = ['recommendation_date', 'administrative_approval_date', 'sanction_date', 
                 'commencement_date', 'completion_date', 'latest_progress_date',
                 'final_payment_date', 'completion_marking_date', 'handover_date']
    
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    # Load into DB
    df.to_sql('works', get_engine(), if_exists='append', index=False, chunksize=100)
    print(f"Loaded {len(df)} works.")

def load_funds(csv_path):
    print("Loading fund releases...")
    df = pd.read_csv(csv_path)
    
    # Map unique_work_number to work_id
    works = fetch_df("SELECT id, unique_work_number FROM works")
    df = df.merge(works, on='unique_work_number', how='inner')
    df.rename(columns={'id': 'work_id'}, inplace=True)
    df.drop(columns=['unique_work_number'], inplace=True)
    
    df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')
    
    df.to_sql('fund_releases', get_engine(), if_exists='append', index=False, chunksize=100)
    print(f"Loaded {len(df)} fund releases.")

def load_progress(csv_path):
    print("Loading work progress...")
    df = pd.read_csv(csv_path)
    
    works = fetch_df("SELECT id, unique_work_number FROM works")
    df = df.merge(works, on='unique_work_number', how='inner')
    df.rename(columns={'id': 'work_id'}, inplace=True)
    df.drop(columns=['unique_work_number'], inplace=True)
    
    df['progress_date'] = pd.to_datetime(df['progress_date'], errors='coerce')
    
    df.to_sql('work_progress', get_engine(), if_exists='append', index=False, chunksize=100)
    print(f"Loaded {len(df)} progress records.")

def run_loader():
    load_works('../data/works_demo.csv')
    load_funds('../data/fund_releases_demo.csv')
    load_progress('../data/work_progress_demo.csv')

if __name__ == "__main__":
    run_loader()
