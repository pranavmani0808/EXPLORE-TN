from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_hill_escapes_canonical_destinations_registered():
    all_places = places_service.get_all_places()
    all_names = [p["name"] for p in all_places]

    required_hill_stations = [
        "Horsley Hills",
        "Yelagiri",
        "Yercaud",
        "Kolli Hills",
        "Sirumalai",
        "Kodaikanal",
        "Palani Hills",
        "Kotagiri",
        "Coonoor",
    ]

    for hill in required_hill_stations:
        assert hill in all_names, f"Missing canonical hill destination '{hill}' in places_service"

def test_hill_escapes_yelagiri_planner_chat_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a road trip from Chennai to Yelagiri, Tamil Nadu"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Yelagiri"
    assert data["route"]["distanceKm"] > 150.0

def test_hill_escapes_origin_and_destination_switching_integrity():
    # Turn 1: Chennai to Yelagiri
    res1 = client.post("/api/v1/planner/chat", json={"message": "Plan a road trip from Chennai to Yelagiri"})
    assert res1.status_code == 200
    cid = res1.json()["data"]["conversationId"]
    assert res1.json()["data"]["plannerState"]["destination"] == "Yelagiri"

    # Turn 2: Switch to Coonoor in same conversation session
    res2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Actually change my destination to Coonoor"})
    assert res2.status_code == 200
    data2 = res2.json()["data"]

    assert data2["plannerState"]["destination"] == "Coonoor"
    assert data2["plannerState"]["destination"] != "Yelagiri"
    assert data2["route"]["distanceKm"] > 400.0
