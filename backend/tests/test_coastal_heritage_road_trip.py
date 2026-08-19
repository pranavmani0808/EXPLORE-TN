from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_coastal_heritage_canonical_stops_registered():
    all_places = places_service.get_all_places()
    all_names = [p["name"] for p in all_places]

    required_stops = [
        "Chennai",
        "East Coast Road (ECR)",
        "Mahabalipuram",
        "Puducherry",
        "Pichavaram Mangrove Forest",
        "Tharangambadi",
        "Nagore",
        "Velankanni",
        "Thanjavur",
        "Karaikudi",
        "Pamban Bridge",
        "Rameswaram",
        "Dhanushkodi",
        "Kanniyakumari",
    ]

    for stop in required_stops:
        assert stop in all_names, f"Missing canonical stop '{stop}' in places_service"

def test_coastal_heritage_road_trip_planner_chat_resolution():
    prompt = (
        "Plan an ultimate Tamil Nadu coastal and heritage road trip from Chennai to Kanniyakumari via ECR, Mahabalipuram, "
        "Puducherry, Pichavaram, Tharangambadi, Nagore, Velankanni, Thanjavur, Karaikudi, Pamban Bridge, Rameswaram and Dhanushkodi."
    )
    res = client.post("/api/v1/planner/chat", json={"message": prompt})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] in ["Kanniyakumari", "Ultimate Coastal Road Trip"]
    assert data["route"]["distanceKm"] > 500.0

def test_coastal_heritage_destination_integrity_isolation():
    # Turn 1: Madurai Request
    res1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip to Madurai"})
    assert res1.status_code == 200
    cid = res1.json()["data"]["conversationId"]

    # Turn 2: Dhanushkodi Request in same session
    res2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a coastal trip to Dhanushkodi, Tamil Nadu"})
    assert res2.status_code == 200
    data2 = res2.json()["data"]

    assert data2["plannerState"]["destination"] == "Dhanushkodi"
    assert data2["plannerState"]["destination"] != "Madurai"
