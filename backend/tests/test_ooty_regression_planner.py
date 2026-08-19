import pytest
from backend.app.services.planner_service import planner_service
from backend.app.services.intelligence.trip_intent import intent_extractor

def test_ooty_destination_extraction():
    query = "plan a trip to ooty from chennai through madurai"
    intent = intent_extractor.extract_intent(query)
    
    assert intent.origin == "Chennai"
    assert intent.destination == "Ooty"
    assert "Madurai" in intent.waypoints
    assert intent.durationDays == 1

def test_ooty_planner_service_destination_integrity():
    query = "plan a trip to ooty from chennai through madurai"
    res = planner_service.process_chat_message(
        conversation_id="test-ooty-conv-001",
        user_message=query,
        trace_id="tr-test-ooty-01"
    )

    # 1. Assert Destination Integrity
    assert res["plannerState"]["destination"] == "Ooty"
    assert res["plannerState"]["origin"] == "Chennai"
    assert "Madurai" in res["plannerState"]["waypoints"]
    assert res["decisionFacts"]["requestedDestination"] == "Ooty"
    assert res["decisionFacts"]["resolvedDestination"] == "Ooty"
    assert res["decisionFacts"]["destinationMatch"] is True

    # 2. Assert Destination MUST NOT be replaced with Suruli Waterfalls
    assert "Suruli Waterfalls" not in res["message"]
    assert "Ooty" in res["message"]

    # 3. Assert Feasibility Warning for 1-day 24h+ trip
    assert res["validation"]["durationFeasible"] is False
    assert len(res["validation"]["warnings"]) > 0
    assert "⚠️ Feasibility Alert" in res["message"]

def test_unknown_destination_clarification_prompt():
    query = "plan a trip to unknownplace123 from chennai"
    res = planner_service.process_chat_message(
        conversation_id="test-unknown-conv-002",
        user_message=query,
        trace_id="tr-test-unknown-02"
    )

    assert res["intent"] == "CLARIFICATION_REQUIRED"
    assert "I couldn't confidently locate 'Unknownplace123'" in res["message"]
    assert res["decisionFacts"]["destinationMatch"] is False
