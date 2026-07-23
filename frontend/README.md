# Frontend (Next.js + Tailwind)

## Structure
```
src/
├── app/
│   ├── layout.tsx     # root layout
│   ├── page.tsx        # dashboard shell (cards + chart, wired to /api/vehicles)
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── DashboardCard.tsx
│   ├── ChartCard.tsx     # Recharts line chart
│   └── LoginForm.tsx      # calls POST /api/auth/login
└── lib/
    └── api.ts              # axios client + typed fetchers
```

Icons come from `lucide-react` (MIT licensed, tree-shakeable) - browse available icons at lucide.dev and import by name, e.g. `import { Car } from "lucide-react"`.

## Run standalone

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Runs at http://localhost:3000, expects the backend at http://localhost:8000 (see `NEXT_PUBLIC_API_URL`).

## Run via Docker Compose

From the repo root: `docker compose up --build`

## Swapping in the real problem statement

`page.tsx` currently renders generic vehicle telemetry cards + a speed chart pulled from `/api/vehicles`. Once the real idea is known:
1. Update `lib/api.ts` types + fetchers to match the real backend schema.
2. Reuse `DashboardCard` / `ChartCard` / `Sidebar` / `Navbar` as-is - they're generic.
3. Add new routes under `src/app/<route>/page.tsx` as needed (Next.js App Router).
