"""
Pydantic schemas and Data Transfer Objects (DTOs) for AI Travel Intelligence Engine.
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class IntentType(str, Enum):
    ROUTE_PLANNING = "ROUTE_PLANNING"
    SINGLE_DESTINATION_DISCOVERY = "SINGLE_DESTINATION_DISCOVERY"
    NATURAL_LANGUAGE_PLANNING = "NATURAL_LANGUAGE_PLANNING"
    PLAN_MODIFY = "PLAN_MODIFY"

class ProvenanceSource(str, Enum):
    EXPLORE_TN = "ExploreTN"
    GOOGLE_PLACES = "Google Places"
    WEB_DISCOVERY = "Web Discovery"

class ProvenanceInfo(BaseModel):
    source: ProvenanceSource = ProvenanceSource.EXPLORE_TN
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    verified: bool = True
    details: Optional[str] = "Verified PostGIS Database Entry"

class StructuredTripIntent(BaseModel):
    intent_type: IntentType = IntentType.NATURAL_LANGUAGE_PLANNING
    raw_query: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    days: int = Field(default=1, ge=1, le=14)
    travelers: int = Field(default=1, ge=1, le=20)
    interests: List[str] = Field(default_factory=list)
    budget: str = "moderate"  # budget, moderate, luxury
    transport_mode: str = "driving"  # driving, transit, bicycling, walking
    max_driving_hours: float = 8.0
    radius_km: float = 50.0
    categories: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    modification_request: Optional[str] = None

class PlaceCandidate(BaseModel):
    id: str
    name: str
    slug: str
    lat: float
    lng: float
    district: Optional[str] = None
    category: str = "Attraction"
    rating: float = 4.5
    confidence_score: float = 0.90
    ranking_score: float = 0.0
    provenance: ProvenanceInfo = Field(default_factory=ProvenanceInfo)
    image_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None

class ItineraryStop(BaseModel):
    order: int
    day_number: int = 1
    place_id: str
    name: str
    slug: str
    category: str
    lat: float
    lng: float
    district: Optional[str] = None
    image_url: Optional[str] = None
    distance_from_prev_km: float = 0.0
    duration_from_prev_mins: float = 0.0
    recommended_visit_mins: int = 60
    rationale: str = ""
    opening_hours: str = "Open 24 Hours / Sunrise to Sunset"
    access_status: str = "Open"
    provenance: ProvenanceInfo = Field(default_factory=ProvenanceInfo)

class DayPlan(BaseModel):
    day_number: int
    title: str
    description: str
    day_driving_dist_km: float = 0.0
    day_driving_time_mins: float = 0.0
    stops: List[ItineraryStop] = Field(default_factory=list)

class CostBreakdown(BaseModel):
    fuel_estimate_inr: float = 0.0
    tolls_estimate_inr: float = 0.0
    entry_fees_inr: float = 0.0
    food_estimate_inr: float = 0.0
    total_estimated_inr: float = 0.0
    currency: str = "INR"

class AITravelPlanRequest(BaseModel):
    query: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    days: Optional[int] = None
    travelers: Optional[int] = None
    interests: Optional[List[str]] = None
    budget: Optional[str] = None
    transport_mode: Optional[str] = None
    max_driving_hours: Optional[float] = None
    radius_km: Optional[float] = None
    categories: Optional[List[str]] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class AIModifyPlanRequest(BaseModel):
    current_plan: Dict[str, Any]
    action: str  # add_stop, remove_stop, regenerate, shorten_driving, add_hidden
    target_stop_id: Optional[str] = None
    prompt: Optional[str] = None

class AITravelPlanResponse(BaseModel):
    success: bool = True
    intent_type: IntentType
    title: str
    summary: str
    origin: Optional[Dict[str, Any]] = None
    destination: Optional[Dict[str, Any]] = None
    total_distance_km: float = 0.0
    total_driving_time_mins: float = 0.0
    day_plans: List[DayPlan] = Field(default_factory=list)
    ordered_stops: List[ItineraryStop] = Field(default_factory=list)
    route_polyline: Optional[str] = None
    route_polyline_points: Optional[List[List[float]]] = Field(default_factory=list)
    cost_estimate: CostBreakdown = Field(default_factory=CostBreakdown)
    weather_advisory: Optional[str] = "Favorable travel conditions across Tamil Nadu corridor."
    web_evidence: Optional[List[Dict[str, Any]]] = None
    raw_intent: Optional[StructuredTripIntent] = None
