#!/usr/bin/env python3
"""Attrivue API server.

Serves the static front-end and a small JSON API backed by SQLite.
Python 3.8+ with no third-party packages:  python3 server.py [port]

Data model
----------
accounts(username, password_hash, salt, created, data)  one row per user,
    `data` holds the whole workspace as JSON (employees, scenarios,
    snapshots, activity log, settings) exactly like the browser build.
sessions(token, username, created)                       bearer tokens.

Passwords are salted and stretched with PBKDF2-HMAC-SHA256 and are never
stored or logged in plain text. All SQL uses bound parameters.
"""
import hashlib
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "attrivue.db"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8000))
PBKDF2_ROUNDS = 120_000
API_FLAG = "<script>window.__ATTRIVUE_API__=true;</script>"
SESSION_HOURS = 24 * 30

SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
    username      TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    salt          TEXT NOT NULL,
    created       TEXT NOT NULL,
    data          TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token     TEXT PRIMARY KEY,
    username  TEXT NOT NULL,
    created   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(username);
"""


def connect():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


def init_db():
    with connect() as conn:
        conn.executescript(SCHEMA)


def now_iso():
    import datetime
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), PBKDF2_ROUNDS).hex()
    return digest, salt


def new_token():
    return secrets.token_urlsafe(32)


def valid_username(name):
    return bool(re.fullmatch(r"[A-Za-z0-9_.-]{3,40}", name or ""))


def new_account(username, password):
    """Returns (account_dict, token) or raises ValueError."""
    digest, salt = hash_password(password)
    account = {
        "hash": digest,
        "created": now_iso(),
        "schemaVersion": 1,
        "theme": "system",
        "privacy": False,
        "tourDone": False,
        "modelId": "ibm",
        "customModels": [],
        "models": {},
        "log": [],
    }
    token = new_token()
    with connect() as conn:
        conn.execute(
            "INSERT INTO accounts(username,password_hash,salt,created,data) VALUES(?,?,?,?,?)",
            (username, digest, salt, account["created"], json.dumps(account)),
        )
        conn.execute(
            "INSERT INTO sessions(token,username,created) VALUES(?,?,?)",
            (token, username, now_iso()),
        )
    return account, token


def find_account(username):
    with connect() as conn:
        row = conn.execute("SELECT data FROM accounts WHERE username=?", (username,)).fetchone()
    return json.loads(row["data"]) if row else None


def verify_login(username, password):
    """Returns (account_dict, token) on success, None on bad credentials."""
    with connect() as conn:
        row = conn.execute("SELECT password_hash, salt FROM accounts WHERE username=?", (username,)).fetchone()
    if not row:
        return None
    digest, _ = hash_password(password, row["salt"])
    if not secrets.compare_digest(digest, row["password_hash"]):
        return None
    account = find_account(username)
    token = new_token()
    with connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO sessions(token,username,created) VALUES(?,?,?)",
            (token, username, now_iso()),
        )
    return account, token


def save_account(username, account):
    with connect() as conn:
        conn.execute("UPDATE accounts SET data=? WHERE username=?", (json.dumps(account), username))


def user_for_token(token):
    if not token:
        return None
    with connect() as conn:
        row = conn.execute("SELECT username FROM sessions WHERE token=?", (token,)).fetchone()
    return row["username"] if row else None


def delete_session(token):
    with connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (token,))


class Handler(BaseHTTPRequestHandler):
    server_version = "Attrivue/1.0"
    protocol_version = "HTTP/1.1"

    # ---------- helpers ----------
    def _send(self, code, payload, content_type="application/json", extra=None):
        body = payload if isinstance(payload, bytes) else json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, code, obj):
        self._send(code, obj)

    def _body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 20_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return {}

    def _token(self):
        header = self.headers.get("Authorization") or ""
        return header[7:] if header.startswith("Bearer ") else None

    def log_message(self, fmt, *args):  # keep the console readable
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    # ---------- routing ----------
    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/api/health":
            return self._json(200, {"ok": True})
        if route == "/api/bootstrap":
            return self.api_bootstrap()
        return self.serve_static(route)

    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        route = urlparse(self.path).path
        if route == "/api/signup":
            return self.api_signup()
        if route == "/api/login":
            return self.api_login()
        if route == "/api/logout":
            return self.api_logout()
        if route == "/api/account":
            return self.api_save_account()
        return self._json(404, {"error": "Unknown endpoint"})

    def do_DELETE(self):
        route = urlparse(self.path).path
        if route == "/api/session":
            return self.api_logout()
        return self._json(404, {"error": "Unknown endpoint"})

    # ---------- API ----------
    def api_bootstrap(self):
        username = user_for_token(self._token())
        if not username:
            return self._json(401, {"error": "Not signed in"})
        account = find_account(username)
        if account is None:
            return self._json(401, {"error": "Account not found"})
        key = "account." + username
        return self._json(200, {"kv": {"session": username, key: account}})

    def api_save_account(self):
        username = user_for_token(self._token())
        if not username:
            return self._json(401, {"error": "Not signed in"})
        account = self._body()
        if not isinstance(account, dict):
            return self._json(400, {"error": "Expected a JSON object"})
        if "hash" in account:
            account.pop("hash", None)
        save_account(username, account)
        return self._json(200, {"ok": True})

    def api_signup(self):
        data = self._body()
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        if not valid_username(username):
            return self._json(400, {"error": "Username must be 3-40 characters: letters, numbers, _ . -"})
        if len(password) < 4:
            return self._json(400, {"error": "Password must be at least 4 characters."})
        if find_account(username):
            return self._json(409, {"error": "That username is already taken. Try signing in instead."})
        account, token = new_account(username, password)
        return self._json(201, {"token": token, "account": account})

    def api_login(self):
        data = self._body()
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        result = verify_login(username, password)
        if not result:
            return self._json(401, {"error": "No account found for that username, or the password is not correct."})
        account, token = result
        return self._json(200, {"token": token, "account": account})

    def api_logout(self):
        delete_session(self._token())
        return self._json(200, {"ok": True})

    # ---------- static files ----------
    def serve_static(self, route):
        rel = unquote(route).lstrip("/") or "index.html"
        target = (ROOT / rel).resolve()
        if not str(target).startswith(str(ROOT)) or not target.is_file():
            return self._json(404, {"error": "Not found"})
        ctype = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        raw = target.read_bytes()
        if target.name == "index.html":
            html = raw.decode("utf-8").replace("</head>", API_FLAG + "</head>", 1)
            raw = html.encode("utf-8")
            ctype = "text/html; charset=utf-8"
        self._send(200, raw, ctype)


def main():
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Attrivue running at http://localhost:%d" % PORT)
    print("Database: %s" % DB_PATH)
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
