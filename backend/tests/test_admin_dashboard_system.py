import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.admin_dashboard_service import admin_dashboard_service

client = TestClient(app)

# 1. Test Overview Metrics
def test_admin_dashboard_overview():
    overview = admin_dashboard_service.get_dashboard_overview()
    assert overview.totalDestinations >= 2
    assert overview.pendingApprovals >= 1
    assert "100%" in overview.systemApiHealth

# 2. Test Crawler Sources & Jobs
def test_admin_crawler_pipeline():
    sources = admin_dashboard_service.get_crawler_sources()
    assert len(sources) >= 4

    jobs = admin_dashboard_service.get_crawler_jobs()
    assert len(jobs) >= 2

    diffs = admin_dashboard_service.get_crawler_diffs()
    assert len(diffs) >= 1

# 3. Test Events, Hotels, Users RBAC, Analytics, Settings
def test_admin_events_hotels_users_analytics():
    events = admin_dashboard_service.get_events()
    assert len(events) >= 1

    hotels = admin_dashboard_service.get_hotels()
    assert len(hotels) >= 1

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

    res_dest = client.get("/api/v1/admin/destinations")
    assert res_dest.status_code == 200
    assert isinstance(res_dest.json()["data"], list)

    res_sy = client.post("/api/v1/admin/settings/categories?category_name=Cultural")
    assert res_sy.status_code == 200
    assert "Cultural" in res_sy.json()["data"]["categories"]
