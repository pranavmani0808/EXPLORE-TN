import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.tn_geo_service import tn_geo_service

client = TestClient(app)

# 1. Test 38 Official Districts
def test_geo_districts_count():
    districts = tn_geo_service.get_districts()
    assert len(districts) == 38
    names = [d.nameEn for d in districts]
    assert "Madurai" in names
    assert "The Nilgiris" in names
    assert "Dindigul" in names
    assert "Theni" in names
    assert "Chennai" in names

# 2. Test 25 Official Corporations
def test_geo_corporations():
    res = tn_geo_service.search_geo("Corporation")
    assert res.totalMatches >= 25
    corp_names = [n.nameEn for n in res.nodes]
    assert any("Madurai" in name for name in corp_names)
    assert any("Chennai" in name for name in corp_names)
    assert any("Coimbatore" in name for name in corp_names)

# 3. Test Locality Search (Ooty, Thirupparankundram, Batlagundu)
def test_geo_search_localities():
    # Ooty
    res_ooty = tn_geo_service.search_geo("Ooty")
    assert res_ooty.totalMatches >= 1
    assert any("Udhagamandalam" in n.nameEn for n in res_ooty.nodes)

    # Thirupparankundram
    res_thirupp = tn_geo_service.search_geo("Thirupparankundram")
    assert res_thirupp.totalMatches >= 1
    assert any("Thirupparankundram" in n.nameEn for n in res_thirupp.nodes)

    # Batlagundu
    res_batla = tn_geo_service.search_geo("Batlagundu")
    assert res_batla.totalMatches >= 1
    assert any("Batlagundu" in n.nameEn for n in res_batla.nodes)

# 4. Test REST Endpoints
def test_geo_rest_api_endpoints():
    res_dist = client.get("/api/v1/geo/districts")
    assert res_dist.status_code == 200
    assert len(res_dist.json()["data"]) == 38

    res_search = client.get("/api/v1/geo/search?q=Madurai")
    assert res_search.status_code == 200
    assert res_search.json()["data"]["totalMatches"] >= 1

    res_area = client.get("/api/v1/geo/area/corp-madurai")
    assert res_area.status_code == 200
    assert res_area.json()["data"]["node"]["nameEn"] == "Madurai City Municipal Corporation"
