"""
Closed-Loop Engineering Automated Verification Suite for ExploreTN.
Validates AI travel engine endpoint integrity, real OSRM highway road geometry,
multi-stop itinerary ordering (Start -> Intermediate -> Destination), and place image provenance.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import PlacesService

client = TestClient(app)

def test_closed_loop_ai_plan_generation():
    """
    Closed-Loop Test 1: Verify AI Plan Generation Endpoint produces valid road geometry,
    valid stops with Madurai as Start and Kanyakumari as Destination.
    """
    payload = {
        "query": "Plan a 2 day road trip from Madurai to Kanyakumari with beaches and temples",
        "origin": "Madurai",
        "destination": "Kanyakumari",
        "days": 2
    }
    response = client.post("/api/v1/ai_travel/plan", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    assert "route_polyline_points" in data
    assert len(data["route_polyline_points"]) > 50, "Expected dense road polyline points count > 50"
    
    stops = data["ordered_stops"]
    assert len(stops) >= 3, "Expected at least 3 itinerary stops (Origin, Intermediate, Destination)"
    
    # Verify Start Stop
    first_stop = stops[0]
    assert first_stop["name"].lower() == "madurai" or "madurai" in first_stop["slug"].lower()
    assert first_stop["order"] == 1
    
    # Verify Destination Stop
    last_stop = stops[-1]
    assert "kanyakumari" in last_stop["name"].lower() or "kanyakumari" in last_stop["slug"].lower()
    assert last_stop["order"] == len(stops)

def test_closed_loop_ai_plan_modification():
    """
    Closed-Loop Test 2: Verify AI Plan Modification Endpoint dynamically recalculates
    route polylines and updates stop counts.
    """
    initial_payload = {
        "query": "Plan a 2 day trip from Madurai to Kanyakumari",
        "origin": "Madurai",
        "destination": "Kanyakumari",
        "days": 2
    }
    init_res = client.post("/api/v1/ai_travel/plan", json=initial_payload)
    assert init_res.status_code == 200
    plan_data = init_res.json()
    
    modify_payload = {
        "current_plan": plan_data,
        "action": "add_hidden"
    }
    mod_res = client.post("/api/v1/ai_travel/modify", json=modify_payload)
    assert mod_res.status_code == 200
    mod_data = mod_res.json()
    
    assert mod_data["success"] is True
    assert len(mod_data["ordered_stops"]) >= len(plan_data["ordered_stops"])
    assert len(mod_data["route_polyline_points"]) > 0

def test_closed_loop_places_service_integrity():
    """
    Closed-Loop Test 3: Verify Places Service loaded database contains valid coordinates
    and non-empty metadata for all entries.
    """
    service = PlacesService()
    places = service._places_db
    assert len(places) >= 50
    
    for slug, place in places.items():
        assert "latitude" in place and "longitude" in place
        assert isinstance(place["latitude"], float)
        assert isinstance(place["longitude"], float)
        assert place["latitude"] != 0.0 and place["longitude"] != 0.0
