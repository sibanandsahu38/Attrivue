"""Model-agnostic, permutation-sampled Shapley explanations on probability scale."""

import numpy as np
import pandas as pd


PERMUTATION_COUNT = 16
BACKGROUND_ROWS = 12
EXPLANATION_SEED = 731
TOP_FACTOR_COUNT = 5
PERCENT_POINTS = 100.0

FEATURE_LABELS = {
    "Age": "Age",
    "BusinessTravel": "Business travel",
    "DailyRate": "Daily rate",
    "Department": "Department",
    "DistanceFromHome": "Distance from home",
    "Education": "Education level",
    "EducationField": "Education field",
    "EnvironmentSatisfaction": "Environment satisfaction",
    "Gender": "Gender",
    "HourlyRate": "Hourly rate",
    "JobInvolvement": "Job involvement",
    "JobLevel": "Job level",
    "JobRole": "Job role",
    "JobSatisfaction": "Job satisfaction",
    "MaritalStatus": "Marital status",
    "MonthlyIncome": "Monthly income",
    "MonthlyRate": "Monthly rate",
    "NumCompaniesWorked": "Companies worked",
    "OverTime": "Overtime",
    "PercentSalaryHike": "Salary hike",
    "PerformanceRating": "Performance rating",
    "RelationshipSatisfaction": "Relationship satisfaction",
    "StockOptionLevel": "Stock option level",
    "TotalWorkingYears": "Total working years",
    "TrainingTimesLastYear": "Training sessions last year",
    "WorkLifeBalance": "Work-life balance",
    "YearsAtCompany": "Years at company",
    "YearsInCurrentRole": "Years in current role",
    "YearsSinceLastPromotion": "Years since last promotion",
    "YearsWithCurrManager": "Years with current manager",
    "RoleTenureRatio": "Role tenure ratio",
    "PromotionGapRatio": "Promotion gap ratio",
    "ManagerTenureRatio": "Manager tenure ratio",
    "IncomePerLevel": "Income per job level",
    "CompaniesPerWorkingYear": "Companies per working year",
}


class ExplanationUnavailable(RuntimeError):
    """Raised when the trained artifact lacks a usable explanation background."""


def _safe_value(value):
    try:
        if pd.isna(value):
            return "Missing (imputed by model)"
    except (TypeError, ValueError):
        pass
    if isinstance(value, (np.integer, int)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        number = float(value)
        return number if np.isfinite(number) else "Missing (imputed by model)"
    return str(value)


def _background_frame(bundle, columns, max_rows):
    background = bundle.get("explanation_background")
    if isinstance(background, pd.DataFrame):
        frame = background.copy()
    elif isinstance(background, list):
        frame = pd.DataFrame(background)
    else:
        raise ExplanationUnavailable("This model artifact has no training background; retrain it to enable explanations.")
    if frame.empty:
        raise ExplanationUnavailable("This model artifact has an empty explanation background; retrain it.")
    for column in columns:
        if column not in frame.columns:
            frame[column] = np.nan
    frame = frame[columns]
    count = min(max_rows, len(frame))
    return frame.sample(n=count, random_state=EXPLANATION_SEED).reset_index(drop=True)


def _model_probability(bundle, frame):
    probabilities = bundle["pipeline"].predict_proba(frame)
    classes = list(bundle["pipeline"].classes_)
    positive_index = classes.index(1) if 1 in classes else classes.index(True)
    return np.asarray(probabilities[:, positive_index], dtype=float)


def _factor(field, value, contribution, total_abs):
    return {
        "feature": field,
        "label": FEATURE_LABELS.get(field, field.replace("_", " ")),
        "value": _safe_value(value),
        "direction": "increases" if contribution > 0 else "decreases",
        "contribution": float(contribution),
        "contribution_percentage_points": float(contribution * PERCENT_POINTS),
        "relative_importance": float(abs(contribution) / total_abs) if total_abs else 0.0,
    }


def explain_employee(features, bundle=None, path=None, probability=None, top_n=TOP_FACTOR_COUNT):
    """Approximate interventional Shapley values by averaging random feature orders.

    Each contribution is a delta in the trained model's attrition probability. The
    empirical background is saved from training rows; it is not an HR rule or a
    causal claim. Along every permutation, the contributions add to the model's
    prediction minus that sampled background row's prediction.
    """
    if bundle is None:
        from ml.predict import load_bundle
        bundle = load_bundle(path) if path is not None else load_bundle()
    from ml.predict import _frame

    columns = list(bundle.get("feature_columns") or [])
    if not columns:
        raise ExplanationUnavailable("This model artifact has no feature schema.")
    target = _frame([features], columns).iloc[0].to_dict()
    target_frame = pd.DataFrame([target], columns=columns)
    actual_probability = (
        float(probability)
        if probability is not None
        else float(_model_probability(bundle, target_frame)[0])
    )
    background = _background_frame(bundle, columns, BACKGROUND_ROWS)

    rng = np.random.default_rng(EXPLANATION_SEED)
    paths = []
    states = []
    for _ in range(PERMUTATION_COUNT):
        background_row = background.iloc[int(rng.integers(0, len(background)))].to_dict()
        order = rng.permutation(len(columns)).tolist()
        path_start = len(states)
        current = dict(background_row)
        states.append(dict(current))
        ordered_fields = [columns[index] for index in order]
        for field in ordered_fields:
            current[field] = target[field]
            states.append(dict(current))
        paths.append((path_start, ordered_fields))

    state_frame = pd.DataFrame(states, columns=columns)
    state_probabilities = _model_probability(bundle, state_frame)
    contributions = {field: 0.0 for field in columns}
    baseline_probability = 0.0
    for start, ordered_fields in paths:
        baseline_probability += float(state_probabilities[start])
        previous = float(state_probabilities[start])
        for offset, field in enumerate(ordered_fields, start=1):
            current_probability = float(state_probabilities[start + offset])
            contributions[field] += current_probability - previous
            previous = current_probability

    path_count = float(len(paths))
    baseline_probability /= path_count
    contributions = {field: value / path_count for field, value in contributions.items()}
    total_abs = sum(abs(value) for value in contributions.values())
    risk = sorted(
        ((field, value) for field, value in contributions.items() if value > 0),
        key=lambda item: item[1],
        reverse=True,
    )[:top_n]
    protective = sorted(
        ((field, value) for field, value in contributions.items() if value < 0),
        key=lambda item: item[1],
    )[:top_n]
    risk_factors = [_factor(field, target[field], value, total_abs) for field, value in risk]
    protective_factors = [_factor(field, target[field], value, total_abs) for field, value in protective]

    def phrase(factor):
        return (
            factor["label"] + " (" + str(factor["value"]) + ", "
            + ("+" if factor["contribution"] >= 0 else "")
            + format(factor["contribution_percentage_points"], ".2f") + " percentage points)"
        )

    risk_text = ", ".join(phrase(item) for item in risk_factors[:3]) or "no individual feature increased the estimate"
    protective_text = ", ".join(phrase(item) for item in protective_factors[:3]) or "no individual feature reduced the estimate"
    explanation = (
        "The trained model estimates " + format(actual_probability * PERCENT_POINTS, ".1f")
        + "% attrition probability, compared with a "
        + format(baseline_probability * PERCENT_POINTS, ".1f")
        + "% mean probability across sampled training employees. Strongest risk-increasing contributions: "
        + risk_text + ". Strongest protective contributions: " + protective_text
        + ". These are associations learned by the model, not causes."
    )
    return {
        "probability": actual_probability,
        "top_risk_factors": risk_factors,
        "protective_factors": protective_factors,
        "baseline_probability": float(baseline_probability),
        "contribution_sum": float(sum(contributions.values())),
        "local_accuracy_residual": float(actual_probability - baseline_probability - sum(contributions.values())),
        "explanation_method": "Permutation-Shapley approximation on attrition probability",
        "explanation": explanation,
    }
