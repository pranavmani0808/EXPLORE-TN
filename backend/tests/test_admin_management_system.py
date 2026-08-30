import time
import jwt
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.services.admin_dashboard_service import admin_dashboard_service
from backend.app.services.places_service import places_service

client = TestClient(app)

def get_auth_token(email="popzdesigngroup@gmail.com", role="super_admin"):
    payload = {
        "sub": "usr-popz-admin",
        "email": email,
        "app_metadata": {"role": role},
        "exp": int(time.time()) + 3600
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)

# 1. Single Source of Truth Test: Admin queries master places_service DB
def test_admin_single_source_of_truth():
    destinations = admin_dashboard_service.get_destinations()
    master_places = places_service.get_all_places()
    assert len(destinations) == len(master_places)
    assert any(d.name == "Madurai" for d in destinations)

# 2. Dynamic Metric Calculations Test
def test_admin_dynamic_metrics():
    metrics = admin_dashboard_service.get_dashboard_overview()
    master_places = places_service.get_all_places()
    assert metrics.totalDestinations == len(master_places)
    assert metrics.totalAttractions == len(master_places)

# 3. Test Crawler Staging Promotion into Production DB
def test_admin_crawler_staging_promotion():
    diffs = admin_dashboard_service.get_crawler_diffs()
    initial_places_count = len(places_service.get_all_places())

    # Approve diff-002 (Kumbakkarai Foothill Rock Pools)
    res = admin_dashboard_service.approve_diff("diff-002", user_email="popzdesigngroup@gmail.com")
    assert res["status"] == "APPROVED"

    # Verify place was promoted directly into production places_service DB
    new_places_count = len(places_service.get_all_places())
    assert new_places_count == initial_places_count + 1

    # Verify Audit Log entry was recorded
    audit_logs = admin_dashboard_service.get_audit_logs()
    assert any(log.action == "CRAWLER_APPROVED" for log in audit_logs)

# 4. Test Granular Role-Based Permissions & Audit Logs
def test_admin_rbac_and_audit_logs():
    users = admin_dashboard_service.get_users()
    assert len(users) >= 3

    # Update role
    updated_user = admin_dashboard_service.update_user_role("usr-2", "Admin", admin_email="popzdesigngroup@gmail.com")
    assert updated_user.role == "Admin"

    # Audit logs
    audit_logs = admin_dashboard_service.get_audit_logs()
    assert any(log.action == "USER_ROLE_CHANGED" for log in audit_logs)

# 5. Test REST Endpoints via FastAPI TestClient
def test_admin_rest_endpoints_with_permissions():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res_ov = client.get("/api/v1/admin/dashboard/overview", headers=headers)
    assert res_ov.status_code == 200
    assert "totalDestinations" in res_ov.json()["data"]

    res_dest = client.get("/api/v1/admin/destinations", headers=headers)
    assert res_dest.status_code == 200
    assert len(res_dest.json()["data"]) >= 50

    res_aud = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res_aud.status_code == 200
    assert isinstance(res_aud.json()["data"], list)
