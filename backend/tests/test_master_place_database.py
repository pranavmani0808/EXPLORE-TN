import pytest
from backend.app.services.places_service import places_service

TN_38_DISTRICTS = [
    "Chennai", "Chengalpattu", "Kancheepuram", "Tiruvallur", "Vellore", "Ranipet",
    "Tirupattur", "Tiruvannamalai", "Villupuram", "Kallakurichi", "Cuddalore", "Salem",
    "Namakkal", "Dharmapuri", "Krishnagiri", "Erode", "Tiruppur", "Coimbatore",
    "The Nilgiris", "Karur", "Tiruchirappalli", "Perambalur", "Ariyalur", "Thanjavur",
    "Tiruvarur", "Nagapattinam", "Mayiladuthurai", "Pudukkottai", "Sivaganga", "Madurai",
    "Dindigul", "Theni", "Virudhunagar", "Ramanathapuram", "Thoothukudi", "Tirunelveli",
    "Tenkasi", "Kanyakumari"
]

def test_full_38_district_coverage():
    all_places = places_service.get_all_places()
    found_districts = set([p.get("district") for p in all_places if p.get("district")])
    for dist in TN_38_DISTRICTS:
        assert dist in found_districts, f"District '{dist}' missing from Master POI database!"

def test_master_poi_destination_resolution():
    queries = [
        ("Suruli Falls", "HIGH"),
        ("Meenakshi Amman Temple", "HIGH"),
        ("Brihadisvara Temple", "HIGH"),
        ("Marina Beach", "HIGH"),
        ("Yelagiri Hills", "HIGH"),
        ("Zanskar River", "HIGH"),
        ("waterfalls near Theni", "HIGH"),
        ("temples in Madurai", "HIGH")
    ]
    for q, expected_conf in queries:
        res = places_service.resolve_destination(q)
        assert res["confidence"] == expected_conf
        assert res["latitude"] is not None
        assert res["longitude"] is not None

def test_route_corridor_poi_search():
    chennai_to_kodai_route = [
        [80.2757, 13.0827], # Chennai
        [79.6898, 12.8423], # Kancheepuram
        [78.6970, 10.8288], # Trichy
        [77.9702, 10.3638], # Dindigul
        [77.4891, 10.2381]  # Kodaikanal
    ]
    pois_along_corridor = places_service.find_places_along_route_corridor(
        chennai_to_kodai_route,
        corridor_width_km=25.0
    )
    assert len(pois_along_corridor) > 0
    for i in range(len(pois_along_corridor) - 1):
        assert pois_along_corridor[i]["corridorDistanceKm"] <= pois_along_corridor[i + 1]["corridorDistanceKm"]

def test_dynamic_destination_interest_category_generator():
    madurai_interests = places_service.get_destination_interest_categories("Madurai")
    interest_ids = set([item["id"] for item in madurai_interests])
    assert "temples" in interest_ids
    assert "food" in interest_ids

    kodai_interests = places_service.get_destination_interest_categories("Kodaikanal")
    kodai_ids = set([item["id"] for item in kodai_interests])
    assert "viewpoints" in kodai_ids or "waterfalls" in kodai_ids

def test_spatial_deduplication():
    new_poi = {
        "name": "Meenakshi Amman Temple",
        "district": "Madurai",
        "category": "temple",
        "latitude": 9.9195,
        "longitude": 78.1193,
        "aliases": ["Madurai Temple Unique Test Alias"]
    }
    canonical, is_new = places_service.deduplicate_and_merge_place(new_poi)
    assert is_new is False
    assert "Madurai Temple Unique Test Alias" in canonical["aliases"]
