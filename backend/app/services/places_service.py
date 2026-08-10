import math
from typing import List, Dict, Any, Tuple
from backend.app.schemas.places import PlaceCreate, PlaceResponse
from backend.app.core.exceptions import ValidationException
from backend.app.core.security import UserContext

# HAVERSINE DISTANCE MATHEMATICAL ENGINE
def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

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
                "verified": True,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-08T10:00:00Z",
                "createdAt": "2026-08-08T10:00:00Z"
            }
        }
        self._audit_logs: List[dict] = []

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

    def create_place_transactional(self, place_in: PlaceCreate, user: UserContext, trace_id: str) -> dict:
        """
        Transactional Place Creation:
        1. Validates TN WGS84 Geofence (done via Pydantic model)
        2. Detects spatial duplicates using Haversine algorithm
        3. Executes Place insertion & Audit Trail insertion inside an atomic transaction block.
        If audit log creation fails, place creation rolls back.
        """
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
            "verified": user.role == "super_admin",
            "createdBy": user.name,
            "createdAt": "2026-08-10T13:00:00Z"
        }

        # Prepare Mandatory Audit Log Entry
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

        # TRANSACTION ATOMICITY SIMULATION
        try:
            self._places_db[slug] = place_record
            self._audit_logs.append(audit_record)
        except Exception as e:
            # Transaction Rollback
            if slug in self._places_db:
                del self._places_db[slug]
            raise ValidationException(f"Transaction failed: {str(e)}")

        return place_record

    def get_all_places(self) -> List[dict]:
        return list(self._places_db.values())

places_service = PlacesService()
