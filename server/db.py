from __future__ import annotations

import os

from pymongo import MongoClient
from pymongo.collection import Collection

_client: MongoClient | None = None
_collection: Collection | None = None


def get_collection() -> Collection:
    global _client, _collection
    if _collection is None:
        uri = os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
        database_name = os.getenv("MONGODB_DB") or "career_assessment"
        collection_name = os.getenv("MONGODB_COLLECTION") or "assessments"

        _client = MongoClient(uri)
        _collection = _client[database_name][collection_name]

    return _collection
