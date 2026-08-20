import time
from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from backend.app.schemas.places import PlaceCreate, PlaceResponse, PlaceFeedbackCreate, PlaceSearchSuggestion
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import check_permission, UserContext, verify_self_approval_restriction
from backend.app.services.places_service import places_service

router = APIRouter(prefix="/places", tags=["Places"])


def _meta(request: Request) -> MetaInfo:
    trace_id = getattr(request.state, "trace_id", "tr-default")
    return MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))


@router.get("", response_model=ResponseEnvelope[List[PlaceResponse]])
async def list_places(
    request: Request,
    category: Optional[str] = None,
    district: Optional[str] = None,
    q: Optional[str] = None,
):
    data = places_service.search_places(q=q, category=category, district=district)
    return ResponseEnvelope(data=data, meta=_meta(request))


@router.get("/search/autocomplete", response_model=ResponseEnvelope[List[PlaceSearchSuggestion]])
async def autocomplete_places(request: Request, q: str = ""):
    data = places_service.autocomplete(q)
    return ResponseEnvelope(data=data, meta=_meta(request))


@router.get("/{place_id}", response_model=ResponseEnvelope[PlaceResponse])
async def get_place_by_id(place_id: str, request: Request):
    place_record = places_service.get_place_by_id_or_slug(place_id)
    return ResponseEnvelope(data=place_record, meta=_meta(request))


@router.post("", response_model=ResponseEnvelope[PlaceResponse])
async def create_place(
    place_in: PlaceCreate,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.create")),
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place_record = places_service.create_place_transactional(place_in, current_user, trace_id)
    return ResponseEnvelope(data=place_record, meta=_meta(request))


@router.post("/{place_id}/feedback", response_model=ResponseEnvelope[dict])
async def submit_place_feedback(
    place_id: str,
    feedback_in: PlaceFeedbackCreate,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.create")),
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    record = places_service.submit_place_feedback(place_id, feedback_in, current_user, trace_id)
    return ResponseEnvelope(data=record, meta=_meta(request))


@router.post("/{place_id}/verify", response_model=ResponseEnvelope[dict])
async def verify_place(
    place_id: str,
    request: Request,
    current_user: UserContext = Depends(check_permission("places.verify")),
):
    place_record = places_service.get_place_by_id_or_slug(place_id)
    created_by_id = place_record.get("createdById") or place_record.get("createdBy") or ""
    verify_self_approval_restriction(current_user, created_by_id)

    place_record["verified"] = True
    place_record["verifiedBy"] = current_user.name
    place_record["verifiedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    place_record["status"] = "VERIFIED"

    return ResponseEnvelope(
        data={"status": "VERIFIED", "verifiedBy": current_user.name, "placeId": place_record.get("id", place_id)},
        meta=_meta(request),
    )
