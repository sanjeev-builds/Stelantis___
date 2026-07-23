import google.generativeai as genai

from config import GEMINI_API_KEY
from prompts import RAG_SYSTEM_PROMPT, build_rag_prompt
from vectorstore import add_documents, query

genai.configure(api_key=GEMINI_API_KEY)
_gemini_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", system_instruction=RAG_SYSTEM_PROMPT
)


def ingest(documents: list[str]) -> None:
    ids = [f"doc-{i}" for i in range(len(documents))]
    add_documents(documents, ids)


def answer_question(question: str, n_results: int = 3) -> str:
    context = query(question, n_results=n_results)
    prompt = build_rag_prompt(context, question)
    response = _gemini_model.generate_content(prompt)
    return response.text


if __name__ == "__main__":
    # Quick smoke test: `python rag_pipeline.py` from ai/src with GEMINI_API_KEY set.
    ingest(
        [
            "The vehicle's engine temperature threshold for a warning is 105C.",
            "Battery voltage below 11.8V indicates a charging system fault.",
            "Recommended tire pressure is 32 PSI front, 30 PSI rear.",
        ]
    )
    print(answer_question("What battery voltage indicates a fault?"))
