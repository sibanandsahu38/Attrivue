import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def evaluate_predictions(y_true, probabilities, threshold=0.5):
    y_true = np.asarray(y_true).astype(int)
    probabilities = np.asarray(probabilities, dtype=float)
    predicted = (probabilities >= threshold).astype(int)
    matrix = confusion_matrix(y_true, predicted, labels=[0, 1]).tolist()
    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true, predicted)),
        "precision": float(precision_score(y_true, predicted, zero_division=0)),
        "recall": float(recall_score(y_true, predicted, zero_division=0)),
        "f1": float(f1_score(y_true, predicted, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, probabilities)),
        "confusion_matrix": {
            "labels": ["Stay", "Leave"],
            "matrix": matrix,
        },
        "positive_rate": float(predicted.mean()),
        "support_positive": int(y_true.sum()),
        "support_total": int(len(y_true)),
    }


def selection_score(metrics):
    # Attrition is imbalanced, so accuracy is not the selection target.
    return 0.45 * metrics["roc_auc"] + 0.35 * metrics["f1"] + 0.20 * metrics["recall"]


def best_f1_threshold(y_true, probabilities):
    y_true = np.asarray(y_true).astype(int)
    probabilities = np.asarray(probabilities, dtype=float)
    best_threshold, best_f1 = 0.5, -1.0
    for threshold in np.linspace(0.15, 0.85, 71):
        score = f1_score(y_true, probabilities >= threshold, zero_division=0)
        if score > best_f1:
            best_threshold, best_f1 = float(threshold), float(score)
    return best_threshold, best_f1
