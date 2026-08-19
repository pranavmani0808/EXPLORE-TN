import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.planner_service import planner_service
from backend.app.services.intelligence.destination_classifier import destination_classifier

client = TestClient(app)

def test_destination_classifier_profiles():
    madurai_profile = destination_classifier.classify_destination("Madurai")
    assert madurai_profile["destination"] == "Madurai"
    assert "TEMPLE" in madurai_profile["destinationTypes"]
    assert any(c["id"] == "temples" for c in madurai_profile["interests"])

    kodai_profile = destination_classifier.classify_destination("Kodaikanal")
    assert kodai_profile["destination"] == "Kodaikanal"
    assert "HILL_STATION" in kodai_profile["destinationTypes"]
    assert any(c["id"] == "waterfalls" for c in kodai_profile["interests"])

    rishi_profile = destination_classifier.classify_destination("Rishikesh")
    assert rishi_profile["destination"] == "Rishikesh"
    assert "ADVENTURE" in rishi_profile["destinationTypes"]
    assert any(c["id"] == "rafting" for c in rishi_profile["interests"])

def test_acceptance_1_madurai_discovery_flow():
    # User asks "Plan a trip inside Madurai"
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trip inside Madurai"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] == "DISCOVER_INTERESTS"
    assert "What would you like to explore in Madurai?" in data["message"]
    assert "suggestedCategories" in data
    assert len(data["suggestedCategories"]) >= 4
    categories = [c["id"] for c in data["suggestedCategories"]]
    assert "temples" in categories or "food" in categories

def test_acceptance_2_kodaikanal_discovery_flow():
    # User asks "Plan a trip inside Kodaikanal"
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trip inside Kodaikanal"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] == "DISCOVER_INTERESTS"
    assert "Kodaikanal" in data["message"]
    categories = [c["id"] for c in data["suggestedCategories"]]
    assert "viewpoints" in categories or "waterfalls" in categories

def test_acceptance_3_rishikesh_destination_integrity():
    # User asks "Plan a trip to Rishikesh for rafting"
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trip to Rishikesh for rafting"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["plannerState"]["destination"] == "Rishikesh"
    assert "Rishikesh" in data["message"]
    # Verify no Madurai or Thirupparankundram places are returned in recommendations
    for rec in data["recommendations"]:
        assert "Thirupparankundram" not in rec
        assert "Meenakshi" not in rec

def test_acceptance_4_madurai_temples_and_food_selection():
    # Turn 1
    r1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip inside Madurai"})
    cid = r1.json()["data"]["conversationId"]

    # Turn 2: User responds "Temples and food"
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Temples and food"})
    assert r2.status_code == 200
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Madurai"
    assert "food" in data["plannerState"]["interests"] or "temples" in data["plannerState"]["interests"]
    assert len(data["timeline"]) > 0

def test_acceptance_5_madurai_shopping_and_food_selection():
    # Turn 1
    r1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip inside Madurai"})
    cid = r1.json()["data"]["conversationId"]

    # Turn 2: User responds "Shopping and food"
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Shopping and food"})
    assert r2.status_code == 200
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Madurai"
    assert "shopping" in data["plannerState"]["interests"] or "food" in data["plannerState"]["interests"]

def test_acceptance_6_session_reset_on_new_destination():
    # Turn 1: Madurai
    r1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip inside Madurai"})
    cid = r1.json()["data"]["conversationId"]

    # Turn 2: User switches to Kodaikanal
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a trip to Kodaikanal"})
    data = r2.json()["data"]

    assert data["plannerState"]["destination"] == "Kodaikanal"
    assert "Kodaikanal" in data["message"]
