import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.planner_service import planner_service
from backend.app.services.intelligence.trip_intent import intent_extractor

client = TestClient(app)

# TEST 1: Generic Madurai request is NOT overridden by Arupadai Veedu or Pazhamudircholai
def test_madurai_generic_request_not_overridden():
    res = client.post("/api/v1/planner/chat", json={"message": "plan a bike to madurai"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["plannerState"]["destination"] == "Madurai"
    assert data["plannerState"]["transport"] == "motorcycle"
    assert data["plannerState"]["destination"] != "Pazhamudircholai Murugan Temple"
    assert data["plannerState"].get("trail") != "arupadai-veedu"
    assert "Arupadai Veedu" not in data["message"]

# TEST 2: Food request classification & typo tolerance ("madurau" -> "Madurai")
def test_food_request_classification_and_typo_tolerance():
    res = client.post("/api/v1/planner/chat", json={"message": "also want to taste madurau famous foods"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] in ["FOOD_DISCOVERY", "ADD_INTEREST"]
    assert data["plannerState"]["destination"] == "Madurai"
    assert "food" in data["plannerState"]["interests"]
    assert len(data.get("foodStops", [])) > 0

# TEST 3: Food spots query does not get treated as a literal place search
def test_food_spots_not_misclassified_as_place():
    res = client.post("/api/v1/planner/chat", json={"message": "include madurai food spots"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] in ["FOOD_DISCOVERY", "ADD_INTEREST"]
    assert data["plannerState"]["destination"] == "Madurai"
    assert "CLARIFICATION_REQUIRED" not in data["intent"]

# TEST 4: Adding a intermediate stop ("include aruppukottai")
def test_add_stop_aruppukottai():
    res = client.post("/api/v1/planner/chat", json={"message": "include aruppukottai"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] == "ADD_STOP"
    assert "Aruppukottai" in data["plannerState"]["waypoints"]

# TEST 5: Adding a destination stop ("add ooty")
def test_add_stop_ooty():
    res = client.post("/api/v1/planner/chat", json={"message": "add ooty"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] == "ADD_STOP"
    assert "Ooty" in data["plannerState"]["waypoints"]

# TEST 6: FULL REPRODUCTION SEQUENCE (Turn 1 to Turn 5)
def test_full_reproduction_conversation_sequence():
    # Turn 1: "plan a bike to madurai"
    r1 = client.post("/api/v1/planner/chat", json={"message": "plan a bike to madurai"})
    assert r1.status_code == 200
    cid = r1.json()["data"]["conversationId"]
    d1 = r1.json()["data"]

    assert d1["plannerState"]["destination"] == "Madurai"
    assert d1["plannerState"]["transport"] == "motorcycle"
    assert d1["plannerState"].get("trail") is None

    # Turn 2: "also want to taste madurau famous foods"
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "also want to taste madurau famous foods"})
    assert r2.status_code == 200
    d2 = r2.json()["data"]

    assert d2["conversationId"] == cid
    assert d2["intent"] == "FOOD_DISCOVERY"
    assert d2["plannerState"]["destination"] == "Madurai"
    assert "food" in d2["plannerState"]["interests"]

    # Turn 3: "include madurai food spots"
    r3 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "include madurai food spots"})
    assert r3.status_code == 200
    d3 = r3.json()["data"]

    assert d3["conversationId"] == cid
    assert d3["intent"] == "FOOD_DISCOVERY"
    assert d3["plannerState"]["destination"] == "Madurai"
    assert "CLARIFICATION_REQUIRED" not in d3["intent"]

    # Turn 4: "include aruppukottai"
    r4 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "include aruppukottai"})
    assert r4.status_code == 200
    d4 = r4.json()["data"]

    assert d4["conversationId"] == cid
    assert d4["intent"] == "ADD_STOP"
    assert "Aruppukottai" in d4["plannerState"]["waypoints"]
    assert d4["plannerState"]["destination"] == "Madurai"

    # Turn 5: "add ooty"
    r5 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "add ooty"})
    assert r5.status_code == 200
    d5 = r5.json()["data"]

    assert d5["conversationId"] == cid
    assert d5["intent"] == "ADD_STOP"
    assert "Ooty" in d5["plannerState"]["waypoints"]
    assert d5["plannerState"]["destination"] == "Madurai"
