import chromadb
from app.core.config import settings

_client = None
_collection = None


def get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=settings.chroma_path)
        _collection = _client.get_collection("vce_general_math")
    return _collection


def retrieve(query: str, unit_filter: str | None = None, n_results: int = 6) -> list[dict]:
    collection = get_collection()
    where = {"unit": {"$eq": unit_filter}} if unit_filter else None
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where,
    )
    chunks = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append({"text": doc, **meta})
    return chunks
