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
}

class DestinationClassifier:
    @classmethod
    def classify_destination(cls, destination_name: str) -> Dict[str, Any]:
        key = destination_name.strip().lower()
        
        # Check exact catalog match
        if key in DESTINATION_CATALOG:
            return DESTINATION_CATALOG[key]
            
        # Partial match
        for cat_key, profile in DESTINATION_CATALOG.items():
            if cat_key in key or key in cat_key:
                return profile

        # Dynamic Fallback for any unknown destination
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
