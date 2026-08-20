from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

INDIA_MIN_LAT = 6.0
INDIA_MAX_LAT = 37.6
INDIA_MIN_LNG = 68.0
INDIA_MAX_LNG = 97.5

class PlaceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Suruli Waterfalls"})
    district: str = Field(..., json_schema_extra={"example": "Theni"})
    category: str = Field(..., json_schema_extra={"example": "waterfall"})
    tagline: Optional[str] = Field(None, json_schema_extra={"example": "Scenic cascading falls surrounded by dense forest"})
    description: Optional[str] = None
    latitude: float = Field(..., json_schema_extra={"example": 9.6644})
    longitude: float = Field(..., json_schema_extra={"example": 77.2653})
    elevation: Optional[str] = "450m MSL"

    @field_validator("latitude")
    def validate_latitude(cls, v: float) -> float:
        if v < -90.0 or v > 90.0:
            raise ValueError(f"Latitude {v}°N falls outside valid WGS84 latitude bounds (-90.0°N to +90.0°N).")
        return v

    @field_validator("longitude")
    def validate_longitude(cls, v: float) -> float:
        if v < -180.0 or v > 180.0:
            raise ValueError(f"Longitude {v}°E falls outside valid WGS84 longitude bounds (-180.0°E to +180.0°E).")
        return v

class PlaceFeedbackCreate(BaseModel):
    isAccurate: bool = True
    issueCategory: Optional[str] = "road_condition"
    comments: Optional[str] = None

class PlaceResponse(BaseModel):
    id: str
    slug: str
    name: str
    district: str
    category: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float
    elevation: Optional[str] = None
    verified: bool = False
    createdBy: str
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[str] = None
    createdAt: str
