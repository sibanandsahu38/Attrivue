import numpy as np
import pandas as pd

ENGINEERED = [
    "RoleTenureRatio",
    "PromotionGapRatio",
    "ManagerTenureRatio",
    "IncomePerLevel",
    "CompaniesPerWorkingYear",
]


def _divide(numerator, denominator):
    return numerator / denominator.replace(0, np.nan)


def add_features(frame):
    data = frame.copy()
    if {"YearsInCurrentRole", "YearsAtCompany"}.issubset(data.columns):
        data["RoleTenureRatio"] = _divide(data["YearsInCurrentRole"], data["YearsAtCompany"] + 1)
    if {"YearsSinceLastPromotion", "YearsAtCompany"}.issubset(data.columns):
        data["PromotionGapRatio"] = _divide(data["YearsSinceLastPromotion"], data["YearsAtCompany"] + 1)
    if {"YearsWithCurrManager", "YearsAtCompany"}.issubset(data.columns):
        data["ManagerTenureRatio"] = _divide(data["YearsWithCurrManager"], data["YearsAtCompany"] + 1)
    if {"MonthlyIncome", "JobLevel"}.issubset(data.columns):
        data["IncomePerLevel"] = _divide(data["MonthlyIncome"], data["JobLevel"].clip(lower=1))
    if {"NumCompaniesWorked", "TotalWorkingYears"}.issubset(data.columns):
        data["CompaniesPerWorkingYear"] = _divide(data["NumCompaniesWorked"], data["TotalWorkingYears"] + 1)
    return data
