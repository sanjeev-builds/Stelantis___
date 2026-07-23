# React / Next.js / Tailwind Cheat Sheet

## Next.js App Router basics
```
src/app/page.tsx          → route "/"
src/app/vehicles/page.tsx → route "/vehicles"
src/app/layout.tsx        → shared shell (imported by every page)
```
Add `"use client"` at the top of any file using `useState`/`useEffect`/browser APIs — server components (the default) can't use them.

## Data fetching pattern used in this repo
```tsx
"use client";
import { useEffect, useState } from "react";
import { fetchTelemetry } from "@/lib/api";

const [data, setData] = useState([]);
useEffect(() => { fetchTelemetry().then(setData).catch(handleError); }, []);
```

## Tailwind quick reference
| Need | Classes |
|---|---|
| Card | `rounded-lg border border-gray-200 bg-white p-4 shadow-sm` |
| Primary button | `bg-brand text-white rounded-md px-3 py-2 hover:bg-brand-dark` |
| Flex row, spaced | `flex items-center justify-between gap-4` |
| Grid of cards | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| Muted text | `text-sm text-gray-500` |

`brand` color is defined in `tailwind.config.ts` — change it there to reskin the whole app in one place.

## lucide-react icons
```tsx
import { Car, Battery, Gauge } from "lucide-react";
<Car size={18} className="text-brand" />
```
Browse available names at lucide.dev.
