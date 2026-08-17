import time
from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from backend.app.schemas.places import PlaceCreate, PlaceResponse, PlaceFeedbackCreate
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import decode_supabase_jwt, check_permission, UserContext, verify_self_approval_restriction
from backend.app.services.places_service import places_service

router = APIRouter(prefix="/places", tags=["Places"])

@router.get("", response_model=ResponseEnvelope[List[PlaceResponse]])
async def list_places(request: Request, category: Optional[str] = None):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    data = places_service.get_all_places()
    if category:
        data = [p for p in data if p.get("category") == category]
    return ResponseEnvelope(
        data=data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/{place_id}", response_model=ResponseEnvelope[PlaceResponse])
async def get_place_by_id(place_id: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place_record = places_service.get_place_by_id_or_slug(place_id)
    return ResponseEnvelope(
        data=place_record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("", response_model=ResponseEnvelope[PlaceResponse])
async def create_place(
    place_in: PlaceCreate,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.create"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place_record = places_service.create_place_transactional(place_in, current_user, trace_id)
    return ResponseEnvelope(
        data=place_record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/{place_id}/feedback", response_model=ResponseEnvelope[dict])
async def submit_place_feedback(
    place_id: str,
    feedback_in: PlaceFeedbackCreate,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.create"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    record = places_service.submit_place_feedback(place_id, feedback_in, current_user, trace_id)
    return ResponseEnvelope(
        data=record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/{place_id}/verify", response_model=ResponseEnvelope[dict])
async def verify_place(
    place_id: str,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.verify"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    created_by_id = "usr-manager-2"
    verify_self_approval_restriction(current_user, created_by_id)

    return ResponseEnvelope(
        data={"status": "VERIFIED", "verifiedBy": current_user.name, "placeId": place_id},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
