# FastAPI Cheat Sheet

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/things", tags=["things"])

class ThingIn(BaseModel):
    name: str

class ThingOut(ThingIn):
    id: int

@router.get("/", response_model=list[ThingOut])
def list_things(): ...

@router.post("/", response_model=ThingOut)
def create_thing(payload: ThingIn): ...

@router.get("/{thing_id}", response_model=ThingOut)
def get_thing(thing_id: int):
    if not found:
        raise HTTPException(status_code=404, detail="Not found")
```

- Register routers in `app/main.py` via `app.include_router(router, prefix="/api")`.
- Swagger UI is automatic at `/docs`, ReDoc at `/redoc` — use it to test endpoints without a frontend.
- DB session dependency: `db: Session = Depends(get_db)` (see `app/db/session.py`).
- Env config: `from app.core.config import get_settings; settings = get_settings()`.
- Run locally: `uvicorn app.main:app --reload` (from `backend/`).
- Validate a request body automatically — Pydantic raises 422 on bad input, no manual checks needed.
