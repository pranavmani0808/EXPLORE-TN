from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TNGeoNodeDTO(BaseModel):
    id: str
    nameEn: str
    nameTa: str
    level: str  # DISTRICT, CORPORATION, MUNICIPALITY, TOWN_PANCHAYAT, BLOCK, VILLAGE_PANCHAYAT, HABITATION
    adminType: str  # STATE, DISTRICT, URBAN, RURAL
    parentId: Optional[str] = None
    districtId: str
    districtName: str
    latitude: float
    longitude: float
    lgdCode: str
    placesCount: int = 0
    attractionsCount: int = 0
    hotelsCount: int = 0
    restaurantsCount: int = 0
    eventsCount: int = 0

class TNGeoSearchResultDTO(BaseModel):
    query: str
    totalMatches: int
    nodes: List[TNGeoNodeDTO]

class TNGeoAreaDetailDTO(BaseModel):
    node: TNGeoNodeDTO
    parentHierarchy: List[Dict[str, str]]
    tourismStats: Dict[str, Any]
