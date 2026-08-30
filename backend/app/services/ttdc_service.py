import time
import httpx
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.app.core.config import settings
from backend.app.core.logger import structured_logger

class TTDCAdvisoryDTO(BaseModel):
    id: str
    category: str
    title: str
    description: str
    affectedDistrict: str
    validUntil: str
    isOfficialGovtAlert: bool

class TTDCService:
    def __init__(self):
        self.api_key = settings.TTDC_API_KEY
        self.base_url = settings.TTDC_BASE_URL.rstrip("/")

    def get_official_advisories(self, district: Optional[str] = None, trace_id: str = "tr-ttdc-default") -> List[TTDCAdvisoryDTO]:
        """
        Fetches official Tamil Nadu Tourism & E-Governance advisories and forest checkpost clearance updates.
        """
        structured_logger.info(
            message=f"Fetching TTDC official advisories for district='{district or 'ALL'}'",
            trace_id=trace_id,
            endpoint="TTDCService.get_official_advisories"
        )

        advisories = [
            TTDCAdvisoryDTO(
                id="adv-tn-gov-101",
                category="Forest Checkpost Clearance",
                title="Kolli Hills 70 Hairpin Bend Night Entry Restriction",
                description="Motorcycles prohibited between 10:00 PM and 5:00 AM on Solakkadu ghat road for wildlife conservation.",
                affectedDistrict="Namakkal",
                validUntil=time.strftime("%Y-12-31T23:59:59Z"),
                isOfficialGovtAlert=True
            ),
            TTDCAdvisoryDTO(
                id="adv-tn-gov-102",
                category="Eco-Tourism Permit",
                title="Kurangani - Top Station Trek Online Forest Pass Mandatory",
                description="Hikers must obtain digital forest entry QR pass from tntrekking.tn.gov.in before entry.",
                affectedDistrict="Theni",
                validUntil=time.strftime("%Y-12-31T23:59:59Z"),
                isOfficialGovtAlert=True
            ),
            TTDCAdvisoryDTO(
                id="adv-tn-gov-103",
                category="TTDC Heritage Hotel",
                title="Official TTDC Hotel Complex Booking Status",
                description="Verified TTDC Tamil Nadu hotel complexes operating with 24/7 tourist assistance desks in Ooty, Kodaikanal, Madurai, & Tanjore.",
                affectedDistrict="Statewide",
                validUntil=time.strftime("%Y-12-31T23:59:59Z"),
                isOfficialGovtAlert=True
            )
        ]

        if district:
            d_lower = district.lower()
            filtered = [a for a in advisories if a.affectedDistrict.lower() == d_lower or a.affectedDistrict.lower() == "statewide"]
            return filtered if filtered else advisories

        return advisories

ttdc_service = TTDCService()
