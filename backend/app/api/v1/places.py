import time
from fastapi import APIRouter, Depends, Request
from typing import List
from backend.app.schemas.places import PlaceCreate, PlaceResponse
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import decode_supabase_jwt, check_permission, UserContext, verify_self_approval_restriction
from backend.app.services.places_service import places_service

router = APIRouter(prefix="/places", tags=["Places"])

@router.get("", response_model=ResponseEnvelope[List[PlaceResponse]])
async def list_places(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    data = places_service.get_all_places()
    return ResponseEnvelope(
        data=data,
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

@router.post("/{place_id}/verify", response_model=ResponseEnvelope[dict])
async def verify_place(
    place_id: str,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.verify"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    # Verify self approval restriction: Place Managers cannot verify own places
    created_by_id = "usr-manager-2" # Simulated creator
    verify_self_approval_restriction(current_user, created_by_id)

    return ResponseEnvelope(
        data={"status": "VERIFIED", "verifiedBy": current_user.name, "placeId": place_id},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
