# REST API Cheat Sheet

## Status codes worth knowing
| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST that created something |
| 400 | Bad Request | Malformed request (not a validation error) |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Valid auth, but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | FastAPI's default for Pydantic validation failures |
| 500 | Internal Server Error | Unhandled exception — check backend logs |

## This repo's API conventions
- Base path: `/api` (see `app/main.py` — every router is included with `prefix="/api"`)
- Auth: `POST /api/auth/login` returns a JWT `access_token`; send it as `Authorization: Bearer <token>` on protected routes
- List endpoints support `?limit=N`
- Swagger UI at `/docs` lets you try any endpoint without writing frontend code first

## Testing an endpoint quickly
```bash
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/vehicles/ -H "Content-Type: application/json" -d '{"engine_temp":95,"battery_voltage":12.6,"rpm":2500,"speed":60,"fuel_level":40,"odometer":50000,"oil_pressure":40}'
```
