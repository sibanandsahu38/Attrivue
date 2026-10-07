import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "attrivue.sqlite"


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def init_db():
    with connect() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created TEXT NOT NULL,
                theme TEXT NOT NULL DEFAULT 'system',
                privacy INTEGER NOT NULL DEFAULT 0,
                tour_done INTEGER NOT NULL DEFAULT 0,
                model_id TEXT NOT NULL DEFAULT 'ibm',
                custom_models TEXT NOT NULL DEFAULT '[]',
                activity_log TEXT NOT NULL DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
                expires INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS model_records (
                username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
                model_id TEXT NOT NULL,
                employees TEXT NOT NULL DEFAULT '[]',
                scenarios TEXT NOT NULL DEFAULT '[]',
                snapshots TEXT NOT NULL DEFAULT '[]',
                PRIMARY KEY (username, model_id)
            );
            """
        )


def dumps(value):
    return json.dumps(value if value is not None else [])


def loads(value, fallback):
    try:
        return json.loads(value) if value else fallback
    except json.JSONDecodeError:
        return fallback
