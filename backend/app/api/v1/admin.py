import time
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Query, HTTPException
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import check_permission, UserContext
from backend.app.services.telemetry_service import telemetry_service
from backend.app.services.places_service import places_service
from backend.app.services.admin_dashboard_service import (
    admin_dashboard_service,
    AdminDashboardMetricsDTO,
    CrawledDataRecordDTO,
    AdminEventDTO,
    AdminHotelListingDTO,
    AdminUserRoleDTO,
    AdminAnalyticsDTO,
    AdminSettingsDTO
)

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

# 1. Admin Dashboard Overview
@router.get("/dashboard/overview", response_model=ResponseEnvelope[AdminDashboardMetricsDTO])
async def get_dashboard_overview(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-admin-overview")
    overview = admin_dashboard_service.get_dashboard_overview(trace_id=trace_id)
    return ResponseEnvelope(
        data=overview,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 2. Crawler Pipeline Endpoints
@router.get("/crawler/records", response_model=ResponseEnvelope[List[CrawledDataRecordDTO]])
async def get_crawled_records(status: Optional[str] = None, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-rec") if request else "tr-crawler-rec"
    records = admin_dashboard_service.get_crawled_records(status_filter=status)
    return ResponseEnvelope(
        data=records,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/crawler/approve/{record_id}", response_model=ResponseEnvelope[CrawledDataRecordDTO])
async def approve_crawled_record(record_id: str, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-approve") if request else "tr-approve"
    try:
        approved = admin_dashboard_service.approve_crawled_record(record_id=record_id, trace_id=trace_id)
        return ResponseEnvelope(
            data=approved,
            meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        )
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

@router.post("/crawler/reject/{record_id}", response_model=ResponseEnvelope[CrawledDataRecordDTO])
async def reject_crawled_record(record_id: str, reason: str = Query("Duplicate record"), request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-reject") if request else "tr-reject"
    try:
        rejected = admin_dashboard_service.reject_crawled_record(record_id=record_id, reason=reason, trace_id=trace_id)
        return ResponseEnvelope(
            data=rejected,
            meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        )
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

@router.post("/crawler/sync", response_model=ResponseEnvelope[dict])
async def sync_crawler_production(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-sync") if request else "tr-sync"
    res = admin_dashboard_service.sync_approved_to_production(trace_id=trace_id)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 3. Events Management
@router.get("/events", response_model=ResponseEnvelope[List[AdminEventDTO]])
async def get_admin_events(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-events") if request else "tr-events"
    events = admin_dashboard_service.get_events()
    return ResponseEnvelope(
        data=events,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 4. Hotels & Restaurants Management
@router.get("/hotels", response_model=ResponseEnvelope[List[AdminHotelListingDTO]])
async def get_admin_hotels(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-hotels") if request else "tr-hotels"
    hotels = admin_dashboard_service.get_hotels()
    return ResponseEnvelope(
        data=hotels,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 5. User Management & RBAC
@router.get("/users", response_model=ResponseEnvelope[List[AdminUserRoleDTO]])
async def get_admin_users(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-users") if request else "tr-users"
    users = admin_dashboard_service.get_users()
    return ResponseEnvelope(
        data=users,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 6. Analytics
@router.get("/analytics", response_model=ResponseEnvelope[AdminAnalyticsDTO])
async def get_admin_analytics(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-analytics") if request else "tr-analytics"
    analytics = admin_dashboard_service.get_analytics()
    return ResponseEnvelope(
        data=analytics,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 7. Settings
@router.get("/settings", response_model=ResponseEnvelope[AdminSettingsDTO])
async def get_admin_settings(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-settings") if request else "tr-settings"
    settings_data = admin_dashboard_service.get_settings()
    return ResponseEnvelope(
        data=settings_data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/settings", response_model=ResponseEnvelope[AdminSettingsDTO])
async def update_admin_settings(payload: AdminSettingsDTO, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-settings") if request else "tr-settings"
    updated = admin_dashboard_service.update_settings(payload)
    return ResponseEnvelope(
        data=updated,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
