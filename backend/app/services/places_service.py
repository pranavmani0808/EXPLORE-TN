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
            },
            # 1. Thiruttani Murugan Temple
            "thiruttani-murugan-temple": {
                "id": "p-thiruttani",
                "slug": "thiruttani-murugan-temple",
                "name": "Thiruttani Murugan Temple",
                "district": "Tiruvallur",
                "category": "temple",
                "tagline": "1st Arupadai Veedu — Hilltop abode where Murugan found tranquility",
                "description": "Located on Tanigai hill in Tiruvallur district, Thiruttani Murugan Temple features 365 steps representing each day of the year. It marks where Lord Murugan found peace after vanquishing Surapadman.",
                "latitude": 13.1788,
                "longitude": 79.6074,
                "elevation": "215m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/thiruttani.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 1,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 2. Swamimalai Murugan Temple
            "swamimalai-murugan-temple": {
                "id": "p-swamimalai",
                "slug": "swamimalai-murugan-temple",
                "name": "Swamimalai Murugan Temple",
                "district": "Thanjavur",
                "category": "temple",
                "tagline": "2nd Arupadai Veedu — Abode where Lord Murugan taught the Pranava Mantra to Lord Shiva",
                "description": "Situated on a 60-foot artificial hillock near Kumbakonam, Swamimalai features 60 steps representing the 60 Tamil calendar years. Lord Murugan presides here as Balamurugan or Swaminatha Swami.",
                "latitude": 10.9567,
                "longitude": 79.3274,
                "elevation": "45m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/swamimalai.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 2,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 3. Palani Murugan Temple
            "palani-murugan-temple": {
                "id": "p-palani",
                "slug": "palani-murugan-temple",
                "name": "Palani Murugan Temple",
                "district": "Dindigul",
                "category": "temple",
                "tagline": "3rd Arupadai Veedu — Sacred Sivagiri hill abode of Lord Dhandayuthapani Swamy",
                "description": "Perched atop the steep Sivagiri hill in Palani, Dindigul district, this world-renowned shrine houses the sacred idol consecrated by Sage Bhogar using Navapashanam (nine medicinal herbal minerals).",
                "latitude": 10.4497,
                "longitude": 77.5204,
                "elevation": "420m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/palani.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 3,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 4. Tiruchendur Murugan Temple
            "tiruchendur-murugan-temple": {
                "id": "p-tiruchendur",
                "slug": "tiruchendur-murugan-temple",
                "name": "Tiruchendur Murugan Temple",
                "district": "Thoothukudi",
                "category": "temple",
                "tagline": "4th Arupadai Veedu — Seashore abode where Murugan vanquished Surapadman",
                "description": "The only Arupadai Veedu shrine located right on the seashore of the Gulf of Mannar in Tiruchendur, Thoothukudi district. It commemorates Lord Murugan's victory over the demon Surapadman.",
                "latitude": 8.4962,
                "longitude": 78.1288,
                "elevation": "5m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/tiruchendur.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 4,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 5. Pazhamudircholai Murugan Temple
            "pazhamudircholai-murugan-temple": {
                "id": "p-pazhamudircholai",
                "slug": "pazhamudircholai-murugan-temple",
                "name": "Pazhamudircholai Murugan Temple",
                "district": "Madurai",
                "category": "temple",
                "tagline": "5th Arupadai Veedu — Dense forest hill shrine of Solaimalai",
                "description": "Nestled amidst dense evergreen forests atop the Solaimalai hill range near Alagar Kovil in Madurai district. Famous for the legendary episode where Lord Murugan tested Tamil poetess Avvaiyar.",
                "latitude": 10.0911,
                "longitude": 78.2173,
                "elevation": "380m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/pazhamudircholai.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 5,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 6. Thirupparankundram Murugan Temple
            "thirupparankundram-murugan-temple": {
                "id": "p-thirupparankundram",
                "slug": "thirupparankundram-murugan-temple",
                "name": "Thirupparankundram Murugan Temple",
                "district": "Madurai",
                "category": "temple",
                "tagline": "6th Arupadai Veedu — Ancient rock-cut cave shrine where Murugan married Deivayanai",
                "description": "A 6th-century rock-cut cave temple carved into a massive granite hill on the outskirts of Madurai city, celebrating the celestial marriage of Lord Murugan to Deivayanai.",
                "latitude": 9.8797,
                "longitude": 78.0710,
                "elevation": "120m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-15T10:00:00Z",
                "createdAt": "2026-08-15T10:00:00Z",
                "image": "/src/assets/temples/thirupparankundram.jpg",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 6,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            }
        }
        self._audit_logs: List[dict] = []
        self._feedback_store: List[dict] = []

    def detect_spatial_duplicates(self, name: str, lat: float, lng: float) -> Tuple[bool, str]:
        norm_name = name.lower().strip().replace(" ", "")
        for p in self._places_db.values():
            p_norm = p["name"].lower().strip().replace(" ", "")
            dist = calculate_haversine(lat, lng, p["latitude"], p["longitude"])
            if norm_name == p_norm and dist < 5.0:
                return True, f"Identical place name '{p['name']}' found {dist} km away."
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
