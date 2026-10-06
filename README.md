# Attrivue — Attrition Predictor

**Attrivue** is a browser-only app for HR managers. It shows how likely each employee is
to leave, the main reasons, what would happen if the company changed something (what-if),
and what the company should do to reduce people leaving.

> Scores are probabilities, not facts. They can be wrong. Never use them to pressure,
> punish or dismiss anyone. Use them to find people who need support and to improve
> working conditions.

## Run it

No build step, no dependencies, no server.

- **Easiest:** open `index.html` in a browser.
- **Or serve the folder:** `python3 -m http.server 8000` then visit
  <http://localhost:8000>.
- **Deploy:** push this folder to GitHub and turn on GitHub Pages (Settings → Pages →
  Deploy from branch, root folder).

## Project structure

```
index.html            page shell, loads the scripts in order
css/styles.css        all styling, light + dark themes, print stylesheet
js/config.js          CONFIG: constants, locked warning text, model descriptions
js/models.js          MODELS: the three locked models + field labels, reasons, advice
js/engine.js          ENGINE: scoring, risk levels, actions, self-test
js/store.js           STORE + STATE: localStorage, account data, caches
js/ui.js              COMPONENTS: toasts, modals, drawer, charts, gauge, theme
js/views.js           VIEWS: the 10 screens, detail drawer, CSV import, sample data
js/features.js        FEATURES: command palette, tour, backup, model import
js/app.js             event delegation + boot
```

## Two ways to run it

**A. Static (no server, no database)** — open `index.html`, or serve the folder with
any static host (GitHub Pages). Data lives in `localStorage`, one key per account.

**B. Python API + SQLite database** — real accounts, real storage:

```bash
python3 server.py          # or: python3 server.py 8080
# open http://localhost:8000
```

`server.py` uses only the Python standard library (`http.server`, `sqlite3`,
`hashlib`, `secrets`) — nothing to `pip install`. It creates `attrivue.db`
automatically on first run and serves the front-end itself.

The front-end detects which mode it is in: the server injects
`window.__ATTRIVUE_API__` into `index.html`, and `js/store.js` then talks to the
API instead of `localStorage`. Both modes keep the same data shape, so a backup
taken in one mode restores in the other.

## The API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/signup` | create an account, returns a bearer token |
| `POST` | `/api/login` | verify credentials, returns a bearer token |
| `POST` | `/api/logout` | drop the session |
| `GET` | `/api/bootstrap` | session + workspace for the stored token |
| `POST` | `/api/account` | save the workspace (employees, scenarios, snapshots, log, settings) |
| `GET` | `/api/health` | liveness check |

Database schema (`attrivue.db`):

```sql
accounts(username PRIMARY KEY, password_hash, salt, created, data)  -- data = workspace JSON
sessions(token PRIMARY KEY, username, created)                      -- bearer tokens
```

- Passwords are salted and stretched with PBKDF2-HMAC-SHA256 (120,000 rounds) and
  are never stored or logged in plain text.
- Every SQL statement uses bound parameters; no SQL is built from strings.
- Session tokens are 256-bit random strings.
- Saves are debounced to one request per burst of edits.

## Where each concern lives

| Concern | Browser build | Server build |
| --- | --- | --- |
| Scoring | `js/engine.js` | `js/engine.js` (unchanged) |
| Storage | `localStorage` in `js/store.js` | `server.py` + SQLite |
| Auth | SHA-256 hash in the browser | PBKDF2 + bearer token in `server.py` |
| Export | `Blob` download | `Blob` download |

## Data and privacy

- Every account keeps its own employees, scenarios and snapshots **in this browser only**.
- Passwords are hashed with SHA-256 before being stored; they never leave the device.
- Privacy mode replaces every name with "Employee 001", "Employee 002"… on every screen,
  in every export and in printed reports.
- Storage keys are prefixed (`attritionPredictor.v1.`) and carry a schema version.
  A storage failure shows a friendly message instead of failing silently.

## Models

Three built-in models are copied exactly from the specification:

| id | name | rows | share who left | CV AUC |
| --- | --- | --- | --- | --- |
| `ibm` | IBM HR | 1,470 | 16.1% | 0.829 |
| `atlas` | Atlas Lab | 1,470 | 16.1% | 0.842 |
| `industry` | Industry survey | 74,498 | 47.5% | 0.787 |

You can add your own model in Settings → Import model by pasting or uploading JSON with
the same keys. The self-test in Settings checks the engine against known values for all
three built-in models (tolerance ±0.003) and runs silently at startup.

## Keyboard and accessibility

- `Ctrl`/`Cmd + K` opens the command palette (screens, employees, models, dark mode,
  privacy mode); arrow keys + Enter, Esc closes.
- `Esc` closes drawers, dialogs and the palette. Dialogs and drawers trap focus.
- Every risk level shows an icon, a word and a number — never colour alone.
- Charts are inline SVG with titles, hover/focus tooltips and text alternatives.
- Touch targets are at least 44px, contrast is at least 4.5:1, and
  `prefers-reduced-motion` is respected.

## Testing the app quickly

1. Open `index.html` → **Create account**.
2. Dashboard → **Load sample data** (25 employees, unique risk percentages).
3. Click a name → see *Why this employee may leave, and how to help*.
4. **What-if** → move a slider, save a scenario (the real record is untouched).
5. **Insights** → Print report (the locked warning appears on the printout).
6. Settings → **Run self-test** (9 checks, all PASS).
