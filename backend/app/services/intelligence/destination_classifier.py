from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DestinationProfile(BaseModel):
    destination: str
    region: str
    destinationTypes: List[str]  # e.g. ["HILL_STATION", "NATURE"], ["TEMPLE", "HERITAGE", "CITY"]
    primaryTagline: str

class InterestCategory(BaseModel):
    id: str
    label: str
    icon: str
    categoryKey: str

# Comprehensive Database of Destination Profiles across Tamil Nadu & India
DESTINATION_CATALOG: Dict[str, Dict[str, Any]] = {
    "madurai": {
        "destination": "Madurai",
        "region": "Tamil Nadu",
        "destinationTypes": ["TEMPLE", "HERITAGE", "CITY", "FOOD", "CULTURAL"],
        "primaryTagline": "Cultural & Culinary Capital of Tamil Nadu",
        "interests": [
            {"id": "temples", "label": "Temples & Heritage", "icon": "🛕", "categoryKey": "temple"},
            {"id": "food", "label": "Famous Local Food", "icon": "🍛", "categoryKey": "food"},
            {"id": "shopping", "label": "Handicrafts & Local Shopping", "icon": "🛍️", "categoryKey": "shopping"},
            {"id": "heritage", "label": "Historical Places", "icon": "🏛️", "categoryKey": "heritage"},
            {"id": "nature", "label": "Nature & Riverside", "icon": "🌿", "categoryKey": "nature"},
            {"id": "hidden", "label": "Hidden / Local Spots", "icon": "📸", "categoryKey": "hidden"},
        ]
    },
    "kodaikanal": {
        "destination": "Kodaikanal",
        "region": "Dindigul, Tamil Nadu",
        "destinationTypes": ["HILL_STATION", "NATURE", "WATERFALL", "FOREST"],
        "primaryTagline": "Princess of Hill Stations",
        "interests": [
            {"id": "viewpoints", "label": "Viewpoints & Valleys", "icon": "🏔️", "categoryKey": "viewpoints"},
            {"id": "sunriseset", "label": "Sunrise & Sunset", "icon": "🌄", "categoryKey": "scenery"},
            {"id": "waterfalls", "label": "Waterfalls", "icon": "💦", "categoryKey": "waterfalls"},
            {"id": "forest", "label": "Forest & Wildlife", "icon": "🌲", "categoryKey": "nature"},
            {"id": "nature", "label": "Scenic Nature & Lake", "icon": "🌿", "categoryKey": "nature"},
            {"id": "trekking", "label": "Trekking & Trails", "icon": "🥾", "categoryKey": "trekking"},
            {"id": "food", "label": "Cafés & Local Food", "icon": "☕", "categoryKey": "food"},
        ]
    },
    "ooty": {
        "destination": "Ooty",
        "region": "Nilgiris, Tamil Nadu",
        "destinationTypes": ["HILL_STATION", "NATURE", "HERITAGE"],
        "primaryTagline": "Queen of Hill Stations",
        "interests": [
            {"id": "viewpoints", "label": "Viewpoints", "icon": "🌄", "categoryKey": "viewpoints"},
            {"id": "tea", "label": "Tea Estates & Factory", "icon": "🌿", "categoryKey": "nature"},
            {"id": "forest", "label": "Forests & Ooty Lake", "icon": "🌲", "categoryKey": "nature"},
            {"id": "gardens", "label": "Botanical Gardens", "icon": "🌸", "categoryKey": "nature"},
            {"id": "train", "label": "Heritage Toy Train", "icon": "🚂", "categoryKey": "heritage"},
            {"id": "trekking", "label": "Trekking & Hiking", "icon": "🥾", "categoryKey": "trekking"},
            {"id": "food", "label": "Fudge, Cafés & Food", "icon": "☕", "categoryKey": "food"},
            {"id": "photography", "label": "Scenic Photography", "icon": "📸", "categoryKey": "scenery"},
        ]
    },
    "pondicherry": {
        "destination": "Pondicherry",
        "region": "Puducherry",
        "destinationTypes": ["COASTAL", "BEACH", "HERITAGE", "FOOD"],
        "primaryTagline": "French Quarter Coastal Escape",
        "interests": [
            {"id": "beaches", "label": "Beaches & Promenade", "icon": "🏖️", "categoryKey": "beaches"},
            {"id": "heritage", "label": "French Heritage Architecture", "icon": "🏛️", "categoryKey": "heritage"},
            {"id": "cafes", "label": "French Bakeries & Cafés", "icon": "☕", "categoryKey": "food"},
            {"id": "food", "label": "Seafood & Local Dining", "icon": "🍛", "categoryKey": "food"},
            {"id": "sunset", "label": "Sunset Views", "icon": "🌅", "categoryKey": "scenery"},
            {"id": "shopping", "label": "Boutique Shopping", "icon": "🛍️", "categoryKey": "shopping"},
            {"id": "spiritual", "label": "Auroville & Relaxation", "icon": "🧘", "categoryKey": "spiritual"},
        ]
    },
    "thanjavur": {
        "destination": "Thanjavur",
        "region": "Tamil Nadu",
        "destinationTypes": ["HERITAGE", "TEMPLE", "CULTURAL"],
        "primaryTagline": "Cradle of Chola Architecture & Culture",
        "interests": [
            {"id": "temples", "label": "Brihadeeswarar Temple", "icon": "🛕", "categoryKey": "temple"},
            {"id": "heritage", "label": "Royal Palace & Fort", "icon": "🏛️", "categoryKey": "heritage"},
            {"id": "culture", "label": "Art, Bronze & Culture", "icon": "🎨", "categoryKey": "culture"},
            {"id": "shopping", "label": "Tanjore Dolls & Handicrafts", "icon": "🛍️", "categoryKey": "shopping"},
            {"id": "food", "label": "Authentic Delta Food", "icon": "🍛", "categoryKey": "food"},
            {"id": "museums", "label": "Museums & Manuscripts", "icon": "🏺", "categoryKey": "heritage"},
        ]
    },
    "rishikesh": {
        "destination": "Rishikesh",
        "region": "Uttarakhand",
        "destinationTypes": ["ADVENTURE", "RIVER", "MOUNTAIN", "SPIRITUAL"],
        "primaryTagline": "Yoga & Ganges White Water Rafting Capital",
        "interests": [
            {"id": "rafting", "label": "River Rafting & Rapids", "icon": "🛶", "categoryKey": "adventure"},
            {"id": "mountain", "label": "Himalayan Valley Views", "icon": "🏔️", "categoryKey": "viewpoints"},
            {"id": "water", "label": "Cliff Jumping & Ganges", "icon": "🌊", "categoryKey": "adventure"},
            {"id": "spiritual", "label": "Ashrams & Ganga Aarti", "icon": "🧘", "categoryKey": "spiritual"},
            {"id": "trekking", "label": "Waterfall Trekking", "icon": "🥾", "categoryKey": "trekking"},
            {"id": "food", "label": "Riverside Cafés & Food", "icon": "🍛", "categoryKey": "food"},
        ]
    },
    "dhanushkodi": {
        "destination": "Dhanushkodi",
        "region": "Rameswaram, Tamil Nadu",
        "destinationTypes": ["COASTAL", "BEACH", "HERITAGE", "NATURE"],
        "primaryTagline": "Lost Ghost Town & Confluence of Two Seas",
        "interests": [
            {"id": "ghost_town", "label": "Ghost Town Ruins", "icon": "🏛️", "categoryKey": "heritage"},
            {"id": "confluence", "label": "Arichal Munai Confluence", "icon": "🌊", "categoryKey": "coastal"},
            {"id": "beaches", "label": "Pristine Beaches", "icon": "🏖️", "categoryKey": "beaches"},
            {"id": "birds", "label": "Flamingos & Seabirds", "icon": "📸", "categoryKey": "nature"},
            {"id": "sunset", "label": "Ocean Sunset", "icon": "🌅", "categoryKey": "scenery"},
        ]
    },
    "chennai": {
        "destination": "Chennai",
        "region": "Tamil Nadu",
        "destinationTypes": ["CITY", "COASTAL", "FOOD", "HERITAGE"],
        "primaryTagline": "Gateway to South India",
        "interests": [
            {"id": "beaches", "label": "Marina & Elliot's Beach", "icon": "🏖️", "categoryKey": "beaches"},
            {"id": "food", "label": "Filter Coffee & Street Food", "icon": "☕", "categoryKey": "food"},
            {"id": "heritage", "label": "Mylapore & Colonial Fort", "icon": "🏛️", "categoryKey": "heritage"},
            {"id": "temples", "label": "Kapaleeshwarar Temple", "icon": "🛕", "categoryKey": "temple"},
            {"id": "shopping", "label": "Silk Sarees & T.Nagar", "icon": "🛍️", "categoryKey": "shopping"},
        ]
    },
    "valparai": {
        "destination": "Valparai",
        "region": "Coimbatore, Tamil Nadu",
        "destinationTypes": ["HILL_STATION", "WILDLIFE", "NATURE"],
        "primaryTagline": "70 Hairpin Pass & Tea Plantation Reserve",
        "interests": [
            {"id": "hairpin", "label": "40 Hairpin Bend Drive", "icon": "🛣️", "categoryKey": "adventure"},
            {"id": "tea", "label": "Lush Tea Plantations", "icon": "🌿", "categoryKey": "nature"},
            {"id": "wildlife", "label": "Nilgiri Tahr & Elephants", "icon": "🐘", "categoryKey": "wildlife"},
            {"id": "waterfalls", "label": "Monkey Falls & Dams", "icon": "💦", "categoryKey": "waterfalls"},
            {"id": "viewpoints", "label": "Nallamudi Poonjolai View", "icon": "🏔️", "categoryKey": "viewpoints"},
        ]
    },
    "bir billing": {
        "destination": "Bir Billing",
        "region": "Kangra, Himachal Pradesh",
        "destinationTypes": ["ADVENTURE", "MOUNTAIN", "SPIRITUAL"],
        "primaryTagline": "World Paragliding Capital",
        "interests": [
            {"id": "paragliding", "label": "Tandem Paragliding", "icon": "🪂", "categoryKey": "adventure"},
            {"id": "monastery", "label": "Tibetan Monasteries", "icon": "🧘", "categoryKey": "spiritual"},
            {"id": "sunset", "label": "Landing Site Sunset", "icon": "🌅", "categoryKey": "scenery"},
            {"id": "cafes", "label": "Mountain Cafés", "icon": "☕", "categoryKey": "food"},
        ]
    },
    "zanskar river": {
        "destination": "Zanskar River",
        "region": "Ladakh",
        "destinationTypes": ["RIVER", "ADVENTURE", "MOUNTAIN"],
        "primaryTagline": "High-altitude Himalayan river for world-class whitewater kayaking & Chadar trek",
        "interests": [
            {"id": "kayaking", "label": "Kayaking & Whitewater Rafting", "icon": "🛶", "categoryKey": "adventure"},
            {"id": "camping", "label": "Riverside Camping & Stays", "icon": "🏕️", "categoryKey": "camping"},
            {"id": "gorge", "label": "Zanskar Canyon & Gorge Views", "icon": "🏔️", "categoryKey": "viewpoints"},
            {"id": "food", "label": "Local Dhaba Food & Rest Stops", "icon": "☕", "categoryKey": "food"},
        ]
    },
}

class DestinationClassifier:
    @classmethod
    def classify_destination(cls, destination_name: str) -> Dict[str, Any]:
        key = destination_name.strip().lower()
        
        # 1. Check exact catalog match
        if key in DESTINATION_CATALOG:
            return DESTINATION_CATALOG[key]
            
        # 2. Check canonical places_service resolver
        try:
            from backend.app.services.places_service import places_service
            resolved = places_service.resolve_destination(destination_name)
            if resolved and resolved.get("confidence") in ["HIGH", "MEDIUM"]:
                place_obj = resolved.get("placeObject") or {}
                name = resolved.get("canonicalName") or destination_name.title()
                p_type = resolved.get("placeType") or "LOCATION"
                region = resolved.get("region") or resolved.get("state") or "India"
                activities = resolved.get("activities") or []
                category = resolved.get("category") or "nature"

                interests = []
                if "kayaking" in activities or "rafting" in activities or "adventure" in category:
                    interests.append({"id": "kayaking", "label": "Kayaking & Whitewater Rafting", "icon": "🛶", "categoryKey": "adventure"})
                    interests.append({"id": "camping", "label": "Riverside Camping & Stays", "icon": "🏕️", "categoryKey": "camping"})
                    interests.append({"id": "viewpoints", "label": "Gorge & Mountain Views", "icon": "🏔️", "categoryKey": "viewpoints"})
                    interests.append({"id": "food", "label": "Local Food & Rest Stops", "icon": "☕", "categoryKey": "food"})
                elif "waterfall" in category or "waterfalls" in activities:
                    interests.append({"id": "waterfalls", "label": "Waterfalls & Streams", "icon": "💦", "categoryKey": "waterfalls"})
                    interests.append({"id": "nature", "label": "Nature Walks", "icon": "🌿", "categoryKey": "nature"})
                    interests.append({"id": "viewpoints", "label": "Scenic Spots", "icon": "🌄", "categoryKey": "viewpoints"})
                    interests.append({"id": "food", "label": "Local Food", "icon": "🍛", "categoryKey": "food"})
                elif "temple" in category or "spiritual" in activities:
                    interests.append({"id": "temples", "label": "Temples & Heritage", "icon": "🛕", "categoryKey": "temple"})
                    interests.append({"id": "heritage", "label": "Historical Architecture", "icon": "🏛️", "categoryKey": "heritage"})
                    interests.append({"id": "food", "label": "Local Food", "icon": "🍛", "categoryKey": "food"})
                else:
                    interests.append({"id": "sights", "label": "Top Sights & Attractions", "icon": "🛕", "categoryKey": "sights"})
                    interests.append({"id": "food", "label": "Local Food & Dining", "icon": "🍛", "categoryKey": "food"})
                    interests.append({"id": "nature", "label": "Nature & Viewpoints", "icon": "🌿", "categoryKey": "nature"})
                    interests.append({"id": "heritage", "label": "Culture & Heritage", "icon": "🏛️", "categoryKey": "heritage"})

                return {
                    "destination": name,
                    "region": region,
                    "destinationTypes": [p_type, category.upper()],
                    "primaryTagline": place_obj.get("tagline") or f"Explore {name}",
                    "interests": interests
                }
        except Exception:
            pass

        # 3. Partial catalog match
        for cat_key, profile in DESTINATION_CATALOG.items():
            if cat_key in key or key in cat_key:
                return profile

        # 4. Dynamic Fallback for any unknown destination
        clean_title = destination_name.strip().title()
        return {
            "destination": clean_title,
            "region": "India",
            "destinationTypes": ["CITY", "NATURE"],
            "primaryTagline": f"Explore {clean_title}",
            "interests": [
                {"id": "sights", "label": "Top Sights & Attractions", "icon": "🛕", "categoryKey": "sights"},
                {"id": "food", "label": "Local Food & Dining", "icon": "🍛", "categoryKey": "food"},
                {"id": "nature", "label": "Nature & Viewpoints", "icon": "🌿", "categoryKey": "nature"},
                {"id": "heritage", "label": "Culture & Heritage", "icon": "🏛️", "categoryKey": "heritage"},
                {"id": "shopping", "label": "Local Markets & Shopping", "icon": "🛍️", "categoryKey": "shopping"},
                {"id": "hidden", "label": "Scenic & Hidden Spots", "icon": "📸", "categoryKey": "hidden"},
            ]
        }

destination_classifier = DestinationClassifier()

