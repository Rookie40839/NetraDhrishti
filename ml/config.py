import os
from dotenv import load_dotenv
# Load .env from ml directory as well as current working directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_URL = os.getenv("SUPABASE_DB_URL")

# MPLADS Policy Thresholds
SANCTION_DELAY_DAYS    = 45       # Para 3.2.4
COMPLETION_DAYS        = 365      # Para 3.2.12
ENTITLEMENT_LIMIT      = 50000000 # ₹5 crore

# Detection Thresholds
COST_MAD_THRESHOLD     = 2.0      # Flag if |deviation| > 2 MADs
COST_HIGH_THRESHOLD    = 3.0      # HIGH severity if > 3 MADs
DUPLICATE_SIM_CUTOFF   = 0.75     # Minimum overall similarity to flag pair
MIN_PEER_GROUP         = 5        # Minimum works for peer comparison
DATA_CONFIDENCE_MIN    = 40       # Below this → INSUFFICIENT_DATA

# Default risk weights (overridden from DB at runtime)
WEIGHTS = {'cost': 0.30, 'delay': 0.25, 'fund': 0.20, 'duplicate': 0.15, 'compliance': 0.10}
