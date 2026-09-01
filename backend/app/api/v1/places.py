import time
from fastapi import APIRouter, Depends, Request
from typing import List, Optional
from backend.app.schemas.places import PlaceCreate, PlaceResponse, PlaceFeedbackCreate
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import decode_supabase_jwt, check_permission, UserContext, verify_self_approval_restriction
from backend.app.services.places_service import places_service
from backend.app.services.weather_service import weather_service

router = APIRouter(prefix="/places", tags=["Places"])

@router.get("/{slug}/weather", response_model=ResponseEnvelope[dict])
async def get_place_weather(slug: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place = places_service.get_place_by_id_or_slug(slug)
    dest_name = place.get("name") if place else slug
    lat = place.get("latitude") if place else None
    lon = place.get("longitude") if place else None
    
    forecast = weather_service.get_weather_forecast(dest_name, lat=lat, lon=lon, trace_id=trace_id)
    return ResponseEnvelope(
        data=forecast.model_dump() if hasattr(forecast, "model_dump") else forecast.dict(),
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

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

@router.post("/resolve", response_model=ResponseEnvelope[dict])
async def resolve_place_query(request: Request, payload: dict):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    q = payload.get("query") or payload.get("q") or ""
    resolved = places_service.resolve_destination(q)
    return ResponseEnvelope(
        data=resolved,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/nearby", response_model=ResponseEnvelope[List[dict]])
async def get_nearby_places(request: Request, lat: float, lng: float, radius: float = 50.0, category: Optional[str] = None):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    nearby = places_service.find_nearby_places(lat, lng, radius_km=radius, category=category)
    return ResponseEnvelope(
        data=nearby,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/search", response_model=ResponseEnvelope[dict])
async def search_places(request: Request, q: str, category: Optional[str] = None, radius: float = 50.0):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    results = places_service.search_places_by_category_and_location(q, category=category, radius_km=radius)
    return ResponseEnvelope(
        data=results,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/category/{category}", response_model=ResponseEnvelope[List[PlaceResponse]])
async def get_places_by_category(category: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    data = places_service.get_places_by_category(category)
    return ResponseEnvelope(
        data=data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/district/{district}", response_model=ResponseEnvelope[List[PlaceResponse]])
async def get_places_by_district(district: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    data = places_service.get_places_by_district(district)
    return ResponseEnvelope(
        data=data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/viewport", response_model=ResponseEnvelope[List[dict]])
async def get_places_in_viewport(
    request: Request,
    min_lat: float,
    max_lat: float,
    min_lng: float,
    max_lng: float,
    category: Optional[str] = None
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    places = places_service.get_places_in_viewport(min_lat, max_lat, min_lng, max_lng, category)
    return ResponseEnvelope(
        data=places,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/corridor", response_model=ResponseEnvelope[List[dict]])
async def get_places_along_corridor(request: Request, payload: dict):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    polyline = payload.get("polyline") or payload.get("coordinates") or []
    max_detour = float(payload.get("maxDetourKm") or 5.0)
    category = payload.get("category")
    places = places_service.get_places_along_corridor(polyline, max_detour_km=max_detour, category=category)
    return ResponseEnvelope(
        data=places,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/categories", response_model=ResponseEnvelope[dict])
async def list_place_categories(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    categories = [
        {"key": "all", "label": "All Places", "icon": "🗺️"},
        {"key": "temple", "label": "Temples & Heritage", "icon": "🛕"},
        {"key": "waterfall", "label": "Waterfalls", "icon": "💦"},
        {"key": "mountain", "label": "Hills & Mountains", "icon": "🏔️"},
        {"key": "coastal", "label": "Beaches & Coastal", "icon": "🏖️"},
        {"key": "heritage", "label": "Forts & Palaces", "icon": "🏛️"},
        {"key": "adventure", "label": "Adventure & Treks", "icon": "🪂"},
        {"key": "food", "label": "Food & Dining", "icon": "🍛"},
        {"key": "lake", "label": "Lakes & Rivers", "icon": "🌊"},
    ]
    place_types = ["CITY", "TOWN", "DISTRICT", "STATE", "REGION", "TEMPLE", "CHURCH", "MOSQUE", "WATERFALL", "RIVER", "LAKE", "DAM", "BEACH", "HILL", "MOUNTAIN", "VALLEY", "VIEWPOINT", "FOREST", "NATIONAL_PARK", "WILDLIFE", "FORT", "PALACE", "HERITAGE_SITE", "FOOD_SPOT", "RESTAURANT", "CAFE", "TEA_SHOP", "HOTEL", "RESORT", "ADVENTURE", "TREKKING", "KAYAKING", "RAFTING", "CAMPING"]
    return ResponseEnvelope(
        data={"categories": categories, "types": place_types},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/search/autocomplete", response_model=ResponseEnvelope[List[dict]])
async def autocomplete_places(q: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    results = places_service.search_places(q)
    return ResponseEnvelope(
        data=results,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/experience/home", response_model=ResponseEnvelope[dict])
async def get_experience_home(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    all_places = places_service.get_all_places()
    featured = [p for p in all_places if p.get("featured", False)] or all_places[:6]
    return ResponseEnvelope(
        data={"featured": featured, "trending": all_places[:4], "categories": ["temple", "waterfall", "hill_station"]},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/experience/trip/{slug}", response_model=ResponseEnvelope[dict])
async def get_experience_trip(slug: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    place = places_service.get_place_by_id_or_slug(slug)
    return ResponseEnvelope(
        data={"tripSlug": slug, "place": place, "recommendedDuration": "2 Days"},
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

