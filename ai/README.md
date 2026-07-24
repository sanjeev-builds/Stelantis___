# AI (Gemini)

## Structure
```
src/
├── config.py         # loads GEMINI_API_KEY from .env
├── prompts.py         # system prompts + chat prompt template
└── gemini_client.py     # explain_scores() + chat() - the whole thing
```

This is used as a **library imported directly by the backend**, not a separate microservice - simplest to run and deploy in a hackathon build. See `backend/README.md` for how it's wired in via `PYTHONPATH`.

Gemini is an **explanation/chat layer only** — it never computes health scores itself. The backend's deterministic scoring engine computes scores from telemetry; `explain_scores()` takes those already-computed scores plus raw telemetry and turns them into natural language. `chat()` answers freeform questions about a vehicle using vehicle data passed in directly as context (no vector search/RAG — the data is structured, not a document corpus). See `docs/Vehicle-Health-Dashboard-Plan.md` for the full architecture.

## Run standalone / smoke test

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # fill in GEMINI_API_KEY
cd src
python gemini_client.py
```
