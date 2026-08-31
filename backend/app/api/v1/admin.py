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
    AdminSettingsDTO,
    AuditLogEntryDTO,
    UserRoleUpdateDTO,
    EntityPerformanceDTO
)

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/entity/{entity_id}/performance", response_model=ResponseEnvelope[EntityPerformanceDTO])
async def get_entity_performance(
    entity_id: str,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("destinations.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-perf") if request else "tr-perf"
    perf = admin_dashboard_service.get_entity_performance(entity_id)
    return ResponseEnvelope(
        data=perf,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/telemetry", response_model=ResponseEnvelope[dict])
async def get_telemetry(
    request: Request,
    current_user: UserContext = Depends(check_permission("telemetry.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-telemetry")
    data = telemetry_service.get_realtime_telemetry()
    return ResponseEnvelope(
        data=data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 1. Admin Dashboard Overview
@router.get("/dashboard/overview", response_model=ResponseEnvelope[AdminDashboardMetricsDTO])
async def get_dashboard_overview(
    request: Request,
    current_user: UserContext = Depends(check_permission("destinations.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-admin-overview")
    overview = admin_dashboard_service.get_dashboard_overview(trace_id=trace_id)
    return ResponseEnvelope(
        data=overview,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 2. Destinations Management (Single Source of Truth)
@router.get("/destinations", response_model=ResponseEnvelope[List[DestinationDetailDTO]])
async def get_admin_destinations(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("destinations.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-dest") if request else "tr-dest"
    destinations = admin_dashboard_service.get_destinations()
    return ResponseEnvelope(
        data=destinations,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/destinations", response_model=ResponseEnvelope[DestinationDetailDTO])
async def create_admin_destination(
    payload: DestinationDetailDTO,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("destinations.create"))
):
    trace_id = getattr(request.state, "trace_id", "tr-dest-create") if request else "tr-dest-create"
    created = admin_dashboard_service.create_destination(payload, user_email=current_user.email)
    return ResponseEnvelope(
        data=created,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.put("/destinations/{destination_id}", response_model=ResponseEnvelope[DestinationDetailDTO])
async def update_admin_destination(
    destination_id: str,
    payload: DestinationDetailDTO,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("destinations.update"))
):
    trace_id = getattr(request.state, "trace_id", "tr-dest-update") if request else "tr-dest-update"
    updated = admin_dashboard_service.update_destination(destination_id, payload, user_email=current_user.email)
    return ResponseEnvelope(
        data=updated,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.delete("/destinations/{destination_id}", response_model=ResponseEnvelope[dict])
async def delete_admin_destination(
    destination_id: str,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("destinations.delete"))
):
    trace_id = getattr(request.state, "trace_id", "tr-dest-delete") if request else "tr-dest-delete"
    success = admin_dashboard_service.delete_destination(destination_id, user_email=current_user.email)
    return ResponseEnvelope(
        data={"deleted": success, "id": destination_id},
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 3. Attractions Management (Single Source of Truth)
@router.get("/attractions", response_model=ResponseEnvelope[List[AttractionDetailDTO]])
async def get_admin_attractions(
    category: Optional[str] = None,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("attractions.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-attractions") if request else "tr-attractions"
    attractions = admin_dashboard_service.get_attractions(category=category)
    return ResponseEnvelope(
        data=attractions,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 4. Hotels & Restaurants Management
@router.get("/hotels", response_model=ResponseEnvelope[List[HotelDetailDTO]])
async def get_admin_hotels(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("hotels.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-hotels") if request else "tr-hotels"
    hotels = admin_dashboard_service.get_hotels()
    return ResponseEnvelope(
        data=hotels,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/restaurants", response_model=ResponseEnvelope[List[RestaurantDetailDTO]])
async def get_admin_restaurants(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("restaurants.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-restaurants") if request else "tr-restaurants"
    restaurants = admin_dashboard_service.get_restaurants()
    return ResponseEnvelope(
        data=restaurants,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 5. Events Management
@router.get("/events", response_model=ResponseEnvelope[List[EventDetailDTO]])
async def get_admin_events(
    status: Optional[str] = None,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("events.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-events") if request else "tr-events"
    events = admin_dashboard_service.get_events(status=status)
    return ResponseEnvelope(
        data=events,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 6. Crawler Pipeline Control Center (Staging → Master DB Promotion)
@router.get("/crawler/sources", response_model=ResponseEnvelope[List[CrawlerSourceDTO]])
async def get_crawler_sources(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("crawler.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-src") if request else "tr-crawler-src"
    sources = admin_dashboard_service.get_crawler_sources()
    return ResponseEnvelope(
        data=sources,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/crawler/jobs", response_model=ResponseEnvelope[List[CrawlerJobDTO]])
async def get_crawler_jobs(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("crawler.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-jobs") if request else "tr-crawler-jobs"
    jobs = admin_dashboard_service.get_crawler_jobs()
    return ResponseEnvelope(
        data=jobs,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/crawler/diffs", response_model=ResponseEnvelope[List[CrawledDataDiffDTO]])
async def get_crawler_diffs(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("crawler.review"))
):
    trace_id = getattr(request.state, "trace_id", "tr-crawler-diffs") if request else "tr-crawler-diffs"
    diffs = admin_dashboard_service.get_crawler_diffs()
    return ResponseEnvelope(
        data=diffs,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/crawler/diffs/{diff_id}/approve", response_model=ResponseEnvelope[dict])
async def approve_crawler_diff(
    diff_id: str,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("crawler.approve"))
):
    trace_id = getattr(request.state, "trace_id", "tr-diff-approve") if request else "tr-diff-approve"
    res = admin_dashboard_service.approve_diff(diff_id, user_email=current_user.email)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/crawler/diffs/{diff_id}/reject", response_model=ResponseEnvelope[dict])
async def reject_crawler_diff(
    diff_id: str,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("crawler.review"))
):
    trace_id = getattr(request.state, "trace_id", "tr-diff-reject") if request else "tr-diff-reject"
    res = admin_dashboard_service.reject_diff(diff_id, user_email=current_user.email)
    return ResponseEnvelope(
        data=res,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 7. Users & Roles (RBAC)
@router.get("/users", response_model=ResponseEnvelope[List[AdminUserRoleDTO]])
async def get_admin_users(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("users.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-users") if request else "tr-users"
    users = admin_dashboard_service.get_users()
    return ResponseEnvelope(
        data=users,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/users/role", response_model=ResponseEnvelope[AdminUserRoleDTO])
async def update_user_role(
    payload: UserRoleUpdateDTO,
    request: Request = None,
    current_user: UserContext = Depends(check_permission("users.role_change"))
):
    trace_id = getattr(request.state, "trace_id", "tr-role-change") if request else "tr-role-change"
    updated = admin_dashboard_service.update_user_role(payload.userId, payload.newRole, admin_email=current_user.email)
    return ResponseEnvelope(
        data=updated,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 8. Audit Logs
@router.get("/audit-logs", response_model=ResponseEnvelope[List[AuditLogEntryDTO]])
async def get_audit_logs(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("audit.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-audit") if request else "tr-audit"
    logs = admin_dashboard_service.get_audit_logs()
    return ResponseEnvelope(
        data=logs,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 9. Analytics
@router.get("/analytics", response_model=ResponseEnvelope[AdminAnalyticsDTO])
async def get_admin_analytics(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("analytics.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-analytics") if request else "tr-analytics"
    analytics = admin_dashboard_service.get_analytics()
    return ResponseEnvelope(
        data=analytics,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 10. Content CMS
@router.get("/cms/sections", response_model=ResponseEnvelope[List[ContentCmsSectionDTO]])
async def get_cms_sections(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("cms.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-cms") if request else "tr-cms"
    sections = admin_dashboard_service.get_cms_sections()
    return ResponseEnvelope(
        data=sections,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 11. Settings & Categories
@router.get("/settings", response_model=ResponseEnvelope[AdminSettingsDTO])
async def get_admin_settings(
    request: Request = None,
    current_user: UserContext = Depends(check_permission("settings.view"))
):
    trace_id = getattr(request.state, "trace_id", "tr-settings") if request else "tr-settings"
    settings_data = admin_dashboard_service.get_settings()
    return ResponseEnvelope(
        data=settings_data,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/settings/categories", response_model=ResponseEnvelope[AdminSettingsDTO])
async def add_admin_category(
    category_name: str = Query(...),
    request: Request = None,
    current_user: UserContext = Depends(check_permission("settings.update"))
):
    trace_id = getattr(request.state, "trace_id", "tr-cat-add") if request else "tr-cat-add"
    updated = admin_dashboard_service.add_category(category_name, admin_email=current_user.email)
    return ResponseEnvelope(
        data=updated,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
