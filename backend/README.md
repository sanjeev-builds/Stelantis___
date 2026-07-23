# Backend (FastAPI)

## Structure
```
app/
├── main.py              # app entrypoint, router registration, CORS, startup
├── core/
│   ├── config.py         # env-based settings (pydantic-settings)
│   ├── logging.py        # logging setup
│   └── security.py       # JWT + password hashing
├── db/
│   ├── session.py         # SQLAlchemy engine/session
│   └── models.py          # ORM models (VehicleTelemetry is an example - copy the pattern)
├── schemas/
│   └── vehicle.py          # Pydantic request/response schemas
└── api/routes/
    ├── health.py
    ├── auth.py
    └── vehicles.py
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

## Run via Docker Compose (recommended - brings up Postgres too)

From the repo root:
```bash
docker compose up --build
```

## Adding a new endpoint

1. Add/extend a model in `app/db/models.py`.
2. Add matching schemas in `app/schemas/`.
3. Add a router in `app/api/routes/`, include it in `app/main.py`.
4. Tables auto-create on startup (`Base.metadata.create_all`) - no migration step needed for hackathon speed.

## Using the `ai/` RAG pipeline from here

`ai/src` is on `PYTHONPATH` (see `Dockerfile` / run it locally with `ai/` as a sibling folder). Import directly, e.g.:

```python
from rag_pipeline import answer_question
```

See `ai/README.md` for details.
