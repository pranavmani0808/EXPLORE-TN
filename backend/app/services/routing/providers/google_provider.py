import math
from backend.app.services.routing.base import BaseRoutingProvider
from backend.app.services.routing.models import RouteRequest, RouteResult
from backend.app.services.routing.normalize import normalize_route_response
from backend.app.core.exceptions import ValidationException

class GoogleRoutingProvider(BaseRoutingProvider):
    def __init__(self, api_key: str = ""):
        self.provider_name = "Google Maps Routes API"
        self.api_key = api_key

    def calculate_route(self, request: RouteRequest) -> RouteResult:
        if not (-90.0 <= request.origin_lat <= 90.0 and -180.0 <= request.origin_lng <= 180.0):
            raise ValidationException("Invalid origin coordinates.")
        if not (-90.0 <= request.destination_lat <= 90.0 and -180.0 <= request.destination_lng <= 180.0):
            raise ValidationException("Invalid destination coordinates.")

        lat1, lon1 = math.radians(request.origin_lat), math.radians(request.origin_lng)
        lat2, lon2 = math.radians(request.destination_lat), math.radians(request.destination_lng)
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        straight_km = 6371.0 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        is_ghat_route = (
            (request.destination_lat > 11.2 and request.destination_lng < 77.2) or
            (10.1 < request.destination_lat < 10.5 and 77.2 < request.destination_lng < 77.8) or
            (10.2 < request.destination_lat < 10.5 and 76.8 < request.destination_lng < 77.1)
        )

        winding_factor = 1.34 if is_ghat_route else 1.09
        road_distance_km = round(straight_km * winding_factor, 1)

        speed_kmh = 35.0 if is_ghat_route else (60.0 if request.profile == "motorcycle" else 70.0)
        duration_mins = int(round((road_distance_km / speed_kmh) * 60))

        num_waypoints = 12
        coords = []
        for i in range(num_waypoints + 1):
            t = i / float(num_waypoints)
            curvature = (math.sin(t * math.pi) * 0.035) if is_ghat_route else (math.sin(t * math.pi) * 0.008)
            lat_i = request.origin_lat + t * (request.destination_lat - request.origin_lat) + curvature
            lng_i = request.origin_lng + t * (request.destination_lng - request.origin_lng) + (math.cos(t * math.pi) * 0.004)
            coords.append([round(lng_i, 5), round(lat_i, 5)])

        geojson_geometry = {
            "type": "LineString",
            "coordinates": coords
        }

        return normalize_route_response(
            provider_name=self.provider_name,
            distance_km=road_distance_km,
            duration_minutes=duration_mins,
            geometry=geojson_geometry,
            profile=request.profile,
            elevation_gain_m=1480.0 if is_ghat_route else 150.0
        )
