from abc import ABC, abstractmethod
from backend.app.services.routing.models import RouteRequest, RouteResult

class BaseRoutingProvider(ABC):
    @abstractmethod
    def calculate_route(self, request: RouteRequest) -> RouteResult:
        """
        Calculates real road distance, ETA, and GeoJSON LineString geometry.
        """
        pass
