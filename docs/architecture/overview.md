# Architecture Overview

## System Diagram

```
Simulated ECU / Vehicle  (mock telemetry generator)
        |
        v
SQLite Database  (vehicles, telemetry, health_scores, alerts, maintenance_logs, users)
        |
        v
FastAPI Backend  (REST API + orchestration)
        |
        +--> Scoring Engine  (deterministic math - no AI)
        +--> Predictive Rule Engine  (slope-of-degradation alerts)
        |
        v
Groq LLM  (explanation + chat layer only - receives scores + telemetry, never computes them)
        |
        v
Next.js Dashboard  (React + Tailwind + Recharts)
```

## Components

- **Frontend (Next.js/React/Tailwind):** UI, client-side state, calls the backend REST API directly (axios).
- **Backend (FastAPI):** Auth (JWT), business logic, DB access, runs the scoring/predictive engines, orchestrates AI calls.
- **Scoring Engine (`backend/app/scoring/`):** Pure Python, config-driven weights and thresholds. Computes Battery Health, Cybersecurity, and Overall Vehicle Health scores deterministically - no model involved. See `docs/Vehicle-Health-Dashboard-Plan.md` for the full formula spec.
- **AI (Groq, `ai/src/groq_client.py`):** Explanation and freeform-chat layer only. Takes already-computed scores plus raw telemetry and produces natural-language output; never computes or overrides a score. Implemented as a Python library imported directly by the backend, not a separate deployed service - simplest to run and ship within a hackathon build. See `ai/README.md` and `backend/README.md`.
- **Database (SQLite):** A single file (`backend/app.db`) - no separate DB service to run or debug.

## Deployment Topology

- Frontend → Vercel
- Backend (with AI client and SQLite file) → Render / Fly.io
- Database → the SQLite file, persisted via a volume alongside the backend

_Fill in with real diagrams (draw.io/Excalidraw export) and API contracts as the architecture evolves._
