import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.chaos_engine import chaos_engine, DatabaseUnavailableException, GatewayTimeoutException
from backend.app.core.redis_manager import redis_manager
from backend.app.services.job_service import job_service
from backend.app.core.security import decode_supabase_jwt, UserContext
from backend.app.core.rate_limiter import rate_limiter, RateLimitExceededException

client = TestClient(app)

# Scenario A: Database Outage & Automatic Recovery
def test_scenario_a_database_outage_and_recovery():
    # Normal State
    chaos_engine.set_database_offline(False)
    chaos_engine.check_database_health()

    # Inject Database Outage
    chaos_engine.set_database_offline(True)
    with pytest.raises(DatabaseUnavailableException) as exc_info:
        chaos_engine.check_database_health()
    assert exc_info.value.status_code == 503
    assert exc_info.value.code == "DATABASE_UNAVAILABLE"

    # Recover Database
    chaos_engine.set_database_offline(False)
    chaos_engine.check_database_health() # Succeeds without error

# Scenario B: Redis Outage & Degraded Mode Resilience
def test_scenario_b_redis_outage_resilience():
    # Inject Redis Outage
    redis_manager.set_online_status(False)
    res = client.get("/readyz")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "Degraded"
    assert body["redis"] == "unhealthy"

    # Recover Redis
    redis_manager.set_online_status(True)
    res_recovered = client.get("/readyz")
    assert res_recovered.json()["status"] == "Ready"

# Scenario C: Worker Process Crash & Dead Letter Queue Recovery
def test_scenario_c_worker_crash_and_recovery():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    job = job_service.create_job("GPX_PARSING", {"gpxXml": "test"}, user, "tr-chaos-crash-1")

    # Simulate Worker Crash
    failed_job = job_service.execute_worker_job(job["jobId"], simulate_worker_crash=True)
    assert failed_job["status"] == "FAILED"
    assert "WorkerProcessCrashed" in failed_job["error"]

    # Verify Dead Letter Record Exists
    dead_letters = [dl for dl in job_service._dead_letter_queue if dl["jobId"] == job["jobId"]]
    assert len(dead_letters) == 1
    assert dead_letters[0]["errorCode"] == "WORKER_CRASH"

# Scenario D: External AI Provider Timeout
def test_scenario_d_external_provider_timeout():
    chaos_engine.set_external_timeout(True)
    with pytest.raises(GatewayTimeoutException) as exc_info:
        chaos_engine.check_external_provider_health("Gemini AI")
    
    assert exc_info.value.status_code == 504
    assert exc_info.value.code == "GATEWAY_TIMEOUT"
    
    chaos_engine.set_external_timeout(False)

# Scenario E: Tampered / Invalid JWT Token Rejection
def test_scenario_e_invalid_jwt_rejection():
    # Passing invalid authorization header to protected endpoint GET /api/v1/jobs/job-1
    res = client.get("/api/v1/jobs/job-1", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert res.status_code == 401
    body = res.json()
    assert body["error"]["code"] == "UNAUTHORIZED"

# Scenario F: Rate Limit Exhaustion Throttling
def test_scenario_f_rate_limit_exhaustion():
    user_id = "test_rate_user_999"
    for _ in range(2):
        rate_limiter.check_rate_limit(user_id, limit=2, window_seconds=60)
    
    with pytest.raises(RateLimitExceededException) as exc_info:
        rate_limiter.check_rate_limit(user_id, limit=2, window_seconds=60)
    assert exc_info.value.status_code == 429
