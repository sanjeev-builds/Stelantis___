# Deployment Prompts

## Get it live for demo day
```
We need [frontend/backend] deployed for the demo. Per README.md, frontend
goes to Vercel and backend to Render/Fly.io. Walk me through the fastest
path from "works locally via docker compose" to "has a public URL",
flagging anything (env vars, CORS origins, DB connection string) that
needs to change for production.
```

## Debug a deploy-only failure
```
This works locally but fails on [Vercel/Render/Fly]: [paste error/logs].
Local env: [describe]. Most likely causes are env vars, build command
differences, or path assumptions — which looks most likely here?
```
