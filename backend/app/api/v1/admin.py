import time
from fastapi import APIRouter, Depends, Request
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import check_permission, UserContext
from backend.app.services.telemetry_service import telemetry_service
from backend.app.services.places_service import places_service

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/telemetry", response_model=ResponseEnvelope[dict])
async def get_telemetry(
    request: Request,
    current_user: UserContext = Depends(check_permission("telemetry.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    places_count = len(places_service.get_all_places())
    
    realtime_telemetry = telemetry_service.get_realtime_telemetry()
    realtime_telemetry["totalPlaces"] = places_count
    
    return ResponseEnvelope(
        data=realtime_telemetry,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
