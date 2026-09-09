import pandas as pd
import numpy as np
from datetime import timedelta
import random
from faker import Faker
import os

fake = Faker('en_IN')

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

# Ensure data dir exists
os.makedirs('../data', exist_ok=True)

# ----------------- CONFIGURATION -----------------
NUM_WORKS = 500

STATES = {
    'Maharashtra': ['Pune', 'Nagpur', 'Thane'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur']
}

CATEGORIES = {
    'Roads': {'mean': 1500000, 'std': 800000},
    'Community Hall': {'mean': 2500000, 'std': 1200000},
    'School Building': {'mean': 3000000, 'std': 1500000},
    'Health Center': {'mean': 2000000, 'std': 1000000},
    'Drinking Water': {'mean': 1000000, 'std': 500000},
    'Drainage': {'mean': 1200000, 'std': 600000},
    'Park': {'mean': 800000, 'std': 400000},
    'Street Light': {'mean': 500000, 'std': 200000},
    'Library': {'mean': 1800000, 'std': 700000}
}

AGENCIES = ['PWD', 'Municipal Corporation', 'Zila Parishad', 'Block Development Office', 'Gram Panchayat', 'State Housing Board']

# ----------------- GENERATE WORKS -----------------
def generate_works():
    works = []
    
    for i in range(1, NUM_WORKS + 1):
        state = random.choice(list(STATES.keys()))
        district = random.choice(STATES[state])
        constituency = district + " East"
        
        category = random.choice(list(CATEGORIES.keys()))
        
        # Base cost
        cost_dist = CATEGORIES[category]
        sanction_amount = np.random.normal(cost_dist['mean'], cost_dist['std'])
        sanction_amount = max(200000, round(sanction_amount, 2)) # Min 2L
        
        # Inject Cost Anomaly (~5% of data)
        if random.random() < 0.05:
            sanction_amount *= random.uniform(2.5, 4.0)
            
        agency = random.choice(AGENCIES)
        mp_name = fake.name()
        
        # Dates
        rec_date = fake.date_between(start_date='-3y', end_date='-6m')
        
        # Inject Sanction Delay Anomaly (~10% > 45 days)
        delay_days = random.randint(10, 40)
        if random.random() < 0.10:
            delay_days = random.randint(50, 150)
            
        sanction_date = rec_date + timedelta(days=delay_days)
        approval_date = sanction_date - timedelta(days=random.randint(1, 5))
        commencement_date = sanction_date + timedelta(days=random.randint(10, 60))
        
        status_roll = random.random()
        if status_roll < 0.6:
            status = 'Ongoing'
            completion_date = None
        elif status_roll < 0.9:
            status = 'Completed'
            # Inject Completion Delay Anomaly
            exec_days = random.randint(100, 350)
            if random.random() < 0.15:
                exec_days = random.randint(400, 800)
            completion_date = sanction_date + timedelta(days=exec_days)
        else:
            status = 'Delayed'
            completion_date = None

        fy = f"{sanction_date.year}-{sanction_date.year + 1}"
        unique_id = f"MPLADS/{state[:2].upper()}/{fy}/{i:04d}"
        
        work_name = f"Construction of {category} in {district}"
        
        # Inject Compliance Anomaly (~2%)
        if random.random() < 0.02:
            bad_word = random.choice(['Temple', 'Residential Complex', 'Commercial Shop'])
            work_name = f"Construction of {bad_word} near {category} in {district}"
            
        work = {
            'unique_work_number': unique_id,
            'work_name': work_name,
            'work_description': fake.text(max_nb_chars=100),
            'work_category': category,
            'state': state,
            'implementing_district': district,
            'nodal_district': district,
            'constituency': constituency,
            'house_name': random.choice(['Lok Sabha', 'Rajya Sabha']),
            'mp_name': mp_name,
            'implementing_agency_name': agency,
            'sanction_amount': sanction_amount,
            'actual_expenditure': 0.0, # Will be calculated from progress
            'released_amount': 0.0,    # Will be calculated from releases
            'recommendation_date': rec_date,
            'administrative_approval_date': approval_date,
            'sanction_date': sanction_date,
            'commencement_date': commencement_date,
            'completion_date': completion_date,
            'work_status': status,
            'financial_year': fy,
            'image_uploaded': 'Yes' if status == 'Completed' and random.random() > 0.1 else 'No'
        }
        works.append(work)
        
    df_works = pd.DataFrame(works)
    
    # Inject Duplicate Anomaly (~10 pairs)
    indices = random.sample(range(len(df_works)), 10)
    for idx in indices:
        row = df_works.iloc[idx].copy()
        row['unique_work_number'] = row['unique_work_number'] + "-DUP"
        row['work_name'] = row['work_name'] + " (Phase 2)"
        row['sanction_amount'] = row['sanction_amount'] * random.uniform(0.9, 1.1)
        # same district, agency, category
        df_works = pd.concat([df_works, pd.DataFrame([row])], ignore_index=True)
        
    return df_works

# ----------------- GENERATE FUND RELEASES & PROGRESS -----------------
def generate_funds_and_progress(df_works):
    releases = []
    progress = []
    
    for idx, work in df_works.iterrows():
        wid = work['unique_work_number']
        sanction = work['sanction_amount']
        s_date = work['sanction_date']
        
        # Releases
        num_installments = random.randint(1, 3) if work['work_status'] != 'Completed' else random.randint(2, 4)
        
        total_released = 0
        current_date = s_date + timedelta(days=random.randint(5, 30))
        
        # Inject Fund Flow Anomaly - Release > Sanction
        release_mult = random.uniform(0.5, 0.95)
        if random.random() < 0.05:
            release_mult = random.uniform(1.1, 1.5)
            
        target_release = sanction * release_mult
        
        for i in range(1, num_installments + 1):
            if i == num_installments:
                amt = target_release - total_released
            else:
                amt = target_release / num_installments * random.uniform(0.8, 1.2)
                
            if amt > 0:
                # Inject End of Year spending
                if random.random() < 0.05:
                    current_date = pd.to_datetime(f"{current_date.year}-03-{random.randint(15,31)}")
                
                releases.append({
                    'unique_work_number': wid,
                    'installment_number': i,
                    'amount': round(amt, 2),
                    'release_date': current_date,
                    'transaction_type': 'Release'
                })
                total_released += amt
                current_date += timedelta(days=random.randint(60, 180))
                
        df_works.at[idx, 'released_amount'] = total_released
        
        # Progress
        if work['work_status'] == 'Completed':
            final_phys = 100
            final_fin = 100
            exp = total_released * random.uniform(0.9, 1.0)
        else:
            # Inject High Release Low Progress
            if random.random() < 0.05 and total_released > sanction * 0.7:
                final_phys = random.randint(10, 30)
            else:
                final_phys = random.randint(10, 90)
            final_fin = final_phys * random.uniform(0.8, 1.2)
            exp = total_released * (final_fin / 100)
            
        df_works.at[idx, 'actual_expenditure'] = round(exp, 2)
        
        p_date = work['commencement_date'] + timedelta(days=random.randint(30, 90))
        progress.append({
            'unique_work_number': wid,
            'progress_date': p_date,
            'physical_progress': round(final_phys, 2),
            'financial_progress': round(final_fin, 2),
            'work_status': work['work_status']
        })

    return df_works, pd.DataFrame(releases), pd.DataFrame(progress)

if __name__ == "__main__":
    print("Generating Works...")
    df_works = generate_works()
    print("Generating Funds and Progress...")
    df_works, df_funds, df_prog = generate_funds_and_progress(df_works)
    
    # Save
    df_works.to_csv('../data/works_demo.csv', index=False)
    df_funds.to_csv('../data/fund_releases_demo.csv', index=False)
    df_prog.to_csv('../data/work_progress_demo.csv', index=False)
    
    print(f"Generated {len(df_works)} works, {len(df_funds)} fund releases, {len(df_prog)} progress records.")
    print("Saved to ../data/")
