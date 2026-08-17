from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float
    profile: str = "motorcycle" # "motorcycle", "car", "walking"

class RouteResult(BaseModel):
    distance_km: float
    duration_minutes: int
    geometry: Dict[str, Any] # GeoJSON LineString
    elevation_gain_m: Optional[float] = None
    provider: str
    profile: str
    source: str = "routing_engine"
