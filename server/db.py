from __future__ import annotations

import os
from threading import Lock

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection

load_dotenv()

_client: MongoClient | None = None
_collection: Collection | None = None
_init_lock = Lock()


def init_client() -> None:
    global _client, _collection
    if _client is not None and _collection is not None:
        return
    with _init_lock:
        if _client is not None and _collection is not None:
            return
        uri = os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
        database_name = os.getenv("MONGODB_DB") or "career_assessment"
        collection_name = os.getenv("MONGODB_COLLECTION") or "assessments"

        _client = MongoClient(uri)
        _collection = _client[database_name][collection_name]


def close_client() -> None:
    global _client, _collection
    if _client is not None:
        _client.close()
    _client = None
    _collection = None


def get_collection() -> Collection:
    if _collection is None:
        init_client()
    if _collection is None:
        raise RuntimeError("Failed to initialize MongoDB collection.")
    return _collection
