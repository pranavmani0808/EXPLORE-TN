from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_surfing_goa_intent_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a Surfing trip to Goa, Goa"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["plannerState"]["destination"] == "Goa"
    assert "Goa" in data["message"]
    assert "Thirupparankundram" not in data["message"]
    assert data["route"]["distanceKm"] > 0.0

def test_paragliding_bir_billing_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a Paragliding trip to Bir Billing, Himachal Pradesh"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["plannerState"]["destination"] == "Bir Billing"
    assert "Bir Billing" in data["message"]
    assert data["route"]["distanceKm"] > 0.0

def test_river_rafting_rishikesh_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a River Rafting trip to Rishikesh, Uttarakhand"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["plannerState"]["destination"] == "Rishikesh"
    assert "Rishikesh" in data["message"]
    assert data["route"]["distanceKm"] > 0.0
