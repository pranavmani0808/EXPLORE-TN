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
            "marina-beach": {'id': 'p-marina-beach', 'slug': 'marina-beach', 'name': 'Marina Beach', 'display_name': 'Marina Beach, Chennai', 'type': 'BEACH', 'category': 'coastal', 'subcategory': 'beach', 'tagline': 'Second longest natural urban beach in the world', 'description': 'A 13km natural urban beach along the Bay of Bengal in Chennai, famous for sunrise views, street food stalls, and lighthouse.', 'latitude': 13.0499, 'longitude': 80.2824, 'city': 'Chennai', 'district': 'Chennai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Coromandel Coast', 'aliases': ['marina', 'marina beach', 'chennai marina', 'marina lighthouse'], 'search_terms': ['beach', 'sunset', 'food', 'lighthouse', 'chennai'], 'activities': ['beaches', 'street_food', 'walking', 'photography'], 'tags': ['beach', 'urban', 'coastal', 'landmark'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "kapaleeshwarar-temple": {'id': 'p-kapaleeshwarar-temple', 'slug': 'kapaleeshwarar-temple', 'name': 'Kapaleeshwarar Temple', 'display_name': 'Kapaleeshwarar Temple, Mylapore', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': '7th-century Dravidian Shiva shrine in historical Mylapore', 'description': 'An ancient temple dedicated to Lord Shiva in Mylapore, Chennai, built in classic 7th-century Dravidian architecture with a towering rainbow gopuram.', 'latitude': 13.0335, 'longitude': 80.2697, 'city': 'Mylapore', 'district': 'Chennai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Mylapore Heritage Zone', 'aliases': ['kapaleeshwarar', 'mylapore temple', 'kapaleeswarar temple'], 'search_terms': ['shiva', 'mylapore', 'temple', 'gopuram', 'heritage'], 'activities': ['temples', 'heritage', 'culture', 'photography'], 'tags': ['temple', 'dravidian', 'shiva', 'mylapore'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 95, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "shore-temple": {'id': 'p-shore-temple', 'slug': 'shore-temple', 'name': 'Shore Temple', 'display_name': 'Shore Temple, Mahabalipuram', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'temple', 'tagline': '8th-century Pallava structural stone temple on the Coromandel coast', 'description': 'UNESCO World Heritage structural stone temple complex built by King Narasimhavarman II overlooking the Bay of Bengal.', 'latitude': 12.616, 'longitude': 80.1989, 'city': 'Mahabalipuram', 'district': 'Chengalpattu', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Coromandel Coast', 'aliases': ['shore temple', 'mahabalipuram shore temple', 'mamallapuram temple'], 'search_terms': ['pallava', 'mahabalipuram', 'unesco', 'heritage', 'stone temple'], 'activities': ['heritage', 'photography', 'architecture', 'beaches'], 'tags': ['unesco', 'pallava', 'heritage', 'beach'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "kailasanathar-temple": {'id': 'p-kailasanathar-temple', 'slug': 'kailasanathar-temple', 'name': 'Kailasanathar Temple', 'display_name': 'Kailasanathar Temple, Kancheepuram', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Oldest sandstone structural temple in Kancheepuram built by Rajasimha Pallava', 'description': 'Constructed in 685–705 AD, this is the oldest surviving sandstone structure in Kancheepuram with intricate lion pillars.', 'latitude': 12.8423, 'longitude': 79.6898, 'city': 'Kancheepuram', 'district': 'Kancheepuram', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Northern Tamil Nadu', 'aliases': ['kanchi kailasanathar', 'kailasanathar temple kancheepuram'], 'search_terms': ['pallava', 'sandstone', 'shiva', 'kancheepuram'], 'activities': ['temples', 'heritage', 'architecture'], 'tags': ['sandstone', 'pallava', 'heritage'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 91, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "pulicat-lake": {'id': 'p-pulicat-lake', 'slug': 'pulicat-lake', 'name': 'Pulicat Lake Bird Sanctuary', 'display_name': 'Pulicat Lake Bird Sanctuary, Tiruvallur', 'type': 'BIRD_SANCTUARY', 'category': 'wildlife', 'subcategory': 'lake', 'tagline': 'Second largest brackish water lagoon in India & Flamingo haven', 'description': 'A vast coastal lagoon on the Bay of Bengal famous for tens of thousands of wintering greater flamingos and pelicans.', 'latitude': 13.4214, 'longitude': 80.32, 'city': 'Pulicat', 'district': 'Tiruvallur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Pulicat Lagoon', 'aliases': ['pulicat lake', 'pulicat bird sanctuary', 'pazhaverkadu'], 'search_terms': ['flamingos', 'birds', 'lagoon', 'boating', 'sanctuary'], 'activities': ['bird_watching', 'boating', 'photography', 'nature'], 'tags': ['flamingos', 'lagoon', 'birds'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.6, 'popularity': 87, 'coordinate_source': 'OpenStreetMap Geocoding API', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "vellore-fort": {'id': 'p-vellore-fort', 'slug': 'vellore-fort', 'name': 'Vellore Fort', 'display_name': 'Vellore Fort & Moat, Vellore', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': '16th-century Vijayanagara granite fortress surrounded by a deep moat', 'description': 'Imposing 16th-century stone fort constructed by Vijayanagara chieftains, featuring massive granite ramparts, double moats, and Jalakandeswarar Temple.', 'latitude': 12.9234, 'longitude': 79.1325, 'city': 'Vellore', 'district': 'Vellore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Palar River Basin', 'aliases': ['vellore fort', 'vellore kottai', 'jalakandeswarar fort'], 'search_terms': ['fort', 'moat', 'vijayanagara', 'vellore'], 'activities': ['fort_walk', 'heritage', 'museum', 'photography'], 'tags': ['fort', 'granite', 'vijayanagara'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 93, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "arcot-fort": {'id': 'p-arcot-fort', 'slug': 'arcot-fort', 'name': 'Arcot Fort & Delhi Gate', 'display_name': 'Arcot Fort Ruins & Delhi Gate, Ranipet', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': "Historic seat of Carnatic Nawabs and site of Robert Clive's 1751 Siege of Arcot", 'description': "Historic fort ruins and Delhi Gate in Arcot, famous for Robert Clive's defense during the Carnatic Wars.", 'latitude': 12.9056, 'longitude': 79.3344, 'city': 'Arcot', 'district': 'Ranipet', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Carnatic Region', 'aliases': ['arcot fort', 'delhi gate arcot', 'carnatic nawab fort'], 'search_terms': ['arcot', 'nawab', 'clive', 'siege of arcot', 'fort'], 'activities': ['history', 'heritage', 'monuments'], 'tags': ['fort', 'carnatic', 'history'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.2, 'popularity': 78, 'coordinate_source': 'OpenStreetMap Geocoding API', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "yelagiri-hills": {'id': 'p-yelagiri-hills', 'slug': 'yelagiri-hills', 'name': 'Yelagiri Hills', 'display_name': 'Yelagiri Hills, Tirupattur', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'viewpoint', 'tagline': 'Peaceful hill cluster at 1,110m MSL with Punganoor Lake & Swamimalai Trek', 'description': 'A tranquil hill station comprising 14 tribal hamlets surrounded by rose gardens, orchards, and Swamimalai Peak trek.', 'latitude': 12.5804, 'longitude': 78.6385, 'city': 'Yelagiri / Athanavur', 'district': 'Tirupattur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Eastern Ghats', 'aliases': ['yelagiri', 'yelagiri hill station', 'punganoor lake'], 'search_terms': ['yelagiri', 'hills', 'trekking', 'boating', 'lake'], 'activities': ['trekking', 'boating', 'viewpoints', 'nature'], 'tags': ['hill_station', 'lake', 'trek'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.6, 'popularity': 92, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "annamalaiyar-temple": {'id': 'p-annamalaiyar-temple', 'slug': 'annamalaiyar-temple', 'name': 'Annamalaiyar Temple', 'display_name': 'Annamalaiyar Temple (Arunachaleswarar), Tiruvannamalai', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Pancha Bhoota Stalam representing Fire (Agni) at the foot of holy Arunachala Hill', 'description': 'One of the largest temple complexes in India covering 25 acres dedicated to Lord Shiva as Agni, renowned for Karthigai Deepam flame atop Arunachala Hill.', 'latitude': 12.2319, 'longitude': 79.0677, 'city': 'Tiruvannamalai', 'district': 'Tiruvannamalai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Arunachala Sacred Region', 'aliases': ['annamalaiyar temple', 'arunachaleswarar temple', 'tiruvannamalai temple'], 'search_terms': ['agni', 'fire temple', 'arunachala', 'giri pradakshina', 'shiva'], 'activities': ['giri_pradakshina', 'temples', 'spiritual', 'heritage'], 'tags': ['agni', 'shiva', 'giri_pradakshina'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "gingee-fort": {'id': 'p-gingee-fort', 'slug': 'gingee-fort', 'name': 'Gingee Fort', 'display_name': 'Gingee Fort (Troy of the East), Villupuram', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': 'Impenetrable triple-citadel hill fort complex named Troy of the East by Shivaji', 'description': 'Spanning three majestic granite hills (Rajagiri, Krishnagiri, and Chandrayandurg), renowned for Kalyana Mahal, granaries, and 800-ft steep citadel climbs.', 'latitude': 12.2505, 'longitude': 79.4184, 'city': 'Gingee', 'district': 'Villupuram', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Gingee Hills', 'aliases': ['gingee fort', 'senji kottai', 'rajagiri fort'], 'search_terms': ['gingee', 'senji', 'fort', 'troy of the east', 'rajagiri'], 'activities': ['fort_climb', 'trekking', 'heritage', 'photography'], 'tags': ['fort', 'citadel', 'heritage'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 94, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "kalrayan-hills": {'id': 'p-kalrayan-hills', 'slug': 'kalrayan-hills', 'name': 'Kalrayan Hills', 'display_name': 'Kalrayan Hills & Megam Falls, Kallakurichi', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'waterfall', 'tagline': 'Unexplored Eastern Ghats forest range with Gomukhi Dam & cascading Megam Falls', 'description': 'Serene green hill range in Eastern Ghats featuring tribal villages, Gomukhi Dam, Periyar Falls, and Megam Falls.', 'latitude': 11.7856, 'longitude': 78.8412, 'city': 'Kallakurichi / Vellimalai', 'district': 'Kallakurichi', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Eastern Ghats', 'aliases': ['kalrayan hills', 'kalvarayan hills', 'megam falls'], 'search_terms': ['kalrayan', 'hills', 'waterfalls', 'gomukhi dam'], 'activities': ['trekking', 'nature_walks', 'waterfalls'], 'tags': ['hills', 'waterfall', 'tribal_heritage'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.5, 'popularity': 82, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},

            "yercaud-hills": {'id': 'p-yercaud-hills', 'slug': 'yercaud-hills', 'name': 'Yercaud Hill Station', 'display_name': 'Yercaud Jewel of the South, Salem', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'viewpoint', 'tagline': 'Jewel of the South at 1,515m MSL with Yercaud Lake & 20 Hairpin Ghats', 'description': "A tranquil hill station in the Shevaroy Hills of Eastern Ghats, famous for coffee plantations, Lady's Seat viewpoint, and Kiliyur Falls.", 'latitude': 11.7753, 'longitude': 78.2093, 'city': 'Yercaud', 'district': 'Salem', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Shevaroy Hills, Eastern Ghats', 'aliases': ['yercaud', 'yercaud hills', 'yercaud lake', 'shevaroy hills'], 'search_terms': ['yercaud', 'salem hills', 'coffee', 'lake', 'viewpoints'], 'activities': ['boating', 'viewpoints', 'coffee_estate_walks', 'waterfalls'], 'tags': ['hill_station', 'coffee', 'lake'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 94, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "kolli-hills": {'id': 'p-kolli-hills', 'slug': 'kolli-hills', 'name': 'Kolli Hills 70 Hairpin Pass', 'display_name': 'Kolli Hills & 70 Hairpin Ghat Road, Namakkal', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'offroad', 'tagline': 'Legendary 70 continuous hairpin bends ghat road to Agaya Gangai Falls', 'description': 'Mountain range in Eastern Ghats rising to 1,300m MSL, world-famous among motorbikers for its 70 continuous hairpin bends ghat run.', 'latitude': 11.266, 'longitude': 78.337, 'city': 'Semmedu / Kolli Hills', 'district': 'Namakkal', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Eastern Ghats', 'aliases': ['kolli hills', 'kolli hills 70 hairpin', 'agaya gangai', 'semmedu'], 'search_terms': ['kolli hills', '70 hairpin', 'ghat road', 'motorcycle', 'agaya gangai'], 'activities': ['motorcycle_ride', 'hairpin_pass_drive', 'waterfalls', 'trekking'], 'tags': ['hairpin_bends', 'ghat_road', 'waterfall'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "hogenakkal-falls": {'id': 'p-hogenakkal-falls', 'slug': 'hogenakkal-falls', 'name': 'Hogenakkal Falls', 'display_name': 'Hogenakkal Falls & Coracle Rides, Dharmapuri', 'type': 'WATERFALL', 'category': 'waterfall', 'tagline': 'Niagara of India — Thundering Cauvery river canyon cascades & coracle rides', 'description': 'A series of cascading waterfalls on the Cauvery river, renowned for circular wicker coracle boat rides, herbal oil massages, and fresh fried fish.', 'latitude': 12.1182, 'longitude': 77.7744, 'city': 'Hogenakkal', 'district': 'Dharmapuri', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery River Gorge', 'aliases': ['hogenakkal', 'hogenakkal falls', 'hogenakkal waterfalls', 'niagara of india'], 'search_terms': ['hogenakkal', 'coracle', 'cauvery', 'waterfall', 'massage'], 'activities': ['coracle_ride', 'waterfalls', 'herbal_massage', 'fish_tasting'], 'tags': ['waterfall', 'coracle', 'cauvery'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "krishnagiri-dam": {'id': 'p-krishnagiri-dam', 'slug': 'krishnagiri-dam', 'name': 'Krishnagiri Reservoir Dam (KRP Dam)', 'display_name': 'Krishnagiri Reservoir Dam & Park', 'type': 'DAM', 'category': 'dam', 'subcategory': 'lake', 'tagline': 'Scenic dam across Thenpennai river nestled between Syed Basha Hills', 'description': "Constructed in 1957 across the Thenpennai river, featuring manicured flower gardens, children's park, and hill views.", 'latitude': 12.4721, 'longitude': 78.1754, 'city': 'Krishnagiri', 'district': 'Krishnagiri', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Thenpennai River Basin', 'aliases': ['krishnagiri dam', 'krp dam', 'thenpennai dam'], 'search_terms': ['dam', 'krishnagiri', 'park', 'reservoir'], 'activities': ['dam_viewing', 'picnic', 'family_park'], 'tags': ['dam', 'park', 'scenic'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.4, 'popularity': 84, 'coordinate_source': 'OpenStreetMap Geocoding API', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "bhavanisagar-dam": {'id': 'p-bhavanisagar-dam', 'slug': 'bhavanisagar-dam', 'name': 'Bhavanisagar Dam', 'display_name': 'Bhavanisagar Dam & Park, Erode', 'type': 'DAM', 'category': 'dam', 'subcategory': 'river', 'tagline': "World's largest earthen dam constructed across Bhavani River", 'description': 'A massive 8km long earthen dam built in 1953 at the confluence of Bhavani and Moyar rivers, featuring an extensive riverside park.', 'latitude': 11.4725, 'longitude': 77.1147, 'city': 'Bhavanisagar', 'district': 'Erode', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Bhavani Valley', 'aliases': ['bhavanisagar dam', 'bhavani dam', 'erode dam'], 'search_terms': ['bhavanisagar', 'earthen dam', 'bhavani', 'erode'], 'activities': ['dam_viewing', 'park', 'family'], 'tags': ['dam', 'earthen_dam', 'bhavani'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.5, 'popularity': 86, 'coordinate_source': 'OpenStreetMap Geocoding API', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "amaravathi-dam": {'id': 'p-amaravathi-dam', 'slug': 'amaravathi-dam', 'name': 'Amaravathi Dam & Crocodile Farm', 'display_name': 'Amaravathi Dam & Mugger Crocodile Sanctuary', 'type': 'DAM', 'category': 'wildlife', 'subcategory': 'dam', 'tagline': 'Scenic reservoir inside Indira Gandhi Wildlife Sanctuary with wild mugger crocodile park', 'description': 'Constructed in 1957 across Amaravathi river in Anamalai Tiger Reserve, hosting the largest wild population of mugger crocodiles in South India.', 'latitude': 10.4075, 'longitude': 77.2662, 'city': 'Amaravathinagar', 'district': 'Tiruppur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Anamalai Foothills', 'aliases': ['amaravathi dam', 'amaravathi crocodile farm', 'tiruppur dam'], 'search_terms': ['crocodile', 'dam', 'amaravathi', 'anamalai', 'wildlife'], 'activities': ['crocodile_watching', 'dam_sightseeing', 'wildlife'], 'tags': ['crocodile', 'dam', 'wildlife'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.6, 'popularity': 88, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "valparai-pass": {'id': 'p-valparai-pass', 'slug': 'valparai-pass', 'name': 'Valparai 40 Hairpin Pass', 'display_name': 'Valparai Ghat Road & 40 Hairpin Bends', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'offroad', 'tagline': '70km scenic tea plantation mountain pass with 40 sharp hairpin bends', 'description': 'High altitude tea town at 1,193m MSL in the Anamalai Hills, famous for Lion-tailed macaques, Aliyar Dam view, and 40 hairpin bends.', 'latitude': 10.327, 'longitude': 76.9554, 'city': 'Valparai', 'district': 'Coimbatore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Anamalai Hills, Western Ghats', 'aliases': ['valparai', 'valparai 40 hairpin', 'valparai hills', 'aliyar dam view'], 'search_terms': ['valparai', '40 hairpin', 'tea estate', 'anamalai', 'ghat road'], 'activities': ['motorcycle_ride', 'tea_estate_walks', 'wildlife_spotting', 'viewpoints'], 'tags': ['hairpin_bends', 'tea_plantation', 'ghat_road'], 'image': 'https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "doddabetta-peak": {'id': 'p-doddabetta-peak', 'slug': 'doddabetta-peak', 'name': 'Doddabetta Peak', 'display_name': 'Doddabetta Peak & Telescope House, Ooty', 'type': 'MOUNTAIN', 'category': 'mountain', 'subcategory': 'viewpoint', 'tagline': 'Highest mountain in the Nilgiri Hills at 2,637m MSL', 'description': 'The highest peak in the Nilgiri Mountains, offering panoramic 360-degree views of Chamundi Hills and the Nilgiri plateau through its Telescope House.', 'latitude': 11.4005, 'longitude': 76.7352, 'city': 'Ooty', 'district': 'The Nilgiris', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Nilgiri Plateau', 'aliases': ['doddabetta', 'doddabetta peak', 'ooty highest peak'], 'search_terms': ['doddabetta', 'highest peak', 'ooty', 'telescope house', 'viewpoint'], 'activities': ['viewpoints', 'nature_walks', 'photography', 'telescope_viewing'], 'tags': ['highest_peak', 'viewpoint', 'nilgiris'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "pasupatheeswarar-temple": {'id': 'p-pasupatheeswarar-temple', 'slug': 'pasupatheeswarar-temple', 'name': 'Pasupatheeswarar Temple', 'display_name': 'Pasupatheeswarar Temple, Karur', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': '7th-century Paadal Petra Sthalam Shiva temple in textiles town Karur', 'description': 'Ancient Chola and Pandyan temple featuring a self-manifested (Swayambhu) Lingam tilted slightly to the side.', 'latitude': 10.9601, 'longitude': 78.0766, 'city': 'Karur', 'district': 'Karur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Amaravathi River Basin', 'aliases': ['pasupatheeswarar', 'karur temple', 'karur shiva temple'], 'search_terms': ['karur', 'shiva', 'paadal petra sthalam', 'temple'], 'activities': ['temples', 'spiritual', 'heritage'], 'tags': ['chola', 'shiva', 'paadal_petra'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.6, 'popularity': 85, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "trichy-rockfort": {'id': 'p-trichy-rockfort', 'slug': 'trichy-rockfort', 'name': 'Trichy Rockfort Temple', 'display_name': 'Trichy Rockfort Uchchi Pillayar Temple', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'temple', 'tagline': '83-meter high ancient 3.8 billion-year-old rock-cut fortress temple', 'description': 'Historic fort and temple carved into a 273-foot high ancient rock monolith in the heart of Tiruchirappalli, with 437 cut stone steps to the summit Ganesha shrine.', 'latitude': 10.8288, 'longitude': 78.697, 'city': 'Tiruchirappalli', 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery Delta', 'aliases': ['rockfort', 'trichy rockfort', 'uchchi pillayar', 'rockfort temple'], 'search_terms': ['rockfort', 'trichy', 'ganesha', 'rock cut', 'viewpoint'], 'activities': ['rock_climb', 'temples', 'city_viewpoint', 'heritage'], 'tags': ['monolith', 'rock_cut', 'ganesha', 'trichy'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "ranjankudi-fort": {'id': 'p-ranjankudi-fort', 'slug': 'ranjankudi-fort', 'name': 'Ranjankudi Fort', 'display_name': 'Ranjankudi Fort, Perambalur', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': '17th-century Jagir fortress constructed by Nawab of Carnatic feudatories', 'description': 'Intact 17th-century stone fortress featuring lower, middle, and upper citadels with moat and defensive ramparts.', 'latitude': 11.3854, 'longitude': 78.9321, 'city': 'Ranjankudi / Perambalur', 'district': 'Perambalur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Central Tamil Nadu', 'aliases': ['ranjankudi fort', 'perambalur fort'], 'search_terms': ['ranjankudi', 'fort', 'carnatic', 'perambalur'], 'activities': ['fort_walk', 'heritage', 'photography'], 'tags': ['fort', 'carnatic', 'citadel'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.3, 'popularity': 79, 'coordinate_source': 'OpenStreetMap Geocoding API', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "gangaikonda-cholapuram": {'id': 'p-gangaikonda-cholapuram', 'slug': 'gangaikonda-cholapuram', 'name': 'Gangaikonda Cholapuram Temple', 'display_name': 'Gangaikonda Cholapuram Brihadisvara Temple', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'temple', 'tagline': '11th-century Chola capital architectural masterpiece built by Rajendra Chola I', 'description': 'UNESCO World Heritage Great Living Chola Temple featuring a curved 55-meter vimana tower, colossal monolithic Nandi, and exquisite Chola sculptures.', 'latitude': 11.2063, 'longitude': 79.4485, 'city': 'Gangaikonda Cholapuram', 'district': 'Ariyalur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Lower Cauvery Delta', 'aliases': ['gangaikonda cholapuram', 'rajendra chola temple', 'gangaikondacholapuram'], 'search_terms': ['chola', 'rajendra chola', 'unesco', 'shiva', 'ariyalur'], 'activities': ['heritage', 'architecture', 'photography', 'temples'], 'tags': ['unesco', 'chola', 'vimana'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 95, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "brihadisvara-temple": {'id': 'p-brihadisvara-temple', 'slug': 'brihadisvara-temple', 'name': 'Brihadisvara Temple (Big Temple)', 'display_name': 'Brihadisvara Temple Tanjore (Big Temple)', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'temple', 'tagline': '1010 AD Chola architectural climax — 216ft granite vimana crowned with 81-ton dome', 'description': 'Built by Raja Raja Chola I in 1010 AD, a UNESCO World Heritage site constructed entirely of interlocking granite blocks without mortar.', 'latitude': 10.7828, 'longitude': 79.1318, 'city': 'Thanjavur', 'district': 'Thanjavur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery Delta Capital', 'aliases': ['big temple thanjavur', 'brihadeeswarar temple', 'thanjavur big temple', 'thanjai periya kovil'], 'search_terms': ['big temple', 'thanjavur', 'chola', 'raja raja', 'unesco', 'granite'], 'activities': ['heritage', 'architecture', 'photography', 'temples'], 'tags': ['unesco', 'chola', 'big_temple', 'granite'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 5.0, 'popularity': 100, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "tiruvarur-thyagaraja-temple": {'id': 'p-tiruvarur-thyagaraja-temple', 'slug': 'tiruvarur-thyagaraja-temple', 'name': 'Tiruvarur Thyagaraja Temple', 'display_name': 'Tiruvarur Thyagaraja Temple & Kamalalayam Tank', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': "Ancient Shiva temple with 33-acre temple tank & world's largest wooden temple chariot", 'description': 'Massive ancient temple complex famous for Kamalalayam tank covering 33 acres with an island shrine, and the grand Aazhi Ther chariot festival.', 'latitude': 10.7712, 'longitude': 79.6341, 'city': 'Tiruvarur', 'district': 'Tiruvarur', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery Delta', 'aliases': ['tiruvarur temple', 'thyagaraja temple', 'kamalalayam tank'], 'search_terms': ['tiruvarur', 'thyagaraja', 'chariot', 'temple tank'], 'activities': ['temples', 'spiritual', 'culture'], 'tags': ['chariot', 'tank', 'shiva'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 91, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "velankanni-basilica": {'id': 'p-velankanni-basilica', 'slug': 'velankanni-basilica', 'name': 'Velankanni Basilica of Our Lady of Good Health', 'display_name': 'Basilica of Our Lady of Good Health, Velankanni', 'type': 'CHURCH', 'category': 'heritage', 'subcategory': 'church', 'tagline': 'Lourdes of the East — Coastal Catholic shrine drawing millions of pilgrims', 'description': 'World-famous Roman Catholic minor basilica situated on the Coromandel coast, known as the Lourdes of the East.', 'latitude': 10.6806, 'longitude': 79.8496, 'city': 'Velankanni', 'district': 'Nagapattinam', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Coromandel Coast', 'aliases': ['velankanni', 'velankanni church', 'our lady of good health'], 'search_terms': ['velankanni', 'basilica', 'church', 'pilgrimage', 'coastal'], 'activities': ['spiritual', 'church_visit', 'coastal_walk'], 'tags': ['basilica', 'pilgrimage', 'coastal'], 'image': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "tharangambadi-danish-fort": {'id': 'p-tharangambadi-danish-fort', 'slug': 'tharangambadi-danish-fort', 'name': 'Tharangambadi Fort Dansborg', 'display_name': 'Fort Dansborg (Danish Fort), Tharangambadi', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': '1620 AD Danish colonial coastal fort on the Coromandel sea front', 'description': 'The second largest Danish fort in the world built in 1620 by Danish Admiral Ove Gjedde in Tranquebar (Tharangambadi).', 'latitude': 11.0315, 'longitude': 79.855, 'city': 'Tharangambadi (Tranquebar)', 'district': 'Mayiladuthurai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Coromandel Coast', 'aliases': ['danish fort', 'tranquebar fort', 'fort dansborg', 'tharangambadi'], 'search_terms': ['danish', 'tranquebar', 'fort', 'coastal', 'museum'], 'activities': ['fort_walk', 'coastal_view', 'museum', 'history'], 'tags': ['danish', 'fort', 'coastal'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 93, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "sittanavasal-cave": {'id': 'p-sittanavasal-cave', 'slug': 'sittanavasal-cave', 'name': 'Sittanavasal Cave Paintings & Rock Cut Beds', 'display_name': 'Sittanavasal Jain Rock-Cut Cave & Lotus Pond Paintings', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'monument', 'tagline': '7th-century Jain rock-cut cave temple with exquisite lotus pond frescoes', 'description': 'Ancient Jain rock-cut monastery featuring 7th-century Pandyan fresco ceiling paintings of lotus ponds, dancers, and stone Jain monk beds.', 'latitude': 10.4619, 'longitude': 78.7291, 'city': 'Sittanavasal', 'district': 'Pudukkottai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Pudukkottai Heritage Range', 'aliases': ['sittanavasal', 'sittanavasal cave', 'jain cave paintings'], 'search_terms': ['jain', 'paintings', 'rock cut', 'frescoes', 'pudukkottai'], 'activities': ['fresco_viewing', 'heritage', 'archaeology', 'photography'], 'tags': ['jain', 'frescoes', 'rock_cut'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 89, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "karaikudi-chettinad": {'id': 'p-karaikudi-chettinad', 'slug': 'karaikudi-chettinad', 'name': 'Karaikudi Chettinad Heritage Mansions', 'display_name': 'Chettinad Palace & Heritage Mansions, Karaikudi', 'type': 'PALACE', 'category': 'heritage', 'subcategory': 'food', 'tagline': 'Palatial 19th-century merchant mansions, Italian marble & legendary spicy cuisine', 'description': 'The cultural capital of Chettinad, famous for thousand-window palatial mansions built with Burmese teak, Italian marble, and fiery Chettinad cuisine.', 'latitude': 10.0735, 'longitude': 78.7732, 'city': 'Karaikudi', 'district': 'Sivaganga', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Chettinad Heritage Region', 'aliases': ['karaikudi', 'chettinad', 'chettinad palace', 'karaikudi mansions'], 'search_terms': ['chettinad', 'mansions', 'food', 'spicy', 'teak', 'palace'], 'activities': ['mansion_tour', 'chettinad_food_tasting', 'heritage', 'shopping'], 'tags': ['chettinad', 'palace', 'food'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "famous-jigarthanda-madurai": {'id': 'p-famous-jigarthanda', 'slug': 'famous-jigarthanda-madurai', 'name': 'Famous Jigarthanda', 'display_name': 'Famous Jigarthanda, East Marret Street, Madurai', 'type': 'FOOD_SPOT', 'category': 'food', 'subcategory': 'local_food', 'tagline': 'Legendary cooling almond gum, nannari & basundi dessert drink of Madurai', 'description': 'Iconic culinary institution of Madurai operating since 1977, famous for its rich cooling dessert drink made with badam pisin, nannari syrup, and hand-churned basundi ice cream.', 'latitude': 9.9165, 'longitude': 78.121, 'city': 'Madurai', 'district': 'Madurai', 'state': 'Tamil Nadu', 'country': 'India', 'aliases': ['jigarthanda', 'famous jigarthanda', 'madurai jigarthanda'], 'search_terms': ['jigarthanda', 'food', 'madurai food', 'dessert', 'drink'], 'activities': ['food_tasting', 'dessert_sampling'], 'tags': ['food', 'dessert', 'jigarthanda', 'legendary'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "murugan-idli-shop-madurai": {'id': 'p-murugan-idli-shop', 'slug': 'murugan-idli-shop-madurai', 'name': 'Murugan Idli Shop', 'display_name': 'Murugan Idli Shop, West Masi Street, Madurai', 'type': 'RESTAURANT', 'category': 'food', 'subcategory': 'restaurant', 'tagline': 'World-famous piping hot soft steamed idlis served on banana leaf with 4 chutney varieties', 'description': 'Legendary Madurai eatery renowned for melt-in-mouth soft idlis, sweet jigarthanda, onion uttapam, and four signature chutneys.', 'latitude': 9.9182, 'longitude': 78.1178, 'city': 'Madurai', 'district': 'Madurai', 'state': 'Tamil Nadu', 'country': 'India', 'aliases': ['murugan idli', 'murugan idli shop', 'madurai idli shop'], 'search_terms': ['idli', 'food', 'chutney', 'breakfast', 'madurai'], 'activities': ['banana_leaf_dining', 'food_tasting'], 'tags': ['food', 'idli', 'breakfast', 'legendary'], 'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "thirumalai-nayakkar-palace": {'id': 'p-thirumalai-nayakkar-palace', 'slug': 'thirumalai-nayakkar-palace', 'name': 'Thirumalai Nayakkar Palace', 'display_name': 'Thirumalai Nayakkar Palace, Madurai', 'type': 'PALACE', 'category': 'heritage', 'subcategory': 'palace', 'tagline': '1636 AD Indo-Saracenic royal palace with 82-foot giant stucco pillars', 'description': 'Constructed in 1636 AD by King Thirumalai Nayak, renowned for its central courtyard (Swarga Vilasam), grand arches, and evening sound & light show.', 'latitude': 9.9147, 'longitude': 78.1244, 'city': 'Madurai', 'district': 'Madurai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Madurai Old City', 'aliases': ['thirumalai nayakkar mahal', 'nayakkar palace', 'madurai palace'], 'search_terms': ['palace', 'nayak', 'madurai', 'pillars', 'light show'], 'activities': ['palace_tour', 'light_show', 'architecture', 'photography'], 'tags': ['palace', 'nayak', 'indo_saracenic'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 94, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "dindigul-rock-fort": {'id': 'p-dindigul-rock-fort', 'slug': 'dindigul-rock-fort', 'name': 'Dindigul Rock Fort', 'display_name': 'Dindigul Rock Fort (Malai Kottai)', 'type': 'FORT', 'category': 'heritage', 'subcategory': 'fort', 'tagline': '17th-century Nayak wedge-shaped rock fortress & Hyder Ali artillery stronghold', 'description': 'Constructed atop a 280ft high solitary granite hill in 1605 by Madurai Nayaks, later fortified by Hyder Ali and Tipu Sultan.', 'latitude': 10.3638, 'longitude': 77.9702, 'city': 'Dindigul', 'district': 'Dindigul', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Dindigul Valley', 'aliases': ['dindigul fort', 'malai kottai dindigul', 'dindigul rockfort'], 'search_terms': ['dindigul', 'fort', 'tipu sultan', 'rock fort', 'biryani town'], 'activities': ['fort_climb', 'viewpoints', 'heritage'], 'tags': ['fort', 'granite', 'tipu_sultan'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.5, 'popularity': 87, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "meghamalai": {'id': 'p-meghamalai', 'slug': 'meghamalai', 'name': 'Meghamalai High Wavy Mountains', 'display_name': 'Meghamalai High Wavy Mountains & Tea Estates', 'type': 'MOUNTAIN', 'category': 'mountain', 'subcategory': 'viewpoint', 'tagline': 'Cloud mountain peak at 1,500m MSL with cardamom estates & Manalar Dam', 'description': 'Misty high mountain range in Western Ghats, famous for tea estates, wild elephants, Maharaja Mettu viewpoint, and pristine cool climate.', 'latitude': 9.6912, 'longitude': 77.4012, 'city': 'Meghamalai', 'district': 'Theni', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Western Ghats, Theni', 'aliases': ['meghamalai', 'cloud mountain', 'high wavys', 'meghamalai tea estate'], 'search_terms': ['meghamalai', 'theni', 'clouds', 'tea estates', 'elephants'], 'activities': ['tea_estate_walks', 'wildlife_spotting', 'viewpoints', 'scenery'], 'tags': ['cloud_mountain', 'tea_estate', 'wildlife'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "srivilliputhur-andal-temple": {'id': 'p-srivilliputhur-andal-temple', 'slug': 'srivilliputhur-andal-temple', 'name': 'Srivilliputhur Andal Temple', 'display_name': 'Srivilliputhur Andal Temple & Emblem Gopuram', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Official Emblem of Tamil Nadu Government — 192ft 11-tiered Rajagopuram', 'description': 'Birthplace of Saint Andal and Periyalvar, featuring a grand 192-foot Rajagopuram which serves as the official seal of the Government of Tamil Nadu.', 'latitude': 9.5097, 'longitude': 77.6322, 'city': 'Srivilliputhur', 'district': 'Virudhunagar', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Southern Tamil Nadu', 'aliases': ['srivilliputhur', 'srivilliputhur temple', 'andal temple', 'tn emblem temple'], 'search_terms': ['andal', 'srivilliputhur', 'gopuram', 'tn emblem', 'palakova'], 'activities': ['temples', 'spiritual', 'palakova_tasting', 'heritage'], 'tags': ['tn_emblem', 'vishnu', 'gopuram'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "rameswaram-temple": {'id': 'p-rameswaram-temple', 'slug': 'rameswaram-temple', 'name': 'Rameswaram Ramanathaswamy Temple', 'display_name': 'Ramanathaswamy Temple & 22 Holy Wells, Rameswaram', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': "Char Dham holy island pilgrimage with world's longest 1,212-pillar outer corridor", 'description': 'A sacred Jyotirlinga temple on Rameswaram Island, famous for its 1,212 carved outer pillars spanning 4,000 feet, and 22 holy bathing tanks.', 'latitude': 9.2881, 'longitude': 79.3174, 'city': 'Rameswaram', 'district': 'Ramanathapuram', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Pamban Island', 'aliases': ['rameswaram temple', 'ramanathaswamy temple', 'rameswaram 22 wells'], 'search_terms': ['jyotirlinga', 'rameswaram', 'corridor', '22 wells', 'char dham'], 'activities': ['22_well_holy_bath', 'temples', 'corridor_walk', 'spiritual'], 'tags': ['jyotirlinga', 'char_dham', 'corridor'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "manapad-beach": {'id': 'p-manapad-beach', 'slug': 'manapad-beach', 'name': 'Manapad Coastal Dune & Holy Cross Church', 'display_name': 'Manapad Beach & Holy Cross Church, Thoothukudi', 'type': 'BEACH', 'category': 'coastal', 'subcategory': 'surfing', 'tagline': 'Coastal sand dune promontory where St. Francis Xavier visited in 1542', 'description': 'Dramatic coastal village nestled between sea and high sand dunes, famous for 1540 Holy Cross Church, natural cave, and point-break surfing.', 'latitude': 8.3795, 'longitude': 78.0567, 'city': 'Manapad', 'district': 'Thoothukudi', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Gulf of Mannar Coast', 'aliases': ['manapad', 'manapad beach', 'manapad church'], 'search_terms': ['manapad', 'dune', 'st francis xavier', 'surfing', 'beach'], 'activities': ['surfing', 'dune_walk', 'church_visit', 'coastal_view'], 'tags': ['dune', 'beach', 'surfing'], 'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 90, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "nellaiappar-temple": {'id': 'p-nellaiappar-temple', 'slug': 'nellaiappar-temple', 'name': 'Nellaiappar Temple', 'display_name': 'Nellaiappar & Kanthimathi Temple, Tirunelveli', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': '700 AD Pandyan Shiva temple famous for musical stone pillars & Iruttu Kadai Halwa', 'description': 'Massive twin temple complex spread over 14 acres in Tirunelveli, famous for musical stone pillars that produce distinct musical notes when tapped.', 'latitude': 8.7275, 'longitude': 77.6897, 'city': 'Tirunelveli', 'district': 'Tirunelveli', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Thamirabarani River Basin', 'aliases': ['nellaiappar', 'nellaiappar temple', 'tirunelveli temple'], 'search_terms': ['nellaiappar', 'musical pillars', 'halwa', 'tirunelveli', 'shiva'], 'activities': ['musical_pillars_tour', 'temples', 'halwa_tasting'], 'tags': ['musical_pillars', 'pandyan', 'halwa'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 95, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "courtallam-falls": {'id': 'p-courtallam-falls', 'slug': 'courtallam-falls', 'name': 'Courtallam Main Falls (Kuttalam)', 'display_name': 'Courtallam Main Falls & Spa Cascades, Tenkasi', 'type': 'WATERFALL', 'category': 'waterfall', 'tagline': 'Spa of South India — 160ft mountain falls infused with medicinal Western Ghats herbs', 'description': 'A famous natural spa waterfall flowing over medicinal herbs in Western Ghats, featuring Main Falls, Five Falls, and Old Courtallam.', 'latitude': 8.9304, 'longitude': 77.2694, 'city': 'Courtallam / Tenkasi', 'district': 'Tenkasi', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Western Ghats, Tenkasi', 'aliases': ['courtallam', 'kuttalam', 'courtallam falls', 'five falls courtallam'], 'search_terms': ['courtallam', 'spa', 'herbal waterfall', 'five falls', 'tenkasi'], 'activities': ['herbal_waterfall_bath', 'nature', 'temples'], 'tags': ['waterfall', 'herbal_spa', 'western_ghats'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "pichavaram-mangrove": {'id': 'p-pichavaram-mangrove', 'slug': 'pichavaram-mangrove', 'name': 'Pichavaram Mangrove Forest', 'display_name': 'Pichavaram Mangrove Forest & Boat Safari, Cuddalore', 'type': 'FOREST', 'category': 'wildlife', 'subcategory': 'mangrove', 'tagline': 'Second largest mangrove forest in the world spread over 1,100 hectares', 'description': 'A vast mangrove ecosystem featuring 4,400 large and small canals navigable by wooden rowboats and motorboats.', 'latitude': 11.4278, 'longitude': 79.7912, 'city': 'Chidambaram / Pichavaram', 'district': 'Cuddalore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Coromandel Coast', 'aliases': ['pichavaram', 'pichavaram mangrove', 'chidambaram mangrove'], 'search_terms': ['mangrove', 'boating', 'cuddalore', 'wildlife', 'birds'], 'activities': ['rowboat_safari', 'bird_watching', 'nature_photography'], 'tags': ['mangrove', 'wetlands', 'boating'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "chidambaram-nataraja-temple": {'id': 'p-chidambaram-nataraja-temple', 'slug': 'chidambaram-nataraja-temple', 'name': 'Thillai Nataraja Temple Chidambaram', 'display_name': 'Thillai Nataraja Temple & Gold Roof Vimanam, Chidambaram', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Pancha Bhoota Stalam representing Space (Akasha) with gold-plated shrine roof', 'description': 'Ancient temple complex celebrating Lord Shiva as cosmic dancer Nataraja, featuring 9 gold-plated roof domes and 108 Bharatanatyam posture carvings.', 'latitude': 11.3992, 'longitude': 79.6934, 'city': 'Chidambaram', 'district': 'Cuddalore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Northern Cauvery Delta', 'aliases': ['chidambaram temple', 'nataraja temple', 'thillai nataraja'], 'search_terms': ['nataraja', 'chidambaram', 'akasha', 'bharatanatyam', 'shiva'], 'activities': ['temples', 'spiritual', 'dance_culture', 'heritage'], 'tags': ['nataraja', 'gold_roof', 'pancha_bhoota'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "kodaikanal-lake": {'id': 'p-kodaikanal-lake', 'slug': 'kodaikanal-lake', 'name': 'Kodaikanal Lake & Star Reservoir', 'display_name': 'Kodaikanal Star Lake & Coaker Walk, Dindigul', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'viewpoint', 'tagline': 'Princess of Hill Stations — 60-acre star-shaped lake created in 1863', 'description': 'Man-made star-shaped lake situated at 2,285m MSL in Palani Hills, famous for pedal boating, horse riding, and Coaker Walk views.', 'latitude': 10.2324, 'longitude': 77.4892, 'city': 'Kodaikanal', 'district': 'Dindigul', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Palani Hills, Western Ghats', 'aliases': ['kodai lake', 'kodaikanal lake', 'kodaikanal hill station'], 'search_terms': ['kodaikanal', 'kodai lake', 'boating', 'hill station', 'coakers walk'], 'activities': ['boating', 'horse_riding', 'viewpoints', 'cycling'], 'tags': ['hill_station', 'star_lake', 'palani_hills'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "palani-murugan-temple": {'id': 'p-palani-murugan-temple', 'slug': 'palani-murugan-temple', 'name': 'Palani Arulmigu Dhandayuthapani Swamy Temple', 'display_name': 'Palani Murugan Hill Temple & Winch Cable Car', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Third Arupadai Veedu featuring Navapashanam idol crafted by Sage Bhogar', 'description': 'Hilltop Murugan temple reached via 659 stone steps, ropeway, or winch train, famous for Palani Panchamirtham prasad.', 'latitude': 10.4481, 'longitude': 77.5204, 'city': 'Palani', 'district': 'Dindigul', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Palani Foothills', 'aliases': ['palani temple', 'palani murugan', 'dhandayuthapani temple'], 'search_terms': ['palani', 'murugan', 'panchamirtham', 'navapashanam', 'ropeway'], 'activities': ['hill_climb', 'winch_ride', 'temples', 'spiritual'], 'tags': ['arupadai_veedu', 'murugan', 'panchamirtham'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 5.0, 'popularity': 100, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "srirangam-temple": {'id': 'p-srirangam-temple', 'slug': 'srirangam-temple', 'name': 'Srirangam Ranganathaswamy Temple', 'display_name': 'Srirangam Ranganathaswamy Temple & Rajagopuram, Trichy', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': "World's largest functioning temple complex spanning 156 acres & 21 gopurams", 'description': 'First of the 108 Divya Desams dedicated to Lord Vishnu, featuring a 236ft tall 13-tiered Rajagopuram and 7 concentric wall enclosures.', 'latitude': 10.8622, 'longitude': 78.6901, 'city': 'Srirangam / Tiruchirappalli', 'district': 'Tiruchirappalli', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery Delta Island', 'aliases': ['srirangam', 'srirangam temple', 'ranganathaswamy temple'], 'search_terms': ['srirangam', 'vishnu', 'divya desam', 'rajagopuram', 'trichy'], 'activities': ['temples', 'spiritual', 'architecture', 'heritage'], 'tags': ['divya_desam', 'vishnu', 'rajagopuram'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 5.0, 'popularity': 100, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "thiruchendur-murugan-temple": {'id': 'p-thiruchendur-murugan-temple', 'slug': 'thiruchendur-murugan-temple', 'name': 'Thiruchendur Murugan Temple', 'display_name': 'Thiruchendur Murugan Temple & Sea Shore Shrine, Thoothukudi', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Second Arupadai Veedu situated directly on the Bay of Bengal shore', 'description': 'Ancient seaside temple dedicated to Lord Murugan, site of the Soorasamharam festival where Lord Murugan defeated demon Surapadman.', 'latitude': 8.4962, 'longitude': 78.1294, 'city': 'Thiruchendur', 'district': 'Thoothukudi', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Gulf of Mannar Coast', 'aliases': ['thiruchendur', 'thiruchendur temple', 'thiruchendur murugan'], 'search_terms': ['thiruchendur', 'murugan', 'seashore temple', 'soorasamharam', 'thoothukudi'], 'activities': ['sea_bath', 'temples', 'spiritual', 'festival'], 'tags': ['arupadai_veedu', 'murugan', 'seashore'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "thiruparankundram-temple": {'id': 'p-thiruparankundram-temple', 'slug': 'thiruparankundram-temple', 'name': 'Thiruparankundram Murugan Temple', 'display_name': 'Thiruparankundram Rock-Cut Shrine, Madurai', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'First Arupadai Veedu — Rock-cut temple where Lord Murugan wed Deivayanai', 'description': '6th-century rock-cut temple carved into a massive granite hill 8km from Madurai, where Lord Murugan married Princess Deivayanai.', 'latitude': 9.8789, 'longitude': 78.0711, 'city': 'Thiruparankundram / Madurai', 'district': 'Madurai', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Madurai Region', 'aliases': ['thiruparankundram', 'thiruparankundram temple'], 'search_terms': ['thiruparankundram', 'murugan', 'rock cut', 'madurai', 'wedding shrine'], 'activities': ['temples', 'rock_cut_tour', 'spiritual'], 'tags': ['arupadai_veedu', 'rock_cut', 'murugan'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "ooty-botanical-garden": {'id': 'p-ooty-botanical-garden', 'slug': 'ooty-botanical-garden', 'name': 'Government Botanical Garden Ooty', 'display_name': 'Government Botanical Garden & Glasshouse, Ooty', 'type': 'PARK', 'category': 'mountain', 'subcategory': 'park', 'tagline': '22-hectare terraced botanical paradise featuring 20-million-year-old fossil tree', 'description': 'Established in 1848 on the slopes of Doddabetta Peak, famous for annual May flower shows, Italian garden, fern house, and glasshouse.', 'latitude': 11.4144, 'longitude': 76.7119, 'city': 'Ooty', 'district': 'The Nilgiris', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Nilgiri Plateau', 'aliases': ['ooty garden', 'ooty botanical garden', 'botanical garden ooty'], 'search_terms': ['ooty garden', 'botanical', 'flower show', 'glasshouse', 'nilgiris'], 'activities': ['botanical_walk', 'flower_show_viewing', 'photography'], 'tags': ['botanical', 'flower_show', 'ooty'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "nilgiri-toy-train": {'id': 'p-nilgiri-toy-train', 'slug': 'nilgiri-toy-train', 'name': 'Nilgiri Mountain Railway Toy Train', 'display_name': 'Nilgiri Mountain Railway (Mettupalayam to Ooty)', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'railway', 'tagline': 'UNESCO World Heritage steam cog railway built in 1908 through 208 curves & 16 tunnels', 'description': 'Historic 46km rack and pinion railway ascending from Mettupalayam (330m) to Ooty (2,200m) through misty valleys, tunnels, and stone bridges.', 'latitude': 11.3005, 'longitude': 76.9385, 'city': 'Mettupalayam / Ooty', 'district': 'The Nilgiris', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Nilgiri Ghats', 'aliases': ['nilgiri toy train', 'ooty toy train', 'mountain railway'], 'search_terms': ['toy train', 'unesco', 'steam engine', 'cog railway', 'nilgiris'], 'activities': ['toy_train_ride', 'scenic_views', 'photography'], 'tags': ['unesco', 'steam_train', 'mountain_railway'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 5.0, 'popularity': 100, 'coordinate_source': 'Government of India Tourism NIDHI Dataset', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "mudumalai-tiger-reserve": {'id': 'p-mudumalai-tiger-reserve', 'slug': 'mudumalai-tiger-reserve', 'name': 'Mudumalai National Park & Elephant Camp', 'display_name': 'Mudumalai Tiger Reserve & Theppakadu Elephant Camp', 'type': 'WILDLIFE_SANCTUARY', 'category': 'wildlife', 'subcategory': 'tiger_reserve', 'tagline': 'Nilgiri Biosphere Reserve sanctuary home to Bengal tigers, Asian elephants & leopards', 'description': 'Pristine 321 sq km wildlife sanctuary bordering Bandipur and Wayanad, famous for jungle jeep safaris and Theppakadu elephant feeding camp.', 'latitude': 11.5623, 'longitude': 76.5345, 'city': 'Mudumalai / Masinagudi', 'district': 'The Nilgiris', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Nilgiri Biosphere Reserve', 'aliases': ['mudumalai', 'mudumalai tiger reserve', 'masinagudi jungle'], 'search_terms': ['mudumalai', 'masinagudi', 'tiger reserve', 'elephant camp', 'jeep safari'], 'activities': ['jeep_safari', 'elephant_interaction', 'wildlife_photography'], 'tags': ['tiger_reserve', 'elephants', 'biosphere'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "dhanushkodi-ghost-town": {'id': 'p-dhanushkodi-ghost-town', 'slug': 'dhanushkodi-ghost-town', 'name': "Dhanushkodi Land's End & Ghost Town", 'display_name': "Dhanushkodi Ghost Town & Ram Setu Point, Rameswaram", 'type': 'HERITAGE_SITE', 'category': 'coastal', 'subcategory': 'viewpoint', 'tagline': 'Submerged 1964 cyclone city & southern tip where Indian Ocean meets Bay of Bengal', 'description': 'Dramatic narrow sand spit at the southernmost tip of Rameswaram island, featuring ruined church walls, railway station ruins, and Ram Setu point.', 'latitude': 9.1775, 'longitude': 79.4144, 'city': 'Dhanushkodi / Rameswaram', 'district': 'Ramanathapuram', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Pamban Island Tip', 'aliases': ['dhanushkodi', 'dhanushkodi beach', 'ram setu point', 'ghost town'], 'search_terms': ['dhanushkodi', 'ram setu', 'ghost town', 'sea confluence', 'cyclone ruins'], 'activities': ['beach_drives', 'ruins_photography', 'sea_confluence_viewing'], 'tags': ['ghost_town', 'ram_setu', 'coastal'], 'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "pamban-bridge": {'id': 'p-pamban-bridge', 'slug': 'pamban-bridge', 'name': 'Pamban Sea Railway Cantilever Bridge', 'display_name': 'Pamban Sea Railway Bridge & New Vertical Lift Sea Bridge', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'bridge', 'tagline': "India's first 2.06km sea railway bridge opened in 1914 with Scherzer rolling lift span", 'description': 'Historic engineering marvel connecting mainland Mandapam to Rameswaram island over the Palk Strait, famous for trains crossing open ocean waters.', 'latitude': 9.2789, 'longitude': 79.2012, 'city': 'Mandapam / Rameswaram', 'district': 'Ramanathapuram', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Palk Strait', 'aliases': ['pamban bridge', 'pamban sea bridge', 'rameswaram bridge'], 'search_terms': ['pamban bridge', 'sea bridge', 'cantilever', 'train on sea', 'palk strait'], 'activities': ['bridge_viewing', 'sea_photography', 'train_watching'], 'tags': ['sea_bridge', 'engineering_marvel', 'palk_strait'], 'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 98, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "padmanabhapuram-palace": {'id': 'p-padmanabhapuram-palace', 'slug': 'padmanabhapuram-palace', 'name': 'Padmanabhapuram Wooden Palace', 'display_name': 'Padmanabhapuram Wooden Palace Complex, Kanyakumari', 'type': 'PALACE', 'category': 'heritage', 'subcategory': 'palace', 'tagline': '16th-century Travancore wooden royal palace with teakwood carvings & polished black floors', 'description': 'Magnificent wooden palace complex built inside a granite fortress, featuring 300-year-old teak carvings, medicinal herbal bed, and Belgian glass mirrors.', 'latitude': 8.2508, 'longitude': 77.3262, 'city': 'Padmanabhapuram / Thuckalay', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Kanyakumari Heritage Belt', 'aliases': ['padmanabhapuram palace', 'thuckalay palace'], 'search_terms': ['wooden palace', 'travancore', 'teakwood', 'padmanabhapuram', 'kanyakumari'], 'activities': ['palace_tour', 'architecture', 'history_museum'], 'tags': ['wooden_palace', 'travancore', 'heritage'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 96, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "vedanthangal-bird-sanctuary": {'id': 'p-vedanthangal-bird-sanctuary', 'slug': 'vedanthangal-bird-sanctuary', 'name': 'Vedanthangal Bird Sanctuary', 'display_name': 'Vedanthangal Water Bird Sanctuary, Chengalpattu', 'type': 'BIRD_SANCTUARY', 'category': 'wildlife', 'subcategory': 'birds', 'tagline': 'Oldest water bird sanctuary in India drawing 40,000 migratory species annually', 'description': '30-hectare protected freshwater lake sanctuary filled with Barringtonia trees, hosting migratory herons, storks, spoonbills, and pelicans.', 'latitude': 12.5456, 'longitude': 79.8556, 'city': 'Vedanthangal / Maduranthakam', 'district': 'Chengalpattu', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Northern Tamil Nadu Wetlands', 'aliases': ['vedanthangal', 'vedanthangal bird sanctuary'], 'search_terms': ['birds', 'migratory birds', 'storks', 'vedanthangal', 'chengalpattu'], 'activities': ['bird_watching', 'nature_walks', 'photography'], 'tags': ['bird_sanctuary', 'wetlands', 'migratory_birds'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 95, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "marudhamalai-temple": {'id': 'p-marudhamalai-temple', 'slug': 'marudhamalai-temple', 'name': 'Marudhamalai Murugan Temple', 'display_name': 'Marudhamalai Subramanya Swamy Hill Temple, Coimbatore', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': '7th-century Western Ghats hill shrine surrounded by medicinal herbal forest', 'description': 'Scenic hilltop Murugan temple in the Western Ghats 12km from Coimbatore, famous for Pambatti Siddhar cave and medicinal Marudham trees.', 'latitude': 11.0456, 'longitude': 76.8521, 'city': 'Marudhamalai / Coimbatore', 'district': 'Coimbatore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Western Ghats Foothills', 'aliases': ['marudhamalai', 'marudhamalai temple'], 'search_terms': ['marudhamalai', 'murugan', 'coimbatore', 'siddhar cave', 'hill temple'], 'activities': ['temples', 'hill_walk', 'spiritual'], 'tags': ['murugan', 'siddhar', 'coimbatore'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "adiyogi-shiva": {'id': 'p-adiyogi-shiva', 'slug': 'adiyogi-shiva', 'name': 'Adiyogi 112ft Shiva Statue', 'display_name': 'Adiyogi 112ft Shiva Statue & Isha Yoga Center, Coimbatore', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'monument', 'tagline': "World's largest bust sculpture (112ft steel statue) at Velliangiri Foothills", 'description': 'Recognized by Guinness World Records as the largest bust sculpture, featuring a 112ft steel statue of Adiyogi Shiva and Dhyanalinga yogic temple.', 'latitude': 10.9754, 'longitude': 76.7354, 'city': 'Ikkarai Boluvampatti / Coimbatore', 'district': 'Coimbatore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Velliangiri Foothills', 'aliases': ['adiyogi', 'adiyogi shiva', 'isha yoga center coimbatore'], 'search_terms': ['adiyogi', 'isha yoga', 'shiva statue', 'dhyanalinga', 'velliangiri'], 'activities': ['meditation', 'statue_viewing', 'light_show', 'spiritual'], 'tags': ['adiyogi', 'guinness_record', 'isha_yoga'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 99, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "mettur-dam": {'id': 'p-mettur-dam', 'slug': 'mettur-dam', 'name': 'Mettur Dam & Stanley Reservoir', 'display_name': 'Mettur Dam & Ellis Park, Salem', 'type': 'DAM', 'category': 'dam', 'subcategory': 'river', 'tagline': '1934 AD engineering feat — 1.6km long dam across Cauvery River', 'description': 'One of the largest dams in India built across the Cauvery River, featuring a manicured riverside park, hydroelectric power station, and fresh fish market.', 'latitude': 11.7912, 'longitude': 77.8012, 'city': 'Mettur', 'district': 'Salem', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Cauvery Basin', 'aliases': ['mettur dam', 'stanley reservoir', 'mettur'], 'search_terms': ['mettur dam', 'cauvery', 'salem dam', 'reservoir', 'park'], 'activities': ['dam_viewing', 'park_walk', 'fish_tasting'], 'tags': ['dam', 'cauvery', 'reservoir'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 93, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},
            "sripuram-golden-temple": {'id': 'p-sripuram-golden-temple', 'slug': 'sripuram-golden-temple', 'name': 'Sripuram Sri Lakshmi Narayani Golden Temple', 'display_name': 'Sripuram Golden Temple & Star Path, Vellore', 'type': 'TEMPLE', 'category': 'temple', 'subcategory': 'heritage', 'tagline': 'Spiritual park featuring 1,500kg gold foil wrapped temple inside a star-shaped path', 'description': 'Spiritual oasis covering 100 acres in Malaikodi Vellore, featuring a temple covered in 1.5 tonnes of pure gold foil surrounded by a star-shaped walking path.', 'latitude': 12.8712, 'longitude': 79.0889, 'city': 'Malaikodi / Vellore', 'district': 'Vellore', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Vellore Valley', 'aliases': ['sripuram golden temple', 'vellore golden temple', 'lakshmi narayani temple'], 'search_terms': ['golden temple', 'vellore', 'gold temple', 'star path', 'lakshmi'], 'activities': ['temples', 'star_path_walk', 'spiritual'], 'tags': ['golden_temple', 'gold_foil', 'vellore'], 'image': 'https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 97, 'coordinate_source': 'Government of Tamil Nadu Tourism Portal', 'coordinate_accuracy': 'EXACT', 'verified': True},

            # Verified Explore TN Places (Sivaganga & Kanyakumari Verified List)
            "piranmalai": {'id': 'p-piranmalai', 'slug': 'piranmalai', 'name': 'Piranmalai Hill & Fort Ruins', 'display_name': 'Piranmalai Fort & Hill Summit Trek, Singampunari, Sivaganga', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'trekking', 'tagline': 'Rugged 2,500ft craggy hill with ancient fort remains, Bhairavar temple & Dargah', 'description': 'A historic craggy hill rising to ~2,500 ft in Singampunari Taluk, Sivaganga. Features multi-tiered ancient fort ruins, Bhairavar hill temple, dargah near the summit, and steep rocky trekking terrain.', 'latitude': 10.2378, 'longitude': 78.4356, 'city': 'Singampunari / Piranmalai', 'district': 'Sivaganga', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Sivaganga Hill Ranges', 'aliases': ['piranmalai', 'piranmalai trek', 'piranmalai fort'], 'search_terms': ['piranmalai', 'sivaganga', 'singampunari', 'fort trek', 'bhairavar', 'dargah'], 'activities': ['trekking', 'history_exploration', 'photography', 'temple_visit'], 'tags': ['trekking', 'fort_ruins', 'hill_summit', 'sivaganga'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 91, 'coordinate_source': 'District Administration Sivaganga & Scientific Coordinates', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': True, 'difficulty': 'Moderate–Hard'},
            "valli-chunai-falls": {'id': 'p-valli-chunai-falls', 'slug': 'valli-chunai-falls', 'name': 'Valli Chunai Falls (வள்ளி சுனை அருவி)', 'display_name': 'Valli Chunai Falls & Cave Cascade, Kumarakovil, Kanyakumari', 'type': 'WATERFALL', 'category': 'waterfall', 'subcategory': 'short_trek', 'tagline': 'Lesser-known cave-like waterfall cascade reached via hill trekking trail', 'description': 'A secluded monsoon waterfall near Kumarakovil in Kanyakumari district where water flows around dense rock formations creating a cave-like appearance.', 'latitude': 8.2577, 'longitude': 77.3557, 'city': 'Kumarakovil / Velimalai', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Southern Western Ghats', 'aliases': ['valli chunai', 'vallichunai falls', 'valli chunai aruvi'], 'search_terms': ['valli chunai', 'kumarakovil', 'cave waterfall', 'kanyakumari', 'waterfall trek'], 'activities': ['waterfall_trek', 'nature_walk', 'cave_viewing'], 'tags': ['waterfall', 'cave_cascade', 'kanyakumari'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.7, 'popularity': 88, 'coordinate_source': 'Research Reference & GIS Survey', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': True, 'difficulty': 'Moderate'},
            "mathoor-aqueduct": {'id': 'p-mathoor-aqueduct', 'slug': 'mathoor-aqueduct', 'name': 'Mathoor Aqueduct (மாத்தூர் தொட்டிப்பாலம்)', 'display_name': 'Mathoor Hanging Trough & Paraliyar River Bridge, Kanyakumari', 'type': 'HERITAGE_SITE', 'category': 'heritage', 'subcategory': 'viewpoint', 'tagline': '115ft high, 1km long elevated aqueduct trough over Paraliyar River with 28 pillars', 'description': 'Constructed in the 1960s across the Pahrali/Paraliyar River in Thiruvattar Taluk. Holds 115-foot high elevated irrigation trough spanning 1 km with panoramic views of the Western Ghats canopy.', 'latitude': 8.3189, 'longitude': 77.2984, 'city': 'Mathoor / Thiruvattar', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Thiruvattar Valley', 'aliases': ['mathoor aqueduct', 'mathoor hanging trough', 'mathur aqueduct'], 'search_terms': ['mathoor', 'aqueduct', 'hanging trough', 'paraliyar river', 'kanyakumari heritage'], 'activities': ['aqueduct_walk', 'bridge_viewing', 'scenery_photography'], 'tags': ['heritage', 'aqueduct', 'engineering_marvel', 'viewpoint'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.9, 'popularity': 96, 'coordinate_source': 'District Administration Kanyakumari GIS', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': False, 'difficulty': 'Easy'},
            "perunchilambu-stream-falls": {'id': 'p-perunchilambu-stream-falls', 'slug': 'perunchilambu-stream-falls', 'name': 'Perunchilambu Stream & Check Dam Falls', 'display_name': 'Perunchilambu Stream & Check Dam Cascades, Velimalai, Kanyakumari', 'type': 'WATERFALL', 'category': 'waterfall', 'subcategory': 'nature', 'tagline': 'Scenic rural stream and seasonal check dam cascades originating near Velimalai', 'description': 'A seasonal stream and check dam cascade passing near Perunchilambu village in Kalkulam Taluk, surrounded by lush rural Western Ghats vegetation.', 'latitude': 8.2950, 'longitude': 77.3470, 'city': 'Perunchilambu / Velimalai', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Velimalai Range', 'aliases': ['perunchilambu', 'perunchilambu falls', 'perunchilambu check dam'], 'search_terms': ['perunchilambu', 'velimalai', 'check dam falls', 'kalkulam', 'stream'], 'activities': ['nature_walk', 'check_dam_viewing', 'seasonal_bathing'], 'tags': ['nature', 'stream', 'check_dam', 'kanyakumari'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.6, 'popularity': 85, 'coordinate_source': 'Parivesh Environmental Mapping & Mapcarta', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': False, 'difficulty': 'Easy–Moderate'},
            "netta-locality": {'id': 'p-netta-locality', 'slug': 'netta-locality', 'name': 'Netta Rural Backwater Locality', 'display_name': 'Netta Countryside & Chittar Dam Spillway Area, Kanyakumari', 'type': 'LAKE', 'category': 'nature', 'subcategory': 'locality', 'tagline': 'Quiet Western Ghats border village near Chittar Reservoir backwaters', 'description': 'A picturesque village locality in Kadayal/Kaliyal block bordering Chittar backwaters. Note: exact "Netta Lake" tourism pin is unverified; recorded as a scenic rural backwater region.', 'latitude': 8.4412, 'longitude': 77.2156, 'city': 'Netta / Kadayal', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Chittar Dam Basin', 'aliases': ['netta', 'netta kanyakumari', 'netta backwaters'], 'search_terms': ['netta', 'kadayal', 'chittar backwaters', 'kanyakumari village'], 'activities': ['countryside_drive', 'scenery_viewing'], 'tags': ['nature', 'backwaters', 'locality_unverified_lake'], 'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', 'rating': 4.4, 'popularity': 80, 'coordinate_source': 'Kanyakumari District Locality Census', 'coordinate_accuracy': 'APPROXIMATE', 'verified': False, 'is_trekking': False, 'difficulty': 'Easy'},
            "kaalimalai-trek": {'id': 'p-kaalimalai-trek', 'slug': 'kaalimalai-trek', 'name': 'Kaalimalai / Kalimala Trek', 'display_name': 'Kaalimalai to Thekkan Kurusumala Peak Trek, Kanyakumari', 'type': 'HILL', 'category': 'mountain', 'subcategory': 'trekking', 'tagline': 'Wild Western Ghats mountain trail featuring foggy ridges & rocky forest ascent', 'description': 'An adventurous mountain trekking trail in Vilavancode Taluk leading towards Thekkan Kurusumala, featuring dense forest cover, misty atmosphere, and summit vistas over the Western Ghats.', 'latitude': 8.4892, 'longitude': 77.2512, 'city': 'Vilavancode / Pathukani', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Vilavancode Western Ghats', 'aliases': ['kaalimalai', 'kalimala trek', 'kurusumala trek'], 'search_terms': ['kaalimalai', 'kalimala', 'vilavancode', 'kurusumala', 'trekking', 'foggy hill'], 'activities': ['mountain_trekking', 'ridge_walking', 'foggy_views'], 'tags': ['trekking', 'mountain', 'western_ghats', 'adventure'], 'image': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'rating': 4.8, 'popularity': 90, 'coordinate_source': 'Bengaluru Trails & Western Ghats GIS Log', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': True, 'difficulty': 'Moderate–Hard'},
            "thellanthi-village": {'id': 'p-thellanthi-village', 'slug': 'thellanthi-village', 'name': 'Thellanthi Rural Countryside', 'display_name': 'Thellanthi Village & Agricultural Ponds, Thovalai, Kanyakumari', 'type': 'HERITAGE_SITE', 'category': 'culture', 'subcategory': 'rural_tourism', 'tagline': 'Offbeat agrarian village 15km north of Nagercoil with lush paddy fields & ponds', 'description': 'A serene rural locality under Thovalai Block situated 15 km north of Nagercoil. Features traditional paddy fields, lotus ponds, and surrounding Western Ghats foothills.', 'latitude': 8.3012, 'longitude': 77.4421, 'city': 'Thellanthi / Thovalai', 'district': 'Kanyakumari', 'state': 'Tamil Nadu', 'country': 'India', 'region': 'Thovalai Basin', 'aliases': ['thellanthi', 'thellanthi village'], 'search_terms': ['thellanthi', 'thovalai', 'nagercoil rural', 'village tourism', 'paddy fields'], 'activities': ['village_walk', 'rural_photography', 'nature_observation'], 'tags': ['rural_tourism', 'culture', 'countryside', 'kanyakumari'], 'image': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', 'rating': 4.5, 'popularity': 82, 'coordinate_source': 'Thovalai Block Rural Development Directory', 'coordinate_accuracy': 'EXACT', 'verified': True, 'is_trekking': False, 'difficulty': 'Easy'},

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
        target = None
        if identifier in self._places_db:
            target = self._places_db[identifier]
        else:
            for p in self._places_db.values():
                if p.get("id") == identifier or p.get("slug") == identifier or (p.get("name") and p["name"].lower() == identifier.lower()):
                    target = p
                    break
        if not target:
            raise ResourceNotFoundException("Place", identifier)

        if "version" not in target:
            target["version"] = 1
        if "createdBy" not in target:
            target["createdBy"] = "System"
        if "createdAt" not in target:
            target["createdAt"] = "2026-08-20T10:00:00Z"
        return target

    def get_all_places(self) -> List[dict]:
        for p in self._places_db.values():
            if "version" not in p:
                p["version"] = 1
            if "createdBy" not in p:
                p["createdBy"] = "System"
            if "createdAt" not in p:
                p["createdAt"] = "2026-08-20T10:00:00Z"
            if "state" not in p:
                p["state"] = "Tamil Nadu"
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

    def find_places_along_route_corridor(self, route_points: List[List[float]], corridor_width_km: float = 10.0, category: Optional[str] = None) -> List[dict]:
        """
        Queries POIs within corridor_width_km of an actual road route polyline [[lng, lat], ...]
        """
        if not route_points:
            return []

        points = [(p[1], p[0]) for p in route_points if len(p) >= 2]
        if not points:
            return []

        matched_places = []
        step = max(1, len(points) // 40)
        sampled_points = points[::step]
        if points[-1] not in sampled_points:
            sampled_points.append(points[-1])

        for slug, place in self._places_db.items():
            p_lat = place.get("latitude")
            p_lng = place.get("longitude")
            if p_lat is None or p_lng is None:
                continue

            if category and category.lower() != "all":
                p_cat = (place.get("category") or "").lower()
                p_subcat = (place.get("subcategory") or "").lower()
                if category.lower() not in p_cat and category.lower() not in p_subcat:
                    continue

            min_dist = float('inf')
            for lat_pt, lng_pt in sampled_points:
                d = calculate_haversine(p_lat, p_lng, lat_pt, lng_pt)
                if d < min_dist:
                    min_dist = d
                if min_dist <= corridor_width_km:
                    break

            if min_dist <= corridor_width_km:
                place_copy = dict(place)
                place_copy["corridorDistanceKm"] = round(min_dist, 2)
                matched_places.append(place_copy)

        matched_places.sort(key=lambda x: x["corridorDistanceKm"])
        return matched_places

    def get_destination_interest_categories(self, destination_name: str) -> List[dict]:
        """
        Generates dynamic interest cards tailored to POIs present in the requested destination.
        """
        resolved = self.resolve_destination(destination_name)
        lat = resolved.get("latitude")
        lng = resolved.get("longitude")

        nearby_pois = []
        if lat and lng:
            nearby_pois = self.find_nearby_places(lat, lng, radius_km=40.0)

        category_counts = {}
        for p in nearby_pois:
            cat = (p.get("category") or "nature").lower()
            subcat = (p.get("subcategory") or "").lower()
            category_counts[cat] = category_counts.get(cat, 0) + 1
            if subcat:
                category_counts[subcat] = category_counts.get(subcat, 0) + 1

        LOOKUP = [
            ({"temple", "temples", "spiritual"}, {"id": "temples", "label": "Temples & Gopurams", "icon": "🛕", "categoryKey": "temple"}),
            ({"waterfall", "waterfalls"}, {"id": "waterfalls", "label": "Waterfalls & Streams", "icon": "💦", "categoryKey": "waterfall"}),
            ({"mountain", "hills", "viewpoint", "viewpoints"}, {"id": "viewpoints", "label": "Hills & Viewpoints", "icon": "🏔️", "categoryKey": "mountain"}),
            ({"coastal", "beach", "beaches"}, {"id": "beaches", "label": "Beaches & Coastal Drives", "icon": "🏖️", "categoryKey": "coastal"}),
            ({"heritage", "fort", "palace", "museum"}, {"id": "heritage", "label": "Forts & Palaces", "icon": "🏛️", "categoryKey": "heritage"}),
            ({"food", "restaurant", "local_food", "cafes"}, {"id": "food", "label": "Local Food & Eateries", "icon": "🍛", "categoryKey": "food"}),
            ({"adventure", "trekking", "kayaking", "rafting", "camping"}, {"id": "adventure", "label": "Adventure & Treks", "icon": "🪂", "categoryKey": "adventure"}),
            ({"lake", "river", "dam"}, {"id": "lakes", "label": "Lakes, Rivers & Dams", "icon": "🌊", "categoryKey": "lake"}),
            ({"wildlife", "forest", "national_park", "bird_sanctuary"}, {"id": "wildlife", "label": "Wildlife & Sanctuaries", "icon": "🦚", "categoryKey": "wildlife"}),
            ({"shopping", "markets", "handicrafts"}, {"id": "markets", "label": "Markets & Local Handicrafts", "icon": "🛍️", "categoryKey": "shopping"}),
        ]

        selected = []
        seen = set()

        for key_set, item in LOOKUP:
            if any(k in category_counts for k in key_set):
                if item["id"] not in seen:
                    seen.add(item["id"])
                    selected.append(item)

        if not selected:
            selected = [
                {"id": "sights", "label": "Top Sights & Attractions", "icon": "🛕", "categoryKey": "sights"},
                {"id": "food", "label": "Local Food & Dining", "icon": "🍛", "categoryKey": "food"},
                {"id": "nature", "label": "Nature & Viewpoints", "icon": "🌿", "categoryKey": "nature"},
                {"id": "heritage", "label": "Culture & Heritage", "icon": "🏛️", "categoryKey": "heritage"}
            ]

        return selected

    def deduplicate_and_merge_place(self, new_place: dict) -> Tuple[dict, bool]:
        """
        Deduplicates POIs by checking name similarity, alias overlap, and spatial proximity (< 1km).
        Returns (canonical_place, is_new_boolean).
        """
        name_clean = (new_place.get("name") or "").lower().strip()
        new_lat = new_place.get("latitude")
        new_lng = new_place.get("longitude")
        new_aliases = set([a.lower() for a in new_place.get("aliases", [])])

        for slug, existing in self._places_db.items():
            ex_name = (existing.get("name") or "").lower().strip()
            ex_aliases = set([a.lower() for a in existing.get("aliases", [])])
            ex_lat = existing.get("latitude")
            ex_lng = existing.get("longitude")

            is_name_match = (name_clean == ex_name) or (name_clean in ex_aliases) or (ex_name in new_aliases)

            is_spatial_close = False
            if new_lat and new_lng and ex_lat and ex_lng:
                dist = calculate_haversine(new_lat, new_lng, ex_lat, ex_lng)
                if dist <= 1.0:
                    is_spatial_close = True

            if is_name_match or (is_spatial_close and new_place.get("category") == existing.get("category")):
                existing_aliases = list(existing.get("aliases", []))
                for a in new_place.get("aliases", []):
                    if a not in existing_aliases:
                        existing_aliases.append(a)
                existing["aliases"] = existing_aliases
                return (existing, False)

        slug = new_place.get("slug") or name_clean.replace(" ", "-").replace("'", "")
        self._places_db[slug] = new_place
        return (new_place, True)

    def get_places_in_viewport(self, min_lat: float, max_lat: float, min_lng: float, max_lng: float, category: Optional[str] = None) -> List[dict]:
        """
        Spatial bounding-box viewport query backing Leaflet map viewports.
        """
        matched = []
        for p in self._places_db.values():
            lat = p.get("latitude")
            lng = p.get("longitude")
            if lat is None or lng is None:
                continue
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                if category and category.lower() != "all":
                    p_cat = p.get("category", "").lower()
                    p_tags = [t.lower() for t in p.get("tags", [])]
                    if category.lower() != p_cat and category.lower() not in p_tags:
                        continue
                matched.append(p)
        return matched

    def get_places_along_corridor(self, polyline_coords: List[List[float]], max_detour_km: float = 5.0, category: Optional[str] = None) -> List[dict]:
        """
        Spatial road corridor query to discover POIs within corridor detour of road geometry.
        """
        if not polyline_coords:
            return []

        matched = []
        for p in self._places_db.values():
            lat = p.get("latitude")
            lng = p.get("longitude")
            if lat is None or lng is None:
                continue

            if category and category.lower() != "all":
                p_cat = p.get("category", "").lower()
                p_tags = [t.lower() for t in p.get("tags", [])]
                if category.lower() != p_cat and category.lower() not in p_tags:
                    continue

            # Minimum distance to any point along the polyline corridor
            min_dist = float("inf")
            for pt in polyline_coords:
                d = calculate_haversine(lat, lng, pt[0], pt[1])
                if d < min_dist:
                    min_dist = d

            if min_dist <= max_detour_km:
                p_copy = dict(p)
                p_copy["detourDistanceKm"] = round(min_dist, 2)
                matched.append(p_copy)

        matched.sort(key=lambda x: x.get("detourDistanceKm", 0.0))
        return matched

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

    def add_place(self, place_id: str, name: str, district: str, category: str, description: str, latitude: float, longitude: float, image_url: str = None, best_time: str = "Year Round", highlights: List[str] = None, tags: List[str] = None) -> dict:
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        record = {
            "id": place_id,
            "slug": slug,
            "name": name,
            "display_name": f"{name}, {district}",
            "type": category.upper(),
            "category": category.lower(),
            "description": description,
            "latitude": float(latitude),
            "longitude": float(longitude),
            "district": district,
            "state": "Tamil Nadu",
            "country": "India",
            "best_time": best_time,
            "highlights": highlights or [name],
            "tags": tags or [category],
            "image": image_url or "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
            "rating": 4.8,
            "popularity": 95,
            "status": "PUBLISHED",
            "verified": True
        }
        self._places_db[slug] = record
        return record

places_service = PlacesService()


