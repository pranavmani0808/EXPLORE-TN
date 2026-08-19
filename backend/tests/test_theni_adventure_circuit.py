from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service

client = TestClient(app)

def test_theni_canonical_places_registration():
    all_places = places_service.get_all_places()
    theni_places = [p for p in all_places if p.get("district") == "Theni"]
    
    assert len(theni_places) >= 9
    theni_names = [p["name"] for p in theni_places]
    
    assert "Meghamalai" in theni_names
    assert "Suruli Falls" in theni_names
    assert "Vineyard Experience" in theni_names
    assert "Ellapatti River" in theni_names
    assert "Chinna Suruli" in theni_names
    assert "Kumbakkarai Falls" in theni_names
    assert "Thottipalam" in theni_names
    assert "Vaigai Dam" in theni_names
    assert "Kurangani to Top Station Trek" in theni_names

def test_theni_meghamalai_planner_chat_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a nature trip to Meghamalai, Theni, Tamil Nadu"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["intent"] in ["PLAN_TRIP", "RECOMMENDATION"]
    assert data["plannerState"]["destination"] == "Meghamalai"
    assert data["route"]["distanceKm"] > 0.0
    assert "Madurai" not in data["plannerState"]["destination"]

def test_theni_kurangani_trekking_planner_resolution():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a trekking trip from Kurangani to Top Station, Theni, Tamil Nadu"})
    assert res.status_code == 200
    body = res.json()
    data = body["data"]

    assert data["plannerState"]["destination"] in ["Top Station", "Kurangani to Top Station Trek"]
    assert data["route"]["distanceKm"] > 0.0

def test_theni_destination_integrity_no_madurai_leakage():
    # Turn 1: Madurai Request
    res1 = client.post("/api/v1/planner/chat", json={"message": "Plan a trip to Madurai"})
    assert res1.status_code == 200
    cid = res1.json()["data"]["conversationId"]

    # Turn 2: Theni Suruli Falls Request in same session
    res2 = client.post("/api/v1/planner/chat", json={"conversationId": cid, "message": "Plan a trip to Suruli Falls, Theni"})
    assert res2.status_code == 200
    data2 = res2.json()["data"]

    assert data2["plannerState"]["destination"] == "Suruli Falls"
    assert data2["plannerState"]["destination"] != "Madurai"
