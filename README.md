# Attrivue

Attrition Predictor for HR managers. Scores, what-if, charts, and reports run in the browser. Accounts are stored in a SQLite database by the Python API.

## Layout

- `index.html` — frontend
- `ml/` — reproducible training and inference
- `models/attrition_model.pkl` — trained model, created by `python -m ml.train`
- `data/ibm_hr_attrition.csv` — IBM HR attrition table, downloaded on first training run
- `backend/app.py` — Python API and static server
- `backend/db.py` — SQLite schema
- `backend/data/attrivue.sqlite` — account database, created on first run
- `api/README.md` — route list

Train the model before expecting live predictions:

```bash
pip install -r requirements.txt
python -m ml.train
python -m unittest tests.test_ml_pipeline
python backend/app.py
```

## Run

```bash
pip install -r requirements.txt
python backend/app.py
```

Open http://127.0.0.1:5000

If you open `index.html` directly and the API is not running, accounts stay in this browser instead.
