import os
from backend.app.services.routing.base import BaseRoutingProvider
from backend.app.services.routing.providers.osrm_provider import OSRMRoutingProvider
from backend.app.services.routing.providers.mapbox_provider import MapboxRoutingProvider
from backend.app.services.routing.providers.google_provider import GoogleRoutingProvider

def get_routing_provider() -> BaseRoutingProvider:
    """
    Returns the configured RoutingProvider based on environment configuration.
    Supported options: 'osrm', 'mapbox', 'google'. Defaults to 'osrm'.
    """
    provider_type = os.getenv("ROUTING_PROVIDER", "osrm").lower()

    if provider_type == "mapbox":
        return MapboxRoutingProvider(api_key=os.getenv("MAPBOX_API_KEY", ""))
    elif provider_type == "google":
        return GoogleRoutingProvider(api_key=os.getenv("GOOGLE_MAPS_API_KEY", ""))
    else:
        return OSRMRoutingProvider()
