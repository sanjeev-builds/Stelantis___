# Groq AI Cheat Sheet

## Direct Groq call (what `ai/src/groq_client.py` uses)
```python
from groq import Groq

client = Groq(api_key=GROQ_API_KEY)
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "your system prompt"},
        {"role": "user", "content": "your prompt"},
    ],
    timeout=15,
)
print(response.choices[0].message.content)
```
`llama-3.3-70b-versatile` is Groq's fast default — inference is typically well under a second per call, good for a live demo.

## How this repo uses it (`ai/src/groq_client.py`)
```python
from groq_client import explain_scores, chat

explain_scores(scores, telemetry)      # turns already-computed scores + raw telemetry into prose
chat(vehicle_context, question)        # freeform Q&A about a vehicle, context passed in directly
```
- `config.py` — loads `GROQ_API_KEY` from `.env`
- `prompts.py` — edit `EXPLAIN_SYSTEM_PROMPT` / `CHAT_SYSTEM_PROMPT` / `build_chat_prompt` to change tone or constraints
- No vector store, no RAG pipeline — the data is structured (scores + telemetry), not a document corpus, so it's passed directly as context rather than retrieved

## Common pitfalls
- Empty/invalid `GROQ_API_KEY` → `backend/app/services/ai_client.py` catches the failure and returns a fallback string ("AI explanation unavailable...") instead of crashing the request; check `ai/.env` and `backend/.env`.
- Keep prompts short and specific for a demo — long system prompts add latency, which is riskier live on stage than a slightly less polished answer.
- Scoring must never move into `ai/` — it stays 100% deterministic in `backend/app/scoring/`. `groq_client.py` only ever receives already-computed scores; it must never be asked to produce or adjust a score itself.
