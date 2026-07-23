# Architecture Prompts

## Deciding how to wire a new feature in
```
We need [feature]. Given the existing architecture (Next.js frontend →
FastAPI backend → Postgres, with ai/ imported as a library for RAG —
see docs/architecture/overview.md), where should this live and why?
Consider: does it need a new table, a new route, a new frontend page,
or just extending an existing one. Optimize for shipping in the next
[X] hours, not long-term design purity.
```

## Evaluating a shortcut
```
We're considering [shortcut, e.g. skipping auth / hardcoding a value /
no migrations] to save time before the demo. What's the actual risk of
this for a 7-hour hackathon MVP, and is there a lower-risk shortcut that
saves nearly as much time?
```
