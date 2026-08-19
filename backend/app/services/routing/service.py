import time
from typing import Dict, Any, List, Optional
from backend.app.services.routing.models import (
    RouteRequest,
    RouteResult,
    CoordinatesDTO,
    IsolatedRouteRequestDTO,
    IsolatedRouteResultDTO,
)
from backend.app.services.routing.providers.osrm_provider import OSRMRoutingProvider
from backend.app.core.logger import structured_logger

class RoutingService:
    def __init__(self):
        self.provider = OSRMRoutingProvider()
        self._cache: Dict[str, IsolatedRouteResultDTO] = {}

    def generate_fingerprint(self, coords: CoordinatesDTO) -> str:
        return f"{coords.name}:{coords.latitude:.4f}:{coords.longitude:.4f}"

    def generate_cache_key(self, req: IsolatedRouteRequestDTO) -> str:
        orig_str = f"{req.origin.latitude:.4f},{req.origin.longitude:.4f}"
        dest_str = f"{req.destination.latitude:.4f},{req.destination.longitude:.4f}"
        wp_str = "_".join([f"{wp.latitude:.4f},{wp.longitude:.4f}" for wp in req.waypoints or []])
        return f"route:{req.travelMode}:{orig_str}:{dest_str}:{wp_str}"

    def calculate_route(self, origin_lat: float, origin_lng: float, destination_lat: float, destination_lng: float, profile: str = "motorcycle") -> RouteResult:
        req = RouteRequest(
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            profile=profile
        )
        return self.provider.calculate_route(req)

    def calculate_isolated_route(self, req: IsolatedRouteRequestDTO) -> IsolatedRouteResultDTO:
        # Cache Check based strictly on Origin + Destination + Waypoints + TravelMode
        cache_key = self.generate_cache_key(req)
        if cache_key in self._cache:
            cached_res = self._cache[cache_key].model_copy()
            cached_res.requestId = req.requestId
            cached_res.calculatedAt = time.strftime("%Y-%m-%dT%H:%M:%SZ")
            structured_logger.info(
                f"[RouteEngine] CACHE HIT requestId={req.requestId} origin={req.origin.name} destination={req.destination.name}",
                trace_id=req.requestId
            )
            return cached_res

        route_sequence = [req.origin] + (req.waypoints or []) + [req.destination]
        
        one_way_dist_km = 0.0
        one_way_duration_mins = 0
        combined_coords: List[List[float]] = []

        # Outbound Leg Calculation
        for i in range(len(route_sequence) - 1):
            p_start = route_sequence[i]
            p_end = route_sequence[i+1]

            leg_res = self.calculate_route(
                origin_lat=p_start.latitude,
                origin_lng=p_start.longitude,
                destination_lat=p_end.latitude,
                destination_lng=p_end.longitude,
                profile=req.travelMode
            )
            one_way_dist_km += leg_res.distance_km
            one_way_duration_mins += leg_res.duration_minutes
            if leg_res.geometry and "coordinates" in leg_res.geometry:
                combined_coords.extend(leg_res.geometry["coordinates"])

        # Return Leg Calculation
        roundtrip_seq = list(reversed(route_sequence))
        for i in range(len(roundtrip_seq) - 1):
            p_start = roundtrip_seq[i]
            p_end = roundtrip_seq[i+1]

            leg_res = self.calculate_route(
                origin_lat=p_start.latitude,
                origin_lng=p_start.longitude,
                destination_lat=p_end.latitude,
                destination_lng=p_end.longitude,
                profile=req.travelMode
            )
            if leg_res.geometry and "coordinates" in leg_res.geometry:
                combined_coords.extend(leg_res.geometry["coordinates"])

        total_road_dist_km = round(one_way_dist_km * 2, 1)
        total_duration_mins = one_way_duration_mins * 2
        fingerprint = self.generate_fingerprint(req.destination)

        result = IsolatedRouteResultDTO(
            requestId=req.requestId,
            origin=req.origin,
            waypoints=req.waypoints,
            destination=req.destination,
            destinationFingerprint=fingerprint,
            distanceKm=total_road_dist_km,
            durationMinutes=total_duration_mins,
            geometry={"type": "LineString", "coordinates": combined_coords},
            provider="OSRM Routing Engine",
            travelMode=req.travelMode,
            calculatedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ")
        )

        # Cache result
        self._cache[cache_key] = result

        # Structured Isolated Route Engine Logging
        structured_logger.info(f"[RouteEngine] requestId={req.requestId}", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] origin={req.origin.name} ({req.origin.latitude}, {req.origin.longitude})", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] destination={req.destination.name} ({req.destination.latitude}, {req.destination.longitude})", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] travelMode={req.travelMode}", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] provider=OSRM Routing Engine", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] distance={total_road_dist_km}km", trace_id=req.requestId)
        structured_logger.info(f"[RouteEngine] duration={total_duration_mins}mins", trace_id=req.requestId)

        return result

routing_service = RoutingService()
