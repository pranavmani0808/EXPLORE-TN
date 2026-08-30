import time
from typing import List, Optional
from fastapi import APIRouter, Request, Query, HTTPException
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.schemas.tn_geo import TNGeoNodeDTO, TNGeoSearchResultDTO, TNGeoAreaDetailDTO
from backend.app.services.tn_geo_service import tn_geo_service

router = APIRouter(prefix="/geo", tags=["Tamil Nadu Geographic Directory"])

@router.get("/districts", response_model=ResponseEnvelope[List[TNGeoNodeDTO]])
async def get_districts(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-districts") if request else "tr-districts"
    districts = tn_geo_service.get_districts()
    return ResponseEnvelope(
        data=districts,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/nodes/{node_id}/children", response_model=ResponseEnvelope[List[TNGeoNodeDTO]])
async def get_children(node_id: str, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-children") if request else "tr-children"
    children = tn_geo_service.get_children(node_id)
    return ResponseEnvelope(
        data=children,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/search", response_model=ResponseEnvelope[TNGeoSearchResultDTO])
async def search_geo(q: str = Query(...), request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-search") if request else "tr-search"
    res = tn_geo_service.search_geo(q)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/area/{area_id}", response_model=ResponseEnvelope[TNGeoAreaDetailDTO])
async def get_area_detail(area_id: str, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-area") if request else "tr-area"
    detail = tn_geo_service.get_area_detail(area_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Geographic area #{area_id} not found")
    return ResponseEnvelope(
        data=detail,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
