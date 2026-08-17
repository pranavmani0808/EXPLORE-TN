from backend.app.services.routing.models import RouteRequest, RouteResult
from backend.app.services.routing.providers.osrm_provider import OSRMRoutingProvider
from backend.app.core.config import settings

class RoutingService:
    def __init__(self):
        self.provider = OSRMRoutingProvider()

    def calculate_route(self, origin_lat: float, origin_lng: float, destination_lat: float, destination_lng: float, profile: str = "motorcycle") -> RouteResult:
        req = RouteRequest(
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            profile=profile
        )
        return self.provider.calculate_route(req)

routing_service = RoutingService()
