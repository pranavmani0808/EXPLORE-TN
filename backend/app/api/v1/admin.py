import time
from fastapi import APIRouter, Depends, Request
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import check_permission, UserContext
from backend.app.services.places_service import places_service

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/telemetry", response_model=ResponseEnvelope[dict])
async def get_telemetry(
    request: Request,
    current_user: UserContext = Depends(check_permission("telemetry.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    places_count = len(places_service.get_all_places())
    
    telemetry_data = {
        "registeredUsers": 1,
        "activeUsersToday": 1,
        "totalPlaces": places_count,
        "verifiedPlaces": 1,
        "pendingPlaces": places_count - 1,
        "totalRoutes": 1,
        "mediaAssets": 1,
        "publishedStories": 0,
        "pendingReviews": 0,
        "weatherAlerts": 0,
        "storageUsedGB": "1.2 GB",
        "avgLatencyMs": 14,
    }
    
    return ResponseEnvelope(
        data=telemetry_data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
