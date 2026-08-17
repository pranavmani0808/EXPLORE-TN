import pytest
from backend.app.services.route_ingestion import route_ingestion_service
from backend.app.services.places_service import places_service
from backend.app.core.exceptions import ValidationException
from backend.app.core.security import UserContext

# 1. Test Sample GPX XML Parsing & PostGIS LineString WKT Generation
def test_gpx_parsing_and_metrics_calculation():
    user = UserContext(id="usr-rm-1", name="Pranav", email="pranav@exploretn.com", role="route_manager")
    
    sample_gpx_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="ExplorerTN Engine">
      <trk>
        <name>Kolli Hills Hairpin Pass</name>
        <trkseg>
          <trkpt lat="11.2721" lon="78.3375"><ele>450.0</ele></trkpt>
          <trkpt lat="11.2750" lon="78.3400"><ele>620.0</ele></trkpt>
          <trkpt lat="11.2710" lon="78.3360"><ele>810.0</ele></trkpt>
          <trkpt lat="11.2800" lon="78.3450"><ele>1050.0</ele></trkpt>
        </trkseg>
      </trk>
    </gpx>"""

    route = route_ingestion_service.ingest_gpx_route(
        title="Kolli Hills Hairpin Pass Test",
        district="Namakkal",
        difficulty="Hard",
        gpx_xml=sample_gpx_xml,
        user=user
    )

    assert route["title"] == "Kolli Hills Hairpin Pass Test"
    assert route["distanceKm"] > 0
    assert route["elevationGainM"] == 600.0 # (620-450) + (810-620) + (1050-810) = 600m
    assert route["hairpinBends"] >= 1
    assert "LINESTRING(" in route["wktLineString"]
    assert "78.3375 11.2721" in route["wktLineString"]

# 2. Test Invalid GPX XML Error Handling
def test_invalid_gpx_xml_handling():
    user = UserContext(id="usr-rm-1", name="Pranav", email="pranav@exploretn.com", role="route_manager")
    
    # Malformed XML string
    malformed_xml = "<gpx><trk><unclosed_tag></trk></gpx>"
    
    with pytest.raises(ValidationException) as exc_info:
        route_ingestion_service.ingest_gpx_route(
            title="Broken Trail",
            district="Salem",
            difficulty="Easy",
            gpx_xml=malformed_xml,
            user=user
        )
    assert "Invalid GPX format" in str(exc_info.value)

# 3. Test Out-of-Bounds GPX Trackpoint Rejection
def test_out_of_bounds_gpx_trackpoint_rejection():
    user = UserContext(id="usr-rm-1", name="Pranav", email="pranav@exploretn.com", role="route_manager")
    
    # GPX containing Mumbai point [19.076, 72.8777]
    non_tn_gpx_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="ExplorerTN Engine">
      <trk>
        <trkseg>
          <trkpt lat="19.0760" lon="72.8777"><ele>10.0</ele></trkpt>
        </trkseg>
      </trk>
    </gpx>"""

    with pytest.raises(ValidationException) as exc_info:
        route_ingestion_service.ingest_gpx_route(
            title="Mumbai Trail",
            district="Mumbai",
            difficulty="Easy",
            gpx_xml=non_tn_gpx_xml,
            user=user
        )
    assert "falls outside Tamil Nadu WGS84 bounds" in str(exc_info.value)

# 4. Test Ingestion of Real Tamil Nadu Place Nodes
def test_real_places_data_ingestion():
    user = UserContext(id="usr-sa-1", name="Pranav", email="pranav@exploretn.com", role="super_admin")
    
    real_places_data = [
        {"name": "Valparai 40 Hairpin Bend Pass", "district": "Coimbatore", "category": "hill_station", "lat": 10.3274, "lng": 76.9554},
        {"name": "Kodaikanal Star Lake", "district": "Dindigul", "category": "lake", "lat": 10.2381, "lng": 77.4892},
        {"name": "Meghamalai Highwavys Peak", "district": "Theni", "category": "hill_station", "lat": 9.6912, "lng": 77.4012},
    ]

    for p in real_places_data:
        res = places_service.create_place_with_lifecycle(
            name=p["name"],
            district=p["district"],
            category=p["category"],
            latitude=p["lat"],
            longitude=p["lng"],
            tagline=f"Scenic {p['category']} in {p['district']}",
            user=user
        )
        assert res["name"] == p["name"]
        assert res["district"] == p["district"]
        assert res["status"] == "DRAFT"
