"""
Automated unit & integration test suite for AI Travel Intelligence Engine.
Tests intent parsing, PostGIS spatial queries, corridor search, ranking,
itinerary construction, plan modification, and API routes.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ai.schemas import (
    AITravelPlanRequest, AIModifyPlanRequest, IntentType, StructuredTripIntent
)
from backend.app.ai.intent_parser import IntentParser
from backend.app.ai.tools import (
    resolve_destination, search_places_near_location, search_places_along_route, calculate_haversine
)
from backend.app.ai.ranking import RankingEngine
from backend.app.ai.itinerary import ItineraryBuilder
from backend.app.ai.travel_agent import AITravelAgent

client = TestClient(app)

@pytest.mark.anyio
async def test_intent_parser_rule_based():
    query = "Plan a 2 day trip from Madurai to Kanyakumari with beaches and temples"
    intent = await IntentParser.parse_intent(query)

    assert intent is not None
    assert intent.intent_type == IntentType.ROUTE_PLANNING
    assert intent.origin == "Madurai"
    assert intent.destination == "Kanyakumari"
    assert intent.days == 2
    assert "coastal" in intent.categories or "temple" in intent.categories

def test_resolve_destination():
    res_madurai = resolve_destination("Madurai")
    assert res_madurai is not None
    assert res_madurai['name'] == "Madurai"
    assert abs(res_madurai['lat'] - 9.9252) < 0.1

    res_kanyakumari = resolve_destination("Kanyakumari")
    assert res_kanyakumari is not None
    assert res_kanyakumari['name'] == "Kanyakumari"

def test_postgis_radius_and_corridor_search():
    near_madurai = search_places_near_location(9.9252, 78.1198, radius_km=50.0)
    assert len(near_madurai) > 0

    along_route = search_places_along_route(
        origin_lat=9.9252, origin_lng=78.1198,
        dest_lat=8.0883, dest_lng=77.5385,
        corridor_km=50.0
    )
    assert len(along_route) > 0

def test_ranking_engine():
    intent = StructuredTripIntent(
        intent_type=IntentType.ROUTE_PLANNING,
        raw_query="Madurai to Kanyakumari",
        origin="Madurai",
        destination="Kanyakumari",
        categories=["coastal", "temple"]
    )
    candidates = search_places_near_location(9.9252, 78.1198, radius_km=50.0)
    ranked = RankingEngine.rank_candidates(candidates, intent)

    assert len(ranked) == len(candidates)
    assert ranked[0].ranking_score >= ranked[-1].ranking_score

@pytest.mark.anyio
async def test_travel_agent_orchestrator():
    req = AITravelPlanRequest(
        query="Plan a 2 day trip from Madurai to Kanyakumari"
    )
    response = await AITravelAgent.generate_plan(req)

    assert response.success is True
    assert response.intent_type == IntentType.ROUTE_PLANNING
    assert len(response.ordered_stops) > 0
    assert response.total_distance_km > 0.0

@pytest.mark.anyio
async def test_travel_agent_modify_plan():
    req = AITravelPlanRequest(
        query="Plan a trip to Kanyakumari"
    )
    initial_plan = await AITravelAgent.generate_plan(req)
    initial_count = len(initial_plan.ordered_stops)

    if initial_count > 1:
        target_stop_id = initial_plan.ordered_stops[0].place_id
        mod_req = AIModifyPlanRequest(
            current_plan=initial_plan.model_dump(),
            action="remove_stop",
            target_stop_id=target_stop_id
        )
        mod_response = await AITravelAgent.modify_plan(mod_req)

        assert len(mod_response.ordered_stops) == initial_count - 1

def test_api_v1_ai_travel_endpoints():
    resp_plan = client.post("/api/v1/ai_travel/plan", json={
        "query": "Plan a trip from Madurai to Kanyakumari",
        "days": 2
    })
    assert resp_plan.status_code == 200
    data_plan = resp_plan.json()
    assert data_plan["success"] is True
    assert len(data_plan["ordered_stops"]) > 0

    resp_disc = client.post("/api/v1/ai_travel/discover", json={
        "query": "Kanyakumari",
        "radius_km": 50
    })
    assert resp_disc.status_code == 200
    data_disc = resp_disc.json()
    assert data_disc["success"] is True
