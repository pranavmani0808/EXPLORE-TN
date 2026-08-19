import time
from fastapi import APIRouter, Request
from typing import List
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.services.trails_service import trails_service

router = APIRouter(prefix="/trails", tags=["Trails"])

@router.get("", response_model=ResponseEnvelope[List[dict]])
async def list_trails(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    trails = trails_service.get_all_trails()
    return ResponseEnvelope(
        data=trails,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/{slug}", response_model=ResponseEnvelope[dict])
async def get_trail_by_slug(slug: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    trail_record = trails_service.get_trail_by_slug(slug)
    return ResponseEnvelope(
        data=trail_record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
