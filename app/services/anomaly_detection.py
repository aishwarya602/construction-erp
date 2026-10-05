import numpy as np
from sklearn.ensemble import IsolationForest

def detect_grn_anomaly(
    quantity_ordered: float,
    quantity_received: float,
    unit_price_quoted: float,
    unit_price_billed: float
) -> dict:
    """
    Detects financial/quantity anomalies in Goods Received Notes (GRN) using Isolation Forest.
    """
    # Feature calculations
    qty_discrepancy = abs(quantity_received - quantity_ordered) / (quantity_ordered if quantity_ordered > 0 else 1)
    price_discrepancy = (unit_price_billed - unit_price_quoted) / (unit_price_quoted if unit_price_quoted > 0 else 1)
    total_overcharge = (quantity_received * unit_price_billed) - (quantity_ordered * unit_price_quoted)

    # Historical normal dataset (synthetic baseline for model fitting)
    np.random.seed(42)
    normal_data = np.random.normal(loc=[0.01, 0.01, 0.0], scale=[0.02, 0.02, 50.0], size=(100, 3))
    
    # Train Isolation Forest on normal baseline
    clf = IsolationForest(contamination=0.05, random_state=42)
    clf.fit(normal_data)

    # Input feature vector
    input_features = np.array([[qty_discrepancy, price_discrepancy, total_overcharge]])
    
    # Prediction: 1 for normal, -1 for anomaly
    prediction = clf.predict(input_features)[0]
    raw_score = float(clf.decision_function(input_features)[0])

    is_anomaly = bool(prediction == -1)

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(raw_score, 4),
        "qty_discrepancy_percent": round(qty_discrepancy * 100, 2),
        "price_discrepancy_percent": round(price_discrepancy * 100, 2),
        "total_overcharge_amount": round(total_overcharge, 2),
        "recommendation": "FLAGGED FOR AUDIT: High Risk Discrepancy" if is_anomaly else "PASSED: Transaction Normal"
    }