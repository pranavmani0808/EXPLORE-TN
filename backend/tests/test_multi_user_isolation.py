import pytest
import jwt
import time
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.services.user_service import user_service

client = TestClient(app)

def generate_test_jwt(user_id: str, email: str, role: str = "explorer") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "app_metadata": {"role": role},
        "user_metadata": {"full_name": f"User {user_id}"},
        "exp": int(time.time()) + 3600
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)

# 1. Test IDOR Protection on User Trips
def test_idor_trip_protection():
    token_a = generate_test_jwt("user-a-123", "user_a@exploretn.com")
    token_b = generate_test_jwt("user-b-456", "user_b@exploretn.com")

    # User A creates a trip
    res_a = client.post(
        "/api/v1/user/trips",
        json={"title": "Madurai Express", "origin": "Chennai", "destination": "Madurai", "places": ["Meenakshi Temple"]},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_a.status_code == 200
    trip_id = res_a.json()["data"]["id"]
    assert res_a.json()["data"]["userId"] == "user-a-123"

    # User A can fetch their own trip
    res_get_a = client.get(f"/api/v1/user/trips/{trip_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_get_a.status_code == 200
    assert res_get_a.json()["data"]["title"] == "Madurai Express"

    # IDOR TEST: User B attempts to access User A's trip -> Must return 403 Forbidden!
    res_get_b = client.get(f"/api/v1/user/trips/{trip_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert res_get_b.status_code == 403
    assert "Forbidden" in res_get_b.json()["error"]["message"]

    # IDOR TEST: User B attempts to delete User A's trip -> Must return 403 Forbidden!
    res_del_b = client.delete(f"/api/v1/user/trips/{trip_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert res_del_b.status_code == 403
    assert "Forbidden" in res_del_b.json()["error"]["message"]

# 2. Test Saved Places Data Isolation
def test_saved_places_multi_tenant_isolation():
    token_a = generate_test_jwt("user-a-123", "user_a@exploretn.com")
    token_b = generate_test_jwt("user-b-456", "user_b@exploretn.com")

    # User A saves Meenakshi Amman Temple
    res_save_a = client.post(
        "/api/v1/user/saved-places",
        json={"placeId": "meenakshi-temple"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_save_a.status_code == 200
    assert "meenakshi-temple" in res_save_a.json()["data"]

    # User B checks saved places -> Must be empty (Zero leakage from User A)
    res_get_b = client.get("/api/v1/user/saved-places", headers={"Authorization": f"Bearer {token_b}"})
    assert res_get_b.status_code == 200
    assert "meenakshi-temple" not in res_get_b.json()["data"]

# 3. Test Concurrent User AI Planner Isolation
def test_concurrent_user_ai_planner_isolation():
    token_a = generate_test_jwt("user-a-123", "user_a@exploretn.com")
    token_b = generate_test_jwt("user-b-456", "user_b@exploretn.com")

    # User A starts planning Madurai from Chennai
    r1_a = client.post(
        "/api/v1/planner/chat",
        json={"message": "Plan a trip to Madurai from Chennai"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert r1_a.status_code == 200
    cid_a = r1_a.json()["data"]["conversationId"]

    # User B simultaneously starts planning Kodaikanal from Madurai
    r1_b = client.post(
        "/api/v1/planner/chat",
        json={"message": "Plan a trip to Kodaikanal from Madurai"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert r1_b.status_code == 200
    cid_b = r1_b.json()["data"]["conversationId"]

    # User A continues conversation A
    r2_a = client.post(
        "/api/v1/planner/chat",
        json={"conversationId": cid_a, "message": "Temples + Food"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert r2_a.status_code == 200
    data_a = r2_a.json()["data"]
    assert data_a["plannerState"]["destination"] == "Madurai"

    # User B continues conversation B
    r2_b = client.post(
        "/api/v1/planner/chat",
        json={"conversationId": cid_b, "message": "Waterfalls + Viewpoints"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert r2_b.status_code == 200
    data_b = r2_b.json()["data"]
    assert data_b["plannerState"]["destination"] == "Kodaikanal"

    # Verify complete isolation: User A state does not contain Kodaikanal, User B state does not contain Madurai
    assert data_a["plannerState"]["destination"] != data_b["plannerState"]["destination"]

# 4. Test IDOR Protection on Saved Routes
def test_idor_saved_routes_protection():
    token_a = generate_test_jwt("user-a-123", "user_a@exploretn.com")
    token_b = generate_test_jwt("user-b-456", "user_b@exploretn.com")

    # User A saves a route
    res_a = client.post(
        "/api/v1/user/routes",
        json={"title": "ECR Scenic Highway", "origin": "Chennai", "destination": "Pondicherry", "distanceKm": 155.0},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_a.status_code == 200
    route_id = res_a.json()["data"]["id"]

    # User B checks saved routes -> Must be empty
    res_b_list = client.get("/api/v1/user/routes", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b_list.status_code == 200
    assert len(res_b_list.json()["data"]) == 0
