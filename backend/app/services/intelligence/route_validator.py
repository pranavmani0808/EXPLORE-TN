import logging
from typing import List, Dict, Any
from backend.app.core.logger import structured_logger

class RouteSanityValidator:
    @staticmethod
    def validate_and_log_route(
        origin_name: str,
        waypoints_names: List[str],
        destination_name: str,
        route_points_coords: List[List[float]],
        distance_km: float,
        duration_minutes: int,
        trace_id: str
    ) -> Dict[str, Any]:
        if distance_km <= 0:
            raise ValueError("Invalid route calculation: distance_km must be greater than 0")
        if duration_minutes <= 0:
            raise ValueError("Invalid route calculation: duration_minutes must be greater than 0")

        # Explicit Route Debug Logging
        structured_logger.info(
            message="TRIP_ROUTE_DEBUG",
            trace_id=trace_id,
            extra={
                "origin": origin_name,
                "waypoints": waypoints_names,
                "destination": destination_name,
                "route_points_count": len(route_points_coords),
                "distance_km": distance_km,
                "duration_minutes": duration_minutes
            }
        )

        return {
            "origin": origin_name,
            "waypoints": waypoints_names,
            "destination": destination_name,
            "pointsCount": len(route_points_coords),
            "distanceKm": distance_km,
            "durationMinutes": duration_minutes,
            "valid": True
        }

route_sanity_validator = RouteSanityValidator()
