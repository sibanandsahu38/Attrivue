import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ml.data_loader import TARGET, clean_rows, load_dataset, validate_dataset
from ml.evaluate import best_f1_threshold, evaluate_predictions, selection_score
from ml.feature_engineering import add_features
from ml.metadata import RISK_THRESHOLDS, write_artifacts
from ml.preprocessing import build_preprocessor, feature_columns, split_column_types

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "models" / "attrition_model.pkl"
SEED = 42


def binary_target(series):
    return series.astype(str).map({"Yes": 1, "No": 0, "1": 1, "0": 0}).astype(int)


def candidate_models():
    models = {
        "logistic_regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=SEED,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
            random_state=SEED,
            n_jobs=-1,
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=3,
            random_state=SEED,
        ),
    }
    try:
        from xgboost import XGBClassifier
        models["xgboost"] = XGBClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=3,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=SEED,
            n_jobs=-1,
        )
    except ImportError:
        pass
    return models


def fit_pipeline(estimator, x_train, y_train, numeric, categorical):
    pipeline = Pipeline([
        ("preprocessor", build_preprocessor(numeric, categorical)),
        ("model", estimator),
    ])
    if estimator.__class__.__name__ in {"GradientBoostingClassifier", "XGBClassifier"}:
        positive = max(1, int(y_train.sum()))
        negative = max(1, int(len(y_train) - positive))
        weights = np.where(y_train == 1, negative / positive, 1.0)
        pipeline.fit(x_train, y_train, model__sample_weight=weights)
    else:
        pipeline.fit(x_train, y_train)
    return pipeline


def train():
    raw = load_dataset()
    validation = validate_dataset(raw)
    if validation["errors"]:
        raise SystemExit("Dataset validation failed: " + "; ".join(validation["errors"]))
    cleaned = clean_rows(raw)
    engineered = add_features(cleaned)
    columns = feature_columns(engineered)
    x = engineered[columns]
    y = binary_target(engineered[TARGET])
    numeric, categorical = split_column_types(x, columns)

    x_train, x_temp, y_train, y_temp = train_test_split(
        x, y, test_size=0.30, random_state=SEED, stratify=y
    )
    x_val, x_test, y_val, y_test = train_test_split(
        x_temp, y_temp, test_size=0.50, random_state=SEED, stratify=y_temp
    )

    reports = {}
    fitted = {}
    for name, estimator in candidate_models().items():
        pipeline = fit_pipeline(estimator, x_train, y_train, numeric, categorical)
        probabilities = pipeline.predict_proba(x_val)[:, 1]
        threshold, _ = best_f1_threshold(y_val, probabilities)
        metrics = evaluate_predictions(y_val, probabilities, threshold)
        metrics["selection_score"] = selection_score(metrics)
        reports[name] = {"validation": metrics}
        fitted[name] = pipeline

    best_name = max(reports, key=lambda name: reports[name]["validation"]["selection_score"])
    winner = fitted[best_name]
    val_probabilities = winner.predict_proba(x_val)[:, 1]
    threshold, _ = best_f1_threshold(y_val, val_probabilities)

    # Refit on train+validation only after model selection. The test split stays untouched.
    x_final = pd_concat(x_train, x_val)
    y_final = pd_concat_y(y_train, y_val)
    final_pipeline = fit_pipeline(
        candidate_models()[best_name],
        x_final,
        y_final,
        numeric,
        categorical,
    )
    test_probabilities = final_pipeline.predict_proba(x_test)[:, 1]
    test_metrics = evaluate_predictions(y_test, test_probabilities, threshold)
    reports[best_name]["test"] = test_metrics
    importance_result = permutation_importance(
        final_pipeline,
        x_test,
        y_test,
        scoring="roc_auc",
        n_repeats=5,
        random_state=SEED,
        n_jobs=1,
    )
    global_importance = [
        {
            "feature": str(feature),
            "importance_mean": float(mean) if np.isfinite(mean) else 0.0,
            "importance_std": float(std) if np.isfinite(std) else 0.0,
            "metric": "test ROC-AUC drop after feature permutation",
        }
        for feature, mean, std in zip(columns, importance_result.importances_mean, importance_result.importances_std)
    ]
    global_importance.sort(key=lambda item: item["importance_mean"], reverse=True)
    background = x_train.sample(n=min(12, len(x_train)), random_state=SEED).copy()

    bundle = {
        "pipeline": final_pipeline,
        "model_name": best_name,
        "feature_columns": columns,
        "numeric_columns": numeric,
        "categorical_columns": categorical,
        "decision_threshold": threshold,
        "risk_low": RISK_THRESHOLDS["low"],
        "risk_medium": RISK_THRESHOLDS["medium"],
        "risk_high": RISK_THRESHOLDS["high"],
        "target": TARGET,
        "validation_report": validation,
        "metrics": reports,
        "explanation_background": background,
        "explanation_method": "Permutation-Shapley approximation on attrition probability",
        "global_importance": global_importance,
        "global_importance_method": "Test-set permutation importance using ROC-AUC drop",
    }
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)
    write_artifacts(
        best_name,
        columns,
        {name: {"validation": item["validation"], **({"test": item["test"]} if "test" in item else {})} for name, item in reports.items()},
        test_metrics,
        validation,
        {"train": len(y_train), "validation": len(y_val), "test": len(y_test)},
        "data/ibm_hr_attrition.csv",
        global_importance,
    )
    return best_name, test_metrics


def pd_concat(left, right):
    import pandas as pd
    return pd.concat([left, right], axis=0)


def pd_concat_y(left, right):
    import pandas as pd
    return pd.concat([left, right], axis=0)


if __name__ == "__main__":
    name, metrics = train()
    print("Best model:", name)
    print("Test metrics:")
    for key in ("accuracy", "precision", "recall", "f1", "roc_auc"):
        print(f"  {key}: {metrics[key]:.4f}")
    print("  confusion_matrix:", metrics["confusion_matrix"]["matrix"])
    print("Saved", MODEL_PATH)
