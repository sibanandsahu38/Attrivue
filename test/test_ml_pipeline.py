import unittest
from pathlib import Path
import tempfile

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from ml.data_loader import TARGET, clean_rows, validate_dataset
from ml.metadata import load_metadata, validate_metadata
from ml.feature_engineering import add_features
from ml.explain import ExplanationUnavailable, explain_employee
from ml.predict import global_feature_importance, predict_employee
from ml.preprocessing import build_preprocessor

ROOT = Path(__file__).resolve().parent.parent


class MetadataTests(unittest.TestCase):
    def test_malformed_metadata_is_rejected(self):
        self.assertTrue(validate_metadata({"model_name": "Attrivue"}))
        data, error = load_metadata(ROOT / "models" / "does-not-exist.json")
        self.assertIsNone(data)
        self.assertTrue(error)


class DataTests(unittest.TestCase):
    def test_validation_rejects_missing_target(self):
        report = validate_dataset(pd.DataFrame({"Age": [30, 40]}))
        self.assertTrue(report["errors"])

    def test_duplicate_detection(self):
        frame = pd.DataFrame({
            "EmployeeNumber": [1, 1, 2],
            "Attrition": ["Yes", "No", "No"],
            "Age": [30, 31, 32],
        })
        report = validate_dataset(frame)
        self.assertEqual(report["duplicate_employee_numbers"], 1)
        self.assertEqual(len(clean_rows(frame)), 2)

    def test_feature_engineering_does_not_need_target(self):
        frame = add_features(pd.DataFrame({
            "YearsAtCompany": [0, 5],
            "YearsInCurrentRole": [0, 2],
            "YearsSinceLastPromotion": [0, 4],
            "YearsWithCurrManager": [0, 1],
            "MonthlyIncome": [2000, 8000],
            "JobLevel": [1, 2],
            "NumCompaniesWorked": [1, 3],
            "TotalWorkingYears": [1, 6],
        }))
        self.assertNotIn(TARGET, frame.columns)
        self.assertAlmostEqual(frame.loc[1, "RoleTenureRatio"], 2 / 6)


class ModelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.model_path = Path(cls.temporary.name) / "test-model.pkl"
        rows = []
        for age in (25, 40, 55):
            for overtime in ("No", "Yes"):
                for income in (2200, 15000):
                    rows.append({
                        "Age": age,
                        "MonthlyIncome": income,
                        "OverTime": overtime,
                        "Attrition": int(overtime == "Yes" or income < 5000),
                    })
        cls.training = pd.DataFrame(rows)
        features = cls.training[["Age", "MonthlyIncome", "OverTime"]]
        cls.pipeline = Pipeline([
            ("preprocessor", build_preprocessor(["Age", "MonthlyIncome"], ["OverTime"])),
            ("model", LogisticRegression(max_iter=500, random_state=7)),
        ])
        cls.pipeline.fit(features, cls.training["Attrition"])
        cls.bundle = {
            "pipeline": cls.pipeline,
            "model_name": "test-logistic-regression",
            "feature_columns": ["Age", "MonthlyIncome", "OverTime"],
            "decision_threshold": 0.5,
            "risk_low": 0.33,
            "risk_medium": 0.66,
            "risk_high": 1.0,
            "explanation_background": features.copy(),
            "global_importance": [
                {"feature": "OverTime", "importance_mean": 0.12, "importance_std": 0.01},
                {"feature": "MonthlyIncome", "importance_mean": 0.08, "importance_std": 0.02},
            ],
        }
        joblib.dump(cls.bundle, cls.model_path)

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def test_prediction_contract_and_not_constant(self):
        low = predict_employee({"Age": 45, "OverTime": "No", "MonthlyIncome": 15000}, self.model_path)
        high = predict_employee({"Age": 25, "OverTime": "Yes", "MonthlyIncome": 2200}, self.model_path)
        for result in (low, high):
            self.assertIn("probability", result)
            self.assertIn(result["risk_level"], {"Low", "Medium", "High"})
            self.assertIn(result["prediction"], {"Likely Stay", "At Risk"})
            self.assertGreaterEqual(result["attrition_probability"], 0)
            self.assertLessEqual(result["attrition_probability"], 1)
        self.assertNotEqual(low["attrition_probability"], high["attrition_probability"])
        self.assertGreater(high["attrition_probability"], low["attrition_probability"])

    def test_prediction_explanation_is_from_model_and_additive(self):
        features = {"Age": 40, "OverTime": "Yes", "MonthlyIncome": 15000}
        probability = float(self.pipeline.predict_proba(pd.DataFrame([features]))[0, 1])
        result = explain_employee(features, bundle=self.bundle, probability=probability)
        self.assertAlmostEqual(result["probability"], probability, places=12)
        self.assertLess(abs(result["local_accuracy_residual"]), 1e-10)
        self.assertTrue(result["top_risk_factors"])
        self.assertTrue(result["protective_factors"])
        self.assertTrue(all(f["contribution"] > 0 for f in result["top_risk_factors"]))
        self.assertTrue(all(f["contribution"] < 0 for f in result["protective_factors"]))
        self.assertIn("not causes", result["explanation"])

    def test_explanation_refuses_artifact_without_training_background(self):
        incomplete = dict(self.bundle)
        incomplete.pop("explanation_background")
        with self.assertRaises(ExplanationUnavailable):
            explain_employee({"Age": 40, "OverTime": "No", "MonthlyIncome": 9000}, bundle=incomplete)

    def test_global_importance_uses_artifact_values(self):
        result = global_feature_importance(self.model_path)
        self.assertEqual(result["features"][0]["feature"], "OverTime")
        self.assertIn("ROC-AUC", result["method"])


if __name__ == "__main__":
    unittest.main()
