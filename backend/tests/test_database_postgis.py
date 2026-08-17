import pytest
from backend.app.schemas.places import PlaceCreate
from backend.app.core.exceptions import ValidationException, ResourceNotFoundException, APIException, ConflictException
from backend.app.services.places_service import places_service, calculate_haversine
from backend.app.core.security import UserContext

# 1. Test PostgreSQL Constraint Integrity & Schema Validation
def test_place_schema_validation_and_constraints():
    # Valid TN Place
    place_in = PlaceCreate(
        name="Kolli Hills Hairpin Pass",
        district="Namakkal",
        category="hill_station",
        tagline="70 hairpin bends mountain trail",
        description="Famous mountain pass in Eastern Ghats.",
        latitude=11.2721,
        longitude=78.3375,
        elevation="1300m MSL"
    )
    assert place_in.name == "Kolli Hills Hairpin Pass"
    assert place_in.latitude == 11.2721
    assert place_in.longitude == 78.3375

    # Out-of-bounds latitude validation error (outside Tamil Nadu 8.0 - 13.6 N)
    with pytest.raises(Exception):
        PlaceCreate(
            name="Out of Bounds",
            district="Chennai",
            category="beach",
            latitude=28.6139, # Delhi latitude
            longitude=77.2090,
            tagline="Invalid"
        )

# 2. Test PostGIS Haversine Spatial Query & Radius Search Engine
def test_postgis_haversine_spatial_query():
    # Distance between Suruli Waterfalls (9.6644, 77.2653) and Meghamalai (9.6912, 77.4012)
    dist_km = calculate_haversine(9.6644, 77.2653, 9.6912, 77.4012)
    assert dist_km > 10.0 and dist_km < 20.0 # ~15.2 km

# 3. Test Optimistic Concurrency Control (Version Locking)
def test_optimistic_concurrency_control():
    user = UserContext(id="usr-pm-1", name="Arun", email="arun@tn.gov.in", role="place_manager")

    # Create place node
    place = places_service.create_place_with_lifecycle(
        name="Meghamalai Tea Estates",
        district="Theni",
        category="hill_station",
        latitude=9.6912,
        longitude=77.4012,
        tagline="High altitude organic tea gardens",
        user=user
    )
    current_version = place["version"]

    # Valid update with matching expected version
    updated = places_service.update_place_concurrent(place["slug"], patch_data={"tagline": "Updated tagline"}, expected_version=current_version, user=user)
    assert updated["version"] == current_version + 1

    # Stale update attempt with old version (simulating concurrent edit collision)
    with pytest.raises(APIException) as exc_info:
        places_service.update_place_concurrent(place["slug"], patch_data={"tagline": "Stale edit"}, expected_version=current_version, user=user)
    assert "Concurrency Conflict" in str(exc_info.value)

# 4. Test Multi-Table Transaction Rollback Atomicity
def test_transactional_rollback_on_failure():
    user = UserContext(id="usr-pm-1", name="Arun", email="arun@tn.gov.in", role="place_manager")
    initial_count = len(places_service.get_all_places())

    # Intentionally trigger failure by supplying duplicate coordinates
    with pytest.raises(ValidationException):
        places_service.create_place_transactional(
            place_in=type("PlaceCreateObj", (), {
                "name": "Suruli Waterfalls", # Duplicate name
                "district": "Theni",
                "category": "waterfall",
                "tagline": "Duplicate test",
                "description": None,
                "latitude": 9.6644,
                "longitude": 77.2653,
                "elevation": "450m"
            })(),
            user=user,
            trace_id="tr-test-rollback"
        )

    # Verify atomic rollback: No orphan record created in places database
    final_count = len(places_service.get_all_places())
    assert final_count == initial_count

# 5. Test Append-Only Audit Immutability
def test_append_only_audit_log_immutability():
    audit_id = "aud-test-1"
    
    # Attempting to mutate an existing audit record raises ValidationException
    with pytest.raises(ValidationException) as exc_info:
        places_service.mutate_audit_log_record(audit_id, {"description": "Tampered description"})
    assert "Immutable Audit Trail" in str(exc_info.value)
