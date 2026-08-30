import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.admin_dashboard_service import admin_dashboard_service

client = TestClient(app)

# 1. Test Overview Metrics & Activity Audit Trail
def test_admin_dashboard_metrics_and_activities():
    metrics = admin_dashboard_service.get_dashboard_overview()
    assert metrics.totalDestinations >= 2
    assert metrics.totalAttractions >= 2
    assert len(metrics.recentActivities) >= 2
    assert metrics.crawlerStatus["urlsScanned"] == 195

# 2. Test Destinations and Attractions CRUD Services
def test_admin_destinations_and_attractions():
    dests = admin_dashboard_service.get_destinations()
    assert len(dests) >= 2

    attrs = admin_dashboard_service.get_attractions()
    assert len(attrs) >= 2

    filtered_temples = admin_dashboard_service.get_attractions("Temples")
    assert any(a.category == "Temples" for a in filtered_temples)

# 3. Test Hotels, Restaurants, and Events
def test_admin_hotels_restaurants_events():
    hotels = admin_dashboard_service.get_hotels()
    assert len(hotels) >= 1

    restaurants = admin_dashboard_service.get_restaurants()
    assert len(restaurants) >= 1

    events = admin_dashboard_service.get_events()
    assert len(events) >= 1

# 4. Test Crawler Pipeline Control Center & Side-by-Side Diff
def test_admin_crawler_control_center():
    sources = admin_dashboard_service.get_crawler_sources()
    assert len(sources) >= 4

    jobs = admin_dashboard_service.get_crawler_jobs()
    assert len(jobs) >= 2

    diffs = admin_dashboard_service.get_crawler_diffs()
    assert len(diffs) >= 2

    # Test diff approval
    app_res = admin_dashboard_service.approve_diff("diff-001")
    assert app_res["status"] == "APPROVED"

# 5. Test REST API Endpoints via FastAPI TestClient
def test_admin_rest_endpoints():
    res_ov = client.get("/api/v1/admin/dashboard/overview")
    assert res_ov.status_code == 200
    assert "totalDestinations" in res_ov.json()["data"]

    res_dest = client.get("/api/v1/admin/destinations")
    assert res_dest.status_code == 200
    assert isinstance(res_dest.json()["data"], list)

    res_attr = client.get("/api/v1/admin/attractions?category=Temples")
    assert res_attr.status_code == 200

    res_diff = client.post("/api/v1/admin/crawler/diffs/diff-002/approve")
    assert res_diff.status_code == 200
    assert res_diff.json()["data"]["status"] == "APPROVED"

    res_cat = client.post("/api/v1/admin/settings/categories?category_name=Eco-Tourism")
    assert res_cat.status_code == 200
    assert "Eco-Tourism" in res_cat.json()["data"]["categories"]
