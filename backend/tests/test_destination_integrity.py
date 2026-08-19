from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_explicit_destination_override_river_rafting_rishikesh():
    # Turn 1: Start with Arupadai Veedu / Madurai trip
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a trip to Madurai"})
    assert r1.status_code == 200
    cid = r1.json()["data"]["conversationId"]
    assert r1.json()["data"]["plannerState"]["destination"] == "Madurai"

    # Turn 2: Explicit River Rafting to Rishikesh override
    r2 = client.post("/api/v1/planner/chat", json={
        "conversationId": cid,
        "message": "Plan a River Rafting trip to Rishikesh, Uttarakhand"
    })
    assert r2.status_code == 200
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Rishikesh"
    assert data["plannerState"]["trail"] is None
    assert data["plannerState"]["waypoints"] == []
    assert "Thirupparankundram" not in data["message"]
    assert "Madurai" not in data["message"]
    assert data["route"]["distanceKm"] > 2000.0

def test_destination_switch_madurai_to_rishikesh():
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a bike trip to Madurai"})
    cid = r1.json()["data"]["conversationId"]

    r2 = client.post("/api/v1/planner/chat", json={
        "conversationId": cid,
        "message": "Plan a trip to Rishikesh"
    })
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Rishikesh"
    assert "Rishikesh" in data["message"]
    assert "Thirupparankundram" not in data["message"]

def test_destination_switch_rishikesh_to_ooty():
    r1 = client.post("/api/v1/planner/chat", json={"message": "Plan a River Rafting trip to Rishikesh"})
    cid = r1.json()["data"]["conversationId"]

    r2 = client.post("/api/v1/planner/chat", json={
        "conversationId": cid,
        "message": "Plan a trip to Ooty"
    })
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Ooty"
    assert "Ooty" in data["message"]
    assert "Rishikesh" not in data["message"]

def test_destination_sequence_switching():
    # Sequence: Madurai -> Rishikesh -> Ooty -> Kovalam
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a trip to Madurai"})
    cid = r1.json()["data"]["conversationId"]
    assert r1.json()["data"]["plannerState"]["destination"] == "Madurai"

    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a River Rafting trip to Rishikesh, Uttarakhand"})
    assert r2.json()["data"]["plannerState"]["destination"] == "Rishikesh"

    r3 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a trip to Ooty"})
    assert r3.json()["data"]["plannerState"]["destination"] == "Ooty"

    r4 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a Surfing trip to Kovalam"})
    assert r4.json()["data"]["plannerState"]["destination"] == "Kovalam"
