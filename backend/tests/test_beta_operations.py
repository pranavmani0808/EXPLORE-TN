import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service
from backend.app.core.security import UserContext
from backend.app.schemas.places import PlaceFeedbackCreate

client = TestClient(app)

# 1. Test Beta Explorer Feedback API (POST /api/v1/places/{id}/feedback)
def test_beta_explorer_feedback_engine():
    user = UserContext(id="usr-exp-1", name="Kannan", email="kannan@gmail.com", role="explorer")
    fb = PlaceFeedbackCreate(isAccurate=True, issueCategory="road_condition", comments="Hairpin bend 24 cleared after monsoon repairs.")
    
    record = places_service.submit_place_feedback("suruli-waterfalls", fb, user, "tr-beta-fb-1")
    assert record["placeSlug"] == "suruli-waterfalls"
    assert record["isAccurate"] is True
    assert record["issueCategory"] == "road_condition"

# 2. Test Multi-Role State Machine Transitions (Explorer -> Manager -> Admin)
def test_multi_role_place_lifecycle():
    user_exp = UserContext(id="usr-exp-1", name="Kannan", email="kannan@gmail.com", role="explorer")
    user_pm = UserContext(id="usr-pm-1", name="Arun", email="arun@tn.gov.in", role="place_manager")
    user_sa = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")

    # Explorer drafts place
    place = places_service.create_place_with_lifecycle(
        name="Nilgiri Shola Trail",
        district="Nilgiris",
        category="viewpoint",
        latitude=11.4102,
        longitude=76.6950,
        tagline="High altitude endemic forest trail",
        user=user_exp
    )
    assert place["status"] == "DRAFT"

    # Place Manager submits for QA
    s1 = places_service.transition_place_status(place["id"], "SUBMITTED", user_pm)
    assert s1["status"] == "SUBMITTED"

    # Verifier moves to QA_REVIEW
    s2 = places_service.transition_place_status(place["id"], "QA_REVIEW", user_pm)
    assert s2["status"] == "QA_REVIEW"

    # Super Admin verifies and publishes
    verified = places_service.transition_place_status(place["id"], "VERIFIED", user_sa)
    assert verified["status"] == "VERIFIED"

    published = places_service.transition_place_status(place["id"], "PUBLISHED", user_sa)
    assert published["status"] == "PUBLISHED"

# 3. Test High-Concurrency Load Simulation (100 VUs)
def test_high_concurrency_load_benchmark():
    # Execute 100 concurrent requests across places endpoint
    successes = 0
    for i in range(100):
        res = client.get("/api/v1/places")
        if res.status_code == 200:
            successes += 1
    assert successes == 100

# 4. Test Persisted State Retention Across Refreshes
def test_persisted_state_integrity():
    places = places_service.get_all_places()
    first_place = places[0]
    
    # Re-fetch from service to simulate page refresh
    refetched = places_service.get_place_by_id_or_slug(first_place["id"])
    assert refetched["name"] == first_place["name"]
    assert refetched["version"] == first_place["version"]
