# Docker Cheat Sheet

## This repo's stack
```bash
docker compose up --build       # build + start db, backend, frontend
docker compose up -d             # start in background
docker compose down              # stop (keeps data volume)
docker compose down -v           # stop AND wipe the Postgres volume
docker compose logs -f backend   # tail logs for one service
docker compose exec backend bash # shell into a running container
docker compose exec db psql -U hackathon -d hackathon
```

## Rebuilding after a dependency change
```bash
docker compose build backend     # rebuild just one service
docker compose up --build backend
```

## Common issues
| Symptom | Likely cause |
|---|---|
| `port already in use` | Something else on host is using 3000/8000/5432 — stop it or change the compose port mapping |
| Backend can't reach db | Compose uses service names as hostnames — `DATABASE_URL` should say `@db:5432`, not `@localhost:5432`, inside containers |
| Frontend can't reach backend | Browser calls happen from your host machine, not inside the container — `NEXT_PUBLIC_API_URL` should be `http://localhost:8000/api` |
| Changes not showing up | Check the `volumes:` mount in docker-compose.yml is pointing at the right folder |
