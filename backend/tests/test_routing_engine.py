import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.routing import routing_service, RouteResult, RouteRequest

client = TestClient(app)

# TEST 1: Direct Routing Engine Calculation & GeoJSON LineString Validation
def test_routing_engine_direct_calculation():
    res = routing_service.calculate_route(
        origin_lat=13.0827,
        origin_lng=80.2707,
        destination_lat=9.6644,
        destination_lng=77.2653,
        profile="motorcycle"
    )
    assert isinstance(res, RouteResult)
    assert res.distance_km > 0
    assert res.duration_minutes > 0
    assert res.geometry["type"] == "LineString"
    assert len(res.geometry["coordinates"]) > 0
    assert res.provider == "OSRM Routing Engine"
    assert res.profile == "motorcycle"

# TEST 2: Invalid Coordinate Range Defense
def test_routing_engine_invalid_coordinates():
    from backend.app.core.exceptions import ValidationException
    with pytest.raises(ValidationException):
        routing_service.calculate_route(
            origin_lat=999.0,
            origin_lng=80.2707,
            destination_lat=9.6644,
            destination_lng=77.2653
        )

# TEST 3: Planner Endpoint Integration with Real Road Distance & Budget Audit
def test_planner_endpoint_road_distance_and_budget():
    res = client.post("/api/v1/planner/chat", json={"message": "Plan a one-day bike trip from Chennai to hills under 3000"})
    assert res.status_code == 200
    data = res.json()["data"]

    assert "route" in data
    assert data["route"]["distanceKm"] > 0
    assert data["route"]["durationMinutes"] > 0
    assert data["route"]["geometry"]["type"] == "LineString"
    assert "withinBudget" in data["costEstimate"]
    assert "total" in data["costEstimate"]
    assert data["costEstimate"]["budget"] == 3000.0
    assert data["provenance"]["route"] == "Routing Engine (OSRM)"
