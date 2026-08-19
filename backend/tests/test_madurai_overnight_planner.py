import pytest
from backend.app.services.planner_service import planner_service
from backend.app.services.intelligence.trip_intent import intent_extractor

def test_madurai_query_normalization():
    # 1. "a trip to chennai to madurai"
    i1 = intent_extractor.extract_intent("a trip to chennai to madurai")
    assert i1.origin == "Chennai"
    assert i1.destination == "Madurai"

    # 2. "trip from chennai to madurai"
    i2 = intent_extractor.extract_intent("trip from chennai to madurai")
    assert i2.origin == "Chennai"
    assert i2.destination == "Madurai"

    # 3. "chennai to madurai"
    i3 = intent_extractor.extract_intent("chennai to madurai")
    assert i3.origin == "Chennai"
    assert i3.destination == "Madurai"

def test_madurai_calibrated_distance_and_overnight():
    query = "trip from chennai to madurai at 11 pm"
    res = planner_service.process_chat_message(
        conversation_id="test-madurai-conv-001",
        user_message=query,
        trace_id="tr-test-madurai-01"
    )

    # 1. Assert Destination & Distance Calibration (NH44 ~925 km round-trip, NOT 1131 km)
    assert res["plannerState"]["origin"] == "Chennai"
    assert res["plannerState"]["destination"] == "Madurai"
    assert 900.0 <= res["route"]["distanceKm"] <= 950.0

    # 2. Assert Overnight Scheduling
    assert res["plannerState"]["overnightTravel"] is True
    assert res["plannerState"]["departureTime"] == "23:00"

    # 3. Assert Madurai POIs & Food in Timeline
    timeline_names = [t["name"] for t in res["timeline"]]
    assert "Meenakshi Amman Temple" in timeline_names
    assert "Madurai Special Lunch" in timeline_names
    assert any("Night Departure" in name for name in timeline_names)
