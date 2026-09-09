import sys
import os
import pandas as pd
import numpy as np

# Ensure stdout handles UTF-8 (rupee symbols, etc.)
sys.stdout.reconfigure(encoding='utf-8')

def audit_sih_csv(csv_path="sih.csv"):
    if not os.path.exists(csv_path):
        csv_path = "SIH_CSV"
    
    print("=" * 70)
    print(f"NETRADHRISHTI AI AUDIT ENGINE - RUNNING ON: {csv_path}")
    print("=" * 70)
    
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    print(f"\n[1] DATASET OVERVIEW:")
    print(f"  Total records: {total_rows:,}")
    print(f"  File size: {os.path.getsize(csv_path) / (1024*1024):.2f} MB")
    print(f"  Columns: {list(df.columns)}")
    
    # Check nulls
    nulls = df.isnull().sum()
    print("\n[2] DATA QUALITY & MISSING VALUES:")
    has_nulls = False
    for col, count in nulls.items():
        if count > 0:
            print(f"  WARNING: Column '{col}' has {count:,} nulls ({count/total_rows*100:.2f}%)")
            has_nulls = True
    if not has_nulls:
        print("  All 10 columns are 100% populated with non-null values.")
        
    # Check duplicate rows
    exact_dups = df.duplicated()
    exact_dup_cnt = exact_dups.sum()
    print(f"\n[3] DUPLICATE TRANSACTION AUDIT:")
    print(f"  Exact Duplicate Rows (Identical across all 10 columns): {exact_dup_cnt:,} ({exact_dup_cnt/total_rows*100:.2f}%)")
    
    # Potential duplicate payments: same MP, Constituency, Work Description, Vendor, Amount on same date
    core_cols = ['MP Name', 'Constituency', 'Work Description', 'Vendor', 'Expenditure Amount (₹)', 'Expenditure Date']
    core_dups = df.duplicated(subset=core_cols, keep=False)
    core_dup_cnt = core_dups.sum()
    print(f"  Identical Financial Payments (Same MP, Constituency, Work, Vendor, Amount, Date): {core_dup_cnt:,} records involved")
    
    # Check duplicate sample
    dup_sample = df[exact_dups].head(3)
    if not dup_sample.empty:
        print("  Sample duplicated record:")
        for _, r in dup_sample.head(1).iterrows():
            print(f"    MP: {r['MP Name']} | Constituency: {r['Constituency']} | Vendor: {r['Vendor']}")
            print(f"    Work: {r['Work Description'][:80]}...")
            print(f"    Amount: Rs. {r['Expenditure Amount (₹)']:,.2f} | Date: {r['Expenditure Date']}")
            
    # 4. Expenditure Analysis
    amt_col = 'Expenditure Amount (₹)'
    amt = df[amt_col]
    total_exp = amt.sum()
    print(f"\n[4] FINANCIAL EXPENDITURE ANALYSIS:")
    print(f"  Total Expenditure Audited: Rs. {total_exp:,.2f} (~Rs. {total_exp/1e7:,.2f} Crore)")
    print(f"  Average Payment: Rs. {amt.mean():,.2f}")
    print(f"  Median Payment: Rs. {amt.median():,.2f}")
    print(f"  Standard Deviation: Rs. {amt.std():,.2f}")
    print(f"  Minimum Payment: Rs. {amt.min():,.2f}")
    print(f"  25th Percentile: Rs. {amt.quantile(0.25):,.2f}")
    print(f"  75th Percentile: Rs. {amt.quantile(0.75):,.2f}")
    print(f"  95th Percentile: Rs. {amt.quantile(0.95):,.2f}")
    print(f"  99th Percentile: Rs. {amt.quantile(0.99):,.2f}")
    print(f"  Maximum Single Payment: Rs. {amt.max():,.2f} (~Rs. {amt.max()/1e7:.2f} Crore)")
    
    # Micro payments anomaly (e.g. < Rs 100, possible test transactions or bookkeeping reconciliation issues)
    tiny = df[amt < 100]
    print(f"\n[5] EXTREME VALUE & THRESHOLD ANOMALIES:")
    print(f"  Suspicious Micro-Transactions (< Rs 100): {len(tiny):,} entries (e.g., minimum is Rs. {amt.min():.2f})")
    
    # Mega payments (> Rs. 50 Lakhs / 0.5 Crore)
    mega = df[amt > 5000000]
    print(f"  High-Value Expenditures (> Rs 50 Lakhs): {len(mega):,} entries (Totaling Rs. {mega[amt_col].sum()/1e7:,.2f} Crore)")
    if not mega.empty:
        print("  Top 3 Highest Single Payments:")
        for _, r in mega.sort_values(by=amt_col, ascending=False).head(3).iterrows():
            print(f"    - Rs. {r[amt_col]:,.2f} to '{r['Vendor']}' by '{r['MP Name']}' ({r['Constituency']}, {r['State']})")
            print(f"      Work: {r['Work Description']}")

    # 6. Payment Status breakdown
    print(f"\n[6] PAYMENT STATUS BREAKDOWN:")
    status_counts = df['Payment Status'].value_counts()
    for status, cnt in status_counts.items():
        status_sum = df[df['Payment Status'] == status][amt_col].sum()
        print(f"  {status}: {cnt:,} records ({cnt/total_rows*100:.2f}%) | Total Amount: Rs. {status_sum:,.2f} ({status_sum/1e7:.2f} Cr)")
        
    # 7. Vendor Monopolization & Cartelization Analysis
    print(f"\n[7] VENDOR RISK & CONCENTRATION (Top Beneficiaries):")
    vendor_stats = df.groupby('Vendor').agg(
        work_count=(amt_col, 'count'),
        total_payout=(amt_col, 'sum'),
        ida_count=('IDA', 'nunique'),
        mp_count=('MP Name', 'nunique'),
        state_count=('State', 'nunique')
    ).reset_index()
    
    top_by_count = vendor_stats.sort_values(by='work_count', ascending=False).head(5)
    print("  Top 5 Vendors by Transaction Count:")
    for _, r in top_by_count.iterrows():
        print(f"    - {r['Vendor']}: {r['work_count']:,} payments | Rs. {r['total_payout']/1e7:.2f} Cr | {r['ida_count']} IDAs | {r['mp_count']} MPs | {r['state_count']} States")
        
    top_by_amount = vendor_stats.sort_values(by='total_payout', ascending=False).head(5)
    print("\n  Top 5 Vendors by Total Fund Absorption:")
    for _, r in top_by_amount.iterrows():
        print(f"    - {r['Vendor']}: Rs. {r['total_payout']/1e7:.2f} Cr ({r['total_payout']:,.2f}) across {r['work_count']:,} payments | {r['ida_count']} IDAs")
        
    # 8. Single-Vendor District Dominance (High Herfindahl-Hirschman Index / Vendor Capture)
    print(f"\n[8] DISTRICT-LEVEL VENDOR MONOPOLY (Vendor Concentration > 40% in an IDA):")
    ida_vendor = df.groupby(['IDA', 'Vendor'])[amt_col].sum().reset_index()
    ida_totals = df.groupby('IDA')[amt_col].sum().reset_index().rename(columns={amt_col: 'ida_total'})
    ida_vendor = ida_vendor.merge(ida_totals, on='IDA')
    ida_vendor['vendor_share'] = ida_vendor[amt_col] / ida_vendor['ida_total']
    
    # Filter IDAs with at least Rs 1 Crore total and vendor share > 50%
    dominant_vendors = ida_vendor[(ida_vendor['ida_total'] > 10000000) & (ida_vendor['vendor_share'] > 0.50)].sort_values(by='vendor_share', ascending=False)
    print(f"  Found {len(dominant_vendors):,} instances where a single vendor captured >50% of an IDA's total budget (min budget Rs. 1 Cr)!")
    for _, r in dominant_vendors.head(5).iterrows():
        print(f"    - {r['IDA'][:45]}...: Vendor '{r['Vendor']}' captured {r['vendor_share']*100:.1f}% (Rs. {r[amt_col]/1e7:.2f} Cr out of Rs. {r['ida_total']/1e7:.2f} Cr)")

    # 9. Work Splitting / Threshold Avoidance
    # Detecting multiple payments to the same vendor on the same day under a round number threshold (e.g., 5 Lakhs or 10 Lakhs)
    print(f"\n[9] WORK SPLITTING / TENDER CIRCUMVENTION INDICATORS:")
    same_day_split = df.groupby(['Vendor', 'Expenditure Date', 'IDA']).filter(lambda x: len(x) >= 3 and x[amt_col].mean() < 500000)
    split_groups = same_day_split.groupby(['Vendor', 'Expenditure Date', 'IDA']).size()
    print(f"  Potential Tender Splitting Clusters (>= 3 consecutive payments < Rs 5L to same vendor on same date): {len(split_groups):,} clusters ({len(same_day_split):,} transactions)")
    if len(split_groups) > 0:
        top_cluster = split_groups.sort_values(ascending=False).head(3)
        print("  Top splitting cluster examples:")
        for (v, dt, ida), count in top_cluster.items():
            sub = df[(df['Vendor'] == v) & (df['Expenditure Date'] == dt) & (df['IDA'] == ida)]
            print(f"    - Vendor '{v}' on {dt[:10]} at {ida[:35]}: {count} separate payments totaling Rs. {sub[amt_col].sum():,.2f}")

    # 10. Geographic & House Distribution
    print(f"\n[10] GEOGRAPHIC DISTRIBUTION:")
    state_exp = df.groupby('State')[amt_col].agg(['count', 'sum']).sort_values(by='sum', ascending=False)
    print("  Top 5 States by Total Expenditure:")
    for st, r in state_exp.head(5).iterrows():
        print(f"    - {st}: Rs. {r['sum']/1e7:,.2f} Cr ({r['count']:,} transactions)")
        
    print("\n  House Breakdown:")
    house_exp = df.groupby('House')[amt_col].agg(['count', 'sum'])
    for h, r in house_exp.iterrows():
        print(f"    - {h}: {r['count']:,} transactions | Rs. {r['sum']/1e7:,.2f} Cr")

    print("\n" + "=" * 70)
    print("AUDIT ENGINE SUMMARY: ALL CHECKS COMPLETED ON SIH DATASET")
    print("=" * 70)

if __name__ == '__main__':
    audit_sih_csv()
