import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_isolated_route_engine_pure_calculation():
    request_payload = {
        "requestId": f"route-test-{uuid.uuid4().hex[:6]}",
        "origin": {
            "name": "Chennai",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "state": "Tamil Nadu",
            "country": "India"
        },
        "destination": {
            "name": "Rishikesh",
            "latitude": 30.0869,
            "longitude": 78.2676,
            "state": "Uttarakhand",
            "country": "India"
        },
        "travelMode": "motorcycle"
    }

    res = client.post("/api/v1/routes/calculate", json=request_payload)
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["requestId"] == request_payload["requestId"]
    assert data["destination"]["name"] == "Rishikesh"
    assert data["destinationFingerprint"] == "Rishikesh:30.0869:78.2676"
    assert data["distanceKm"] > 2000.0
    assert "geometry" in data
    assert len(data["geometry"]["coordinates"]) > 0

def test_isolated_route_engine_multi_stop():
    request_payload = {
        "requestId": f"route-multi-{uuid.uuid4().hex[:6]}",
        "origin": {
            "name": "Chennai",
            "latitude": 13.0827,
            "longitude": 80.2707
        },
        "waypoints": [
            {
                "name": "Haridwar",
                "latitude": 29.9457,
                "longitude": 78.1642
            }
        ],
        "destination": {
            "name": "Rishikesh",
            "latitude": 30.0869,
            "longitude": 78.2676
        },
        "travelMode": "motorcycle"
    }

    res = client.post("/api/v1/routes/calculate", json=request_payload)
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["requestId"] == request_payload["requestId"]
    assert len(data["waypoints"]) == 1
    assert data["waypoints"][0]["name"] == "Haridwar"

def test_isolated_route_engine_request_id_reflection():
    req_id = "route-unique-999"
    payload = {
        "requestId": req_id,
        "origin": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
        "destination": {"name": "Ooty", "latitude": 11.4102, "longitude": 76.6950},
        "travelMode": "motorcycle"
    }
    res = client.post("/api/v1/routes/calculate", json=payload)
    assert res.status_code == 200
    assert res.json()["data"]["requestId"] == req_id

def test_isolated_route_engine_zero_destination_contamination():
    # Call 1: Madurai Route Request
    req_madurai = {
        "requestId": "route-madurai-111",
        "origin": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
        "destination": {"name": "Madurai", "latitude": 9.9252, "longitude": 78.1198},
        "travelMode": "motorcycle"
    }
    res_m = client.post("/api/v1/routes/calculate", json=req_madurai)
    assert res_m.status_code == 200

    # Call 2: Rishikesh Route Request immediately after
    req_rishikesh = {
        "requestId": "route-rishikesh-222",
        "origin": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
        "destination": {"name": "Rishikesh", "latitude": 30.0869, "longitude": 78.2676},
        "travelMode": "motorcycle"
    }
    res_r = client.post("/api/v1/routes/calculate", json=req_rishikesh)
    assert res_r.status_code == 200
    data_r = res_r.json()["data"]

    # Verify 0 Madurai data or references in Rishikesh route result
    assert data_r["destination"]["name"] == "Rishikesh"
    assert "Madurai" not in str(data_r)
    assert "Thirupparankundram" not in str(data_r)
