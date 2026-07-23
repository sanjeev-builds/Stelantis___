from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def get_embedder() -> SentenceTransformer:
    """Lazy-loaded so importing this module doesn't pull the model unless used."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embedder().encode(texts, normalize_embeddings=True).tolist()
