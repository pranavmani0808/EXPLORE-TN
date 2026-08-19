import time
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

# Isolated Stateless Route Engine Contracts
class CoordinatesDTO(BaseModel):
    name: str
    latitude: float
    longitude: float
    state: Optional[str] = None
    country: Optional[str] = "India"

class IsolatedRouteRequestDTO(BaseModel):
    requestId: str
    origin: CoordinatesDTO
    waypoints: Optional[List[CoordinatesDTO]] = []
    destination: CoordinatesDTO
    travelMode: str = "motorcycle" # "driving", "motorcycle", "walking", "cycling"

class IsolatedRouteResultDTO(BaseModel):
    requestId: str
    origin: CoordinatesDTO
    waypoints: Optional[List[CoordinatesDTO]] = []
    destination: CoordinatesDTO
    destinationFingerprint: str # e.g. "Rishikesh:30.0869:78.2676"
    distanceKm: float
    durationMinutes: int
    geometry: Dict[str, Any]
    provider: str
    travelMode: str
    calculatedAt: str # ISO 8601 string
