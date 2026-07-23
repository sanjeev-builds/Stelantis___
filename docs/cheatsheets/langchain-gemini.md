# LangChain / Gemini Cheat Sheet

## Direct Gemini call (what `ai/src/rag_pipeline.py` uses)
```python
import google.generativeai as genai
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("your prompt")
print(response.text)
```
`gemini-1.5-flash` is fast and cheap — good default for a hackathon demo. Use `gemini-1.5-pro` only if quality noticeably matters and latency is acceptable.

## RAG pipeline in this repo (`ai/src/`)
```python
from rag_pipeline import ingest, answer_question
ingest(["doc text 1", "doc text 2"])
answer_question("a question about the docs")
```
- `embeddings.py` — sentence-transformers, local, no API cost
- `vectorstore.py` — ChromaDB, persists to `ai/.chroma/`
- `prompts.py` — edit `RAG_SYSTEM_PROMPT` to change the assistant's behavior/tone

## Common pitfalls
- Empty `GEMINI_API_KEY` → calls fail silently or 403; check `ai/.env`.
- ChromaDB collection persists between runs — delete `ai/.chroma/` to reset during dev if results look stale.
- Keep prompts short and specific for a demo — long system prompts increase latency, which is riskier live on stage than a slightly less polished answer.
