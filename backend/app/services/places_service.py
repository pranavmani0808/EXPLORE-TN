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
