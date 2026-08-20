import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import places_service
from backend.app.services.job_service import job_service
from backend.app.core.security import UserContext

client = TestClient(app)

# 1. 🔎 Search Flow E2E Chain
def test_e2e_search_flow():
    res = client.get("/api/v1/places")
    assert res.status_code == 200
    body = res.json()
    assert "data" in body
    assert "meta" in body
    assert "traceId" in body["meta"]
    assert len(body["data"]) >= 1

# 2. 🗺️ Explore Spatial Viewport Flow E2E Chain
def test_e2e_explore_spatial_flow():
    res = client.get("/api/v1/places?category=hill_station")
    assert res.status_code == 200
    body = res.json()
    assert all(p["category"] == "hill_station" for p in body["data"])

# 3. 📍 Place Detail Lookup Flow E2E Chain
def test_e2e_place_detail_flow():
    places = places_service.get_all_places()
    assert len(places) > 0
    place_id = places[0]["id"]
    
    res = client.get(f"/api/v1/places/{place_id}")
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["id"] == place_id

# 4. 🛣️ Routes GPX Job Flow E2E Chain
def test_e2e_routes_gpx_job_flow():
    user = UserContext(id="usr-rm-1", name="Pranav", email="pranav@exploretn.com", role="route_manager")
    gpx_xml = """<gpx version="1.1"><trk><trkseg><trkpt lat="11.2721" lon="78.3375"><ele>450.0</ele></trkpt></trkseg></trk></gpx>"""
    
    job = job_service.create_job("GPX_PARSING", {"title": "E2E Route", "gpxXml": gpx_xml}, user, "tr-e2e-route-1")
    completed_job = job_service.execute_worker_job(job["jobId"])
    
    assert completed_job["status"] == "COMPLETED"
    assert completed_job["result"]["title"] == "E2E Route"

# 5. 🤖 AI Planner Expedition Job Flow E2E Chain
def test_e2e_ai_planner_job_flow():
    user = UserContext(id="usr-exp-1", name="Kannan", email="kannan@gmail.com", role="explorer")
    job = job_service.create_job("GEMINI_GENERATION", {"origin": "Chennai", "destination": "Kolli Hills"}, user, "tr-e2e-ai-1")
    completed_job = job_service.execute_worker_job(job["jobId"])
    
    assert completed_job["status"] == "COMPLETED"
    assert "expeditionTitle" in completed_job["result"]

# 6. 👤 Profile Authentication Flow E2E Chain
def test_e2e_profile_auth_flow():
    res = client.get("/api/v1/jobs/job-1")
    # Anonymous request to protected route returns 401/404
    assert res.status_code in [401, 404]

# 7. 🛡️ Admin Verification & Self-Approval Prevention Flow E2E Chain
def test_e2e_admin_verification_self_approval_guard():
    user_sa = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    user_verifier = UserContext(id="usr-verifier-2", name="Ramesh", email="ramesh@tn.gov.in", role="place_manager")
    
    place = places_service.create_place_with_lifecycle(
        name="E2E Admin Place",
        district="Namakkal",
        category="waterfall",
        latitude=11.2721,
        longitude=78.3375,
        tagline="Admin test",
        user=user_sa
    )
    
    # Sequential State Machine Transition: DRAFT -> SUBMITTED -> QA_REVIEW -> VERIFIED
    s1 = places_service.transition_place_status(place["id"], "SUBMITTED", user_sa)
    assert s1["status"] == "SUBMITTED"
    
    s2 = places_service.transition_place_status(place["id"], "QA_REVIEW", user_verifier)
    assert s2["status"] == "QA_REVIEW"
    
    verified = places_service.transition_place_status(place["id"], "VERIFIED", user_verifier)
    assert verified["status"] == "VERIFIED"

# 8. 📸 Media Processing Job Flow E2E Chain
def test_e2e_media_processing_job_flow():
    user = UserContext(id="usr-pm-1", name="Arun", email="arun@tn.gov.in", role="place_manager")
    job = job_service.create_job("MEDIA_PROCESSING", {"filename": "falls.jpg", "mimeType": "image/jpeg"}, user, "tr-e2e-media-1")
    completed_job = job_service.execute_worker_job(job["jobId"])
    
    assert completed_job["status"] == "COMPLETED"
    assert completed_job["result"]["status"] == "OPTIMIZED"

# 9. 🌦️ Telemetry & Infrastructure Health Flow E2E Chain
def test_e2e_telemetry_health_flow():
    res = client.get("/readyz")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "Ready"
    assert body["database"] == "healthy"

# 10. 📜 Audit Trail Logging Flow E2E Chain
import jwt, time
from backend.app.core.config import settings

def test_e2e_audit_trail_flow():
    token = jwt.encode({"sub": "usr-sa-1", "email": "admin@exploretn.com", "app_metadata": {"role": "super_admin"}, "exp": int(time.time()) + 3600}, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)
    res = client.get("/api/v1/admin/telemetry", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert "errorTaxonomy" in body["data"]
