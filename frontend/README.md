# Frontend (Next.js + Tailwind)

## Structure
```
src/
├── app/
│   ├── layout.tsx            # root layout - renders Navigation + wraps children in AuthGuard
│   ├── page.tsx                # Fleet Overview - fleet-wide scores, alert counts, vehicle directory
│   ├── login/page.tsx            # login screen (LoginForm)
│   ├── vehicle/[id]/page.tsx       # Vehicle Detail - gauges, telemetry, AI summary, external context
│   ├── telemetry/page.tsx           # Telemetry History - raw charts + reading table
│   ├── alerts/page.tsx                # Predictive Alerts - fleet-wide, severity-ranked
│   ├── maintenance/page.tsx            # Maintenance - AI-explained recommendations per vehicle
│   ├── ai-assistant/page.tsx             # AI Advisor - freeform chat (AIChatPanel)
│   ├── simulator/page.tsx                  # Custom Test Lab - live what-if scoring
│   └── globals.css
├── components/
│   ├── Navigation.tsx                        # top nav bar, sign-out
│   ├── AuthGuard.tsx                           # redirects to /login when no token
│   ├── LoginForm.tsx                             # calls POST /api/auth/login
│   ├── ScoreGauge.tsx, MetricCard.tsx               # score ring / stat tile primitives
│   ├── TelemetryCharts.tsx                            # Recharts area/line charts (manual ResizeObserver -
│   │                                                    see in-file comment for why, not <ResponsiveContainer>)
│   ├── AlertsTable.tsx, AIChatPanel.tsx                  # alerts table, chat panel
│   └── ExternalContextPanel.tsx                            # NHTSA recalls / weather / charging cards
└── lib/
    └── api.ts                                                # shared axios instance (baseURL only - most
                                                                 pages call axios directly with full URLs)
```

Icons come from `lucide-react` (MIT licensed, tree-shakeable) - browse available icons at lucide.dev and import by name, e.g. `import { Car } from "lucide-react"`.

## Run standalone

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Runs at http://localhost:3000, expects the backend at http://localhost:8000 (see `NEXT_PUBLIC_API_URL`). Demo login: `demo@hackathon.dev` / `hackathon` (prefilled on the login screen).

## Run via Docker Compose

From the repo root: `docker compose up --build`

## Linting

`npm run lint` runs ESLint directly (`eslint.config.mjs`, flat config via `eslint-config-next`) - `next lint` itself doesn't work on this Next.js version, so the script bypasses it rather than wrapping it.
