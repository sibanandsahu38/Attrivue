import secrets
import sys
import time
from pathlib import Path
import hmac
import re

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
for import_path in (str(ROOT), str(BACKEND_DIR)):
    if import_path not in sys.path:
        sys.path.insert(0, import_path)
from db import connect, dumps, init_db, loads

TOKEN_SECONDS = 60 * 60 * 24 * 14
app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
init_db()
CLIENT_HASH_RE = re.compile(r"(?:[a-f0-9]{64}|x[a-f0-9]{1,32})\Z")
PASSWORD_KDF = "pbkdf2:sha256:600000"


def account_for(row, models):
    return {
        "created": row["created"],
        "schemaVersion": 1,
        "theme": row["theme"],
        "privacy": bool(row["privacy"]),
        "tourDone": bool(row["tour_done"]),
        "modelId": row["model_id"],
        "customModels": loads(row["custom_models"], []),
        "models": models,
        "log": loads(row["activity_log"], []),
    }


def verify_client_hash(stored_hash, submitted_hash):
    if stored_hash.startswith(("pbkdf2:", "scrypt:")):
        return check_password_hash(stored_hash, submitted_hash), False
    matches = hmac.compare_digest(stored_hash, submitted_hash)
    return matches, matches


def models_for(con, username):
    out = {}
    rows = con.execute(
        "SELECT model_id, employees, scenarios, snapshots FROM model_records WHERE username = ?",
        (username,),
    ).fetchall()
    for row in rows:
        out[row["model_id"]] = {
            "employees": loads(row["employees"], []),
            "scenarios": loads(row["scenarios"], []),
            "snapshots": loads(row["snapshots"], []),
        }
    return out


def current_user(con):
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    row = con.execute(
        """
        SELECT users.* FROM sessions
        JOIN users ON users.username = sessions.username
        WHERE sessions.token = ? AND sessions.expires > ?
        """,
        (token, int(time.time())),
    ).fetchone()
    return (token, row) if row else (None, None)


def save_models(con, username, models):
    con.execute("DELETE FROM model_records WHERE username = ?", (username,))
    if not isinstance(models, dict):
        return
    for model_id, bundle in models.items():
        bundle = bundle if isinstance(bundle, dict) else {}
        con.execute(
            """
            INSERT INTO model_records (username, model_id, employees, scenarios, snapshots)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                username,
                str(model_id)[:80],
                dumps(bundle.get("employees", [])),
                dumps(bundle.get("scenarios", [])),
                dumps(bundle.get("snapshots", [])),
            ),
        )


@app.get("/api/health")
def health():
    model_ready = (ROOT / "models" / "attrition_model.pkl").exists()
    return jsonify(ok=True, name="Attrivue", database="sqlite", modelReady=model_ready)


@app.get("/api/model/importance")
def model_importance():
    try:
        from ml.predict import global_feature_importance
        return jsonify(global_feature_importance())
    except FileNotFoundError:
        return jsonify(error="Train the model to generate global feature importance."), 503
    except Exception:
        return jsonify(error="Global feature importance could not be loaded."), 503


@app.get("/api/model/metadata")
def model_metadata():
    try:
        from ml.metadata import load_metadata
        data, error = load_metadata()
    except Exception:
        return jsonify(valid=False, metadata=None, error="Metadata could not be loaded.")
    if error:
        return jsonify(valid=False, metadata=None, error=error)
    return jsonify(valid=True, metadata=data)


@app.get("/api/model/metrics")
def model_metrics():
    try:
        from ml.metadata import load_report
        data, error = load_report()
    except Exception:
        return jsonify(valid=False, metrics=None, error="Metrics could not be loaded.")
    if error:
        return jsonify(valid=False, metrics=None, error=error)
    return jsonify(valid=True, metrics=data)


@app.post("/api/predict")
def predict_one():
    body = request.get_json(silent=True) or {}
    features = body.get("features") or body
    try:
        with connect() as con:
            _, user = current_user(con)
        if not user:
            return jsonify(error="Sign in to request an employee prediction."), 401
        from ml.predict import predict_employee
        return jsonify(predict_employee(features))
    except FileNotFoundError:
        return jsonify(error="Trained model is missing. Run python -m ml.train."), 503
    except Exception as exc:
        if exc.__class__.__name__ == "ExplanationUnavailable":
            return jsonify(error=str(exc)), 503
        return jsonify(error="Prediction or explanation failed."), 400


@app.post("/api/predict/batch")
def predict_batch():
    body = request.get_json(silent=True) or {}
    rows = body.get("employees") or []
    try:
        with connect() as con:
            _, user = current_user(con)
        if not user:
            return jsonify(error="Sign in to request employee predictions."), 401
        from ml.predict import predict_many
        include_explanations = bool(body.get("include_explanations", False))
        return jsonify(predictions=predict_many(rows, include_explanations=include_explanations))
    except FileNotFoundError:
        return jsonify(error="Trained model is missing. Run python -m ml.train."), 503
    except Exception as exc:
        if exc.__class__.__name__ == "ExplanationUnavailable":
            return jsonify(error=str(exc)), 503
        return jsonify(error="Batch prediction failed."), 400


@app.post("/api/signup")
@app.post("/api/login")
def auth():
    body = request.get_json(silent=True) or {}
    username = str(body.get("username") or "").strip()[:80]
    password_hash = str(body.get("passwordHash") or "")
    if not username or not CLIENT_HASH_RE.fullmatch(password_hash):
        return jsonify(error="Username and a SHA-256 password hash are required."), 400
    with connect() as con:
        found = con.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if request.path.endswith("/signup"):
            if found:
                return jsonify(error="That username is already taken. Try signing in instead."), 409
            con.execute(
                "INSERT INTO users (username, password_hash, created) VALUES (?, ?, datetime('now'))",
                (username, generate_password_hash(password_hash, method=PASSWORD_KDF)),
            )
            found = con.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        else:
            if not found:
                return jsonify(error="No account found for that username. Create one first."), 401
            valid, legacy = verify_client_hash(found["password_hash"], password_hash)
            if not valid:
                return jsonify(error="That password is not correct."), 401
            if legacy:
                con.execute(
                    "UPDATE users SET password_hash = ? WHERE username = ?",
                    (generate_password_hash(password_hash, method=PASSWORD_KDF), username),
                )
                found = con.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        token = secrets.token_hex(24)
        con.execute(
            "INSERT INTO sessions (token, username, expires) VALUES (?, ?, ?)",
            (token, username, int(time.time()) + TOKEN_SECONDS),
        )
        return jsonify(token=token, account=account_for(found, models_for(con, username)))


@app.post("/api/logout")
def logout():
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    with connect() as con:
        con.execute("DELETE FROM sessions WHERE token = ?", (token,))
    return jsonify(ok=True)


@app.get("/api/me")
def me():
    with connect() as con:
        _, user = current_user(con)
        if not user:
            return jsonify(error="Sign in again."), 401
        return jsonify(username=user["username"], account=account_for(user, models_for(con, user["username"])))


@app.put("/api/me")
def save_me():
    body = request.get_json(silent=True) or {}
    with connect() as con:
        _, user = current_user(con)
        if not user:
            return jsonify(error="Sign in again."), 401
        username = user["username"]
        con.execute(
            """
            UPDATE users
            SET theme = ?, privacy = ?, tour_done = ?, model_id = ?, custom_models = ?, activity_log = ?
            WHERE username = ?
            """,
            (
                str(body.get("theme") or "system"),
                1 if body.get("privacy") else 0,
                1 if body.get("tourDone") else 0,
                str(body.get("modelId") or "ibm")[:80],
                dumps(body.get("customModels", [])),
                dumps(body.get("log", [])),
                username,
            ),
        )
        save_models(con, username, body.get("models", {}))
    return jsonify(ok=True)


@app.get("/api/backup")
def backup():
    with connect() as con:
        _, user = current_user(con)
        if not user:
            return jsonify(error="Sign in again."), 401
        payload = account_for(user, models_for(con, user["username"]))
        payload.update(app="Attrivue", exported=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), username=user["username"])
        return jsonify(payload)


@app.get("/")
def home():
    return send_from_directory(ROOT, "index.html")


@app.get("/<path:filename>")
def files(filename):
    # This single-file frontend needs no other public files. Never expose SQLite,
    # serialized models, training data, source files, or secrets as static assets.
    if filename != "index.html":
        return jsonify(error="Not found."), 404
    return send_from_directory(ROOT, "index.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
