# Debugging Prompts

## General structured debug request
```
Bug: [what's wrong, exact symptom]
Expected: [what should happen instead]
Steps to reproduce: [1, 2, 3]
Relevant files: [paths]
Error/logs: [paste, don't summarize]

Find the root cause first — explain it in one sentence — then propose
the minimal fix. Don't refactor unrelated code.
```

## "It worked yesterday" bug
```
This broke sometime after [last known-good state, e.g. commit/feature].
Nothing in [suspected file] looks obviously changed. Help me bisect —
what's the fastest way to narrow down which change caused [symptom]?
```

## Flaky/intermittent bug
```
[Symptom] happens sometimes, not always, when [action]. Likely candidates:
race condition, stale state, network timing, non-deterministic data. Given
this code: [paste], which of these is most plausible and why?
```
