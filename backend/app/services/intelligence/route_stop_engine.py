import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OpeningHours(BaseModel):
    openTime: str = "06:00"
    closeTime: str = "22:00"
    isOpen24Hours: bool = False

class RouteStopCandidate(BaseModel):
    placeId: str
    name: str
    category: str  # "tea" | "breakfast" | "lunch" | "dinner" | "fuel" | "rest" | "hotel"
    latitude: float
    longitude: float
    routeDistanceFromOriginKm: float
    detourDistanceKm: float
    estimatedArrivalTime: str
    estimatedStopDurationMinutes: int
    rating: float = 4.5
    reviewsCount: int = 250
    openingHours: Optional[OpeningHours] = None
    routePositionPercent: float
    reason: str
    score: float
    district: str
    tagline: str
    verified: bool = True

class RouteRecommendationRequest(BaseModel):
    requestId: str
    routePolyline: List[List[float]]  # [[lat, lng], ...]
    totalDistanceKm: float
    totalDurationMinutes: float
    departureTime: str = "06:00"  # "HH:MM" 24h format
    travelMode: str = "driving"
    maxDetourKm: float = 5.0

class RouteRecommendationResponse(BaseModel):
    requestId: str
    isLongJourney: bool
    journeyMode: str  # "SHORT_TRIP" | "MEDIUM_TRIP" | "LONG_JOURNEY_MODE"
    totalDistanceKm: float
    totalDurationMinutes: float
    departureTime: str
    expectedArrivalTime: str
    recommendations: List[RouteStopCandidate]
    calculatedAt: str

# Catalog of Highway Rest Stops, Dining Complexes, Fuel Hubs, and Hotels across Tamil Nadu Corridors
HIGHWAY_CANDIDATES: List[Dict[str, Any]] = [
    # NH44 Chennai - Villupuram - Trichy Corridor
    {
        "id": "a2b-tindivanam-nh44",
        "name": "A2B Adyar Ananda Bhavan — Tindivanam NH44",
        "district": "Villupuram",
        "latitude": 12.2274,
        "longitude": 79.6468,
        "category": "breakfast",
        "tagline": "Famous South Indian pure veg breakfast & filter coffee highway stop",
        "rating": 4.6,
        "reviewsCount": 8500,
        "openTime": "06:00",
        "closeTime": "22:30",
        "stopDurationMins": 30,
    },
    {
        "id": "shell-tindivanam-fuel",
        "name": "Shell Fuel Station & RestStop — Tindivanam",
        "district": "Villupuram",
        "latitude": 12.2350,
        "longitude": 79.6490,
        "category": "fuel",
        "tagline": "Clean rest areas, EV fast charging, premium V-Power fuel & snacks",
        "rating": 4.7,
        "reviewsCount": 3200,
        "openTime": "00:00",
        "closeTime": "23:59",
        "stopDurationMins": 15,
        "isOpen24Hours": True,
    },
    {
        "id": "sri-saravana-bhavan-ulundurpet",
        "name": "Sri Saravana Bhavan — Ulundurpet Toll Plaza",
        "district": "Kallakurichi",
        "latitude": 11.6912,
        "longitude": 79.2891,
        "category": "lunch",
        "tagline": "Premium vegetarian thali, meals & clean highway rest facilities",
        "rating": 4.5,
        "reviewsCount": 6400,
        "openTime": "07:00",
        "closeTime": "22:00",
        "stopDurationMins": 45,
    },
    # NH44 Perambalur - Trichy Corridor
    {
        "id": "mr-palani-tea-perambalur",
        "name": "Kumbakonam Degree Coffee — Perambalur NH44",
        "district": "Perambalur",
        "latitude": 11.2333,
        "longitude": 78.8821,
        "category": "tea",
        "tagline": "Authentic Kumbakonam brass cup degree coffee & hot snacks",
        "rating": 4.8,
        "reviewsCount": 4100,
        "openTime": "05:30",
        "closeTime": "22:00",
        "stopDurationMins": 20,
    },
    {
        "id": "hari-bhavanam-trichy-bypass",
        "name": "Hari Bhavanam — Trichy Bypass Highway Hub",
        "district": "Tiruchirappalli",
        "latitude": 10.7905,
        "longitude": 78.7047,
        "category": "lunch",
        "tagline": "Iconic Kongu style non-veg feasts, biryani & spacious parking",
        "rating": 4.6,
        "reviewsCount": 9200,
        "openTime": "11:00",
        "closeTime": "23:00",
        "stopDurationMins": 50,
    },
    # NH44 Dindigul - Madurai Corridor
    {
        "id": "thalappakatti-dindigul-nh44",
        "name": "Dindigul Thalappakatti Restaurant — NH44 Junction",
        "district": "Dindigul",
        "latitude": 10.3624,
        "longitude": 77.9695,
        "category": "dinner",
        "tagline": "World-famous Seeraga Samba mutton biryani & traditional sides",
        "rating": 4.7,
        "reviewsCount": 11400,
        "openTime": "11:00",
        "closeTime": "23:00",
        "stopDurationMins": 45,
    },
    {
        "id": "hp-autocare-dindigul",
        "name": "HPCL Auto Care Centre & Rest Point — Dindigul Bypass",
        "district": "Dindigul",
        "latitude": 10.3411,
        "longitude": 77.9522,
        "category": "fuel",
        "tagline": "24/7 Fuel station, tire pressure check, clean restrooms & coffee shop",
        "rating": 4.5,
        "reviewsCount": 2100,
        "openTime": "00:00",
        "closeTime": "23:59",
        "stopDurationMins": 15,
        "isOpen24Hours": True,
    },
    # NH44 Madurai - Virudhunagar - Tirunelveli Corridor
    {
        "id": "amavasai-hotel-virudhunagar",
        "name": "Virudhunagar Amavasai Hotel — Highway Hub",
        "district": "Virudhunagar",
        "latitude": 9.5872,
        "longitude": 77.9514,
        "category": "lunch",
        "tagline": "Authentic Virudhunagar Ennai Parotta & Chettinad curries",
        "rating": 4.7,
        "reviewsCount": 7800,
        "openTime": "11:30",
        "closeTime": "22:30",
        "stopDurationMins": 40,
    },
    {
        "id": "iruttu-kadai-halwa-tirunelveli-bypass",
        "name": "Tirunelveli Halwa & Coffee Express — Highway Stop",
        "district": "Tirunelveli",
        "latitude": 8.7139,
        "longitude": 77.7567,
        "category": "tea",
        "tagline": "Fresh wheat halwa, hot tea, filter coffee & evening snacks",
        "rating": 4.8,
        "reviewsCount": 5600,
        "openTime": "06:00",
        "closeTime": "22:00",
        "stopDurationMins": 20,
    },
    {
        "id": "hotel-grand-aryas-tirunelveli-nh44",
        "name": "Hotel Grand Aryas — Tirunelveli NH44 Bypass",
        "district": "Tirunelveli",
        "latitude": 8.7280,
        "longitude": 77.7210,
        "category": "dinner",
        "tagline": "Multicuisine family dining, spacious AC halls & lush garden lounge",
        "rating": 4.6,
        "reviewsCount": 4900,
        "openTime": "07:00",
        "closeTime": "23:00",
        "stopDurationMins": 45,
    },
    {
        "id": "hotel-heritage-kanniyakumari-stay",
        "name": "Hotel Heritage Sea Resort — Kanniyakumari Highway",
        "district": "Kanniyakumari",
        "latitude": 8.0883,
        "longitude": 77.5385,
        "category": "hotel",
        "tagline": "Comfortable overnight stay, ocean views & 24/7 check-in for long drivers",
        "rating": 4.6,
        "reviewsCount": 3800,
        "openTime": "00:00",
        "closeTime": "23:59",
        "stopDurationMins": 480,
        "isOpen24Hours": True,
    },
    # ECR Chennai - Mahabalipuram - Pondicherry Corridor
    {
        "id": "ecr-dhaba-mahabalipuram",
        "name": "ECR Beachside Dhaba & Refreshment — Mahabalipuram",
        "district": "Chengalpattu",
        "latitude": 12.6269,
        "longitude": 80.1927,
        "category": "tea",
        "tagline": "Fresh tender coconut, sea breeze coffee, fried seafood & snacks",
        "rating": 4.6,
        "reviewsCount": 5100,
        "openTime": "06:00",
        "closeTime": "22:00",
        "stopDurationMins": 25,
    },
    # Salem - Valparai - Ooty Corridor
    {
        "id": "salem-rr-biryani-nh44",
        "name": "Salem RR Biryani & Grill — Salem Highway Junction",
        "district": "Salem",
        "latitude": 11.6643,
        "longitude": 78.1460,
        "category": "lunch",
        "tagline": "Salem style mutton biryani, chicken 65 & highway family dining",
        "rating": 4.5,
        "reviewsCount": 6100,
        "openTime": "11:00",
        "closeTime": "23:00",
        "stopDurationMins": 45,
    },
    {
        "id": "coimbatore-annapoorna-nh",
        "name": "Sree Annapoorna Sree Gowrishankar — Coimbatore NH",
        "district": "Coimbatore",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "category": "breakfast",
        "tagline": "World famous Coimbatore Sambar Idli, Ghee Roast & Filter Coffee",
        "rating": 4.9,
        "reviewsCount": 18200,
        "openTime": "06:00",
        "closeTime": "22:00",
        "stopDurationMins": 35,
    },
]

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_to_segment_km(p_lat: float, p_lng: float, a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    """Calculate minimum perpendicular detour distance from point P to line segment AB."""
    ab_dist = haversine_distance_km(a_lat, a_lng, b_lat, b_lng)
    if ab_dist < 0.001:
        return haversine_distance_km(p_lat, p_lng, a_lat, a_lng)
    
    t = ((p_lat - a_lat) * (b_lat - a_lat) + (p_lng - a_lng) * (b_lng - a_lng)) / ((b_lat - a_lat)**2 + (b_lng - a_lng)**2 + 1e-9)
    t = max(0.0, min(1.0, t))
    
    proj_lat = a_lat + t * (b_lat - a_lat)
    proj_lng = a_lng + t * (b_lng - a_lng)
    return haversine_distance_km(p_lat, p_lng, proj_lat, proj_lng)

def parse_time_to_minutes(time_str: str) -> int:
    try:
        parts = time_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 6 * 60

def format_minutes_to_time(minutes: int) -> str:
    total = minutes % (24 * 60)
    hrs = total // 60
    mins = total % 60
    period = "AM" if hrs < 12 else "PM"
    display_hrs = hrs % 12
    if display_hrs == 0:
        display_hrs = 12
    return f"{display_hrs:02d}:{mins:02d} {period}"

class RouteStopEngineService:
    def recommend_stops(self, request: RouteRecommendationRequest) -> RouteRecommendationResponse:
        total_dist = request.totalDistanceKm
        total_dur = request.totalDurationMinutes
        departure_mins = parse_time_to_minutes(request.departureTime)
        
        # 1. Determine Journey Mode & Threshold Trigger
        if total_dist < 150.0:
            journey_mode = "SHORT_TRIP"
            is_long_journey = False
        elif total_dist <= 300.0:
            journey_mode = "MEDIUM_TRIP"
            is_long_journey = False
        elif total_dist <= 500.0:
            journey_mode = "EXTENDED_TRIP"
            is_long_journey = False
        else:
            journey_mode = "LONG_JOURNEY_MODE"
            is_long_journey = True

        polyline = request.routePolyline
        
        if not polyline or len(polyline) < 2 or total_dist < 150.0:
            expected_arrival = format_minutes_to_time(departure_mins + int(total_dur))
            return RouteRecommendationResponse(
                requestId=request.requestId,
                isLongJourney=is_long_journey,
                journeyMode=journey_mode,
                totalDistanceKm=total_dist,
                totalDurationMinutes=total_dur,
                departureTime=request.departureTime,
                expectedArrivalTime=expected_arrival,
                recommendations=[],
                calculatedAt=datetime.now(timezone.utc).isoformat()
            )

        # 2. Evaluate Candidate Places against Route Corridor Geometry
        evaluated_candidates = []
        for cand in HIGHWAY_CANDIDATES:
            c_lat = cand["latitude"]
            c_lng = cand["longitude"]
            
            min_detour = 999.0
            closest_segment_idx = 0
            
            for i in range(len(polyline) - 1):
                seg_a = polyline[i]
                seg_b = polyline[i + 1]
                detour = distance_to_segment_km(c_lat, c_lng, seg_a[0], seg_a[1], seg_b[0], seg_b[1])
                if detour < min_detour:
                    min_detour = detour
                    closest_segment_idx = i
            
            if min_detour > request.maxDetourKm:
                continue  # Discard places requiring > 5km detour
            
            route_pos_percent = (closest_segment_idx / max(1, len(polyline) - 1)) * 100.0
            dist_from_origin = (route_pos_percent / 100.0) * total_dist
            travel_mins_to_point = (route_pos_percent / 100.0) * total_dur
            arrival_mins = departure_mins + travel_mins_to_point
            arrival_time_str = format_minutes_to_time(int(arrival_mins))
            
            arrival_hour = (arrival_mins % (24 * 60)) / 60.0
            cat = cand["category"]
            
            meal_compatibility_score = 0.0
            reason = ""
            
            if cat == "breakfast":
                if 7.0 <= arrival_hour <= 10.5:
                    meal_compatibility_score = 35.0
                    reason = f"Ideal Morning Breakfast Stop around {arrival_time_str}"
                elif 6.0 <= arrival_hour <= 11.5:
                    meal_compatibility_score = 20.0
                    reason = f"Morning Coffee & Breakfast Stop around {arrival_time_str}"
            elif cat == "lunch":
                if 12.0 <= arrival_hour <= 15.0:
                    meal_compatibility_score = 40.0
                    reason = f"Recommended Midday Lunch Rest Stop around {arrival_time_str}"
                elif 11.5 <= arrival_hour <= 16.0:
                    meal_compatibility_score = 25.0
                    reason = f"Afternoon Meal Opportunity around {arrival_time_str}"
            elif cat == "dinner":
                if 19.0 <= arrival_hour <= 22.0:
                    meal_compatibility_score = 40.0
                    reason = f"Recommended Evening Dinner Stop around {arrival_time_str}"
                elif 18.5 <= arrival_hour <= 23.0:
                    meal_compatibility_score = 20.0
                    reason = f"Night Dining Break around {arrival_time_str}"
            elif cat == "tea":
                meal_compatibility_score = 30.0
                reason = f"Refreshing Tea & Snack Break around {arrival_time_str} ({round(dist_from_origin)} km into journey)"
            elif cat == "fuel":
                if dist_from_origin >= 150.0:
                    meal_compatibility_score = 35.0
                    reason = f"Highway Fuel & Rest Area ({round(dist_from_origin)} km from origin)"
                else:
                    meal_compatibility_score = 15.0
                    reason = f"Highway Fuel Station"
            elif cat == "hotel":
                if arrival_hour >= 21.0 or arrival_hour <= 4.0:
                    meal_compatibility_score = 45.0
                    reason = f"Recommended Overnight Stay — Arrival at {arrival_time_str}"
                else:
                    meal_compatibility_score = 10.0
                    reason = f"Overnight Lodge & Resort"

            if cat in ["breakfast", "lunch", "dinner"] and meal_compatibility_score < 20.0:
                continue

            detour_score = max(0.0, (5.0 - min_detour) * 6.0)
            rating_score = cand["rating"] * 5.0
            total_score = detour_score + rating_score + meal_compatibility_score + 10.0
            
            evaluated_candidates.append(RouteStopCandidate(
                placeId=cand["id"],
                name=cand["name"],
                category=cat,
                latitude=c_lat,
                longitude=c_lng,
                routeDistanceFromOriginKm=round(dist_from_origin, 1),
                detourDistanceKm=round(min_detour, 1),
                estimatedArrivalTime=arrival_time_str,
                estimatedStopDurationMinutes=cand.get("stopDurationMins", 30),
                rating=cand["rating"],
                reviewsCount=cand["reviewsCount"],
                openingHours=OpeningHours(
                    openTime=cand.get("openTime", "06:00"),
                    closeTime=cand.get("closeTime", "22:00"),
                    isOpen24Hours=cand.get("isOpen24Hours", False)
                ),
                routePositionPercent=round(route_pos_percent, 1),
                reason=reason,
                score=round(total_score, 1),
                district=cand["district"],
                tagline=cand["tagline"],
                verified=True
            ))

        evaluated_candidates.sort(key=lambda x: x.routeDistanceFromOriginKm)
        
        max_recs = 2 if journey_mode == "MEDIUM_TRIP" else 4 if journey_mode == "EXTENDED_TRIP" else 6
        selected_recs = evaluated_candidates[:max_recs]
        
        expected_arrival = format_minutes_to_time(departure_mins + int(total_dur))
        
        return RouteRecommendationResponse(
            requestId=request.requestId,
            isLongJourney=is_long_journey,
            journeyMode=journey_mode,
            totalDistanceKm=total_dist,
            totalDurationMinutes=total_dur,
            departureTime=request.departureTime,
            expectedArrivalTime=expected_arrival,
            recommendations=selected_recs,
            calculatedAt=datetime.now(timezone.utc).isoformat()
        )

route_stop_engine_service = RouteStopEngineService()
