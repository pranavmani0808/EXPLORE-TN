import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.admin_dashboard_service import admin_dashboard_service

client = TestClient(app)

# 1. Test Overview Metrics
def test_admin_dashboard_overview():
    overview = admin_dashboard_service.get_dashboard_overview()
    assert overview.totalDestinations >= 10
    assert overview.pendingApprovals >= 1
    assert "OPERATIONAL" in overview.systemApiHealth

# 2. Test Crawler Review & Approval Pipeline
def test_admin_crawler_pipeline():
    records = admin_dashboard_service.get_crawled_records()
    assert len(records) >= 3

    # Approve record
    approved = admin_dashboard_service.approve_crawled_record("crawl-rec-001")
    assert approved.status == "APPROVED"

    # Reject record
    rejected = admin_dashboard_service.reject_crawled_record("crawl-rec-002", "Out of state location")
    assert rejected.status == "REJECTED"
    assert rejected.errorMessage == "Out of state location"

    # Sync to production database
    sync_res = admin_dashboard_service.sync_approved_to_production()
    assert sync_res["status"] == "SUCCESS"
    assert sync_res["syncedCount"] >= 1

# 3. Test Events, Hotels, Users RBAC, Analytics, Settings
def test_admin_events_hotels_users_analytics():
    events = admin_dashboard_service.get_events()
    assert len(events) >= 2

    hotels = admin_dashboard_service.get_hotels()
    assert len(hotels) >= 2

    users = admin_dashboard_service.get_users()
    assert len(users) >= 3
    assert any(u.role == "Super Admin" for u in users)

    analytics = admin_dashboard_service.get_analytics()
    assert analytics.dailyApiRequests > 0

    settings = admin_dashboard_service.get_settings()
    assert settings.crawlerMaxPagesPerRun == 50

# 4. Test REST Endpoints via FastAPI TestClient
def test_admin_endpoints():
    res_ov = client.get("/api/v1/admin/dashboard/overview")
    assert res_ov.status_code == 200
    assert "totalDestinations" in res_ov.json()["data"]

    res_cr = client.get("/api/v1/admin/crawler/records")
    assert res_cr.status_code == 200
    assert isinstance(res_cr.json()["data"], list)

    res_app = client.post("/api/v1/admin/crawler/approve/crawl-rec-001")
    assert res_app.status_code == 200
    assert res_app.json()["data"]["status"] == "APPROVED"

    res_sy = client.post("/api/v1/admin/crawler/sync")
    assert res_sy.status_code == 200
    assert res_sy.json()["data"]["status"] == "SUCCESS"
