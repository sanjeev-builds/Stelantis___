import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from config import CHROMA_PERSIST_DIR

# FAISS is included in requirements.txt as a swap-in alternative if you need
# pure in-memory / no-persistence vector search instead of ChromaDB - see
# https://python.langchain.com/docs/integrations/vectorstores/faiss/

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
_embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")


def get_collection(name: str = "hackathon_docs"):
    return _client.get_or_create_collection(name=name, embedding_function=_embedding_fn)


def add_documents(docs: list[str], ids: list[str], collection_name: str = "hackathon_docs") -> None:
    collection = get_collection(collection_name)
    collection.add(documents=docs, ids=ids)


def query(text: str, n_results: int = 3, collection_name: str = "hackathon_docs") -> list[str]:
    collection = get_collection(collection_name)
    results = collection.query(query_texts=[text], n_results=n_results)
    return results["documents"][0] if results["documents"] else []
