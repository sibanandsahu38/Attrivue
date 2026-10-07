import urllib.request
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "ibm_hr_attrition.csv"
SOURCE_URL = "https://raw.githubusercontent.com/IBM/employee-attrition-aif360/master/data/emp_attrition.csv"
TARGET = "Attrition"
ID_COLUMNS = ["EmployeeNumber"]
CONSTANT_CANDIDATES = ["EmployeeCount", "Over18", "StandardHours"]


def ensure_dataset(path=DATA_PATH):
    path = Path(path)
    if path.exists() and path.stat().st_size > 1000:
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(SOURCE_URL, path)
    return path


def load_dataset(path=DATA_PATH):
    path = ensure_dataset(path)
    frame = pd.read_csv(path, encoding="utf-8-sig")
    frame.columns = [str(col).strip() for col in frame.columns]
    return frame


def validate_dataset(frame):
    report = {"rows": int(len(frame)), "columns": list(frame.columns), "errors": [], "warnings": []}
    if TARGET not in frame.columns:
        report["errors"].append("Missing target column: Attrition")
        return report
    labels = set(frame[TARGET].dropna().astype(str).unique())
    if not labels.issubset({"Yes", "No", "0", "1"}):
        report["errors"].append("Attrition must contain only Yes/No or 0/1.")
    if frame[TARGET].isna().any():
        report["errors"].append("Attrition contains missing values.")
    missing = frame.drop(columns=[TARGET]).isna().sum()
    missing = missing[missing > 0]
    report["missing"] = {col: int(count) for col, count in missing.items()}
    if "EmployeeNumber" in frame.columns:
        dupes = int(frame["EmployeeNumber"].duplicated().sum())
        report["duplicate_employee_numbers"] = dupes
        if dupes:
            report["warnings"].append(str(dupes) + " duplicate EmployeeNumber values.")
    else:
        report["duplicate_employee_numbers"] = 0
        report["warnings"].append("EmployeeNumber is absent, so duplicate employees cannot be checked by id.")
    if len(frame) < 100:
        report["errors"].append("Dataset is too small for a stable train/validation/test split.")
    report["class_counts"] = {str(k): int(v) for k, v in frame[TARGET].value_counts(dropna=False).items()}
    return report


def clean_rows(frame):
    cleaned = frame.copy()
    if "EmployeeNumber" in cleaned.columns:
        cleaned = cleaned.drop_duplicates(subset=["EmployeeNumber"], keep="first")
    cleaned = cleaned.drop_duplicates()
    return cleaned.reset_index(drop=True)
