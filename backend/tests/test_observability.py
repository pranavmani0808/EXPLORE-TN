import json
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.logger import structured_logger
from backend.app.services.telemetry_service import telemetry_service
from backend.app.core.exceptions import ValidationException, PermissionDeniedException

client = TestClient(app)

# 1. Test Structured JSON Log Formatting & Latency Breakdown
def test_structured_json_logging_format():
    log_json = structured_logger.format_log(
        level="INFO",
        message="Test request",
        trace_id="tr-test-100",
        actor_id="usr-sa-1",
        actor_role="SUPER_ADMIN",
        endpoint="/api/v1/places",
        method="GET",
        status_code=200,
        total_ms=42.5,
        db_ms=18.2,
        redis_ms=2.4
    )
    
    parsed = json.loads(log_json)
    assert parsed["level"] == "INFO"
    assert parsed["traceId"] == "tr-test-100"
    assert parsed["actorId"] == "usr-sa-1"
    assert parsed["actorRole"] == "SUPER_ADMIN"
    assert parsed["endpoint"] == "/api/v1/places"
    assert parsed["latencyMs"]["total"] == 42.5
    assert parsed["latencyMs"]["db"] == 18.2
    assert parsed["latencyMs"]["redis"] == 2.4

# 2. Test Standardized Error Category Taxonomy Mapping
def test_error_taxonomy_category_mapping():
    val_exc = ValidationException("Invalid district name")
    assert val_exc.error_category == "VALIDATION_ERROR"

    perm_exc = PermissionDeniedException("Access forbidden")
    assert perm_exc.error_category == "AUTH_ERROR"

# 3. Test Real-Time Telemetry API Endpoint (GET /api/v1/admin/telemetry)
def test_realtime_telemetry_endpoint():
    res = client.get("/api/v1/admin/telemetry")
    assert res.status_code == 200
    body = res.json()
    assert "data" in body
    data = body["data"]
    
    # Verify Structure
    assert "healthStatus" in data
    assert "trafficMetrics" in data
    assert "latencyPercentilesMs" in data
    assert "errorTaxonomy" in data
    assert "infrastructurePools" in data
    
    # Latency Percentiles
    assert "p50" in data["latencyPercentilesMs"]
    assert "p95" in data["latencyPercentilesMs"]
    assert "p99" in data["latencyPercentilesMs"]

    # Infrastructure Pools
    assert data["infrastructurePools"]["redisPool"]["status"] == "healthy"
    assert "workerQueueDepth" in data["infrastructurePools"]
