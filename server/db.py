from __future__ import annotations

import os
from pymongo import MongoClient

_client: MongoClient | None = None
_collection = None


def _env(name: str, default: str) -> str:
    value = os.getenv(name)
    return value if value else default


def get_collection():
    global _client, _collection
    if _collection is None:
        uri = _env("MONGODB_URI", "mongodb://localhost:27017")
        database_name = _env("MONGODB_DB", "career_assessment")
        collection_name = _env("MONGODB_COLLECTION", "assessments")

        _client = MongoClient(uri)
        _collection = _client[database_name][collection_name]

    return _collection
