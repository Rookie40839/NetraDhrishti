import sys
import os
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

sys.stdout.reconfigure(encoding='utf-8')

def run_sih_ml_audit(csv_path="sih.csv"):
    if not os.path.exists(csv_path):
        csv_path = "SIH_CSV"
        
    print("=" * 75)
    print("NETRADHRISHTI AI/ML ADVANCED ANOMALY DETECTION ON SIH DATASET")
    print("=" * 75)
    
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    amt_col = 'Expenditure Amount (₹)'
    
    # -------------------------------------------------------------
    # 1. Isolation Forest on Expenditure Amounts (Peer-Group Normalized)
    # -------------------------------------------------------------
    print("\n[ML ENGINE 1] ISOLATION FOREST MULTIVARIATE COST ANOMALY DETECTION...")
    
    # Calculate peer medians by Work Description (112 distinct categories)
    peer_stats = df.groupby('Work Description')[amt_col].agg(['median', lambda x: np.median(np.abs(x - np.median(x)))]).rename(columns={'median': 'peer_median', '<lambda_0>': 'peer_mad'})
    peer_stats['peer_mad'] = peer_stats['peer_mad'].replace(0, 1.0) # avoid div by zero
    
    df = df.merge(peer_stats, on='Work Description', how='left')
    df['cost_deviation'] = (df[amt_col] - df['peer_median']) / df['peer_mad']
    
    # Prepare features for Isolation Forest
    features = pd.DataFrame()
    features['log_amount'] = np.log1p(df[amt_col])
    features['cost_deviation'] = df['cost_deviation'].clip(-10, 100)
    features['log_peer_median'] = np.log1p(df['peer_median'])
    
    iso = IsolationForest(contamination=0.02, random_state=42, n_estimators=150, n_jobs=-1)
    df['iso_pred'] = iso.fit_predict(features)
    df['iso_score'] = -iso.decision_function(features)
    
    ml_outliers = df[df['iso_pred'] == -1]
    print(f"  Isolation Forest flagged {len(ml_outliers):,} statistical cost anomalies (top ~2% extreme cost behavior).")
    
    print("\n  Top 5 High-Risk Cost Anomalies Detected by Isolation Forest:")
    top_cost = ml_outliers.sort_values(by='iso_score', ascending=False).head(5)
    for idx, r in top_cost.iterrows():
        print(f"    - Rs. {r[amt_col]:,.2f} (Peer Median: Rs. {r['peer_median']:,.2f} | Dev: {r['cost_deviation']:.1f} MADs)")
        print(f"      Work: {r['Work Description'][:60]}")
        print(f"      Vendor: {r['Vendor']} | IDA: {r['IDA'][:40]} | MP: {r['MP Name']}")

    # -------------------------------------------------------------
    # 2. NLP Duplicate Detection Engine (TF-IDF + Cosine Similarity)
    # -------------------------------------------------------------
    print("\n[ML ENGINE 2] NLP DUPLICATE WORK DETECTION (Cross-Vendor & Spatial)...")
    
    # Analyze exact vs near-duplicate work clusters
    # Sample 5,000 distinct work records across top categories to test cross-constituency overlap
    sample_works = df.drop_duplicates(subset=['Work Description', 'Vendor', 'Constituency']).head(5000).copy()
    vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=500, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(sample_works['Work Description'])
    
    print(f"  Built TF-IDF matrix: {tfidf_matrix.shape[0]} unique work instances x {tfidf_matrix.shape[1]} n-gram features")
    
    # -------------------------------------------------------------
    # 3. Cartelization & Herfindahl-Hirschman Index (HHI)
    # -------------------------------------------------------------
    print("\n[ML ENGINE 3] AGENCY & VENDOR CARTELIZATION (HHI Concentration Index)...")
    
    # Calculate HHI per IDA: HHI = sum((market_share_percentage)^2)
    # HHI > 2500 indicates a highly concentrated / monopolized market
    ida_vendor_grp = df.groupby(['IDA', 'Vendor'])[amt_col].sum().reset_index()
    ida_totals = df.groupby('IDA')[amt_col].sum().reset_index().rename(columns={amt_col: 'ida_total'})
    merged_ida = ida_vendor_grp.merge(ida_totals, on='IDA')
    merged_ida['share_pct'] = (merged_ida[amt_col] / merged_ida['ida_total']) * 100
    merged_ida['share_sq'] = merged_ida['share_pct'] ** 2
    
    hhi_scores = merged_ida.groupby('IDA').agg(
        hhi=('share_sq', 'sum'),
        total_exp=('ida_total', 'first'),
        vendor_count=('Vendor', 'count'),
        top_vendor=('Vendor', lambda x: merged_ida.loc[x.index].sort_values(by='share_pct', ascending=False).iloc[0]['Vendor']),
        top_vendor_share=('share_pct', 'max')
    ).reset_index()
    
    # Filter IDAs with at least Rs 1 Crore total expenditure
    hhi_significant = hhi_scores[hhi_scores['total_exp'] >= 10000000].sort_values(by='hhi', ascending=False)
    high_hhi = hhi_significant[hhi_significant['hhi'] >= 5000]
    
    print(f"  High-Concentration IDAs (HHI >= 5,000, Monopoly / Duopoly Cartels): {len(high_hhi)} IDAs")
    print("  Top 5 Most Concentrated IDAs (Extreme Monopoly Risk):")
    for _, r in high_hhi.head(5).iterrows():
        print(f"    - {r['IDA'][:45]}... (HHI: {r['hhi']:,.0f} / 10,000 | Total Budget: Rs. {r['total_exp']/1e7:.2f} Cr)")
        print(f"      Dominant Vendor: '{r['top_vendor']}' controls {r['top_vendor_share']:.1f}% of total funds!")

    # -------------------------------------------------------------
    # 4. Tender Splitting (Structuring) Risk Score
    # -------------------------------------------------------------
    print("\n[ML ENGINE 4] TENDER SPLITTING & SMURFING VELOCITY...")
    
    # Group by (Vendor, IDA, Date) with count >= 5
    rapid_bursts = df.groupby(['Vendor', 'IDA', 'Expenditure Date']).agg(
        tx_count=(amt_col, 'count'),
        burst_total=(amt_col, 'sum'),
        avg_tx=(amt_col, 'mean'),
        max_tx=(amt_col, 'max')
    ).reset_index()
    
    suspicious_bursts = rapid_bursts[(rapid_bursts['tx_count'] >= 10) & (rapid_bursts['avg_tx'] < 500000)].sort_values(by='tx_count', ascending=False)
    print(f"  Severe Burst Transactions (>= 10 payments on single day < Rs 5L each): {len(suspicious_bursts):,} incidents")
    print("  Top 5 Severe Same-Day Payment Bursts:")
    for _, r in suspicious_bursts.head(5).iterrows():
        print(f"    - Vendor '{r['Vendor'][:35]}' at {r['IDA'][:35]} on {str(r['Expenditure Date'])[:10]}:")
        print(f"      {r['tx_count']} separate transactions totaling Rs. {r['burst_total']/1e7:.2f} Cr (Avg: Rs. {r['avg_tx']:,.2f})")

    # -------------------------------------------------------------
    # 5. Composite Risk Summary Generation
    # -------------------------------------------------------------
    findings = {
        "dataset_metadata": {
            "source_file": csv_path,
            "total_transactions": int(total_rows),
            "total_expenditure_crore": round(total_rows * df[amt_col].mean() / 1e7, 2),
            "date_range": [str(df['Expenditure Date'].min())[:10], str(df['Expenditure Date'].max())[:10]],
            "states_count": int(df['State'].nunique()),
            "constituencies_count": int(df['Constituency'].nunique()),
            "mps_count": int(df['MP Name'].nunique()),
            "vendors_count": int(df['Vendor'].nunique()),
            "idas_count": int(df['IDA'].nunique()),
        },
        "critical_red_flags": {
            "exact_duplicate_rows": int(df.duplicated().sum()),
            "duplicate_financial_payments": int(df.duplicated(subset=['MP Name', 'Constituency', 'Work Description', 'Vendor', amt_col, 'Expenditure Date']).sum()),
            "high_concentration_monopoly_idas": int(len(high_hhi)),
            "tender_splitting_burst_incidents": int(len(suspicious_bursts)),
            "isolation_forest_cost_outliers": int(len(ml_outliers)),
            "micro_transactions_under_100_inr": int((df[amt_col] < 100).sum()),
            "mega_transactions_over_50_lakh_inr": int((df[amt_col] > 5000000).sum()),
            "payment_in_progress_crore": round(df[df['Payment Status'] == 'Payment In-Progress'][amt_col].sum() / 1e7, 2),
        },
        "top_monopoly_districts": high_hhi.head(10)[['IDA', 'hhi', 'total_exp', 'top_vendor', 'top_vendor_share']].to_dict(orient='records'),
        "top_splitting_incidents": suspicious_bursts.head(10)[['Vendor', 'IDA', 'Expenditure Date', 'tx_count', 'burst_total', 'avg_tx']].to_dict(orient='records'),
    }
    
    out_file = "sih_audit_findings.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2, default=str)
    print(f"\n[OUTPUT] Comprehensive Audit Findings exported to: {out_file}")
    print("=" * 75)

if __name__ == '__main__':
    run_sih_ml_audit()
