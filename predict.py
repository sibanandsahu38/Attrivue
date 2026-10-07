from pathlib import Path

import numpy as np
import pandas as pd

from ml.feature_engineering import add_features
from ml.metadata import load_metadata, safe_thresholds

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "models" / "attrition_model.pkl"
_BUNDLE = None


def load_bundle(path=MODEL_PATH):
    global _BUNDLE
    if _BUNDLE is None or _BUNDLE.get("_path") != str(path):
        import joblib
        bundle = joblib.load(path)
        bundle["_path"] = str(path)
        _BUNDLE = bundle
    return _BUNDLE


def risk_level(probability, thresholds=None):
    limits = safe_thresholds({"risk_thresholds": thresholds} if isinstance(thresholds, dict) else None)
    if probability >= limits["medium"]:
        return "High"
    if probability >= limits["low"]:
        return "Medium"
    return "Low"


def _frame(records, columns):
    frame = pd.DataFrame(records)
    frame = add_features(frame)
    for column in columns:
        if column not in frame.columns:
            frame[column] = np.nan
    return frame[columns]


def predict_many(records, path=MODEL_PATH, include_explanations=False):
    if not records:
        return []
    bundle = load_bundle(path)
    metadata, _error = load_metadata()
    thresholds = safe_thresholds(metadata, bundle)
    frame = _frame(records, bundle["feature_columns"])
    probabilities = bundle["pipeline"].predict_proba(frame)[:, 1]
    try:
        threshold = float(bundle["decision_threshold"])
    except (TypeError, ValueError):
        threshold = 0.5
    results = []
    for index, probability in enumerate(probabilities):
        value = float(probability)
        result = {
            "attrition_probability": value,
            "probability": value,
            "risk_level": risk_level(value, thresholds),
            "prediction": "At Risk" if value >= threshold else "Likely Stay",
        }
        if include_explanations:
            from ml.explain import explain_employee
            result.update(explain_employee(records[index], bundle=bundle, probability=value))
        results.append(result)
    return results


def predict_employee(features, path=MODEL_PATH):
    return predict_many([features], path, include_explanations=True)[0]


def global_feature_importance(path=MODEL_PATH):
    bundle = load_bundle(path)
    importance = bundle.get("global_importance")
    if not isinstance(importance, list) or not importance:
        raise FileNotFoundError("The trained artifact has no global feature importance. Retrain it.")
    return {
        "model_name": bundle.get("model_name", "trained attrition model"),
        "method": "Test-set permutation importance using ROC-AUC drop",
        "features": importance,
    }
