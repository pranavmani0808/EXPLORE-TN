import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.openserp_service import openserp_service, SourceDTO

client = TestClient(app)

# TEST 1: OpenSERP Health Probe
def test_openserp_health_probe():
    health = openserp_service.check_health()
    assert health["status"] == "Healthy"
    assert health["provider"] == "OpenSERP Web Grounding Engine"
    assert health["apiConfigured"] is True

# TEST 2: OpenSERP Web Evidence Search & DTO Structure
def test_openserp_search_web_evidence():
    sources = openserp_service.search_web_evidence(query="Suruli Waterfalls", trace_id="tr-test-openserp-1")
    assert len(sources) > 0
    s1 = sources[0]
    assert isinstance(s1, SourceDTO)
    assert "Suruli Waterfalls" in s1.title
    assert s1.domain != ""
    assert s1.url.startswith("https://")

# TEST 3: SSRF Safety Guard Defense
def test_openserp_ssrf_safety_defense():
    from backend.app.core.security_guard import security_guard
    res_local = security_guard.validate_ssrf_target("http://127.0.0.1:8000/internal-admin")
    res_aws = security_guard.validate_ssrf_target("http://169.254.169.254/latest/meta-data")
    assert res_local["allowed"] is False
    assert res_aws["allowed"] is False

# TEST 4: OpenSERP Web Evidence Integration in Trip Copilot Endpoint
def test_openserp_planner_endpoint_integration():
    res = client.post("/api/v1/planner/chat", json={"message": "plan a trip from chennai to ooty"})
    assert res.status_code == 200
    data = res.json()["data"]
    
    assert "webEvidence" in data
    assert len(data["webEvidence"]) > 0
    assert data["provenance"]["webEvidence"] == "OpenSERP Web Grounding Engine"
