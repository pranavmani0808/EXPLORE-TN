import pytest
from backend.app.services.places_service import places_service
from backend.app.services.intelligence.destination_classifier import destination_classifier
from backend.app.services.planner_service import planner_service

def test_zanskar_river_kayaking_resolution():
    # 1. Test "Zanskar River"
    r1 = places_service.resolve_destination("Zanskar River")
    assert r1["confidence"] in ["HIGH", "MEDIUM"]
    assert r1["canonicalName"] == "Zanskar River"
    assert r1["state"] == "Ladakh"
    assert r1["latitude"] == 33.8689
    assert r1["longitude"] == 76.9200

    # 2. Test "Zanskar kayaking"
    r2 = places_service.resolve_destination("Zanskar kayaking")
    assert r2["confidence"] in ["HIGH", "MEDIUM"]
    assert r2["canonicalName"] == "Zanskar River"
    assert r2["extractedActivity"] == "kayaking"

    # 3. Test Planner Chat execution with Zanskar River query
    res = planner_service.process_chat_message(
        conversation_id="conv-zanskar-01",
        user_message="Plan a kayaking trip to Zanskar River, Ladakh",
        trace_id="tr-test-zanskar"
    )
    assert res["plannerState"]["destination"] == "Zanskar River"
    assert "Zanskar River" in res["recommendations"] or "Zanskar River" in res["message"] or res["decisionFacts"]["destinationMatch"] is True

def test_rishikesh_rafting_resolution():
    r = places_service.resolve_destination("Rishikesh rafting")
    assert r["confidence"] in ["HIGH", "MEDIUM"]
    assert r["canonicalName"] == "Rishikesh"
    assert r["extractedActivity"] == "rafting"
    assert r["state"] == "Uttarakhand"

def test_munnar_tea_plantations_resolution():
    r = places_service.resolve_destination("Munnar tea plantations")
    assert r["confidence"] in ["HIGH", "MEDIUM"]
    assert r["canonicalName"] == "Munnar"

def test_madurai_temples_and_food_resolution():
    # 1. "Meenakshi temple"
    r1 = places_service.resolve_destination("Meenakshi temple")
    assert r1["confidence"] in ["HIGH", "MEDIUM"]
    assert r1["canonicalName"] == "Meenakshi Amman Temple"

    # 2. "Meenakshi Amman"
    r2 = places_service.resolve_destination("Meenakshi Amman")
    assert r2["confidence"] in ["HIGH", "MEDIUM"]
    assert r2["canonicalName"] == "Meenakshi Amman Temple"

    # 3. "food in Madurai"
    r3 = places_service.search_places_by_category_and_location("Madurai", category="food")
    assert r3["resolvedDestination"]["canonicalName"] == "Madurai"

def test_suruli_falls_and_theni_waterfalls_resolution():
    # 1. "Suruli Falls"
    r1 = places_service.resolve_destination("Suruli Falls")
    assert r1["confidence"] in ["HIGH", "MEDIUM"]
    assert r1["canonicalName"] in ["Suruli Falls", "Suruli Waterfalls"]

    # 2. "Theni waterfalls"
    r2 = places_service.search_places_by_category_and_location("Theni", category="waterfall")
    assert r2["resolvedDestination"]["canonicalName"] == "Theni"
    assert len(r2["nearbyPlaces"]) > 0

def test_kodaikanal_viewpoints_resolution():
    r = places_service.resolve_destination("Kodaikanal viewpoints")
    assert r["confidence"] in ["HIGH", "MEDIUM"]
    assert r["canonicalName"] == "Kodaikanal"

def test_national_destinations_coverage():
    destinations = ["Agumbe", "Mullayanagiri", "Chennai to Pondicherry", "Chennai to Kanyakumari"]
    for dest in destinations:
        r = places_service.resolve_destination(dest)
        assert r["confidence"] in ["HIGH", "MEDIUM"]

def test_nearby_places_haversine_search():
    # Find places within 50km of Madurai (9.9252, 78.1198)
    nearby = places_service.find_nearby_places(9.9252, 78.1198, radius_km=50.0)
    assert len(nearby) > 0
    # Every place should have a calculated distanceKm field
    for p in nearby:
        assert "distanceKm" in p
        assert p["distanceKm"] <= 50.0
