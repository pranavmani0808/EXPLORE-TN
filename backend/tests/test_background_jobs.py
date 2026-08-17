import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.redis_manager import redis_manager
from backend.app.services.job_service import job_service
from backend.app.core.security import decode_supabase_jwt, UserContext
from backend.app.core.exceptions import ValidationException, PermissionDeniedException

client = TestClient(app)

# 1. Test Redis Readiness Probe & Failure Injection
def test_redis_readiness_probe_and_failure_injection():
    # Normal Online State
    redis_manager.set_online_status(True)
    res_ready = client.get("/readyz")
    assert res_ready.status_code == 200
    body = res_ready.json()
    assert body["status"] == "Ready"
    assert body["database"] == "healthy"
    assert body["redis"] == "healthy"

    # Simulate Redis Offline / Interrupted Connection
    redis_manager.set_online_status(False)
    res_offline = client.get("/readyz")
    assert res_offline.status_code == 200
    body_off = res_offline.json()
    assert body_off["status"] == "Degraded"
    assert body_off["redis"] == "unhealthy"

    # Restore Redis Online Status
    redis_manager.set_online_status(True)

# 2. Test Asynchronous GPX Parsing Worker Job
def test_gpx_parsing_worker_job():
    user = UserContext(id="usr-rm-1", name="Pranav", email="pranav@exploretn.com", role="route_manager")
    gpx_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1">
      <trk><trkseg>
        <trkpt lat="11.2721" lon="78.3375"><ele>450.0</ele></trkpt>
        <trkpt lat="11.2800" lon="78.3450"><ele>1050.0</ele></trkpt>
      </trkseg></trk>
    </gpx>"""

    job = job_service.create_job(
        job_type="GPX_PARSING",
        payload={"title": "Async Kolli Pass", "district": "Namakkal", "difficulty": "Hard", "gpxXml": gpx_xml},
        user=user,
        trace_id="tr-job-gpx-1"
    )
    assert job["status"] == "QUEUED"

    # Execute Worker
    completed_job = job_service.execute_worker_job(job["jobId"])
    assert completed_job["status"] == "COMPLETED"
    assert completed_job["progress"] == 100
    assert completed_job["result"]["title"] == "Async Kolli Pass"
    assert "LINESTRING(" in completed_job["result"]["wktLineString"]

# 3. Test Asynchronous Media EXIF Worker Job
def test_media_processing_worker_job():
    user = UserContext(id="usr-pm-1", name="Arun", email="arun@tn.gov.in", role="place_manager")
    
    job = job_service.create_job(
        job_type="MEDIA_PROCESSING",
        payload={"filename": "kolli_peak.jpg", "mimeType": "image/jpeg"},
        user=user,
        trace_id="tr-job-media-1"
    )
    
    completed_job = job_service.execute_worker_job(job["jobId"])
    assert completed_job["status"] == "COMPLETED"
    assert completed_job["result"]["status"] == "OPTIMIZED"
    assert completed_job["result"]["exif"]["latitude"] == 10.2381

# 4. Test Idempotency Engine (Preventing Duplicate Worker Execution)
def test_job_idempotency_engine():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    payload = {"origin": "Chennai", "destination": "Kolli Hills"}
    idempotency_key = "idemp-gemini-unique-key-100"

    job1 = job_service.create_job("GEMINI_GENERATION", payload, user, "tr-idemp-1", idempotency_key=idempotency_key)
    job2 = job_service.create_job("GEMINI_GENERATION", payload, user, "tr-idemp-2", idempotency_key=idempotency_key)

    # Re-queueing with identical key returns existing job record
    assert job1["jobId"] == job2["jobId"]

# 5. Test Worker Failure Injection & Dead Letter Queue
def test_worker_crash_and_dead_letter_queue():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    job = job_service.create_job("GPX_PARSING", {"gpxXml": "test"}, user, "tr-crash-1")
    
    # Simulate Worker Crash
    failed_job = job_service.execute_worker_job(job["jobId"], simulate_worker_crash=True)
    assert failed_job["status"] == "FAILED"
    assert "WorkerProcessCrashed" in failed_job["error"]
    assert len(job_service._dead_letter_queue) >= 1

# 6. Test Job Status API & RBAC Protection
def test_job_status_api_rbac_protection():
    user_admin = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    user_explorer = UserContext(id="usr-exp-9", name="Kannan", email="kannan@gmail.com", role="explorer")

    job = job_service.create_job("GEMINI_GENERATION", {"query": "Ooty"}, user_admin, "tr-rbac-1")

    # Explorer trying to access Admin job raises PermissionDeniedException
    with pytest.raises(PermissionDeniedException):
        job_service.get_job_status(job["jobId"], user_explorer)

    # Admin accessing own job succeeds
    res = job_service.get_job_status(job["jobId"], user_admin)
    assert res["jobId"] == job["jobId"]
