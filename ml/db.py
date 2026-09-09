import os
from sqlalchemy import create_engine, text
from config import DB_URL
import pandas as pd

_engine = None

def get_engine():
    global _engine
    if _engine is None:
        url = DB_URL
        if not url:
            raise ValueError("SUPABASE_DB_URL not found in environment.")
        _engine = create_engine(
            url,
            pool_size=5,
            max_overflow=10,
            pool_timeout=60,
            pool_recycle=1800,
            pool_pre_ping=True,
            connect_args={"options": "-c statement_timeout=300000"}
        )
    return _engine

def execute(sql, params=None):
    """Execute a raw SQL statement (INSERT/UPDATE/DELETE)."""
    with get_engine().begin() as conn:
        conn.execute(text(sql), params or {})

def fetch_df(sql, params=None):
    """Fetch results as a pandas DataFrame."""
    with get_engine().connect() as conn:
        return pd.read_sql(text(sql), conn, params=params)
