import bcrypt
import pandas as pd
from db import get_engine, execute

def seed_users():
    print("Seeding demo users...")
    
    password = "demo123"
    salt = bcrypt.gensalt()
    pwd_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    users = [
        {
            'name': 'Ravi Kumar',
            'email': 'mp.pune@india.gov.in',
            'password_hash': pwd_hash,
            'role': 'MP',
            'constituency_id': 'Pune East',
            'district_id': 'Pune',
            'state_id': 'Maharashtra'
        },
        {
            'name': 'Priya Singh',
            'email': 'do.pune@india.gov.in',
            'password_hash': pwd_hash,
            'role': 'district_officer',
            'constituency_id': None,
            'district_id': 'Pune',
            'state_id': 'Maharashtra'
        },
        {
            'name': 'Amit Desai',
            'email': 'admin.mh@india.gov.in',
            'password_hash': pwd_hash,
            'role': 'state_admin',
            'constituency_id': None,
            'district_id': None,
            'state_id': 'Maharashtra'
        },
        {
            'name': 'Dr. S. Sharma',
            'email': 'admin@mospi.gov.in',
            'password_hash': pwd_hash,
            'role': 'mospi_admin',
            'constituency_id': None,
            'district_id': None,
            'state_id': None
        }
    ]
    
    df = pd.DataFrame(users)
    
    execute("DELETE FROM users WHERE email IN ('mp.pune@india.gov.in', 'do.pune@india.gov.in', 'admin.mh@india.gov.in', 'admin@mospi.gov.in')")
    df.to_sql('users', get_engine(), if_exists='append', index=False)
    print("Seeded 4 demo users.")

if __name__ == "__main__":
    seed_users()
