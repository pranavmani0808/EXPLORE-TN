import time
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Query, HTTPException
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import check_permission, UserContext
from backend.app.services.telemetry_service import telemetry_service
from backend.app.services.places_service import places_service
from backend.app.services.admin_dashboard_service import admin_dashboard_service
from backend.app.schemas.admin_dashboard import (
    AdminDashboardMetricsDTO,
    DestinationDetailDTO,
    AttractionDetailDTO,
    HotelDetailDTO,
    RestaurantDetailDTO,
    EventDetailDTO,
    CrawlerSourceDTO,
    CrawlerJobDTO,
    CrawledDataDiffDTO,
    AdminUserRoleDTO,
    AdminAnalyticsDTO,
    ContentCmsSectionDTO,
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

# 2. Destinations Management
@router.get("/destinations", response_model=ResponseEnvelope[List[DestinationDetailDTO]])
async def get_admin_destinations(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-dest") if request else "tr-dest"
    destinations = admin_dashboard_service.get_destinations()
    return ResponseEnvelope(
        data=destinations,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/destinations", response_model=ResponseEnvelope[DestinationDetailDTO])
async def create_admin_destination(payload: DestinationDetailDTO, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-dest-create") if request else "tr-dest-create"
    created = admin_dashboard_service.create_destination(payload)
    return ResponseEnvelope(
        data=created,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 3. Attractions Management
@router.get("/attractions", response_model=ResponseEnvelope[List[AttractionDetailDTO]])
async def get_admin_attractions(category: Optional[str] = None, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-attractions") if request else "tr-attractions"
    attractions = admin_dashboard_service.get_attractions(category=category)
    return ResponseEnvelope(
        data=attractions,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 4. Hotels & Restaurants Management
@router.get("/hotels", response_model=ResponseEnvelope[List[HotelDetailDTO]])
async def get_admin_hotels(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-hotels") if request else "tr-hotels"
    hotels = admin_dashboard_service.get_hotels()
    return ResponseEnvelope(
        data=hotels,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/restaurants", response_model=ResponseEnvelope[List[RestaurantDetailDTO]])
async def get_admin_restaurants(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-restaurants") if request else "tr-restaurants"
    restaurants = admin_dashboard_service.get_restaurants()
    return ResponseEnvelope(
        data=restaurants,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 5. Events Management
@router.get("/events", response_model=ResponseEnvelope[List[EventDetailDTO]])
async def get_admin_events(status: Optional[str] = None, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-events") if request else "tr-events"
    events = admin_dashboard_service.get_events(status=status)
    return ResponseEnvelope(
        data=events,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 6. Crawler Pipeline Control Center
@router.get("/crawler/sources", response_model=ResponseEnvelope[List[CrawlerSourceDTO]])
async def get_crawler_sources(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-src") if request else "tr-crawler-src"
    sources = admin_dashboard_service.get_crawler_sources()
    return ResponseEnvelope(
        data=sources,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/crawler/jobs", response_model=ResponseEnvelope[List[CrawlerJobDTO]])
async def get_crawler_jobs(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-jobs") if request else "tr-crawler-jobs"
    jobs = admin_dashboard_service.get_crawler_jobs()
    return ResponseEnvelope(
        data=jobs,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/crawler/diffs", response_model=ResponseEnvelope[List[CrawledDataDiffDTO]])
async def get_crawler_diffs(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-diffs") if request else "tr-crawler-diffs"
    diffs = admin_dashboard_service.get_crawler_diffs()
    return ResponseEnvelope(
        data=diffs,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/crawler/diffs/{diff_id}/approve", response_model=ResponseEnvelope[dict])
async def approve_crawler_diff(diff_id: str, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-diff-approve") if request else "tr-diff-approve"
    res = admin_dashboard_service.approve_diff(diff_id)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/crawler/diffs/{diff_id}/reject", response_model=ResponseEnvelope[dict])
async def reject_crawler_diff(diff_id: str, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-diff-reject") if request else "tr-diff-reject"
    res = admin_dashboard_service.reject_diff(diff_id)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 7. Users & Roles (RBAC)
@router.get("/users", response_model=ResponseEnvelope[List[AdminUserRoleDTO]])
async def get_admin_users(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-users") if request else "tr-users"
    users = admin_dashboard_service.get_users()
    return ResponseEnvelope(
        data=users,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 8. Analytics
@router.get("/analytics", response_model=ResponseEnvelope[AdminAnalyticsDTO])
async def get_admin_analytics(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-analytics") if request else "tr-analytics"
    analytics = admin_dashboard_service.get_analytics()
    return ResponseEnvelope(
        data=analytics,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 9. Content CMS
@router.get("/cms/sections", response_model=ResponseEnvelope[List[ContentCmsSectionDTO]])
async def get_cms_sections(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-cms") if request else "tr-cms"
    sections = admin_dashboard_service.get_cms_sections()
    return ResponseEnvelope(
        data=sections,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 10. Settings & Categories
@router.get("/settings", response_model=ResponseEnvelope[AdminSettingsDTO])
async def get_admin_settings(request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-settings") if request else "tr-settings"
    settings_data = admin_dashboard_service.get_settings()
    return ResponseEnvelope(
        data=settings_data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/settings/categories", response_model=ResponseEnvelope[AdminSettingsDTO])
async def add_admin_category(category_name: str = Query(...), request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-cat-add") if request else "tr-cat-add"
    updated = admin_dashboard_service.add_category(category_name)
    return ResponseEnvelope(
        data=updated,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
