# AI (Gemini + LangChain + ChromaDB RAG)

## Structure
```
src/
├── config.py         # loads GEMINI_API_KEY, CHROMA_PERSIST_DIR from .env
├── embeddings.py       # sentence-transformers embedding helper
├── vectorstore.py       # ChromaDB collection (FAISS noted as an alternative)
├── prompts.py            # RAG prompt templates
└── rag_pipeline.py        # ingest() + answer_question() - the whole pipeline
```

This is used as a **library imported directly by the backend**, not a separate microservice - simplest to run and deploy in a 7-hour hackathon. See `backend/README.md` for how it's wired in via `PYTHONPATH`.

## Run standalone / smoke test

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # fill in GEMINI_API_KEY
cd src
python rag_pipeline.py
```

## Swapping in real documents

Replace the hardcoded list in `rag_pipeline.py`'s `if __name__ == "__main__"` block with `ingest(your_docs)` called from wherever documents come from (uploaded files, scraped manuals, DB rows). `answer_question(question)` is the one function the backend needs to call.

## ChromaDB persistence

Vectors persist to `ai/.chroma/` (already gitignored). Delete that folder to reset the vector store.
