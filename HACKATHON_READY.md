# Hackathon Ready Checklist

Status as of prep session, before the problem statement drops.

## Environment (this laptop)
- [x] Git 2.51.0
- [x] GitHub CLI 2.96.0
- [x] Node.js v22.16.0 / npm 10.9.2
- [x] Python 3.11.9 / pip
- [x] Docker 28.5.1 / Docker Compose v2.40.3
- [x] VS Code 1.98.2
- [x] Java 25 LTS
- [x] GPU: RTX 4070 Laptop (not required — Gemini is a cloud API)
- [ ] PostgreSQL / SQLite CLI — intentionally **not installed locally**; Postgres runs via `docker compose up` instead
- [ ] CUDA toolkit — intentionally skipped, not needed for this stack

## Repository
- [x] README, LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md
- [x] .gitignore covering frontend/backend/ai/db/secrets
- [x] `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`
- [x] 5-branch strategy documented (`main`/`frontend`/`backend`/`ai`/`integration`) with team ownership, commit conventions, PR flow, conflict resolution, emergency recovery
- [ ] Branches actually created and pushed (`git checkout -b frontend && git push -u origin frontend`, etc.) — README has the exact commands, not run yet since that's a one-time action the repo owner should trigger deliberately
- [ ] GitHub branch protection on `main` enabled (Settings → Branches — see README)

## Backend (`backend/`)
- [x] FastAPI app with health check, JWT auth (demo user), example CRUD (`vehicles`)
- [x] SQLAlchemy models + Pydantic schemas, Swagger at `/docs`
- [x] Structured logging, env-based config
- [x] `requirements.txt`, `Dockerfile`, `.env` (local, gitignored) + `.env.example`
- [x] `pip install -r requirements.txt` — installed into `backend/.venv`, app imports and boots cleanly (fixed a real bug along the way: `passlib` is unmaintained and crashes with modern `bcrypt` — swapped to calling `bcrypt` directly in `app/core/security.py`)

## Frontend (`frontend/`)
- [x] Next.js App Router + Tailwind dashboard shell (Sidebar, Navbar, cards, chart)
- [x] lucide-react icons, Recharts, axios client wired to backend
- [x] Login form calling `/api/auth/login`
- [x] `package.json`, `Dockerfile`, `.env.local` (local, gitignored) + `.env.local.example`
- [x] `npm install` — installed, `tsc --noEmit` and `npm run build` both pass. Bumped `next`/`eslint`/`eslint-config-next`/`axios` off their originally-pinned versions after `npm audit` flagged a critical Next.js DoS CVE in 14.2.15 — now on `next@16.2.11`. 3 high-severity advisories remain in Next's own bundled transitive deps (postcss/sharp for image optimization); npm's only suggested fix is downgrading to `next@9.3.3`, which would be worse — left as-is

## AI (`ai/`)
- [x] Gemini + LangChain + ChromaDB RAG pipeline (`ingest()` / `answer_question()`)
- [x] Sentence-transformers embeddings, FAISS noted as an alternative
- [x] Imported as a library by the backend (not a separate microservice) — simplest for a 7-hour build
- [ ] Real `GEMINI_API_KEY` — placeholder only in `.env`, needs a real key before RAG calls work
- [x] `pip install -r requirements.txt` — installed into `ai/.venv`, all modules import cleanly

## Data
- [x] `datasets/mock/` — 120 realistic records each: vehicle telemetry, battery health, predictive maintenance, fleet
- [x] `datasets/generate_mock_data.py` — regenerate/expand anytime, stdlib only
- [x] `datasets/README.md` — links to real public datasets (NASA battery, UCI predictive maintenance, DOT traffic, etc.) if the real problem statement needs them

## Infra
- [x] `docker-compose.yml` — Postgres + backend + frontend wired together, validated with `docker compose config`
- [ ] `docker compose up --build` — not run: Docker Desktop's engine wasn't running on this laptop when tested. Start Docker Desktop, then run `docker compose up --build` (or `scripts\run-all.ps1`) to smoke-test the full stack together, including Postgres

## Reference material
- [x] `prompts/` — 13-file Claude prompt library (React, FastAPI, Python, SQL, Docker, debugging, architecture, presentation, judge Q&A, UI, performance, bug-fixing, deployment)
- [x] `docs/cheatsheets/` — Git, FastAPI, React/Tailwind, Python, SQL, REST APIs, LangChain/Gemini, Docker
- [x] `docs/presentation/pitch-kit.md` — 3-min/5-min pitch templates, judge FAQ draft, innovation/future-scope prompts
- [x] `docs/presentation/notes.md` — existing demo script skeleton (untouched, fill in live)
- [x] `docs/architecture/overview.md` — system diagram, updated to reflect `ai/` as a library

## Still needs a human decision (can't be prepped further blind)
- **The actual problem statement** — everything above is idea-agnostic scaffolding, not the MVP itself
- **Start Docker Desktop** and run `docker compose up --build` once, to smoke-test all three services together against real Postgres (backend/ai were only verified standalone against local venvs, not against a live DB)
- Real `GEMINI_API_KEY` needs to go in `backend/.env` and `ai/.env` (gitignored, safe to fill in directly)
- `docs/team-workflow-notes.md` exists but is empty (untracked) — unclear if it's a stub you're still writing; left untouched
