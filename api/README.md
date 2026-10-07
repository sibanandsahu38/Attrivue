# Attrivue API

The API is Python (`backend/app.py`) with a SQLite database at `backend/data/attrivue.sqlite`.

Base URL: `http://127.0.0.1:5000/api`

Passwords are hashed with SHA-256 in the browser. The API stores that hash and never receives the plain password.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | no | Check that the API is running |
| POST | `/signup` | no | Create an account from `{ username, passwordHash }` |
| POST | `/login` | no | Sign in and receive a bearer token |
| POST | `/logout` | yes | End the current session |
| GET | `/me` | yes | Read the signed-in account |
| PUT | `/me` | yes | Save employees, scenarios, snapshots, settings, and the activity log |
| GET | `/backup` | yes | Download the signed-in account as JSON |
| POST | `/predict` | no | Score one employee with the trained model |
| POST | `/predict/batch` | no | Score many employees with the trained model |
| GET | `/model/metadata` | no | Validated model metadata, or a safe invalid response |
| GET | `/model/metrics` | no | Validated evaluation report, or a safe invalid response |

Authorized requests use `Authorization: Bearer <token>`.

Scoring stays in the frontend. The locked model coefficients are not sent to or recalculated by the API.
