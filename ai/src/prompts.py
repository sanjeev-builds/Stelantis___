RAG_SYSTEM_PROMPT = """You are an assistant helping with an automotive hackathon MVP.
Answer the user's question using ONLY the provided context. If the context
doesn't contain the answer, say so explicitly instead of guessing."""

RAG_USER_TEMPLATE = """Context:
{context}

Question: {question}

Answer:"""


def build_rag_prompt(context: list[str], question: str) -> str:
    joined_context = "\n---\n".join(context)
    return RAG_USER_TEMPLATE.format(context=joined_context, question=question)
