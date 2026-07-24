# Helper Scripts (PowerShell)

Run from the repo root or anywhere — each script `cd`s to the right folder itself.

| Script | Does |
|---|---|
| `start-backend.ps1` | Creates/activates backend venv, installs deps, runs `uvicorn --reload` |
| `start-frontend.ps1` | Installs npm deps if needed, runs `npm run dev` |
| `start-ai-demo.ps1` | Runs the Groq client smoke test (`ai/src/groq_client.py`) |
| `run-all.ps1` | `docker compose up --build` — everything at once |
| `clean-cache.ps1` | Wipes node_modules, `.next`, `__pycache__`, venvs |
| `new-branch.ps1` | Creates a feature branch following the README's naming convention. Usage: `.\new-branch.ps1 frontend alex navbar-fix` |
| `test-all.ps1` | Runs backend pytest + frontend lint |

```powershell
# Example
.\scripts\start-backend.ps1
```

## Mac/Linux teammates

These scripts are PowerShell-only (dev machine is Windows). Raw equivalents:

```bash
# start-backend
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

# start-frontend
cd frontend && npm install && npm run dev

# start-ai-demo
cd ai && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd src && python groq_client.py

# run-all
docker compose up --build

# clean-cache
rm -rf frontend/node_modules frontend/.next backend/.venv ai/.venv
find backend ai -type d -name "__pycache__" -exec rm -rf {} +

# new-branch
git checkout <team-branch> && git pull origin <team-branch> && git checkout -b <team-branch>/<name>-<feature>

# test-all
cd backend && source .venv/bin/activate && pytest
cd ../frontend && npm run lint
```
