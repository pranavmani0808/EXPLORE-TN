import math
import re
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
            # National & Interstate Destinations
            "kovalam": {
                "id": "p-kovalam",
                "slug": "kovalam",
                "name": "Kovalam",
                "display_name": "Kovalam Beach Break & Surfing",
                "type": "TOWN",
                "category": "coastal",
                "subcategory": "surfing",
                "tagline": "Lighthouse Beach & Surfing Point",
                "description": "Famous crescent-shaped beach near Thiruvananthapuram, renowned for surfing breaks, lighthouse view, and seaside seafood cafes.",
                "latitude": 8.4004,
                "longitude": 76.9787,
                "city": "Kovalam",
                "district": "Thiruvananthapuram",
                "state": "Kerala",
                "country": "India",
                "region": "Malabar Coast",
                "aliases": ["kovalam", "kovalam beach", "lighthouse beach kovalam"],
                "search_terms": ["surfing", "beach", "lighthouse", "water sports"],
                "activities": ["surfing", "beaches", "swimming", "seafood"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.7,
                "popularity": 90
            },
            "zanskar-river": {
                "id": "p-zanskar-river",
                "slug": "zanskar-river",
                "name": "Zanskar River",
                "display_name": "Zanskar River & Gorge, Ladakh",
                "type": "RIVER",
                "category": "adventure",
                "subcategory": "kayaking",
                "tagline": "High-altitude Himalayan river for world-class whitewater kayaking & Chadar trek",
                "description": "A sacred Himalayan river in Ladakh renowned for extreme whitewater kayaking, rafting through 1,000m granite gorges, and winter frozen river ice treks.",
                "latitude": 33.8689,
                "longitude": 76.9200,
                "city": "Padum",
                "district": "Kargil / Zanskar",
                "state": "Ladakh",
                "country": "India",
                "region": "Ladakh, Trans-Himalayas",
                "aliases": ["zanskar", "zanskar river", "zanskar river ladakh", "zanskar valley river", "zanskar rafting", "zanskar kayaking", "zanskar gorge"],
                "search_terms": ["kayaking", "rafting", "white water rafting", "chadar trek", "ladakh", "zanskar"],
                "activities": ["kayaking", "rafting", "camping", "trekking"],
                "best_for": ["Adventure Enthusiasts", "Whitewater Kayakers", "Landscape Photographers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 96
            },
            "rishikesh": {
                "id": "p-rishikesh",
                "slug": "rishikesh",
                "name": "Rishikesh",
                "display_name": "Rishikesh, Uttarakhand",
                "type": "TOWN",
                "category": "adventure",
                "subcategory": "rafting",
                "tagline": "Yoga & Ganges White Water Rafting Capital of the World",
                "description": "Situated at the Himalayan foothills where the holy Ganges river emerges, world-famous for white water river rafting, cliff jumping, yoga ashrams, and Ganga Aarti.",
                "latitude": 30.0869,
                "longitude": 78.2676,
                "city": "Rishikesh",
                "district": "Dehradun / Tehri Garhwal",
                "state": "Uttarakhand",
                "country": "India",
                "region": "Garhwal Himalayas, Uttarakhand",
                "aliases": ["rishikesh", "rishikesh rafting", "ganges rafting", "rishikesh yoga", "laxman jhula"],
                "search_terms": ["rafting", "yoga", "ganges", "kayaking", "camping", "cliff jumping"],
                "activities": ["rafting", "kayaking", "camping", "yoga", "trekking"],
                "best_for": ["River Rafters", "Yogis", "Adventure Seekers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.8,
                "popularity": 94
            },
            "goa": {
                "id": "p-goa",
                "slug": "goa",
                "name": "Goa",
                "display_name": "Goa Coastal Beaches",
                "type": "STATE",
                "category": "coastal",
                "subcategory": "beach",
                "tagline": "Pristine Arabian Sea coastline, Portuguese heritage & water sports",
                "description": "India's premier coastal state famous for golden sand beaches, water sports, Portuguese colonial architecture, and fresh seafood.",
                "latitude": 15.2993,
                "longitude": 74.1240,
                "city": "Panaji",
                "district": "North & South Goa",
                "state": "Goa",
                "country": "India",
                "region": "Konkan Coast",
                "aliases": ["goa", "goa beaches", "north goa", "south goa", "calangute", "baga"],
                "search_terms": ["beach", "beaches", "water sports", "seafood", "sunset", "coastal"],
                "activities": ["beaches", "water_sports", "seafood", "heritage", "scuba"],
                "best_for": ["Beach Lovers", "Water Sports Enthusiasts", "Holidaymakers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.8,
                "popularity": 98
            },
            "munnar": {
                "id": "p-munnar",
                "slug": "munnar",
                "name": "Munnar",
                "display_name": "Munnar Tea Hills, Kerala",
                "type": "HILL",
                "category": "mountain",
                "subcategory": "tea_plantation",
                "tagline": "Lush emerald tea plantations & high mountain misty peaks",
                "description": "A picturesque hill station in the Western Ghats of Kerala, famous for sprawling tea estates, Anamudi Peak, waterfalls, and cool mountain climate.",
                "latitude": 10.0889,
                "longitude": 77.0595,
                "city": "Munnar",
                "district": "Idukki",
                "state": "Kerala",
                "country": "India",
                "region": "Western Ghats, Kerala",
                "aliases": ["munnar", "munnar tea plantations", "munnar hills", "munnar kerala"],
                "search_terms": ["tea plantations", "tea gardens", "hills", "waterfalls", "viewpoints", "trekking"],
                "activities": ["tea_gardens", "scenery", "trekking", "viewpoints"],
                "best_for": ["Nature Enthusiasts", "Photographers", "Trekkers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.8,
                "popularity": 93
            },
            "manali": {
                "id": "p-manali",
                "slug": "manali",
                "name": "Manali",
                "display_name": "Manali Valley, Himachal Pradesh",
                "type": "TOWN",
                "category": "mountain",
                "subcategory": "adventure",
                "tagline": "Himalayan snow resort, Solang paragliding & alpine adventure",
                "description": "High-altitude Himalayan resort town in Kullu valley, renowned for paragliding in Solang Valley, snow sports at Rohtang Pass, and scenic pine forests.",
                "latitude": 32.2432,
                "longitude": 77.1892,
                "city": "Manali",
                "district": "Kullu",
                "state": "Himachal Pradesh",
                "country": "India",
                "region": "Beas River Valley, Himalayas",
                "aliases": ["manali", "solang valley", "rohtang pass", "manali adventure"],
                "search_terms": ["snow", "paragliding", "trekking", "skiing", "mountains"],
                "activities": ["paragliding", "snow_sports", "trekking", "camping"],
                "best_for": ["Snow Seekers", "Adventure Trekkers", "Mountain Lovers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1609946782701-7fa158869150?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.7,
                "popularity": 92
            },
            "leh": {
                "id": "p-leh",
                "slug": "leh",
                "name": "Leh",
                "display_name": "Leh High-Altitude Capital, Ladakh",
                "type": "TOWN",
                "category": "mountain",
                "subcategory": "heritage",
                "tagline": "High-altitude Trans-Himalayan desert capital, Buddhist monasteries & high passes",
                "description": "The capital of Ladakh situated at 3,500m MSL, surrounded by cold desert mountains, ancient Buddhist monasteries, Leh Palace, and Khardung La Pass.",
                "latitude": 34.1526,
                "longitude": 77.5771,
                "city": "Leh",
                "district": "Leh",
                "state": "Ladakh",
                "country": "India",
                "region": "Trans-Himalayas, Ladakh",
                "aliases": ["leh", "leh ladakh", "leh palace", "pangong tso", "khardung la"],
                "search_terms": ["monasteries", "high pass", "biking", "pangong", "khardung la"],
                "activities": ["biking", "monasteries", "trekking", "high_pass"],
                "best_for": ["High Altitude Explorers", "Motorcycle Riders", "Culture Seekers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 95
            },
            "coorg": {
                "id": "p-coorg",
                "slug": "coorg",
                "name": "Coorg",
                "display_name": "Coorg (Kodagu), Karnataka",
                "type": "DISTRICT",
                "category": "mountain",
                "subcategory": "coffee_plantation",
                "tagline": "Scotland of India — Coffee estates, misty hills & Abbey Falls",
                "description": "A serene coffee-producing hill station in the Western Ghats of Karnataka, renowned for Abbey Falls, Raja's Seat, coffee plantations, and Kodava culture.",
                "latitude": 12.4244,
                "longitude": 75.7382,
                "city": "Madikeri",
                "district": "Kodagu",
                "state": "Karnataka",
                "country": "India",
                "region": "Western Ghats, Karnataka",
                "aliases": ["coorg", "kodagu", "madikeri", "coorg hills", "coorg coffee"],
                "search_terms": ["coffee plantations", "coffee", "hills", "waterfalls", "abbey falls"],
                "activities": ["coffee_plantations", "trekking", "waterfalls", "viewpoints"],
                "best_for": ["Coffee Lovers", "Trekkers", "Nature Seekers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.7,
                "popularity": 90
            },
            "srinagar": {
                "id": "p-srinagar",
                "slug": "srinagar",
                "name": "Srinagar",
                "display_name": "Srinagar & Dal Lake, Kashmir",
                "type": "CITY",
                "category": "lake",
                "subcategory": "houseboat",
                "tagline": "Jewel of Kashmir — Dal Lake Shikaras, houseboats & Mughal Gardens",
                "description": "The summer capital of Jammu & Kashmir, famous for Dal Lake shikara rides, historic wooden houseboats, Nishat Bagh, Shalimar Bagh, and saffron gardens.",
                "latitude": 34.0837,
                "longitude": 74.7973,
                "city": "Srinagar",
                "district": "Srinagar",
                "state": "Jammu & Kashmir",
                "country": "India",
                "region": "Kashmir Valley",
                "aliases": ["srinagar", "dal lake", "srinagar kashmir", "shalimar bagh", "shikara"],
                "search_terms": ["dal lake", "houseboats", "shikara", "mughal gardens", "kashmir"],
                "activities": ["houseboats", "shikara_rides", "gardens", "heritage"],
                "best_for": ["Couples", "Family Vacationers", "Heritage Enthusiasts"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.8,
                "popularity": 91
            },
            "mysuru": {
                "id": "p-mysuru",
                "slug": "mysuru",
                "name": "Mysuru",
                "display_name": "Mysuru (Mysore), Karnataka",
                "type": "CITY",
                "category": "heritage",
                "subcategory": "palace",
                "tagline": "Heritage Palace Capital — Royal Amba Vilas Palace & Chamundi Hill",
                "description": "The cultural capital of Karnataka, famous for the magnificent Mysuru Palace, Chamundeshwari Temple atop Chamundi Hill, Mysore silk, and Dasara festivities.",
                "latitude": 12.2958,
                "longitude": 76.6394,
                "city": "Mysuru",
                "district": "Mysuru",
                "state": "Karnataka",
                "country": "India",
                "region": "Southern Karnataka",
                "aliases": ["mysore", "mysuru", "mysore palace", "chamundi hill"],
                "search_terms": ["palace", "heritage", "mysore palace", "silk", "temple"],
                "activities": ["palaces", "culture", "silk_shopping", "heritage"],
                "best_for": ["Heritage Buffs", "Royal History Enthusiasts", "Shoppers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.7,
                "popularity": 89
            },
            "bir-billing": {
                "id": "p-bir-billing",
                "slug": "bir-billing",
                "name": "Bir Billing",
                "display_name": "Bir Billing Paragliding Capital, Himachal Pradesh",
                "type": "TOWN",
                "category": "adventure",
                "subcategory": "paragliding",
                "tagline": "World Paragliding Capital & Tibetan Monastery Hub",
                "description": "A world-renowned paragliding destination in Kangra valley, Himachal Pradesh, offering tandem paragliding flights, scenic landing sites, and Buddhist monasteries.",
                "latitude": 32.0436,
                "longitude": 76.7180,
                "city": "Bir",
                "district": "Kangra",
                "state": "Himachal Pradesh",
                "country": "India",
                "region": "Kangra Valley, Dhauladhar Range",
                "aliases": ["bir billing", "bir", "billing", "bir paragliding"],
                "search_terms": ["paragliding", "monastery", "sunset", "adventure", "flying"],
                "activities": ["paragliding", "monasteries", "trekking", "cafes"],
                "best_for": ["Paragliders", "Adventure Seekers", "Peace Seekers"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 91
            },
            "madurai": {
                "id": "p-madurai",
                "slug": "madurai",
                "name": "Madurai",
                "display_name": "Madurai City, Tamil Nadu",
                "type": "CITY",
                "category": "heritage",
                "subcategory": "temple",
                "tagline": "Cultural & Culinary Capital of Tamil Nadu",
                "description": "An ancient lotus-shaped city on the banks of the Vaigai river, world-renowned for Meenakshi Amman Temple, Thirumalai Nayakkar Palace, and iconic street food.",
                "latitude": 9.9252,
                "longitude": 78.1198,
                "city": "Madurai",
                "district": "Madurai",
                "state": "Tamil Nadu",
                "country": "India",
                "region": "Southern Tamil Nadu",
                "aliases": ["madurai", "madurai city", "thoonga nagaram", "temple city"],
                "search_terms": ["madurai", "temple", "food", "heritage", "jigarthanda", "kari dosa"],
                "activities": ["temples", "food", "heritage", "shopping", "culture"],
                "best_for": ["Cultural Explorers", "Foodies", "Pilgrims"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 99
            },
            "chennai": {
                "id": "p-chennai",
                "slug": "chennai",
                "name": "Chennai",
                "display_name": "Chennai Capital City, Tamil Nadu",
                "type": "CITY",
                "category": "coastal",
                "subcategory": "city",
                "tagline": "Gateway to South India — Marina Beach, heritage & filter coffee",
                "description": "The capital city of Tamil Nadu, famous for Marina Beach, Kapaleeshwarar Temple, Carnatic music season, filter coffee, and silk heritage.",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "city": "Chennai",
                "district": "Chennai",
                "state": "Tamil Nadu",
                "country": "India",
                "region": "Coromandel Coast",
                "aliases": ["chennai", "madras", "chennai city"],
                "search_terms": ["chennai", "marina beach", "filter coffee", "mylapore"],
                "activities": ["beaches", "food", "heritage", "shopping", "temples"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.8,
                "popularity": 98
            },
            "kodaikanal": {
                "id": "p-kodaikanal",
                "slug": "kodaikanal",
                "name": "Kodaikanal",
                "display_name": "Kodaikanal Hill Station, Dindigul",
                "type": "HILL",
                "category": "mountain",
                "subcategory": "viewpoint",
                "tagline": "Princess of Hill Stations — Kodai Lake, Coaker's Walk & misty waterfalls",
                "description": "A tranquil hill station perched at 2,133m MSL in the Palani Hills, renowned for Kodai Lake, Pillar Rocks, Silver Cascade, and pine forests.",
                "latitude": 10.2381,
                "longitude": 77.4892,
                "city": "Kodaikanal",
                "district": "Dindigul",
                "state": "Tamil Nadu",
                "country": "India",
                "region": "Palani Hills, Western Ghats",
                "aliases": ["kodaikanal", "kodai", "kodaikanal hills", "kodai hills"],
                "search_terms": ["kodaikanal", "viewpoints", "waterfalls", "lake", "trekking"],
                "activities": ["viewpoints", "waterfalls", "boating", "trekking"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 97
            },
            "ooty": {
                "id": "p-ooty",
                "slug": "ooty",
                "name": "Ooty",
                "display_name": "Ooty (Udhagamandalam), Nilgiris",
                "type": "HILL",
                "category": "mountain",
                "subcategory": "tea_plantation",
                "tagline": "Queen of Hill Stations — Nilgiri Mountain Toy Train & Doddabetta Peak",
                "description": "The capital of the Nilgiris district, famous for Doddabetta Peak, Botanical Gardens, UNESCO heritage toy train, tea estates, and homemade chocolates.",
                "latitude": 11.4102,
                "longitude": 76.6950,
                "city": "Udhagamandalam",
                "district": "The Nilgiris",
                "state": "Tamil Nadu",
                "country": "India",
                "region": "Nilgiri Hills, Western Ghats",
                "aliases": ["ooty", "udhagamandalam", "ooti", "oothy", "ooty hills"],
                "search_terms": ["ooty", "nilgiris", "toy train", "tea estates", "doddabetta"],
                "activities": ["tea_estates", "toy_train", "viewpoints", "boating"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "createdAt": "2026-08-20T10:00:00Z",
                "image": "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
                "rating": 4.9,
                "popularity": 97
            },
            "suruli-waterfalls": {
                "id": "p-1",
                "slug": "suruli-waterfalls",
                "name": "Suruli Waterfalls",
                "display_name": "Suruli Waterfalls, Theni",
                "type": "WATERFALL",
                "category": "waterfall",
                "tagline": "Scenic 150ft 2-tier cascading falls",
                "description": "Located in Theni district, Tamil Nadu. Renowned for its 2-stage drop and medicinal herbal stream.",
                "latitude": 9.6644,
                "longitude": 77.2653,
                "city": "Cumbum / Uthamapalayam",
                "district": "Theni",
                "state": "Tamil Nadu",
                "country": "India",
                "region": "Theni, Western Ghats",
                "aliases": ["suruli", "suruli falls", "suruli waterfall", "suruli aruvi", "suruli waterfalls"],
                "search_terms": ["suruli", "waterfall", "theni waterfalls", "falls near theni"],
                "activities": ["waterfalls", "bathing", "nature", "photography"],
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-08T10:00:00Z",
                "createdAt": "2026-08-08T10:00:00Z"
            },
            # 1. Thirupparankundram Murugan Temple
            "thirupparankundram-murugan-temple": {
                "id": "p-thirupparankundram",
                "slug": "thirupparankundram-murugan-temple",
                "name": "Thirupparankundram Murugan Temple",
                "district": "Madurai",
                "category": "temple",
                "tagline": "1st Arupadai Veedu — Ancient rock-cut cave shrine where Murugan married Deivayanai",
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
                "image": "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 1,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 2. Tiruchendur Murugan Temple
            "tiruchendur-murugan-temple": {
                "id": "p-tiruchendur",
                "slug": "tiruchendur-murugan-temple",
                "name": "Tiruchendur Murugan Temple",
                "district": "Thoothukudi",
                "category": "temple",
                "tagline": "2nd Arupadai Veedu — Seashore abode where Murugan vanquished Surapadman",
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
                "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
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
                "image": "https://images.unsplash.com/photo-1609946782701-791789c67676?auto=format&fit=crop&w=1000&q=80",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 3,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 4. Swamimalai Murugan Temple
            "swamimalai-murugan-temple": {
                "id": "p-swamimalai",
                "slug": "swamimalai-murugan-temple",
                "name": "Swamimalai Murugan Temple",
                "district": "Thanjavur",
                "category": "temple",
                "tagline": "4th Arupadai Veedu — Abode where Lord Murugan taught the Pranava Mantra to Lord Shiva",
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
                "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 4,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 5. Thiruttani Murugan Temple
            "thiruttani-murugan-temple": {
                "id": "p-thiruttani",
                "slug": "thiruttani-murugan-temple",
                "name": "Thiruttani Murugan Temple",
                "district": "Tiruvallur",
                "category": "temple",
                "tagline": "5th Arupadai Veedu — Hilltop abode where Murugan found tranquility",
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
                "image": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 5,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 6. Pazhamudircholai Murugan Temple
            "pazhamudircholai-murugan-temple": {
                "id": "p-pazhamudircholai",
                "slug": "pazhamudircholai-murugan-temple",
                "name": "Pazhamudircholai Murugan Temple",
                "district": "Madurai",
                "category": "temple",
                "tagline": "6th Arupadai Veedu — Dense forest hill shrine of Solaimalai",
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
                "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
                "trailSlug": "arupadai-veedu",
                "trailOrder": 6,
                "imageAttribution": "Public Heritage Archive / ExplorerTN Verified Media"
            },
            # 7. Theni Hub
            "theni": {
                "id": "p-theni",
                "slug": "theni",
                "name": "Theni",
                "district": "Theni",
                "category": "city",
                "tagline": "Gateway to Western Ghats, Waterfalls, Tea Estates & Cumbum Valley Vineyards",
                "description": "Nestled at the foot of the Western Ghats in Tamil Nadu, Theni is renowned for lush cardamon hills, Cumbum valley grape farms, cascades, and mountain treks.",
                "latitude": 10.0104,
                "longitude": 77.4768,
                "elevation": "280m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 8. Meghamalai
            "meghamalai": {
                "id": "p-meghamalai",
                "slug": "meghamalai",
                "name": "Meghamalai",
                "district": "Theni",
                "category": "mountain",
                "tagline": "High Wavy Mountains, tea estates, cloud forests and Western Ghats viewpoints",
                "description": "Perched at 1,500m elevation in Theni district, Meghamalai features rolling tea gardens, cardamom plantations, and misty mountain ridges.",
                "latitude": 9.6738,
                "longitude": 77.4207,
                "elevation": "1500m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 9. Suruli Falls
            "suruli-falls": {
                "id": "p-suruli-falls-theni",
                "slug": "suruli-falls",
                "name": "Suruli Falls",
                "district": "Theni",
                "category": "waterfall",
                "tagline": "150ft 2-tier cascading waterfall surrounded by dense Meghamalai forest reserves",
                "description": "Suruli Falls drops 150 feet in two distinct stages amidst dense jungle near Cumbum, fed by mountain streams from the High Wavy range.",
                "latitude": 9.6705,
                "longitude": 77.3060,
                "elevation": "350m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 10. Vineyard Experience (Cumbum Valley)
            "cumbum-vineyard": {
                "id": "p-cumbum-vineyard",
                "slug": "cumbum-vineyard",
                "name": "Vineyard Experience",
                "district": "Theni",
                "category": "vineyard",
                "tagline": "Cumbum Valley grape farms, countryside scenery and local agricultural tour",
                "description": "The Cumbum Valley in Theni produces over 90% of Tamil Nadu's Muscat grapes. Visitors can tour lush grape orchards along the foothill roads.",
                "latitude": 9.7360,
                "longitude": 77.2830,
                "elevation": "300m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 11. Ellapatti River
            "ellapatti-river": {
                "id": "p-ellapatti-river",
                "slug": "ellapatti-river",
                "name": "Ellapatti River",
                "district": "Theni",
                "category": "river",
                "tagline": "Serene riverside views, natural cooling breezes and relaxing nature photography spots",
                "description": "Ellapatti River flows through scenic green valleys in Theni, offering calm riverbank vistas and cool mountain water streams.",
                "latitude": 9.7890,
                "longitude": 77.2540,
                "elevation": "320m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 12. Chinna Suruli
            "chinna-suruli": {
                "id": "p-chinna-suruli",
                "slug": "chinna-suruli",
                "name": "Chinna Suruli",
                "district": "Theni",
                "category": "waterfall",
                "tagline": "Offbeat secluded waterfall tucked deep inside forest landscape near Kombaithozhu",
                "description": "Chinna Suruli (also known as Wild Suruli) is a picturesque, quiet waterfall located near Kombaithozhu village, distinct from the main Suruli Falls.",
                "latitude": 9.8700,
                "longitude": 77.3900,
                "elevation": "380m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 13. Kumbakkarai Falls
            "kumbakkarai-falls": {
                "id": "p-kumbakkarai-falls",
                "slug": "kumbakkarai-falls",
                "name": "Kumbakkarai Falls",
                "district": "Theni",
                "category": "waterfall",
                "tagline": "Natural rock formation pools fed by Kodaikanal hill streams",
                "description": "Situated at the foot of Kodaikanal hills in Periyakulam taluk, Kumbakkarai Falls cascades over natural rock formations with designated visitor view areas.",
                "latitude": 10.1804,
                "longitude": 77.5303,
                "elevation": "400m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 14. Thottipalam
            "thottipalam": {
                "id": "p-thottipalam",
                "slug": "thottipalam",
                "name": "Thottipalam",
                "district": "Theni",
                "category": "viewpoint",
                "tagline": "Historic elevated aqueduct bridge offering panoramic valley and mountain views",
                "description": "Thottipalam is a historic aqueduct bridge structure near Periyakulam offering scenic road-trip views of surrounding agricultural fields and hill ridges.",
                "latitude": 10.0450,
                "longitude": 77.5850,
                "elevation": "290m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 15. Vaigai Dam
            "vaigai-dam": {
                "id": "p-vaigai-dam",
                "slug": "vaigai-dam",
                "name": "Vaigai Dam",
                "district": "Theni",
                "category": "dam",
                "tagline": "Massive reservoir across Vaigai river with landscaped gardens and sunset views",
                "description": "Built across the Vaigai River near Andipatti, Vaigai Dam provides vital irrigation to southern districts and features expansive water reservoir views.",
                "latitude": 10.0551,
                "longitude": 77.5910,
                "elevation": "270m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 16. Kurangani to Top Station Trek
            "kurangani-top-station": {
                "id": "p-kurangani-top-station",
                "slug": "kurangani-top-station",
                "name": "Kurangani to Top Station Trek",
                "district": "Theni",
                "category": "trek",
                "tagline": "Challenging mountain trek through pine forests, tea estates and cliff ridges",
                "description": "A celebrated Western Ghats trekking route starting from Kurangani foothills up to Top Station ridge, offering cliffside views of the cloud canopy.",
                "latitude": 10.0800,
                "longitude": 77.2400,
                "elevation": "1800m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 17. Kurangani
            "kurangani": {
                "id": "p-kurangani",
                "slug": "kurangani",
                "name": "Kurangani",
                "district": "Theni",
                "category": "mountain",
                "tagline": "Foothill village starting point for Western Ghats mountain treks",
                "description": "Located in Bodi Hills range in Theni district, Kurangani is the foothill base for treks to Top Station and Central Village.",
                "latitude": 10.0800,
                "longitude": 77.2400,
                "elevation": "400m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 18. Top Station
            "top-station": {
                "id": "p-top-station",
                "slug": "top-station",
                "name": "Top Station",
                "district": "Theni",
                "category": "mountain",
                "tagline": "Summit ridge offering panoramic views of Kannan Devan Hills and Western Ghats",
                "description": "Perched at 1,880m on the Tamil Nadu-Kerala border in Theni district, Top Station was historically the highest railway station in Kundala Valley.",
                "latitude": 10.1250,
                "longitude": 77.2450,
                "elevation": "1880m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 19. Chennai
            "chennai": {
                "id": "p-chennai",
                "slug": "chennai",
                "name": "Chennai",
                "district": "Chennai",
                "category": "city",
                "tagline": "Gateway to South India — Marina Beach, heritage colonial architecture & ECR corridor",
                "description": "Capital of Tamil Nadu and the starting hub for the East Coast Road journey.",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "elevation": "6m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 20. East Coast Road
            "east-coast-road": {
                "id": "p-ecr",
                "slug": "east-coast-road",
                "name": "East Coast Road (ECR)",
                "district": "Chengalpattu",
                "category": "road_trip",
                "tagline": "Scenic 2-lane coastal highway hugging the Bay of Bengal coastline",
                "description": "State Highway 49 running along the Coromandel Coast with ocean vistas and beach halts.",
                "latitude": 12.7800,
                "longitude": 80.2200,
                "elevation": "5m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 21. Mahabalipuram
            "mahabalipuram": {
                "id": "p-mahabalipuram",
                "slug": "mahabalipuram",
                "name": "Mahabalipuram",
                "district": "Chengalpattu",
                "category": "heritage",
                "tagline": "7th-century UNESCO World Heritage Pallava rock-cut temples and Shore Temple",
                "description": "Ancient port city famous for the Shore Temple, Pancha Rathas, and Arjuna's Penance.",
                "latitude": 12.6269,
                "longitude": 80.1927,
                "elevation": "12m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 22. Puducherry
            "puducherry": {
                "id": "p-puducherry",
                "slug": "puducherry",
                "name": "Puducherry",
                "district": "Puducherry",
                "category": "city",
                "tagline": "French colonial heritage quarter, yellow villas, cafés & Rock Beach promenade",
                "description": "Historic seaside French quarter offering coastal promenade walks and Auroville cultural vibes.",
                "latitude": 11.9416,
                "longitude": 79.8083,
                "elevation": "3m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 23. Pichavaram Mangrove Forest
            "pichavaram": {
                "id": "p-pichavaram",
                "slug": "pichavaram-mangrove-forest",
                "name": "Pichavaram Mangrove Forest",
                "district": "Cuddalore",
                "category": "nature",
                "tagline": "World's 2nd largest mangrove forest with intricate canal waterways and boat safari",
                "description": "Expansive 1,100-hectare mangrove wetland network with wooden rowboat tours.",
                "latitude": 11.4286,
                "longitude": 79.7797,
                "elevation": "1m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 24. Tharangambadi
            "tharangambadi": {
                "id": "p-tharangambadi",
                "slug": "tharangambadi",
                "name": "Tharangambadi",
                "district": "Mayiladuthurai",
                "category": "heritage",
                "tagline": "Tranquebar — 17th-century Danish colonial port town & Fort Dansborg",
                "description": "Peaceful coastal heritage town featuring 1620 Danish Fort Dansborg overlooking the surf.",
                "latitude": 11.0347,
                "longitude": 79.8524,
                "elevation": "4m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 25. Nagore
            "nagore": {
                "id": "p-nagore",
                "slug": "nagore",
                "name": "Nagore",
                "district": "Nagapattinam",
                "category": "culture",
                "tagline": "Historic 16th-century Nagore Dargah Sufi shrine with 5 minarets",
                "description": "Renowned pilgrimage and cultural town famous for Nagore Dargah shrine.",
                "latitude": 10.8197,
                "longitude": 79.8436,
                "elevation": "5m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 26. Velankanni
            "velankanni": {
                "id": "p-velankanni",
                "slug": "velankanni",
                "name": "Velankanni",
                "district": "Nagapattinam",
                "category": "pilgrimage",
                "tagline": "Basilica of Our Lady of Good Health & Coromandel coast beach",
                "description": "Major coastal pilgrimage destination and Gothic revival Basilica overlooking the sea.",
                "latitude": 10.6811,
                "longitude": 79.8361,
                "elevation": "4m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 27. Thanjavur
            "thanjavur": {
                "id": "p-thanjavur",
                "slug": "thanjavur",
                "name": "Thanjavur",
                "district": "Thanjavur",
                "category": "heritage",
                "tagline": "Chola Empire heartland — UNESCO Brihadisvara Temple & Maratha Palace",
                "description": "Grand Chola capital housing the 1,000-year-old Big Temple and bronze art heritage.",
                "latitude": 10.7870,
                "longitude": 79.1378,
                "elevation": "57m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 28. Karaikudi
            "karaikudi": {
                "id": "p-karaikudi",
                "slug": "karaikudi",
                "name": "Karaikudi",
                "district": "Sivaganga",
                "category": "culture",
                "tagline": "Chettinad heritage capital — Palatial mansions, Athangudi tiles & authentic Chettinad food",
                "description": "Capital of Chettinad region famous for sprawling merchant mansions and fiery cuisine.",
                "latitude": 10.0735,
                "longitude": 78.7834,
                "elevation": "84m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 29. Pamban Bridge
            "pamban-bridge": {
                "id": "p-pamban-bridge",
                "slug": "pamban-bridge",
                "name": "Pamban Bridge",
                "district": "Ramanathapuram",
                "category": "engineering",
                "tagline": "Historic 2.06 km sea railway cantilever bridge connecting mainland to Rameswaram island",
                "description": "Engineering marvel crossing Palk Strait with breathtaking sea views.",
                "latitude": 9.2818,
                "longitude": 79.2086,
                "elevation": "10m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 30. Rameswaram
            "rameswaram": {
                "id": "p-rameswaram",
                "slug": "rameswaram",
                "name": "Rameswaram",
                "district": "Ramanathapuram",
                "category": "temple",
                "tagline": "Sacred island town — Ramanathaswamy Temple long corridors & Agni Theertham coast",
                "description": "Holy island shrine featuring the world's longest temple corridor and 22 sacred wells.",
                "latitude": 9.2876,
                "longitude": 79.3129,
                "elevation": "10m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 31. Dhanushkodi
            "dhanushkodi": {
                "id": "p-dhanushkodi",
                "slug": "dhanushkodi",
                "name": "Dhanushkodi",
                "district": "Ramanathapuram",
                "category": "coastal",
                "tagline": "Submerged ghost town & Arichal Munai land's end where oceans meet",
                "description": "Remote coastal tip surrounded by Bay of Bengal and Indian Ocean waters.",
                "latitude": 9.1517,
                "longitude": 79.4455,
                "elevation": "2m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 32. Kanniyakumari
            "kanniyakumari": {
                "id": "p-kanniyakumari",
                "slug": "kanniyakumari",
                "name": "Kanniyakumari",
                "district": "Kanniyakumari",
                "category": "landmark",
                "tagline": "Southernmost tip of mainland India — Vivekananda Rock Memorial & 3-ocean confluence",
                "description": "Meeting point of Indian Ocean, Arabian Sea & Bay of Bengal famous for sunrise/sunset.",
                "latitude": 8.0883,
                "longitude": 77.5385,
                "elevation": "0m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 33. Horsley Hills
            "horsley-hills": {
                "id": "p-horsley-hills",
                "slug": "horsley-hills",
                "name": "Horsley Hills",
                "district": "Chittoor",
                "category": "mountain",
                "tagline": "Scenic Andhra Pradesh hill station with eucalyptus groves and mountain viewpoints",
                "description": "Cool climate hill getaway in Chittoor district surrounded by dense vegetation.",
                "latitude": 13.6608,
                "longitude": 78.3970,
                "elevation": "1265m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 34. Yelagiri
            "yelagiri": {
                "id": "p-yelagiri",
                "slug": "yelagiri",
                "name": "Yelagiri",
                "district": "Tirupathur",
                "category": "mountain",
                "tagline": "Cluster of 14 tribal villages, Punganoor Lake & Jalagamparai Falls",
                "description": "Peaceful hill cluster at 1,110m elevation popular for weekend road trips from Chennai.",
                "latitude": 12.5786,
                "longitude": 78.6389,
                "elevation": "1110m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 35. Yercaud
            "yercaud": {
                "id": "p-yercaud",
                "slug": "yercaud",
                "name": "Yercaud",
                "district": "Salem",
                "category": "mountain",
                "tagline": "Jewel of the Shevaroys — Coffee plantations, Yercaud Lake & Pagoda Point",
                "description": "Lush hill station in the Shevaroy Hills range known for coffee estates and orange groves.",
                "latitude": 11.7753,
                "longitude": 78.2093,
                "elevation": "1515m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 36. Kolli Hills
            "kolli-hills": {
                "id": "p-kolli-hills",
                "slug": "kolli-hills",
                "name": "Kolli Hills",
                "district": "Namakkal",
                "category": "mountain",
                "tagline": "Mountain of Death — 70 continuous hairpin bends & Agaya Gangai waterfall",
                "description": "Unspoiled mountain range in Namakkal district famous for 70 hairpin curves and medicinal herbs.",
                "latitude": 11.2721,
                "longitude": 78.3412,
                "elevation": "1300m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 37. Sirumalai
            "sirumalai": {
                "id": "p-sirumalai",
                "slug": "sirumalai",
                "name": "Sirumalai",
                "district": "Dindigul",
                "category": "mountain",
                "tagline": "Dense forest reserve, 18 hairpin bends & offbeat quiet hill valley",
                "description": "Offbeat hill region near Dindigul known for Sirumalai bananas, high biodiversity, and peaceful nature trails.",
                "latitude": 10.1983,
                "longitude": 77.9944,
                "elevation": "1600m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 38. Kodaikanal
            "kodaikanal": {
                "id": "p-kodaikanal",
                "slug": "kodaikanal",
                "name": "Kodaikanal",
                "district": "Dindigul",
                "category": "mountain",
                "tagline": "Princess of Hill Stations — Star-shaped lake, Coaker's Walk & cloud forests",
                "description": "Premier Western Ghats hill station in Palani Hills range featuring pine forests and misty cliff trails.",
                "latitude": 10.2381,
                "longitude": 77.4892,
                "elevation": "2133m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 39. Palani Hills
            "palani-hills": {
                "id": "p-palani-hills",
                "slug": "palani-hills",
                "name": "Palani Hills",
                "district": "Dindigul",
                "category": "mountain",
                "tagline": "Eastern offshoot of Western Ghats — Sacred Sivagiri hill & valley wilderness",
                "description": "Extensive mountain range home to sacred shrines, tea valleys, and rich mountain wildlife.",
                "latitude": 10.4497,
                "longitude": 77.5204,
                "elevation": "1800m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 40. Kotagiri
            "kotagiri": {
                "id": "p-kotagiri",
                "slug": "kotagiri",
                "name": "Kotagiri",
                "district": "The Nilgiris",
                "category": "mountain",
                "tagline": "Oldest Nilgiri hill station — Emerald tea estates, Catherine Falls & Kodanad Viewpoint",
                "description": "Quiet tea valley hill station tucked amidst Nilgiri pine forests and waterfall viewpoints.",
                "latitude": 11.4243,
                "longitude": 76.8672,
                "elevation": "1793m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 41. Coonoor
            "coonoor": {
                "id": "p-coonoor",
                "slug": "coonoor",
                "name": "Coonoor",
                "district": "The Nilgiris",
                "category": "mountain",
                "tagline": "Tea estate paradise — Sim's Park, Dolphin's Nose & Nilgiri Toy Train heritage",
                "description": "Second largest hill station in the Nilgiris famous for high altitude teas and botanical gardens.",
                "latitude": 11.3530,
                "longitude": 76.7959,
                "elevation": "1850m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 42. Meenakshi Amman Temple
            "meenakshi-amman-temple": {
                "id": "p-meenakshi-amman-temple",
                "slug": "meenakshi-amman-temple",
                "name": "Meenakshi Amman Temple",
                "district": "Madurai",
                "category": "heritage",
                "tagline": "Dravidian architectural masterpiece — 14 gopurams & 33,000 stone sculptures",
                "description": "Historic temple complex on the southern bank of Vaigai river.",
                "latitude": 9.9195,
                "longitude": 78.1193,
                "elevation": "100m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 43. Gandhi Memorial Museum
            "gandhi-museum": {
                "id": "p-gandhi-museum",
                "slug": "gandhi-museum",
                "name": "Gandhi Memorial Museum",
                "district": "Madurai",
                "category": "museum",
                "tagline": "Tamukkam Nayak Palace museum — Freedom struggle relics & peace gardens",
                "description": "One of five Gandhi Museums in India housed in 17th-century palace.",
                "latitude": 9.9304,
                "longitude": 78.1384,
                "elevation": "102m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 44. Thirumalai Nayakkar Mahal
            "thirumalai-mahal": {
                "id": "p-thirumalai-mahal",
                "slug": "thirumalai-mahal",
                "name": "Thirumalai Nayakkar Mahal",
                "district": "Madurai",
                "category": "palace",
                "tagline": "1636 Indo-Saracenic palace — 82ft giant white columns & Swarga Vilasam courtyard",
                "description": "Royal palace built by King Thirumalai Nayak of Madurai's Nayak dynasty.",
                "latitude": 9.9158,
                "longitude": 78.1232,
                "elevation": "101m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 45. Samanar Hills
            "samanar-hills": {
                "id": "p-samanar-hills",
                "slug": "samanar-hills",
                "name": "Samanar Hills",
                "district": "Madurai",
                "category": "heritage",
                "tagline": "Historic Jain rock-cut beds, stone carvings & panoramic sunset viewpoint",
                "description": "Protected monument hill located in Keelakuyilkudi village near Madurai.",
                "latitude": 9.9056,
                "longitude": 78.0538,
                "elevation": "140m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 46. Alagar Kovil
            "alagar-kovil": {
                "id": "p-alagar-kovil",
                "slug": "alagar-kovil",
                "name": "Alagar Kovil",
                "district": "Madurai",
                "category": "temple",
                "tagline": "Vishnu shrine at the foot of Alagar Hills forest reserve",
                "description": "Scenic temple surrounded by forested hills 21km northeast of Madurai.",
                "latitude": 10.0742,
                "longitude": 78.2136,
                "elevation": "160m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 47. Thirumangalam / Rural Madurai
            "thirumangalam-rural": {
                "id": "p-thirumangalam-rural",
                "slug": "thirumangalam-rural",
                "name": "Thirumangalam / Rural Madurai",
                "district": "Madurai",
                "category": "culture",
                "tagline": "Terracotta Ayyanar horse statues, agricultural countryside & authentic village messes",
                "description": "Rural culture hub showcasing traditional Madurai pottery and culinary roots.",
                "latitude": 9.8242,
                "longitude": 77.9868,
                "elevation": "110m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 48. Vandiyur Mariamman Teppakulam
            "vandiyur-teppakulam": {
                "id": "p-vandiyur-teppakulam",
                "slug": "vandiyur-teppakulam",
                "name": "Vandiyur Mariamman Teppakulam",
                "district": "Madurai",
                "category": "heritage",
                "tagline": "Massive 16-acre square temple tank with central Maiya Mandapam island pavilion",
                "description": "Historic temple tank built in 1645 by King Thirumalai Nayak, site of the annual Float Festival.",
                "latitude": 9.9133,
                "longitude": 78.1517,
                "elevation": "101m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 49. Vaigai Riverfront
            "vaigai-riverfront": {
                "id": "p-vaigai-riverfront",
                "slug": "vaigai-riverfront",
                "name": "Vaigai Riverfront",
                "district": "Madurai",
                "category": "landmark",
                "tagline": "Scenic city riverfront promenade, historic bridge vistas & local urban pulse",
                "description": "Historic river corridor flowing through central Madurai, venue for the Chithirai festival river crossing.",
                "latitude": 9.9280,
                "longitude": 78.1220,
                "elevation": "100m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 50. Kinnakorai
            "kinnakorai": {
                "id": "p-kinnakorai",
                "slug": "kinnakorai",
                "name": "Kinnakorai",
                "district": "The Nilgiris",
                "category": "mountain",
                "tagline": "Remote offbeat Western Ghats village tucked amidst misty mountain ridges",
                "description": "Secluded mountain hamlet in the Nilgiris range known for quiet nature trails and scenic mountain roads.",
                "latitude": 11.2333,
                "longitude": 76.5833,
                "elevation": "1750m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 51. Mullayanagiri
            "mullayanagiri": {
                "id": "p-mullayanagiri",
                "slug": "mullayanagiri",
                "name": "Mullayanagiri",
                "district": "Chikkamagaluru",
                "category": "mountain",
                "tagline": "Highest peak in Karnataka (1,930m) — Shola grasslands & coffee plantation vistas",
                "description": "Highest mountain peak in Karnataka offering summit views, trekking trails, and coffee estate drives.",
                "latitude": 13.3908,
                "longitude": 75.7214,
                "elevation": "1930m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 52. Agumbe
            "agumbe": {
                "id": "p-agumbe",
                "slug": "agumbe",
                "name": "Agumbe",
                "district": "Shivamogga",
                "category": "nature",
                "tagline": "Cherrapunji of the South — High-altitude rainforest reserve, sunset point & waterfalls",
                "description": "Renowned Western Ghats rainforest biodiversity hotspot known for King Cobra conservation, waterfalls, and sunset views.",
                "latitude": 13.5028,
                "longitude": 75.0931,
                "elevation": "643m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 53. Kalrayan Hills
            "kalrayan-hills": {
                "id": "p-kalrayan-hills",
                "slug": "kalrayan-hills",
                "name": "Kalrayan Hills",
                "district": "Kallakurichi",
                "category": "mountain",
                "tagline": "Eastern Ghats offbeat hill range with botanical gardens, Periyar falls & forest streams",
                "description": "Lesser-known Eastern Ghats hill range known for forest landscapes, mountain streams, and quiet road trips.",
                "latitude": 11.9674,
                "longitude": 78.7562,
                "elevation": "900m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 54. Gingee Fort
            "gingee-fort": {
                "id": "p-gingee-fort",
                "slug": "gingee-fort",
                "name": "Gingee Fort",
                "district": "Villupuram",
                "category": "heritage",
                "tagline": "Troy of the East — Impregnable 3-hill fort citadel (Rajagiri, Krishnagiri, Chandrayandurg)",
                "description": "Historic hill fortification built across three granite citadel hills, known for Rajagiri tower and steep rock staircases.",
                "latitude": 12.2530,
                "longitude": 79.4184,
                "elevation": "250m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
            },
            # 55. Panchamalai — Salem
            "panchamalai": {
                "id": "p-panchamalai",
                "slug": "panchamalai",
                "name": "Panchamalai — Salem",
                "district": "Salem",
                "category": "mountain",
                "tagline": "Hidden Eastern Ghats green hill range with tranquil rural countryside & viewpoints",
                "description": "Offbeat hill range in Salem district offering quiet countryside drives, mountain air, and unexplored scenery.",
                "latitude": 11.5167,
                "longitude": 78.5000,
                "elevation": "850m MSL",
                "status": "PUBLISHED",
                "verified": True,
                "version": 1,
                "createdBy": "Pranav",
                "verifiedBy": "Pranav",
                "verifiedAt": "2026-08-19T10:00:00Z",
                "createdAt": "2026-08-19T10:00:00Z"
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
        if latitude < -90.0 or latitude > 90.0 or longitude < -180.0 or longitude > 180.0:
            raise ValidationException(f"Latitude/Longitude ({latitude}°N, {longitude}°E) falls outside valid WGS84 bounds.")

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
            if p.get("id") == identifier or p.get("slug") == identifier or (p.get("name") and p["name"].lower() == identifier.lower()):
                return p
        raise ResourceNotFoundException("Place", identifier)

    def get_all_places(self) -> List[dict]:
        return list(self._places_db.values())

    def _build_resolved_dict(self, place: dict, confidence: str, matched_alias: str = None, extracted_activity: str = None) -> dict:
        return {
            "canonicalPlaceId": place.get("id"),
            "canonicalName": place.get("name"),
            "slug": place.get("slug"),
            "displayName": place.get("display_name") or f"{place.get('name')}, {place.get('district') or place.get('city') or place.get('state')}",
            "confidence": confidence,
            "matchedAlias": matched_alias or place.get("name"),
            "placeType": (place.get("type") or "LOCATION").upper(),
            "category": place.get("category", "nature"),
            "subcategory": place.get("subcategory"),
            "city": place.get("city") or place.get("district"),
            "district": place.get("district"),
            "state": place.get("state", "Tamil Nadu"),
            "region": place.get("region") or f"{place.get('district') or place.get('state')}, India",
            "latitude": place.get("latitude"),
            "longitude": place.get("longitude"),
            "activities": place.get("activities", []),
            "extractedActivity": extracted_activity,
            "placeObject": place
        }

    def resolve_destination(self, query: str) -> dict:
        """
        Intelligent Multi-Pass Destination & Place Resolver
        """
        if not query or not str(query).strip():
            return {
                "canonicalPlaceId": None,
                "canonicalName": None,
                "slug": None,
                "displayName": None,
                "confidence": "UNRESOLVED",
                "matchedAlias": None,
                "placeType": "UNKNOWN",
                "city": None,
                "district": None,
                "state": None,
                "region": "India",
                "latitude": None,
                "longitude": None,
                "activities": [],
                "extractedActivity": None,
                "placeObject": None
            }

        raw_query = str(query).strip()
        clean_q = raw_query.lower()

        # Activity Extraction
        activity_keywords = ["kayaking", "rafting", "trekking", "camping", "surfing", "paragliding", "temple", "temples", "waterfall", "waterfalls", "beach", "beaches", "food", "cafes", "viewpoint", "viewpoints"]
        extracted_activity = None
        target_place_query = clean_q

        for act in activity_keywords:
            if re.search(r"\b" + act + r"\b", clean_q):
                extracted_activity = act
                target_place_query = re.sub(r"\b" + act + r"\b", "", target_place_query).strip()
                break

        # Cleanup query prefix/suffix
        target_place_query = re.sub(r"^(?:plan\s+a?\s*(?:surfing|paragliding|skydiving|scuba|scuba\s+diving|kayaking|river\s+rafting|rafting)?\s*(?:trip|ride|tour|experience)?\s*(?:to|in|inside|around)?|trip\s+to|trip\s+in|waterfalls?\s+near|temples?\s+in|food\s+in|viewpoints?\s+in)\s*", "", target_place_query, flags=re.IGNORECASE).strip()
        if not target_place_query:
            target_place_query = clean_q

        norm_q = " ".join(re.sub(r"[^\w\s]", " ", clean_q).split())
        norm_target = " ".join(re.sub(r"[^\w\s]", " ", target_place_query).split())

        # Pass 1: Direct Slug / ID Match
        for slug, place in self._places_db.items():
            if clean_q == slug or target_place_query == slug or norm_target == slug or clean_q == place.get("id", "").lower():
                return self._build_resolved_dict(place, confidence="HIGH", matched_alias=slug, extracted_activity=extracted_activity)

        # Pass 2: Exact Name / Display Name / Alias Match (Punctuation-Insensitive)
        for slug, place in self._places_db.items():
            name_clean = (place.get("name") or "").lower()
            disp_clean = (place.get("display_name") or "").lower()
            aliases = [a.lower() for a in place.get("aliases", [])]
            norm_aliases = [" ".join(re.sub(r"[^\w\s]", " ", a).split()) for a in aliases]
            norm_name = " ".join(re.sub(r"[^\w\s]", " ", name_clean).split())

            if clean_q in [name_clean, disp_clean] or clean_q in aliases or norm_q in norm_aliases or norm_q == norm_name:
                return self._build_resolved_dict(place, confidence="HIGH", matched_alias=clean_q, extracted_activity=extracted_activity)
            if target_place_query in [name_clean, disp_clean] or target_place_query in aliases or norm_target in norm_aliases or norm_target == norm_name:
                return self._build_resolved_dict(place, confidence="HIGH", matched_alias=target_place_query, extracted_activity=extracted_activity)

        # Pass 3: Token Substring / Fuzzy Search
        best_place = None
        best_score = 0.0
        matched_alias_found = None

        for slug, place in self._places_db.items():
            name_clean = (place.get("name") or "").lower()
            aliases = [a.lower() for a in place.get("aliases", [])]
            search_terms = [s.lower() for s in place.get("search_terms", [])]
            city = (place.get("city") or place.get("district") or "").lower()
            district = (place.get("district") or "").lower()

            score = 0.0
            matched_term = None

            q_test = norm_target if norm_target else norm_q
            if len(q_test) >= 3:
                if q_test in name_clean or name_clean in q_test:
                    score = 0.95
                    matched_term = name_clean
                elif any(q_test in a or a in q_test for a in aliases):
                    score = 0.90
                    matched_term = q_test
                elif any(q_test in s for s in search_terms):
                    score = 0.85
                    matched_term = q_test
                elif q_test in city or q_test in district:
                    score = 0.88
                    matched_term = city

            if score > best_score:
                best_score = score
                best_place = place
                matched_alias_found = matched_term

        if best_place and best_score >= 0.70:
            conf = "HIGH" if best_score >= 0.85 else "MEDIUM"
            return self._build_resolved_dict(best_place, confidence=conf, matched_alias=matched_alias_found, extracted_activity=extracted_activity)

        # Pass 4: Unresolved Fallback
        return {
            "canonicalPlaceId": None,
            "canonicalName": raw_query.title(),
            "slug": None,
            "displayName": raw_query.title(),
            "confidence": "UNRESOLVED",
            "matchedAlias": None,
            "placeType": "UNKNOWN",
            "city": None,
            "district": None,
            "state": None,
            "region": "India",
            "latitude": None,
            "longitude": None,
            "activities": [],
            "extractedActivity": extracted_activity,
            "placeObject": None
        }

    def find_nearby_places(self, lat: float, lng: float, radius_km: float = 50.0, category: Optional[str] = None, place_type: Optional[str] = None, min_rating: float = 0.0) -> List[dict]:
        results = []
        for slug, place in self._places_db.items():
            p_lat = place.get("latitude")
            p_lng = place.get("longitude")
            if p_lat is None or p_lng is None:
                continue
            dist_km = calculate_haversine(lat, lng, p_lat, p_lng)
            if dist_km <= radius_km:
                if category and category.lower() != "all":
                    p_cat = (place.get("category") or "").lower()
                    if category.lower() not in p_cat:
                        continue
                if place_type and place_type.lower() != "all":
                    p_type = (place.get("type") or "").lower()
                    if place_type.lower() not in p_type:
                        continue
                place_copy = dict(place)
                place_copy["distanceKm"] = dist_km
                results.append(place_copy)
        results.sort(key=lambda x: x["distanceKm"])
        return results

    def search_places_by_category_and_location(self, query: str, category: Optional[str] = None, radius_km: float = 50.0) -> Dict[str, Any]:
        resolved = self.resolve_destination(query)
        if resolved["confidence"] in ["HIGH", "MEDIUM"] and resolved["latitude"] and resolved["longitude"]:
            nearby = self.find_nearby_places(resolved["latitude"], resolved["longitude"], radius_km=radius_km, category=category)
            return {
                "resolvedDestination": resolved,
                "category": category,
                "nearbyPlaces": nearby
            }
        return {
            "resolvedDestination": resolved,
            "category": category,
            "nearbyPlaces": []
        }

places_service = PlacesService()

