import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service
from backend.app.services.trails_service import trails_service
from backend.app.services.planner_service import planner_service

client = TestClient(app)

# TEST 1: Trail definition and 6 destinations resolve
def test_arupadai_veedu_trail_exists_and_resolves():
    trail = trails_service.get_trail_by_slug("arupadai-veedu")
    assert trail["slug"] == "arupadai-veedu"
    assert trail["name"] == "Arupadai Veedu Trail"
    assert len(trail["destinations"]) == 6

    # Verify all 6 are published and verified
    for place in trail["destinations"]:
        assert place["status"] == "PUBLISHED"
        assert place["verified"] is True

# TEST 2: Trip Copilot recognizes Arupadai Veedu request
def test_planner_arupadai_veedu_intent_recognition():
    res = client.post("/api/v1/planner/chat", json={"message": "I want to visit all six Arupadai Veedu temples from Chennai"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["intent"] == "ARUPADAI_VEEDU_TRAIL"
    assert data["plannerState"]["trail"] == "arupadai-veedu"
    assert data["plannerState"]["origin"] == "Chennai"
    assert len(data["timeline"]) >= 6

# TEST 3: Multi-turn conversation state retention
def test_planner_multi_turn_arupadai_veedu():
    # Turn 1: "Plan an Arupadai Veedu trip from Chennai"
    r1 = client.post("/api/v1/planner/chat", json={"message": "Plan an Arupadai Veedu trip from Chennai"})
    assert r1.status_code == 200
    cid = r1.json()["data"]["conversationId"]
    assert r1.json()["data"]["plannerState"]["trail"] == "arupadai-veedu"

    # Turn 2: "Make it 4 days"
    r2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Make it 4 days"})
    assert r2.status_code == 200
    d2 = r2.json()["data"]
    assert d2["conversationId"] == cid
    assert d2["plannerState"]["durationDays"] == 4
    assert d2["plannerState"]["trail"] == "arupadai-veedu"
    assert d2["plannerState"]["origin"] == "Chennai"

    # Turn 3: "Keep the budget under ₹12000"
    r3 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Keep the budget under ₹12000"})
    assert r3.status_code == 200
    d3 = r3.json()["data"]
    assert d3["conversationId"] == cid
    assert d3["plannerState"]["budget"] == 12000.0
    assert d3["plannerState"]["durationDays"] == 4
    assert d3["plannerState"]["trail"] == "arupadai-veedu"

    # Turn 4: "Make it a motorcycle trip"
    r4 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Make it a motorcycle trip"})
    assert r4.status_code == 200
    d4 = r4.json()["data"]
    assert d4["conversationId"] == cid
    assert d4["plannerState"]["transport"] == "motorcycle"
    assert d4["plannerState"]["budget"] == 12000.0
    assert d4["plannerState"]["trail"] == "arupadai-veedu"

# TEST 4: OSRM Route Data and Provenance Verification
def test_planner_osrm_route_and_provenance():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan the six Murugan temples within ₹10000"})
    data = res.json()["data"]

    assert "route" in data
    assert data["route"]["provider"] == "OSRM Routing Engine"
    assert data["route"]["distanceKm"] > 800.0
    assert len(data["route"]["geometry"]["coordinates"]) > 0

    assert data["provenance"]["destination"] == "PostgreSQL/PostGIS"
    assert data["provenance"]["route"] == "Routing Engine (OSRM)"
    assert data["provenance"]["cost"] == "Deterministic Cost Engine"
    assert data["provenance"]["webEvidence"] == "OpenSERP"
