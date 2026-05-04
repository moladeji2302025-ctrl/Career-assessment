from __future__ import annotations

import os
from functools import lru_cache

from pymongo import MongoClient


def _env(name: str, default: str) -> str:
    value = os.getenv(name)
    return value if value else default


@lru_cache
def get_collection():
    uri = _env("MONGODB_URI", "mongodb://localhost:27017")
    database_name = _env("MONGODB_DB", "career_assessment")
    collection_name = _env("MONGODB_COLLECTION", "assessments")

    client = MongoClient(uri)
    return client[database_name][collection_name]
