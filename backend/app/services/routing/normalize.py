from typing import Dict, Any, List
from backend.app.services.routing.models import RouteResult

def normalize_route_response(
    provider_name: str,
    distance_km: float,
    duration_minutes: int,
    geometry: Dict[str, Any],
    profile: str = "driving",
    elevation_gain_m: float = 0.0
) -> RouteResult:
    """
    Normalizes provider-specific responses into the standard ExplorerTN RouteResult contract.
    Never exposes raw provider JSON schemas to the API or frontend layer.
    """
    return RouteResult(
        distance_km=round(distance_km, 1),
        duration_minutes=max(1, int(round(duration_minutes))),
        geometry=geometry,
        elevation_gain_m=elevation_gain_m,
        provider=provider_name,
        profile=profile,
        source="routing_engine"
    )
