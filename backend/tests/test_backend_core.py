import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import decode_supabase_jwt, UserContext

client = TestClient(app)

# 1. Test Infrastructure Health & Readiness
def test_health_and_readiness():
    res_health = client.get("/healthz")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "Healthy"

    res_ready = client.get("/readyz")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "Ready"

# 2. Test WGS84 Geofence Validation
def test_wgs84_geofence_validation():
    # Valid TN Coordinates (Kodaikanal)
    valid_payload = {
        "name": "Kodaikanal Lake View",
        "district": "Dindigul",
        "category": "hill_station",
        "latitude": 10.2381,
        "longitude": 77.4892,
        "tagline": "Scenic high altitude star shaped lake"
    }
    res_valid = client.post("/api/v1/places", json=valid_payload)
    assert res_valid.status_code == 200
    assert res_valid.json()["data"]["name"] == "Kodaikanal Lake View"

    # Invalid Non-TN Coordinates (Mumbai: 19.076°N, 72.8777°E)
    invalid_payload = {
        "name": "Gateway of India",
        "district": "Mumbai",
        "category": "heritage",
        "latitude": 19.076,
        "longitude": 72.8777,
        "tagline": "Non TN location"
    }
    res_invalid = client.post("/api/v1/places", json=invalid_payload)
    assert res_invalid.status_code == 400
    assert "Latitude 19.076" in res_invalid.json()["error"]["message"]

# 3. Test Spatial Duplicate Detection Engine
def test_spatial_duplicate_detection():
    # Attempting to create duplicate "Suruli Waterfalls" near existing [9.6644, 77.2653]
    dup_payload = {
        "name": "Suruli Waterfalls",
        "district": "Theni",
        "category": "waterfall",
        "latitude": 9.6650,
        "longitude": 77.2655,
        "tagline": "Duplicate entry"
    }
    res = client.post("/api/v1/places", json=dup_payload)
    assert res.status_code == 400
    assert "Potential spatial duplicate detected" in res.json()["error"]["message"]

# 4. Test RBAC Permission Restriction
def test_permission_rbac_enforcement():
    # Override auth to simulate Explorer role (no places.create permission)
    def mock_explorer_auth():
        return UserContext(id="usr-99", name="Anand", email="anand@gmail.com", role="explorer")

    app.dependency_overrides[decode_supabase_jwt] = mock_explorer_auth

    payload = {
        "name": "Yercaud Peak",
        "district": "Salem",
        "category": "hill_station",
        "latitude": 11.7753,
        "longitude": 78.2093
    }
    res = client.post("/api/v1/places", json=payload)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "PERMISSION_DENIED"

    # Clean up dependency override
    app.dependency_overrides.clear()

# 5. Test Self-Approval Restriction
def test_self_approval_restriction():
    # Override auth to simulate Place Manager
    def mock_place_manager_auth():
        return UserContext(id="usr-manager-2", name="Arun", email="arun@exploretn.com", role="place_manager")

    app.dependency_overrides[decode_supabase_jwt] = mock_place_manager_auth

    # Place Manager trying to verify a place created by himself (usr-manager-2)
    res = client.post("/api/v1/places/p-1/verify")
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "SELF_APPROVAL_DISABLED"

    # Clean up dependency override
    app.dependency_overrides.clear()

# 6. Test Error Envelope Standard Format
def test_error_envelope_formatting():
    res = client.get("/api/v1/places/non-existent-id-9999")
    assert res.status_code == 404
    body = res.json()
    assert "error" in body
    assert "code" in body["error"]
    assert "message" in body["error"]
    assert "traceId" in body["error"]
