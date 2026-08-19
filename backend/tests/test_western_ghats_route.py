from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_western_ghats_canonical_stops_registered():
    all_places = places_service.get_all_places()
    all_names = [p["name"] for p in all_places]

    required_stops = ["Kinnakorai", "Mullayanagiri", "Agumbe"]

    for stop in required_stops:
        assert stop in all_names, f"Missing canonical stop '{stop}' in places_service"

def test_western_ghats_segment_route_calculation():
    # Kinnakorai -> Mullayanagiri
    res1 = client.post(
        "/api/v1/routes/calculate",
        json={
            "requestId": "test-wg-seg1",
            "origin": {"name": "Kinnakorai", "latitude": 11.2333, "longitude": 76.5833},
            "destination": {"name": "Mullayanagiri", "latitude": 13.3908, "longitude": 75.7214},
            "travelMode": "driving",
        },
    )
    assert res1.status_code == 200
    data1 = res1.json()["data"]
    assert data1["distanceKm"] > 150.0

    # Mullayanagiri -> Agumbe
    res2 = client.post(
        "/api/v1/routes/calculate",
        json={
            "requestId": "test-wg-seg2",
            "origin": {"name": "Mullayanagiri", "latitude": 13.3908, "longitude": 75.7214},
            "destination": {"name": "Agumbe", "latitude": 13.5028, "longitude": 75.0931},
            "travelMode": "driving",
        },
    )
    assert res2.status_code == 200
    data2 = res2.json()["data"]
    assert data2["distanceKm"] > 50.0

def test_western_ghats_copilot_road_trip_planner():
    res = client.post(
        "/api/v1/planner/chat",
        json={
            "message": "Plan a road trip to Mullayanagiri, Karnataka",
        },
    )
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Mullayanagiri"
