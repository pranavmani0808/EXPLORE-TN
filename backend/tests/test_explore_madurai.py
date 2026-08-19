from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_explore_madurai_canonical_destinations_registered():
    all_places = places_service.get_all_places()
    all_names = [p["name"] for p in all_places]

    required_madurai_destinations = [
        "Meenakshi Amman Temple",
        "Thirupparankundram Murugan Temple",
        "Alagar Kovil",
        "Pazhamudircholai Murugan Temple",
        "Samanar Hills",
        "Gandhi Memorial Museum",
        "Thirumalai Nayakkar Mahal",
        "Vaigai Dam",
        "Kumbakkarai Falls",
        "Sirumalai",
        "Thirumangalam / Rural Madurai",
    ]

    for dest in required_madurai_destinations:
        assert dest in all_names, f"Missing canonical destination '{dest}' in places_service"

def test_explore_madurai_sirumalai_planner_chat_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trip from Madurai to Sirumalai, Tamil Nadu"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Sirumalai"
    assert data["route"]["distanceKm"] > 20.0

def test_explore_madurai_destination_switching_integrity():
    # Turn 1: Madurai to Thirupparankundram
    res1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip from Madurai to Thirupparankundram"})
    assert res1.status_code == 200
    cid = res1.json()["data"]["conversationId"]
    assert res1.json()["data"]["plannerState"]["destination"] == "Thirupparankundram Murugan Temple"

    # Turn 2: Switch to Kumbakkarai Falls in same conversation session
    res2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Change my destination to Kumbakkarai Falls"})
    assert res2.status_code == 200
    data2 = res2.json()["data"]

    assert data2["plannerState"]["destination"] == "Kumbakkarai Falls"
    assert data2["plannerState"]["destination"] != "Thirupparankundram Murugan Temple"
    assert data2["route"]["distanceKm"] > 50.0
