# React / Next.js Prompts

## Build a new component
```
Add a [component name] to frontend/src/components/ that [does what].
It should reuse the existing Tailwind style used in DashboardCard.tsx
(rounded-lg border border-gray-200 bg-white shadow-sm) and use lucide-react
for any icons. Props: [list props]. Wire it into src/app/page.tsx at [location].
```

## Wire a component to the backend
```
frontend/src/lib/api.ts has the axios client. Add a typed fetcher for
GET [endpoint] matching the response shape in backend/app/schemas/[file].py,
then use it in [component] with useEffect + useState, showing a loading
and error state like page.tsx already does for fetchTelemetry.
```

## Fix a rendering/state bug
```
[Component] renders [wrong behavior] when [action]. Expected: [correct
behavior]. Here's the component: [paste]. Walk through the render/state
flow before changing anything, then make the minimal fix.
```
