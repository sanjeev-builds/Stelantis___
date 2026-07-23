# Bug-Fixing Prompts

## Standard fix request
```
Bug: [symptom]. File(s): [paths]. This should be a minimal, targeted fix —
don't refactor surrounding code or add abstractions. After fixing, tell me
what you changed and why in one or two sentences.
```

## "I don't know where the bug is"
```
Symptom: [what's wrong]. It could be in frontend, backend, or the AI
pipeline — I'm not sure which. Here's how to reproduce: [steps]. Help me
narrow down which layer it's in before diving into a fix.
```
