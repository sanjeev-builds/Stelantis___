# UI Improvement Prompts

## Make it demo-ready fast
```
This screen works but looks rough: [paste component/screenshot description].
Using the existing Tailwind patterns in DashboardCard.tsx/ChartCard.tsx
(rounded-lg, border-gray-200, shadow-sm, brand color), make it look
polished in the next 15 minutes — spacing, hierarchy, empty/loading states.
Don't change the underlying logic.
```

## Add a missing state
```
[Component] has no [loading/empty/error] state — it just [current
behavior]. Add one that matches the visual style already used elsewhere
in the app (see page.tsx's error banner as an example).
```
