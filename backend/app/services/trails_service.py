from typing import Dict, List, Optional, Any
from backend.app.services.places_service import places_service
from backend.app.core.exceptions import ResourceNotFoundException

class TrailsService:
    def __init__(self):
        self._trails_db: Dict[str, dict] = {
            "arupadai-veedu": {
                "id": "t-arupadai-veedu",
                "slug": "arupadai-veedu",
                "name": "Arupadai Veedu Trail",
                "subtitle": "Journey through the six sacred abodes of Lord Murugan across Tamil Nadu.",
                "category": "spiritual",
                "coverImage": "/src/assets/temples/palani.jpg",
                "destinationSlugs": [
                    "thirupparankundram-murugan-temple",
                    "tiruchendur-murugan-temple",
                    "palani-murugan-temple",
                    "swamimalai-murugan-temple",
                    "thiruttani-murugan-temple",
                    "pazhamudircholai-murugan-temple"
                ],
                "metadata": {
                    "totalTemples": 6,
                    "recommendedDays": 3,
                    "primaryDistrict": "Tamil Nadu Circuit",
                    "imageAttribution": "ExplorerTN Verified Cultural Archive & Public Heritage Media"
                }
            }
        }

    def get_all_trails(self) -> List[dict]:
        res = []
        for trail in self._trails_db.values():
            trail_copy = dict(trail)
            destinations = []
            for slug in trail_copy["destinationSlugs"]:
                try:
                    place = places_service.get_place_by_id_or_slug(slug)
                    destinations.append(place)
                except ResourceNotFoundException:
                    pass
            trail_copy["destinations"] = destinations
            res.append(trail_copy)
        return res

    def get_trail_by_slug(self, slug: str) -> dict:
        if slug not in self._trails_db:
            raise ResourceNotFoundException("Trail", slug)
        
        trail_data = dict(self._trails_db[slug])
        destinations = []
        for d_slug in trail_data["destinationSlugs"]:
            try:
                place = places_service.get_place_by_id_or_slug(d_slug)
                destinations.append(place)
            except ResourceNotFoundException:
                pass
        trail_data["destinations"] = destinations
        return trail_data

trails_service = TrailsService()
