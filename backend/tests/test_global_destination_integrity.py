import pytest
import math
from backend.app.services.places_service import places_service

def test_canonical_places_uniqueness_and_validity():
    """Verify that all canonical places have valid WGS84 coordinates and unique IDs."""
    places = places_service.get_all_places()
    assert len(places) >= 50, f"Expected at least 50 places, found {len(places)}"

    seen_ids = set()
    seen_slugs = set()

    for p in places:
        # Check ID & Slug uniqueness
        assert p["id"] not in seen_ids, f"Duplicate place ID: {p['id']}"
        assert p["slug"] not in seen_slugs, f"Duplicate place slug: {p['slug']}"
        seen_ids.add(p["id"])
        seen_slugs.add(p["slug"])

        # Check WGS84 Coordinate Integrity
        lat = p["latitude"]
        lng = p["longitude"]
        assert isinstance(lat, (int, float)), f"Invalid latitude type for {p['slug']}"
        assert isinstance(lng, (int, float)), f"Invalid longitude type for {p['slug']}"
        assert -90.0 <= lat <= 90.0, f"Latitude out of bounds for {p['slug']}: {lat}"
        assert -180.0 <= lng <= 180.0, f"Longitude out of bounds for {p['slug']}: {lng}"
        assert not (lat == 0.0 and lng == 0.0), f"Dummy (0,0) coordinates detected for {p['slug']}"

def test_theni_circuit_destinations_spatial_distinctness():
    """Verify that all Theni circuit stops have geographically distinct coordinates."""
    theni_place_ids = [
        "suruli-waterfalls",
        "chinna-suruli",
        "ellapatti-river",
        "kumbakkarai-falls",
        "thottipalam",
        "vaigai-dam",
        "meghamalai",
        "kurangani-top-station",
        "cumbum-vineyard",
        "theni"
    ]

    resolved_coords = []
    for pid in theni_place_ids:
        p = places_service.get_place_by_id_or_slug(pid)
        resolved_coords.append((p["slug"], p["latitude"], p["longitude"]))

    # Verify no two distinct places share the exact same lat/lng
    for i in range(len(resolved_coords)):
        for j in range(i + 1, len(resolved_coords)):
            slug1, lat1, lng1 = resolved_coords[i]
            slug2, lat2, lng2 = resolved_coords[j]

            # Calculate Haversine distance
            dlat = math.radians(lat2 - lat1)
            dlng = math.radians(lng2 - lng1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2)**2
            dist_km = 6371 * 2 * math.atan2(math.sqrt(a), Math_sqrt_fallback := math.sqrt(1 - a))

            assert dist_km > 0.5, f"Places '{slug1}' and '{slug2}' are unexpectedly identical in coordinates (dist={dist_km:.2f} km)"

def test_out_of_state_place_sanity():
    """Verify that out-of-state destinations retain their actual state & WGS84 coordinates."""
    # Horsley Hills -> Andhra Pradesh
    horsley = places_service.get_place_by_id_or_slug("horsley-hills")
    assert horsley["district"] == "Chittoor"
    assert horsley["latitude"] == 13.6608
    assert horsley["longitude"] == 78.397

    # Mullayanagiri -> Karnataka
    mullayanagiri = places_service.get_place_by_id_or_slug("mullayanagiri")
    assert mullayanagiri["district"] == "Chikkamagaluru"
    assert mullayanagiri["latitude"] == 13.3908
    assert mullayanagiri["longitude"] == 75.7214

    # Agumbe -> Karnataka
    agumbe = places_service.get_place_by_id_or_slug("agumbe")
    assert agumbe["district"] == "Shivamogga"
    assert agumbe["latitude"] == 13.5028
    assert agumbe["longitude"] == 75.0931

def test_request_isolation_and_no_stale_leakage():
    """Verify backend places service get_all_places returns isolated data structures."""
    places1 = places_service.get_all_places()
    places2 = places_service.get_all_places()
    assert len(places1) == len(places2)
    assert places1 is not places2 # Different list instance
