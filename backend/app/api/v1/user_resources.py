import time
from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import decode_supabase_jwt, UserContext
from backend.app.services.user_service import user_service

router = APIRouter(prefix="/user", tags=["User Private Resources"])

# --- TRIPS ---
@router.get("/trips", response_model=ResponseEnvelope[List[dict]])
async def get_my_trips(request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    trips = user_service.get_user_trips(current_user.id)
    return ResponseEnvelope(
        data=trips,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/trips", response_model=ResponseEnvelope[dict])
async def create_trip(request: Request, payload: dict, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    title = payload.get("title") or "New Trip"
    origin = payload.get("origin") or "Chennai"
    destination = payload.get("destination") or "Madurai"
    places = payload.get("places") or []
    
    trip = user_service.create_trip(current_user.id, title, origin, destination, places)
    return ResponseEnvelope(
        data=trip,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/trips/{trip_id}", response_model=ResponseEnvelope[dict])
async def get_trip_by_id(trip_id: str, request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    trip = user_service.get_trip_by_id(trip_id, current_user.id)
    return ResponseEnvelope(
        data=trip,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.delete("/trips/{trip_id}", response_model=ResponseEnvelope[dict])
async def delete_trip(trip_id: str, request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    user_service.delete_trip(trip_id, current_user.id)
    return ResponseEnvelope(
        data={"status": "DELETED", "tripId": trip_id},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# --- SAVED PLACES ---
@router.get("/saved-places", response_model=ResponseEnvelope[List[str]])
async def get_saved_places(request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    saved = user_service.get_saved_places(current_user.id)
    return ResponseEnvelope(
        data=saved,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/saved-places", response_model=ResponseEnvelope[List[str]])
async def save_place(request: Request, payload: dict, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place_id = payload.get("placeId") or payload.get("place_id") or ""
    saved = user_service.save_place(current_user.id, place_id)
    return ResponseEnvelope(
        data=saved,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.delete("/saved-places/{place_id}", response_model=ResponseEnvelope[List[str]])
async def remove_saved_place(place_id: str, request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    saved = user_service.remove_saved_place(current_user.id, place_id)
    return ResponseEnvelope(
        data=saved,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# --- FAVORITES ---
@router.get("/favorites", response_model=ResponseEnvelope[List[str]])
async def get_favorites(request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    favorites = user_service.get_favorites(current_user.id)
    return ResponseEnvelope(
        data=favorites,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/favorites", response_model=ResponseEnvelope[List[str]])
async def add_favorite(request: Request, payload: dict, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place_id = payload.get("placeId") or payload.get("place_id") or ""
    favorites = user_service.add_favorite(current_user.id, place_id)
    return ResponseEnvelope(
        data=favorites,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.delete("/favorites/{place_id}", response_model=ResponseEnvelope[List[str]])
async def remove_favorite(place_id: str, request: Request, current_user: UserContext = Depends(decode_supabase_jwt)):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    favorites = user_service.remove_favorite(current_user.id, place_id)
    return ResponseEnvelope(
        data=favorites,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
