from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

TN_MIN_LAT = 8.0
TN_MAX_LAT = 13.6
TN_MIN_LNG = 76.0
TN_MAX_LNG = 80.5

class PlaceCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, json_schema_extra={"example": "Suruli Waterfalls"})
    district: str = Field(..., json_schema_extra={"example": "Theni"})
    category: str = Field(..., json_schema_extra={"example": "waterfall"})
    tagline: Optional[str] = Field(None, json_schema_extra={"example": "Scenic cascading falls surrounded by dense forest"})
    description: Optional[str] = None
    latitude: float = Field(..., json_schema_extra={"example": 9.6644})
    longitude: float = Field(..., json_schema_extra={"example": 77.2653})
    elevation: Optional[str] = "450m MSL"

    @field_validator("latitude")
    def validate_latitude(cls, v: float) -> float:
        if v < TN_MIN_LAT or v > TN_MAX_LAT:
            raise ValueError(f"Latitude {v}°N falls outside Tamil Nadu WGS84 bounds ({TN_MIN_LAT}°N - {TN_MAX_LAT}°N).")
        return v

    @field_validator("longitude")
    def validate_longitude(cls, v: float) -> float:
        if v < TN_MIN_LNG or v > TN_MAX_LNG:
            raise ValueError(f"Longitude {v}°E falls outside Tamil Nadu WGS84 bounds ({TN_MIN_LNG}°E - {TN_MAX_LNG}°E).")
        return v

class PlaceResponse(BaseModel):
    id: str
    slug: str
    name: str
    district: str
    category: str
    tagline: Optional[str]
    description: Optional[str]
    latitude: float
    longitude: float
    elevation: Optional[str]
    verified: bool
    createdBy: str
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[str] = None
    createdAt: str
