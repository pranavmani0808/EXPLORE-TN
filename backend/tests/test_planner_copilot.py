import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.planner_service import planner_service

client = TestClient(app)

# TEST A: Greeting Intent ("hi") -> Natural Greeting, NO Itinerary Mutation
def test_copilot_greeting_intent():
    res = client.post("/api/v1/planner/chat", json={"message": "hi"})
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["intent"] == "GREETING"
    assert "Hi!" in body["data"]["message"]
    assert len(body["data"]["timeline"]) == 0

# TEST B: "plan a trip from chennai a one day plan" -> Constraint Extraction
def test_copilot_plan_trip_intent():
    res = client.post("/api/v1/planner/chat", json={"message": "plan a trip from chennai a one day plan"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]
    
    assert data["plannerState"]["origin"] == "Chennai"
    assert data["plannerState"]["durationDays"] == 1
    assert len(data["timeline"]) > 0

# TEST C: Multi-Turn Interest Accumulation ("hills and waterfalls")
def test_copilot_multi_turn_interests_accumulation():
    # Turn 1
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a trip from chennai"})
    cid = r1.json()["data"]["conversationId"]

    # Turn 2
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "hills and waterfalls"})
    data = r2.json()["data"]

    assert data["plannerState"]["origin"] == "Chennai"
    assert "hills" in data["plannerState"]["interests"]
    assert "waterfalls" in data["plannerState"]["interests"]

# TEST D: Budget & Transport Constraint Extraction ("bike under 3000")
def test_copilot_budget_transport_extraction():
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a trip from chennai"})
    cid = r1.json()["data"]["conversationId"]

    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "bike under 3000"})
    data = r2.json()["data"]

    assert data["plannerState"]["transport"] == "motorcycle"
    assert data["plannerState"]["budget"] == 3000.0
    assert "fuelCost" in data["costEstimate"]
    assert "@ 32.0 km/L" in data["costEstimate"]["assumptions"]

# TEST E: Duration Modification ("make it two days")
def test_copilot_duration_modification():
    r1 = client.post("/api/v1/planner/chat", json={"message": "one day trip from chennai"})
    cid = r1.json()["data"]["conversationId"]
    assert r1.json()["data"]["plannerState"]["durationDays"] == 1

    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "make it two days"})
    data = r2.json()["data"]

    assert data["plannerState"]["origin"] == "Chennai"
    assert data["plannerState"]["durationDays"] == 2

# TEST F: Auditable Data Provenance Verification
def test_copilot_data_provenance():
    res = client.post("/api/v1/planner/chat", json={"message": "plan a trip from chennai"})
    data = res.json()["data"]

    assert "provenance" in data
    assert data["provenance"]["destination"] == "PostgreSQL places"
    assert data["provenance"]["route"] == "haversine routing engine"
    assert data["provenance"]["cost"] == "deterministic cost engine"
