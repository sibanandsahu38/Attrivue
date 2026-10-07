import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
METADATA_PATH = ROOT / "models" / "model_metadata.json"
REPORT_PATH = ROOT / "reports" / "model_metrics.json"
METRIC_KEYS = ("accuracy", "precision", "recall", "f1", "roc_auc")
RISK_THRESHOLDS = {"low": 0.33, "medium": 0.66, "high": 1.0}
ALGORITHM_NAMES = {
    "logistic_regression": "Logistic Regression",
    "random_forest": "Random Forest",
    "gradient_boosting": "Gradient Boosting",
    "xgboost": "XGBoost",
}


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _number(value, name, errors, low=0.0, high=1.0):
    try:
        number = float(value)
    except (TypeError, ValueError):
        errors.append(name + " must be a number.")
        return None
    if number < low or number > high or number != number:
        errors.append(name + " is outside the expected range.")
    return number


def validate_metadata(data):
    errors = []
    if not isinstance(data, dict):
        return ["Metadata must be a JSON object."]
    for key in ("model_name", "model_version", "algorithm", "dataset", "training_date", "target"):
        if not isinstance(data.get(key), str) or not data.get(key).strip():
            errors.append(key + " must be a non-empty string.")
    if data.get("target") not in (None, "Attrition") and isinstance(data.get("target"), str):
        errors.append("target must be Attrition.")
    features = data.get("features")
    if not isinstance(features, list) or not features or not all(isinstance(item, str) and item for item in features):
        errors.append("features must be a non-empty list of strings.")
    metrics = data.get("metrics")
    if not isinstance(metrics, dict):
        errors.append("metrics must be an object.")
    else:
        for key in METRIC_KEYS:
            _number(metrics.get(key), "metrics." + key, errors)
    if not isinstance(data.get("class_distribution"), dict):
        errors.append("class_distribution must be an object.")
    thresholds = data.get("risk_thresholds")
    if not isinstance(thresholds, dict):
        errors.append("risk_thresholds must be an object.")
    else:
        low = _number(thresholds.get("low"), "risk_thresholds.low", errors)
        medium = _number(thresholds.get("medium"), "risk_thresholds.medium", errors)
        high = _number(thresholds.get("high"), "risk_thresholds.high", errors)
        if None not in (low, medium, high) and not (low < medium <= high):
            errors.append("risk thresholds must increase from low to high.")
    return errors


def validate_report(data):
    errors = []
    if not isinstance(data, dict):
        return ["Metrics report must be a JSON object."]
    if not isinstance(data.get("best_model"), str) or not data.get("best_model"):
        errors.append("best_model must be a non-empty string.")
    models = data.get("models")
    if not isinstance(models, dict) or not models:
        errors.append("models must contain at least one trained model.")
    else:
        for name, item in models.items():
            if not isinstance(item, dict) or not isinstance(item.get("validation"), dict):
                errors.append("models." + str(name) + " is missing validation metrics.")
                continue
            for key in METRIC_KEYS:
                _number(item["validation"].get(key), "models." + str(name) + ".validation." + key, errors)
    if not isinstance(data.get("dataset"), dict):
        errors.append("dataset information is missing.")
    counts = data.get("sample_counts")
    if not isinstance(counts, dict):
        errors.append("sample_counts is missing.")
    else:
        for key in ("train", "validation", "test"):
            try:
                if int(counts.get(key)) < 1:
                    raise ValueError
            except (TypeError, ValueError):
                errors.append("sample_counts." + key + " must be a positive integer.")
    try:
        if int(data.get("feature_count")) < 1:
            raise ValueError
    except (TypeError, ValueError):
        errors.append("feature_count must be a positive integer.")
    matrix = data.get("confusion_matrix")
    if not isinstance(matrix, list) or len(matrix) != 2 or any(not isinstance(row, list) or len(row) != 2 for row in matrix):
        errors.append("confusion_matrix must be a 2x2 list.")
    return errors


def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8")), None
    except FileNotFoundError:
        return None, "File not found."
    except json.JSONDecodeError:
        return None, "File is not valid JSON."
    except OSError:
        return None, "File could not be read."


def load_metadata(path=METADATA_PATH):
    data, error = read_json(path)
    if error:
        return None, error
    errors = validate_metadata(data)
    if errors:
        return None, "; ".join(errors)
    return data, None


def load_report(path=REPORT_PATH):
    data, error = read_json(path)
    if error:
        return None, error
    errors = validate_report(data)
    if errors:
        return None, "; ".join(errors)
    return data, None


def safe_thresholds(metadata=None, bundle=None):
    candidates = []
    if isinstance(metadata, dict):
        candidates.append(metadata.get("risk_thresholds"))
    if isinstance(bundle, dict):
        candidates.append({
            "low": bundle.get("risk_low", bundle.get("risk_medium")),
            "medium": bundle.get("risk_medium", bundle.get("risk_high")),
            "high": bundle.get("risk_high", 1.0),
        })
    candidates.append(RISK_THRESHOLDS)
    for item in candidates:
        if validate_metadata({"model_name": "x", "model_version": "x", "algorithm": "x", "dataset": "x", "training_date": "x", "features": ["x"], "target": "Attrition", "metrics": {key: 0 for key in METRIC_KEYS}, "class_distribution": {}, "risk_thresholds": item}) == []:
            return item
        if isinstance(item, dict):
            try:
                low, medium, high = float(item["low"]), float(item["medium"]), float(item["high"])
                if 0 <= low < medium <= high <= 1:
                    return {"low": low, "medium": medium, "high": high}
            except (KeyError, TypeError, ValueError):
                continue
    return dict(RISK_THRESHOLDS)


def _metric_block(metrics):
    return {key: float(metrics[key]) for key in METRIC_KEYS}


def write_artifacts(best_name, columns, reports, test_metrics, validation, counts, dataset_path, global_importance):
    written_at = utc_now()
    metadata = {
        "model_name": "attrivue-attrition",
        "model_version": written_at,
        "algorithm": ALGORITHM_NAMES.get(best_name, best_name),
        "dataset": "IBM HR Analytics Employee Attrition & Performance",
        "training_date": written_at,
        "features": list(columns),
        "target": "Attrition",
        "metrics": _metric_block(test_metrics),
        "class_distribution": validation.get("class_counts", {}),
        "risk_thresholds": dict(RISK_THRESHOLDS),
    }
    report = {
        "best_model": best_name,
        "best_algorithm": ALGORITHM_NAMES.get(best_name, best_name),
        "training_date": written_at,
        "dataset": {
            "name": metadata["dataset"],
            "path": str(dataset_path),
            "rows": validation.get("rows"),
            "duplicate_employee_numbers": validation.get("duplicate_employee_numbers", 0),
            "missing": validation.get("missing", {}),
        },
        "feature_count": len(columns),
        "features": list(columns),
        "sample_counts": {
            "train": int(counts["train"]),
            "validation": int(counts["validation"]),
            "test": int(counts["test"]),
        },
        "class_distribution": validation.get("class_counts", {}),
        "models": reports,
        "global_feature_importance": global_importance,
        "global_importance_metric": "Test-set ROC-AUC drop after independently permuting each raw model feature.",
        "confusion_matrix": test_metrics["confusion_matrix"]["matrix"],
        "roc_auc": float(test_metrics["roc_auc"]),
        "f1": float(test_metrics["f1"]),
        "precision": float(test_metrics["precision"]),
        "recall": float(test_metrics["recall"]),
        "accuracy": float(test_metrics["accuracy"]),
        "decision_threshold": float(test_metrics["threshold"]),
    }
    metadata_errors = validate_metadata(metadata)
    report_errors = validate_report(report)
    if metadata_errors or report_errors:
        raise ValueError("Refusing to write invalid model JSON: " + "; ".join(metadata_errors + report_errors))
    _write(METADATA_PATH, metadata)
    _write(REPORT_PATH, report)
    return metadata, report


def _write(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    temporary.replace(path)
