# FastAPI Prompts

## Add a new endpoint
```
Add a [METHOD] [/api/path] endpoint to backend/app/api/routes/[file].py
following the existing pattern in vehicles.py: Pydantic schema in
app/schemas/, SQLAlchemy model in app/db/models.py if new data is stored,
router included in app/main.py. Behavior: [describe]. Auth required: [yes/no].
```

## Add auth to an existing endpoint
```
Protect [endpoint] in [file] so it requires a valid JWT (see
app/core/security.py for decode_access_token). Return 401 if missing/invalid.
Follow the pattern already used for [comparable endpoint if any].
```

## Debug a 500/422 error
```
[endpoint] returns [status code] with this request: [paste request].
Error/traceback: [paste]. Relevant file: [path]. Find the root cause
before proposing a fix.
```
