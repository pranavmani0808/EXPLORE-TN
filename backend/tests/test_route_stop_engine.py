import pytest
from backend.app.services.intelligence.route_stop_engine import (
    RouteRecommendationRequest,
    RouteRecommendationResponse,
    route_stop_engine_service,
)

def test_short_trip_threshold():
    # Short trip < 150km (e.g. Chennai to Mahabalipuram ~ 56km)
    req = RouteRecommendationRequest(
        requestId="test-short-1",
        routePolyline=[[13.0827, 80.2707], [12.8387, 80.2220], [12.6269, 80.1927]],
        totalDistanceKm=56.1,
        totalDurationMinutes=75.0,
        departureTime="08:00",
    )
    res: RouteRecommendationResponse = route_stop_engine_service.recommend_stops(req)
    assert res.isLongJourney is False
    assert res.journeyMode == "SHORT_TRIP"
    assert len(res.recommendations) == 0

def test_long_journey_mode_trigger():
    # Long Journey > 500km (e.g. Chennai to Kanniyakumari ~ 666km)
    req = RouteRecommendationRequest(
        requestId="test-long-1",
        routePolyline=[
            [13.0827, 80.2707], # Chennai
            [12.2274, 79.6468], # Tindivanam
            [11.6912, 79.2891], # Ulundurpet
            [10.7905, 78.7047], # Trichy
            [10.3624, 77.9695], # Dindigul
            [9.9195, 78.1193],  # Madurai
            [8.7139, 77.7567],  # Tirunelveli
            [8.0883, 77.5385],  # Kanniyakumari
        ],
        totalDistanceKm=666.5,
        totalDurationMinutes=545.0,
        departureTime="06:00",
        maxDetourKm=5.0,
    )
    res: RouteRecommendationResponse = route_stop_engine_service.recommend_stops(req)
    assert res.isLongJourney is True
    assert res.journeyMode == "LONG_JOURNEY_MODE"
    assert len(res.recommendations) > 0
    
    # Check candidates have valid detour <= 5km and timing attributes
    for rec in res.recommendations:
        assert rec.detourDistanceKm <= 5.0
        assert rec.estimatedArrivalTime != ""
        assert rec.score > 0
        assert rec.category in ["tea", "breakfast", "lunch", "dinner", "fuel", "rest", "hotel"]

def test_meal_window_matching():
    req = RouteRecommendationRequest(
        requestId="test-meal-1",
        routePolyline=[
            [13.0827, 80.2707],
            [12.2274, 79.6468],
            [11.6912, 79.2891],
            [10.7905, 78.7047],
        ],
        totalDistanceKm=320.0,
        totalDurationMinutes=240.0,
        departureTime="06:00", # Departs 6 AM -> Tindivanam at ~7:30 AM (Breakfast window)
    )
    res: RouteRecommendationResponse = route_stop_engine_service.recommend_stops(req)
    categories = [rec.category for rec in res.recommendations]
    assert "breakfast" in categories or "tea" in categories

def test_ecr_route_corridor_recommendations():
    # ECR Route: Chennai -> Mahabalipuram -> Kalpakkam -> Marakkanam -> Pondicherry
    ecr_polyline = [
        [13.0827, 80.2707], # Chennai
        [12.7910, 80.2450], # Kovelong Shell
        [12.6269, 80.1927], # Mahabalipuram
        [12.5020, 80.1600], # Kalpakkam
        [12.1960, 79.9530], # Marakkanam
        [11.9416, 79.8083], # Pondicherry
    ]
    req = RouteRecommendationRequest(
        requestId="test-ecr-corridor-1",
        routePolyline=ecr_polyline,
        totalDistanceKm=158.0,
        totalDurationMinutes=180.0,
        departureTime="07:00",
        maxDetourKm=5.0
    )
    res = route_stop_engine_service.recommend_stops(req)
    assert len(res.recommendations) > 0
    rec_ids = [rec.placeId for rec in res.recommendations]
    
    # Assert ECR stops present
    assert any("ecr" in r_id for r_id in rec_ids)
    # Assert inland NH44 stops (Ulundurpet, Trichy, Dindigul) are NOT present
    assert "sri-saravana-bhavan-ulundurpet" not in rec_ids
    assert "hari-bhavanam-trichy-bypass" not in rec_ids

def test_alternative_route_corridor_switching():
    # NH44 Inland Route: Chennai -> Tindivanam -> Pondicherry
    nh_polyline = [
        [13.0827, 80.2707], # Chennai
        [12.2274, 79.6468], # Tindivanam
        [11.9416, 79.8083], # Pondicherry
    ]
    nh_req = RouteRecommendationRequest(
        requestId="test-nh-corridor",
        routePolyline=nh_polyline,
        totalDistanceKm=165.0,
        totalDurationMinutes=150.0,
        departureTime="07:00"
    )
    nh_res = route_stop_engine_service.recommend_stops(nh_req)
    nh_ids = [r.placeId for r in nh_res.recommendations]
    
    # ECR Scenic Route: Chennai -> Mahabalipuram -> Marakkanam -> Pondicherry
    ecr_polyline = [
        [13.0827, 80.2707],
        [12.6269, 80.1927],
        [12.1960, 79.9530],
        [11.9416, 79.8083],
    ]
    ecr_req = RouteRecommendationRequest(
        requestId="test-ecr-corridor",
        routePolyline=ecr_polyline,
        totalDistanceKm=155.0,
        totalDurationMinutes=190.0,
        departureTime="07:00"
    )
    ecr_res = route_stop_engine_service.recommend_stops(ecr_req)
    ecr_ids = [r.placeId for r in ecr_res.recommendations]

    # Verify recommendations are distinct and corridor-specific
    assert nh_ids != ecr_ids

