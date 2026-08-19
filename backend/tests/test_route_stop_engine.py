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
