# Docker Cheat Sheet

## This repo's stack

Two services only - `backend` and `frontend`. No database service: SQLite is a single file (`backend/app.db`) living inside the backend container/volume, not a separate container.

```bash
docker compose up --build       # build + start backend, frontend
docker compose up -d             # start in background
docker compose down              # stop
docker compose logs -f backend   # tail logs for one service
docker compose exec backend bash # shell into a running container
```

## Rebuilding after a dependency change
```bash
docker compose build backend     # rebuild just one service
docker compose up --build backend
```

## Common issues
| Symptom | Likely cause |
|---|---|
| `port already in use` | Something else on host is using 3000/8000 — stop it or change the compose port mapping |
| Frontend can't reach backend | Browser calls happen from your host machine, not inside the container — `NEXT_PUBLIC_API_URL` should be `http://localhost:8000/api` |
| Changes not showing up | Check the `volumes:` mount in docker-compose.yml is pointing at the right folder |
| Slow/huge build context | Make sure `.dockerignore` (repo root and `frontend/`) exists and excludes `.venv`, `node_modules`, `.git` - without it the context can balloon past 1GB |
