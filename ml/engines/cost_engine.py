import pandas as pd
import numpy as np
import json
from sklearn.ensemble import IsolationForest
from db import fetch_df, get_engine, execute

# Engineered features (from feature_engine.py) that describe a work's cost/
# fund/agency profile. Feeding all of these into Isolation Forest, rather
# than sanction_amount alone, lets the model catch works that are unusual in
# combination (e.g. moderately high cost + fast fund release + a rare
# agency) even when no single figure crosses a fixed threshold.
ML_FEATURE_COLUMNS = [
    'cost_deviation', 'cost_z_score',
    'sanction_delay_days', 'execution_delay_days',
    'payment_delay_days', 'closure_delay_days',
    'released_percentage', 'expenditure_percentage', 'progress_gap',
    'agency_work_share', 'agency_district_share',
    'agency_avg_delay', 'agency_high_risk_pct',
]


def run_cost_engine():
    print("Running Cost Engine (Isolation Forest)...")

    query = f"""
        SELECT w.id, w.sanction_amount, f.cost_peer_median,
               {', '.join('f.' + c for c in ML_FEATURE_COLUMNS)}
        FROM works w
        JOIN work_features f ON w.id = f.work_id
    """
    df = fetch_df(query)
    if df.empty:
        return
    df = df.reset_index(drop=True)

    # --- Build the feature matrix ---
    X = df[ML_FEATURE_COLUMNS].copy()
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.median(numeric_only=True))
    X = X.fillna(0)

    # Log-dampen heavy-tailed columns (deviations, delay counts) so a single
    # extreme work can't dominate the tree splits.
    X_log = np.sign(X) * np.log1p(np.abs(X))

    results = []

    if len(df) >= 10:
        # --- Isolation Forest: multivariate outlier detection ---
        contamination = min(0.10, max(0.01, 20 / max(len(df), 1)))
        model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=200,
        )
        pred = model.fit_predict(X_log)
        strength = -model.decision_function(X_log)
        ml_score_pct = pd.Series(strength).rank(pct=True) * 100
    else:
        # Too few works this run for a stable forest; skip the ML signal
        # and fall back to the IQR rule below.
        pred = np.ones(len(df))
        ml_score_pct = pd.Series(np.zeros(len(df)))

    # --- IQR rule: flags amounts that are extreme in absolute terms, even
    # if the ML model didn't isolate them (mirrors the DS team's script) ---
    amounts = df['sanction_amount'].dropna()
    upper_limit = None
    if len(amounts) >= 5:
        q1, q3 = amounts.quantile(0.25), amounts.quantile(0.75)
        iqr = q3 - q1
        if iqr > 0:
            upper_limit = q3 + 3 * iqr

    for i, row in df.iterrows():
        amt = row['sanction_amount']
        med = row['cost_peer_median']
        dev = row['cost_deviation']

        is_ml_outlier = pred[i] == -1
        is_extreme_value = pd.notna(amt) and upper_limit is not None and amt > upper_limit

        raw_score = float(ml_score_pct.iloc[i]) if len(df) >= 10 else 0.0
        if is_extreme_value:
            raw_score = max(raw_score, 90.0)

        # Being cheaper than peers is far less suspicious than being pricier
        # — keep the repo's existing domain judgement call.
        if pd.notna(amt) and pd.notna(med) and amt < med:
            raw_score *= 0.3

        score = int(round(min(100, raw_score)))

        if score >= 60:
            sev = 'HIGH'
        elif score >= 30:
            sev = 'MEDIUM'
        else:
            sev = 'LOW'

        reasons = []
        if is_ml_outlier:
            reasons.append('MULTIVARIATE_OUTLIER')
        if is_extreme_value:
            reasons.append('EXTREME_ALLOCATION_VALUE')
        if not reasons and pd.notna(dev) and abs(dev) > 2.0:
            reasons.append('COST_ABOVE_PEER_MEDIAN')
        rcode = reasons[0] if reasons else 'COST_NORMAL'

        pct_above = ((amt - med) / med * 100) if pd.notna(amt) and med else 0
        desc_bits = []
        if is_extreme_value:
            desc_bits.append("Sanction amount is an extreme outlier vs. all works (IQR rule)")
        if is_ml_outlier:
            desc_bits.append(f"Unusual combination of cost/delay/fund signals ({pct_above:.1f}% vs peer median)")
        if not desc_bits:
            desc_bits.append(f"Sanction amount is {pct_above:.1f}% above peer median ({dev:.1f} MADs)" if pd.notna(dev) else "Within normal range")
        desc = " | ".join(desc_bits)

        evid = {
            'work_amount': float(amt) if pd.notna(amt) else 0,
            'peer_median': float(med) if pd.notna(med) else 0,
            'deviation_mads': float(dev) if pd.notna(dev) else 0,
            'ml_anomaly_percentile': round(raw_score, 2),
            'ml_flagged': bool(is_ml_outlier),
            'iqr_extreme_flagged': bool(is_extreme_value),
            'features_used': ML_FEATURE_COLUMNS,
        }

        results.append({
            'work_id': row['id'],
            'engine_type': 'COST',
            'score': score,
            'severity': sev,
            'reason_code': rcode,
            'description': desc,
            'evidence': json.dumps(evid),
            'confidence': 90,
            'model_version': '2.0-isoforest',
        })

    df_res = pd.DataFrame(results)
    execute("DELETE FROM detection_results WHERE engine_type = 'COST'")
    df_res.to_sql('detection_results', get_engine(), if_exists='append', index=False)
    print(f"Cost Engine completed. Generated {len(df_res)} scores "
          f"({int((pred == -1).sum()) if len(df) >= 10 else 0} ML outliers).")


if __name__ == "__main__":
    run_cost_engine()