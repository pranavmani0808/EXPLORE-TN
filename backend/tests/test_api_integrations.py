import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.weather_service import weather_service
from backend.app.services.ttdc_service import ttdc_service
from backend.app.services.geocoding_service import geocoding_service
from backend.app.services.external_api_service import external_api_service, ExternalApiProxyRequestDTO

client = TestClient(app)

# 1. Test OpenWeather Service
def test_weather_service_forecast():
    forecast_ooty = weather_service.get_weather_forecast("Ooty")
    assert forecast_ooty.destination == "Ooty"
    assert forecast_ooty.temperatureC < 25.0
    assert "fog" in forecast_ooty.ghatAdvisory.lower() or "ghat" in forecast_ooty.ghatAdvisory.lower()

    forecast_madurai = weather_service.get_weather_forecast("Madurai")
    assert forecast_madurai.destination == "Madurai"
    assert forecast_madurai.temperatureC >= 20.0

# 2. Test TTDC Official Tourism Service
def test_ttdc_service_advisories():
    advisories = ttdc_service.get_official_advisories()
    assert len(advisories) >= 2
    assert any(a.isOfficialGovtAlert for a in advisories)

    namakkal_advisories = ttdc_service.get_official_advisories("Namakkal")
    assert any("Namakkal" in a.affectedDistrict or a.affectedDistrict == "Statewide" for a in namakkal_advisories)

# 3. Test Mapbox / Geocoding Service
def test_geocoding_service_search():
    results = geocoding_service.search_place_autocomplete("Meenakshi")
    assert len(results) >= 1
    assert results[0].placeName == "Meenakshi Amman Temple"
    assert results[0].latitude == 9.9195
    assert results[0].longitude == 78.1193

# 4. Test External REST API Proxy & SSRF Protection
def test_external_api_proxy_ssrf_protection():
    payload_safe = ExternalApiProxyRequestDTO(
        url="https://api.openserp.com/v1/search?q=TamilNadu",
        method="GET"
    )
    res_safe = external_api_service.execute_proxy_request(payload_safe)
    assert res_safe.statusCode in [200, 502]
    assert res_safe.latencyMs >= 0

    # SSRF Attack payload attempting localhost access -> Must throw ValueError!
    payload_ssrf = ExternalApiProxyRequestDTO(
        url="http://169.254.169.254/latest/meta-data/",
        method="GET"
    )
    with pytest.raises(ValueError) as exc:
        external_api_service.execute_proxy_request(payload_ssrf)
    assert "Security Guard Block" in str(exc.value)

# 5. Test API Endpoints (/api/v1/integrations)
def test_integrations_api_endpoints():
    res_w = client.get("/api/v1/integrations/weather?destination=Kodaikanal")
    assert res_w.status_code == 200
    assert res_w.json()["data"]["destination"] == "Kodaikanal"

    res_t = client.get("/api/v1/integrations/ttdc/advisories?district=Namakkal")
    assert res_t.status_code == 200
    assert isinstance(res_t.json()["data"], list)

    res_g = client.get("/api/v1/integrations/geocoding/search?q=Kodaikanal")
    assert res_g.status_code == 200
    assert len(res_g.json()["data"]) >= 1

    res_p = client.post("/api/v1/integrations/external/proxy", json={"url": "https://api.ttdc.tn.gov.in/v1/status", "method": "GET"})
    assert res_p.status_code == 200
    assert "statusCode" in res_p.json()["data"]
