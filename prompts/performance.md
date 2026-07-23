# Performance Prompts

## Something feels slow
```
[Page/endpoint] feels slow when [action]. Rough numbers: [X seconds /
network tab / profiler if available]. Relevant code: [paste]. Find the
actual bottleneck before optimizing — don't guess.
```

## Reduce demo-day risk from slow calls
```
[This call, e.g. a Gemini RAG query] takes [X seconds], which is risky
live on stage. Given we have [time left], what's the cheapest way to
either speed it up or hide the latency (loading state, pre-computed
fallback, caching)?
```
