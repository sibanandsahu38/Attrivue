from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.data_loader import CONSTANT_CANDIDATES, ID_COLUMNS, TARGET


def feature_columns(frame):
    excluded = set(ID_COLUMNS + CONSTANT_CANDIDATES + [TARGET])
    return [col for col in frame.columns if col not in excluded]


def split_column_types(frame, columns):
    numeric, categorical = [], []
    for col in columns:
        if pd_is_numeric(frame[col]):
            numeric.append(col)
        else:
            categorical.append(col)
    return numeric, categorical


def pd_is_numeric(series):
    return series.dtype.kind in "biufc"


def build_preprocessor(numeric_columns, categorical_columns):
    numeric = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric, numeric_columns),
            ("categorical", categorical, categorical_columns),
        ],
        remainder="drop",
    )
