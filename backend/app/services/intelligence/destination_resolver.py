import re
from typing import Dict, Any, List, Optional, Tuple
from backend.app.services.places_service import places_service

# Destination Category Profiles
DESTINATION_CATEGORY_PROFILES: Dict[str, Dict[str, Any]] = {
    "madurai": {
        "canonicalName": "Madurai",
        "district": "Madurai",
        "categories": [
            {"id": "temple", "label": "Temples & Sacred", "icon": "🛕"},
            {"id": "food", "label": "Iconic Street Food", "icon": "🍌"},
            {"id": "heritage", "label": "Royal Palaces", "icon": "🏰"},
            {"id": "market", "label": "Heritage Markets", "icon": "🛍️"},
        ],
        "highlights": ["meenakshi-temple", "thirumalai-nayakkar-palace", "famous-jigarthanda-madurai", "murugan-idli-shop-madurai"]
    },
    "kodaikanal": {
        "canonicalName": "Kodaikanal",
        "district": "Dindigul",
        "categories": [
            {"id": "viewpoint", "label": "Mountain Viewpoints", "icon": "🏞️"},
            {"id": "waterfall", "label": "Waterfalls", "icon": "🌊"},
            {"id": "lake", "label": "Boating & Lakes", "icon": "🚣"},
            {"id": "nature", "label": "Pine Forests", "icon": "🌲"},
        ],
        "highlights": ["kodaikanal-lake", "palani-temple"]
    },
    "theni": {
        "canonicalName": "Theni",
        "district": "Theni",
        "categories": [
            {"id": "waterfall", "label": "Cascade Falls", "icon": "🌊"},
            {"id": "mountain", "label": "Cloud Mountains", "icon": "☁️"},
            {"id": "river", "label": "River Valleys", "icon": "🏕️"},
        ],
        "highlights": ["suruli-falls", "meghamalai"]
    },
    "chennai": {
        "canonicalName": "Chennai",
        "district": "Chennai",
        "categories": [
            {"id": "coastal", "label": "Coastal Beaches", "icon": "🏖️"},
            {"id": "temple", "label": "Dravidian Shrines", "icon": "🛕"},
            {"id": "food", "label": "Culinary Trails", "icon": "🍱"},
        ],
        "highlights": ["marina-beach", "kapaleeshwarar-temple"]
    },
    "thanjavur": {
        "canonicalName": "Thanjavur",
        "district": "Thanjavur",
        "categories": [
            {"id": "heritage", "label": "Chola Architecture", "icon": "🏰"},
            {"id": "temple", "label": "Big Temple", "icon": "🛕"},
        ],
        "highlights": ["brihadisvara-temple", "swamimalai-temple"]
    }
}

ALIAS_MAP: Dict[str, str] = {
    "kodai": "kodaikanal",
    "kodaikanal hills": "kodaikanal",
    "kodai hills": "kodaikanal",
    "madurai city": "madurai",
    "temple city": "madurai",
    "theni valley": "theni",
    "cloud mountain": "meghamalai",
    "big temple": "brihadisvara-temple",
    "marina": "marina-beach",
    "jigarthanda": "famous-jigarthanda-madurai",
    "meenakshi": "meenakshi-temple",
}

class DestinationResolver:
    def __init__(self):
        pass

    def resolve_destination_query(self, query: str) -> Tuple[Optional[dict], List[dict]]:
        """
        Resolves a free-text destination search query into:
        1. Canonical place/destination object
        2. List of verified nearby/contained places in that destination
        """
        if not query:
            return None, []

        q_clean = query.lower().strip()

        # Check explicit alias mapping
        mapped_key = ALIAS_MAP.get(q_clean, q_clean)

        # Search places_service for exact slug or alias match
        all_places = list(places_service._places_db.values())
        matched_place = None

        for p in all_places:
            if p["slug"] == mapped_key or p["name"].lower() == mapped_key:
                matched_place = p
                break
            if any(alias.lower() == mapped_key for alias in p.get("aliases", [])):
                matched_place = p
                break

        if not matched_place:
            # Search by district match
            district_matches = [p for p in all_places if p["district"].lower() == mapped_key or mapped_key in p["district"].lower()]
            if district_matches:
                matched_place = district_matches[0]

        if not matched_place:
            # Substring search
            for p in all_places:
                if mapped_key in p["name"].lower():
                    matched_place = p
                    break

        if matched_place:
            # Retrieve contained/nearby places within same district or 35km radius
            target_district = matched_place["district"]
            nearby = [
                p for p in all_places
                if p["district"] == target_district or (
                    abs(p["latitude"] - matched_place["latitude"]) < 0.35 and
                    abs(p["longitude"] - matched_place["longitude"]) < 0.35
                )
            ]
            return matched_place, nearby

        return None, []

    def get_destination_profile(self, destination_name: str) -> Dict[str, Any]:
        """
        Returns destination-aware category chips and highlights for AI Trip Copilot.
        """
        dest_key = destination_name.lower().strip()
        mapped_key = ALIAS_MAP.get(dest_key, dest_key)

        if mapped_key in DESTINATION_CATEGORY_PROFILES:
            return DESTINATION_CATEGORY_PROFILES[mapped_key]

        # Dynamic fallback category profile derived from DB
        matched_place, nearby = self.resolve_destination_query(destination_name)
        categories = set()
        if nearby:
            for p in nearby:
                categories.add(p.get("category", "sightseeing"))

        cat_list = [{"id": c, "label": c.capitalize(), "icon": "📍"} for c in categories]
        return {
            "canonicalName": matched_place["name"] if matched_place else destination_name.capitalize(),
            "district": matched_place["district"] if matched_place else "Tamil Nadu",
            "categories": cat_list[:5] if cat_list else [{"id": "tourism", "label": "Tourist Spots", "icon": "🏞️"}],
            "highlights": [p["slug"] for p in nearby[:4]]
        }

destination_resolver = DestinationResolver()
