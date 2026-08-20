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
        "Vandiyur Mariamman Teppakulam",
        "Vaigai Riverfront",
    ]

    for dest in required_madurai_destinations:
        assert dest in all_names, f"Missing canonical destination '{dest}' in places_service"

def test_explore_madurai_city_planner_chat_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trip from Madurai to Alagar Kovil, Tamil Nadu"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Alagar Kovil"

def test_explore_madurai_city_destination_switching_integrity():
    # Turn 1: Madurai to Thirupparankundram
    res1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip from Madurai to Thirupparankundram"})
    assert res1.status_code == 200
    cid = res1.json()["data"]["conversationId"]
    assert res1.json()["data"]["plannerState"]["destination"] == "Thirupparankundram Murugan Temple"

    # Turn 2: Switch to Thirumalai Nayakkar Mahal in same conversation session
    res2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Change my destination to Thirumalai Nayakkar Mahal"})
    assert res2.status_code == 200
    data2 = res2.json()["data"]

    assert data2["plannerState"]["destination"] in ["Thirumalai Nayakkar Palace", "Thirumalai Nayakkar Mahal"]
    assert data2["plannerState"]["destination"] != "Thirupparankundram Murugan Temple"
