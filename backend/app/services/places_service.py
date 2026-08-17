import math
from typing import List, Dict, Any, Tuple
from backend.app.schemas.places import PlaceCreate, PlaceResponse, PlaceFeedbackCreate
from backend.app.core.exceptions import ValidationException, ResourceNotFoundException, APIException, ConflictException
from backend.app.core.security import UserContext

# HAVERSINE DISTANCE MATHEMATICAL ENGINE
def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

VALID_LIFECYCLE_TRANSITIONS = {
    "DRAFT": ["SUBMITTED"],
    "SUBMITTED": ["QA_REVIEW", "REJECTED"],
    "QA_REVIEW": ["VERIFIED", "REJECTED"],
    "VERIFIED": ["PUBLISHED", "ARCHIVED"],
    "PUBLISHED": ["ARCHIVED"],
    "REJECTED": ["DRAFT"],
    "ARCHIVED": ["DRAFT"]
}

class PlacesService:
    def __init__(self):
        # In-memory transactional store backing PostgreSQL PostGIS database queries
        self._places_db: Dict[str, dict] = {
            "suruli-waterfalls": {
                "id": "p-1",
                "slug": "suruli-waterfalls",
                "name": "Suruli Waterfalls",
                "district": "Theni",
                "category": "waterfall",
                "tagline": "Scenic 150ft 2-tier cascading falls",
                "description": "Located in Theni district, Tamil Nadu.",
                "latitude": 9.6644,
                "longitude": 77.2653,
                "elevation": "450m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-08T10:00:00Z",
                "createdAt": "2026-08-08T10:00:00Z"
            }
        }
        self._audit_logs: List[dict] = []
        self._feedback_store: List[dict] = []

    def detect_spatial_duplicates(self, name: str, lat: float, lng: float) -> Tuple[bool, str]:
        norm_name = name.lower().strip().replace(" ", "")
        for p in self._places_db.values():
            p_norm = p["name"].lower().strip().replace(" ", "")
            dist = calculate_haversine(lat, lng, p["latitude"], p["longitude"])
            
            # Match 1: Exact or near name match within 5km radius
            if norm_name == p_norm and dist < 5.0:
                return True, f"Identical place name '{p['name']}' found {dist} km away."
            
            # Match 2: Extreme physical proximity (< 0.5km)
            if dist < 0.5:
                return True, f"Existing destination '{p['name']}' located within {dist} km radius."
                
        return False, ""

    def submit_place_feedback(self, place_id: str, feedback_in: PlaceFeedbackCreate, user: UserContext, trace_id: str) -> dict:
        place = self.get_place_by_id_or_slug(place_id)
        fb_record = {
            "id": f"fb-{len(self._feedback_store) + 1}",
            "placeId": place["id"],
            "placeSlug": place["slug"],
            "placeName": place["name"],
            "isAccurate": feedback_in.isAccurate,
            "issueCategory": feedback_in.issueCategory or "other",
            "comments": feedback_in.comments,
            "submittedBy": user.name,
            "traceId": trace_id,
            "createdAt": "2026-08-12T10:18:00Z"
        }
        self._feedback_store.append(fb_record)
        return fb_record

    def create_place_transactional(self, place_in: PlaceCreate, user: UserContext, trace_id: str) -> dict:
        is_dup, reason = self.detect_spatial_duplicates(place_in.name, place_in.latitude, place_in.longitude)
        if is_dup:
            raise ValidationException(f"Potential spatial duplicate detected: {reason}")

        slug = place_in.name.lower().replace(" ", "-").replace("'", "")
        place_id = f"p-{len(self._places_db) + 1}"
        
        place_record = {
            "id": place_id,
            "slug": slug,
            "name": place_in.name,
            "district": place_in.district,
            "category": place_in.category,
            "tagline": place_in.tagline,
            "description": place_in.description,
            "latitude": place_in.latitude,
            "longitude": place_in.longitude,
            "elevation": place_in.elevation,
            "status": "DRAFT",
            "verified": user.role == "super_admin",
            "version": 1,
            "createdBy": user.name,
            "createdAt": "2026-08-10T13:00:00Z"
        }

        audit_record = {
            "id": f"aud-{len(self._audit_logs) + 1}",
            "actorId": user.id,
            "actorName": user.name,
            "actorRole": user.role.upper(),
            "action": "CREATED",
            "entityType": "place",
            "entityId": slug,
            "entityName": place_in.name,
            "description": f"{user.name} • {user.role.upper()} • Created Place '{place_in.name}' ({place_in.district})",
            "traceId": trace_id,
            "createdAt": "2026-08-10T13:00:00Z"
        }

        try:
            self._places_db[slug] = place_record
            self._audit_logs.append(audit_record)
        except Exception as e:
            if slug in self._places_db:
                del self._places_db[slug]
            raise ValidationException(f"Transaction failed: {str(e)}")

        return place_record

    def create_place_with_lifecycle(self, name: str, district: str, category: str, latitude: float, longitude: float, tagline: str, user: UserContext) -> dict:
        # Validate WGS84 coordinate bounds
        if latitude < 8.0 or latitude > 13.6 or longitude < 76.0 or longitude > 80.5:
            raise ValidationException(f"Latitude/Longitude ({latitude}°N, {longitude}°E) falls outside Tamil Nadu WGS84 bounds (8.0°N-13.6°N, 76.0°E-80.5°E).")

        slug = name.lower().replace(" ", "-").replace("'", "")
        place_record = {
            "id": f"p-{len(self._places_db) + 1}",
            "slug": slug,
            "name": name,
            "district": district,
            "category": category,
            "tagline": tagline,
            "latitude": latitude,
            "longitude": longitude,
            "status": "DRAFT",
            "verified": False,
            "version": 1,
            "createdBy": user.name,
            "createdAt": "2026-08-10T14:00:00Z"
        }
        self._places_db[slug] = place_record
        return place_record

    def transition_place_status(self, slug: str, target_status: str, user: UserContext) -> dict:
        place = self.get_place_by_id_or_slug(slug)
        current_status = place.get("status", "DRAFT")
        
        allowed_targets = VALID_LIFECYCLE_TRANSITIONS.get(current_status, [])
        if target_status not in allowed_targets:
            raise ValidationException(
                f"Invalid place lifecycle transition: Cannot move from status '{current_status}' to '{target_status}'. Allowed transitions: {allowed_targets}"
            )
            
        place["status"] = target_status
        place["version"] += 1
        return place

    def update_place_concurrent(self, place_id: str, patch_data: dict = None, expected_version: int = 1, user: UserContext = None, update_data: dict = None) -> dict:
        data_to_use = patch_data if patch_data is not None else update_data
        if data_to_use is None:
            data_to_use = {}

        place = self.get_place_by_id_or_slug(place_id)
        if place["version"] != expected_version:
            raise ConflictException(
                f"Concurrency Conflict: Expected version {expected_version}, but place record is currently at version {place['version']}."
            )
            
        for k, v in data_to_use.items():
            place[k] = v
        place["version"] += 1
        return place

    def mutate_audit_log_record(self, audit_id: str, patch_data: dict) -> dict:
        raise ValidationException(f"Immutable Audit Trail: UPDATE or DELETE on audit record '{audit_id}' is strictly forbidden.")

    def get_place_by_id_or_slug(self, identifier: str) -> dict:
        if identifier in self._places_db:
            return self._places_db[identifier]
        for p in self._places_db.values():
            if p["id"] == identifier or p["slug"] == identifier:
                return p
        raise ResourceNotFoundException("Place", identifier)

    def get_all_places(self) -> List[dict]:
        return list(self._places_db.values())

places_service = PlacesService()
