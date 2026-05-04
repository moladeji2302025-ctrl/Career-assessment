from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError

from .db import close_client, get_collection, init_client

REQUIRED_FIELDS = [
    "respondentName",
    "respondentGroup",
    "organizationDepartment",
    "careerInterests",
    "enjoyedSkills",
    "workEnvironment",
    "primaryMotivation",
    "biggestStrength",
    "shortTermGoal",
    "longTermGoal",
]

VALID_GROUPS = {"IT_STUDENT", "NYSC_CORP_MEMBER"}

@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_client()
    try:
        yield
    finally:
        close_client()


app = FastAPI(title="Career Assessment API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_fields(payload: Dict[str, Any]) -> None:
    for field in REQUIRED_FIELDS:
        value = payload.get(field)
        if value is None or value == "":
            raise HTTPException(
                status_code=400,
                detail=f"Missing required field: {field}",
            )

    group = payload.get("respondentGroup")
    if group not in VALID_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid respondentGroup value.")


def _normalize_list(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    return []


def _optional_string(payload: Dict[str, Any], key: str) -> str | None:
    value = payload.get(key)
    if value is None or value == "":
        return None
    return str(value)


def _iso_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_entry(payload: Dict[str, Any]) -> Dict[str, Any]:
    entry: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "submittedAt": _iso_timestamp(),
        "respondentName": str(payload["respondentName"]),
        "respondentGroup": str(payload["respondentGroup"]),
        "organizationDepartment": str(payload["organizationDepartment"]),
        "careerInterests": _normalize_list(payload.get("careerInterests")),
        "enjoyedSkills": _normalize_list(payload.get("enjoyedSkills")),
        "workEnvironment": str(payload["workEnvironment"]),
        "primaryMotivation": str(payload["primaryMotivation"]),
        "biggestStrength": str(payload["biggestStrength"]),
        "shortTermGoal": str(payload["shortTermGoal"]),
        "longTermGoal": str(payload["longTermGoal"]),
    }

    optional_fields = [
        "schoolProgram",
        "expectedCompletionDate",
        "programStudied",
        "degreeRequired",
        "serviceEndDate",
    ]

    for field in optional_fields:
        value = _optional_string(payload, field)
        if value is not None:
            entry[field] = value

    return entry


@app.post("/api/assessments", status_code=201)
def create_assessment(payload: Dict[str, Any] = Body(...)):
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload.")

    _require_fields(payload)
    entry = _build_entry(payload)

    try:
        collection = get_collection()
        collection.insert_one(entry)
    except PyMongoError as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to insert assessment into MongoDB. Check database connectivity.",
        ) from exc

    return {"id": entry["id"], "submittedAt": entry["submittedAt"]}


@app.get("/api/assessments")
def list_assessments():
    try:
        collection = get_collection()
        entries = list(collection.find({}, {"_id": 0}))
    except PyMongoError as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve assessments from MongoDB. Check database connectivity.",
        ) from exc

    return entries


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
