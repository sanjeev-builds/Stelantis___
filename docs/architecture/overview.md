# Architecture Overview

## System Diagram

```
┌────────────┐      HTTPS       ┌──────────────┐      SQL       ┌────────────┐
│  Frontend  │ ───────────────▶ │   Backend    │ ─────────────▶ │ PostgreSQL │
│ (Next.js)  │ ◀─────────────── │  (FastAPI)   │ ◀───────────── │            │
└────────────┘      JSON        └──────┬───────┘                └────────────┘
                                        │
                                        │ calls
                                        ▼
                                 ┌──────────────┐      ┌────────────┐
                                 │  AI Service  │ ───▶ │  ChromaDB  │
                                 │ (LangChain + │      │ (vectors)  │
                                 │  Gemini API) │      └────────────┘
                                 └──────────────┘
```

## Components

- **Frontend (Next.js/React/Tailwind):** UI, client-side state, calls backend REST API.
- **Backend (FastAPI):** Auth, business logic, DB access, orchestrates AI calls.
- **AI (Gemini + LangChain + ChromaDB):** RAG pipeline — embeds documents into ChromaDB, retrieves context, calls Gemini for generation.
- **Database (PostgreSQL):** Persistent structured data.

## Deployment Topology

- Frontend → Vercel
- Backend + AI service → Render / Fly.io
- Database → Managed PostgreSQL

_Fill in with real diagrams (draw.io/Excalidraw export) and API contracts as the architecture solidifies._
