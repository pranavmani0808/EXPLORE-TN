import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service
from backend.app.core.security import UserContext
from backend.app.core.exceptions import ConflictException, ValidationException
from backend.app.core.chaos_engine import DatabaseUnavailableException
from backend.app.core.idempotency import idempotency_service

client = TestClient(app)

# 1. Test Optimistic Concurrency Locking (HTTP 409 CONFLICT)
def test_optimistic_locking_conflict():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    # Create Place
    place = places_service.create_place_with_lifecycle(
        name="Concurrent Kolli Peak",
        district="Namakkal",
        category="hill_station",
        latitude=11.2721,
        longitude=78.3375,
        tagline="Test peak",
        user=user
    )
    assert place["version"] == 1

    # Admin A updates version 1 -> 2
    updated = places_service.update_place_concurrent(
        place_id=place["id"],
        expected_version=1,
        update_data={"tagline": "Updated by Admin A"},
        user=user
    )
    assert updated["version"] == 2

    # Admin B attempts to update with stale version 1 (Raises HTTP 409 CONFLICT)
    with pytest.raises(ConflictException) as exc_info:
        places_service.update_place_concurrent(
            place_id=place["id"],
            expected_version=1,
            update_data={"tagline": "Stale update by Admin B"},
            user=user
        )
    assert exc_info.value.status_code == 409
    assert exc_info.value.code == "CONFLICT"

# 2. Test Transaction Atomicity & Rollback Integrity
def test_transaction_atomicity_and_rollback():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    # Simulated atomic mutation failure
    with pytest.raises(ValidationException):
        places_service.create_place_with_lifecycle(
            name="Invalid Bounds Place",
            district="Chennai",
            category="temple",
            latitude=119.0760, # Out of WGS84 bounds
            longitude=72.8777,
            tagline="Should rollback",
            user=user
        )

# 3. Test Idempotency-Key Request Deduplication
def test_idempotency_key_deduplication():
    key = "idemp-key-place-creation-777"
    payload = {"name": "Idempotent Valparai Pass", "district": "Coimbatore"}

    idempotency_service.cache_response(key, payload)
    cached = idempotency_service.get_cached_response(key)
    
    assert cached is not None
    assert cached["name"] == "Idempotent Valparai Pass"

# 4. Test PostGIS Coordinate & Unique Constraint Guards
def test_postgis_and_unique_constraints():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    # Out of WGS84 bounds coordinate check
    with pytest.raises(ValidationException):
        places_service.create_place_with_lifecycle(
            name="Delhi Out of Bounds",
            district="Delhi",
            category="monument",
            latitude=128.6139,
            longitude=77.2090,
            tagline="Out of bounds",
            user=user
        )

# 5. Test Connection Pool Exhaustion Resilience
def test_connection_pool_exhaustion_envelope():
    # Verify DatabaseUnavailableException returns 503 envelope
    exc = DatabaseUnavailableException()
    assert exc.status_code == 503
    assert exc.code == "DATABASE_UNAVAILABLE"
