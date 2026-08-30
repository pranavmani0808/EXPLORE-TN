import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.web_crawl_service import web_crawl_service

client = TestClient(app)

# 1. Test WebCrawlService Health Check
def test_web_crawl_service_health():
    health = web_crawl_service.check_health()
    assert "status" in health
    assert "provider" in health
    assert health["provider"] == "WEB_CRAWL-main Engine"
    assert "apiBaseUrl" in health

# 2. Test Triggering Crawl & Evidence Generation
def test_web_crawl_trigger_and_evidence():
    crawl_res = web_crawl_service.trigger_crawl("https://tourism.tn.gov.in/destinations", max_pages=10)
    assert "jobId" in crawl_res
    assert crawl_res["targetUrl"] == "https://tourism.tn.gov.in/destinations"
    assert crawl_res["domain"] == "tourism.tn.gov.in"

    evidence = web_crawl_service.fetch_destination_evidence("Madurai")
    assert evidence["destination"] == "Madurai"
    assert "evidence" in evidence
    assert len(evidence["evidence"]) > 0

# 3. Test API Endpoints (/api/v1/crawl)
def test_crawl_api_endpoints():
    res_health = client.get("/api/v1/crawl/health")
    assert res_health.status_code == 200
    assert res_health.json()["data"]["provider"] == "WEB_CRAWL-main Engine"

    res_trigger = client.post("/api/v1/crawl/trigger", json={"url": "https://tourism.tn.gov.in/ecotourism", "maxPages": 5})
    assert res_trigger.status_code == 200
    job_id = res_trigger.json()["data"]["jobId"]
    assert len(job_id) > 0

    res_job = client.get(f"/api/v1/crawl/jobs/{job_id}")
    assert res_job.status_code == 200

    res_urls = client.get(f"/api/v1/crawl/jobs/{job_id}/urls")
    assert res_urls.status_code == 200
    assert isinstance(res_urls.json()["data"], list)

    res_evidence = client.get("/api/v1/crawl/evidence?destination=Ooty")
    assert res_evidence.status_code == 200
    assert res_evidence.json()["data"]["destination"] == "Ooty"
