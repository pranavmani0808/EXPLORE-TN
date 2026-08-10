from pydantic import BaseModel, Field
from typing import List, Optional

class TrackPoint(BaseModel):
    lat: float
    lng: float
    elevation: float

class RouteCreate(BaseModel):
    title: str = Field(..., example="Valparai 40 Hairpin Bend Trail")
    district: str = Field(..., example="Coimbatore")
    difficulty: str = Field(..., example="Hard")
    distanceKm: float = Field(..., example=64.5)
    elevationGainM: float = Field(..., example=1480.0)
    trackPoints: Optional[List[TrackPoint]] = []

class RouteResponse(BaseModel):
    id: str
    slug: str
    title: str
    district: str
    difficulty: str
    distanceKm: float
    elevationGainM: float
    verified: bool
    createdBy: str
    createdAt: str
