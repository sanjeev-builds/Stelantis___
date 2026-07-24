# Backend (FastAPI)

## Structure
```
app/
├── main.py                 # app entrypoint, router registration, CORS, startup
├── core/
│   ├── config.py            # env-based settings (pydantic-settings)
│   ├── logging.py            # logging setup
│   └── security.py            # JWT + password hashing
├── db/
│   ├── session.py             # SQLAlchemy engine/session
│   ├── models.py               # ORM models: Vehicle, Telemetry, HealthScore, Alert, MaintenanceLog, User
│   └── seed.py                  # seeds from datasets/mock/*.json on first startup
├── scoring/
│   ├── config.py                 # all scoring weights/thresholds - tune here, not in health.py
│   ├── health.py                   # deterministic battery/cybersecurity/overall scores
│   └── predictive.py                # trend-based (slope-of-degradation) alert rules
├── services/
│   ├── scoring_service.py            # wires scoring/predictive to the DB; used by seed + /analyze + /predict
│   ├── ai_client.py                    # thin wrapper around ai/src/groq_client.py, fails safe
│   └── external_apis.py                 # NHTSA recalls, Open-Meteo, Open Charge Map clients
├── schemas/                              # one file per resource: vehicle, telemetry, health, alert,
│                                          # maintenance, chat, fleet, simulate, external
└── api/routes/
    ├── health.py, auth.py, vehicles.py, telemetry.py, health_scores.py,
    ├── alerts.py, maintenance.py, external.py
    └── actions.py                          # /analyze, /predict, /chat, /simulate, /fleet-summary, /reset-demo-data
```

## Run standalone

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # then fill in real values
uvicorn app.main:app --reload
```

API docs (Swagger): http://localhost:8000/docs

## Run via Docker Compose

From the repo root:
```bash
docker compose up --build
```

Database is SQLite (`backend/app.db`, gitignored) - no separate DB service to run.

## Adding a new endpoint

1. Add/extend a model in `app/db/models.py`.
2. Add matching schemas in `app/schemas/`.
3. Add a router in `app/api/routes/`, include it in `app/main.py`.
4. Tables auto-create on startup (`Base.metadata.create_all`) - no migration step needed for hackathon speed.

## Using `ai/` from here

`ai/src` is on `PYTHONPATH` (see `Dockerfile` / run it locally with `ai/` as a sibling folder). Import directly, e.g.:

```python
from groq_client import explain_scores, chat
```

See `ai/README.md` for details.

## External integrations (`app/api/routes/external.py`)

Read-only, real-world context around a vehicle - none of these feed the deterministic scoring engine:

| Endpoint | Source | Auth |
|---|---|---|
| `GET /api/vehicles/{id}/recalls` | NHTSA `recallsByVehicle` | None needed |
| `GET /api/vehicles/{id}/environment` | Open-Meteo current weather at the vehicle's last GPS fix | None needed |
| `GET /api/vehicles/{id}/charging-stations` | Open Charge Map, within 25km of the vehicle's last GPS fix | Free key - set `OPENCHARGEMAP_API_KEY` in `.env`, get one at https://openchargemap.org/site/develop/api. Without it, the endpoint returns `{"configured": false, "stations": []}` instead of erroring. |

All three degrade to an empty/safe response on any upstream failure or timeout (`app/services/external_apis.py`) - a slow third party never turns into a 500 on the dashboard.
