from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_hills_of_tn_destinations_registered():
    all_places = places_service.get_all_places()
    all_names = [p["name"] for p in all_places]

    required_destinations = [
        "Kolli Hills",
        "Yelagiri",
        "Tharangambadi",
        "Kalrayan Hills",
        "Gingee Fort",
        "Panchamalai — Salem",
    ]

    for dest in required_destinations:
        assert dest in all_names, f"Missing canonical destination '{dest}' in places_service"

def test_hills_of_tn_isolated_route_calculation():
    # Chennai -> Gingee Fort
    res1 = client.post(
        "/api/v1/routes/calculate",
        json={
            "requestId": "test-htn-gingee",
            "origin": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
            "destination": {"name": "Gingee Fort", "latitude": 12.2530, "longitude": 79.4184},
            "travelMode": "driving",
        },
    )
    assert res1.status_code == 200
    data1 = res1.json()["data"]
    assert data1["distanceKm"] > 140.0

    # Chennai -> Kolli Hills
    res2 = client.post(
        "/api/v1/routes/calculate",
        json={
            "requestId": "test-htn-kolli",
            "origin": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
            "destination": {"name": "Kolli Hills", "latitude": 11.2721, "longitude": 78.3412},
            "travelMode": "driving",
        },
    )
    assert res2.status_code == 200
    data2 = res2.json()["data"]
    assert data2["distanceKm"] > 300.0

def test_hills_of_tn_copilot_planner_resolution():
    res = client.post(
        "/api/v1/planner/chat",
        json={
            "message": "Plan a trip from Chennai to Gingee Fort, Tamil Nadu",
        },
    )
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Gingee Fort"
