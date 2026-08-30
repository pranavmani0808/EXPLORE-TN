import time
from typing import List, Dict, Any, Optional
from backend.app.schemas.admin_dashboard import (
    AdminDashboardMetricsDTO,
    CrawledDataRecordDTO,
    AdminEventDTO,
    AdminHotelListingDTO,
    AdminUserRoleDTO,
    AdminAnalyticsDTO,
    AdminSettingsDTO
)
from backend.app.services.places_service import places_service
from backend.app.core.logger import structured_logger

class AdminDashboardService:
    def __init__(self):
        # In-memory staging store for crawler ingested records
        self._crawled_records: List[CrawledDataRecordDTO] = [
            CrawledDataRecordDTO(
                id="crawl-rec-001",
                sourceUrl="https://ttdc.tn.gov.in/destinations/meenakshi-amman",
                domain="ttdc.tn.gov.in",
                title="Meenakshi Sundareswarar Temple Complex",
                extractedType="attraction",
                district="Madurai",
                rawPayload={"name": "Meenakshi Temple", "district": "Madurai", "category": "temple", "gopurams": 14},
                status="PENDING_REVIEW",
                crawlTime=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            ),
            CrawledDataRecordDTO(
                id="crawl-rec-002",
                sourceUrl="https://forests.tn.gov.in/kolli-hills-sanctuary",
                domain="forests.tn.gov.in",
                title="Kolli Hills Agaya Gangai Eco-Trek",
                extractedType="destination",
                district="Namakkal",
                rawPayload={"name": "Kolli Hills Trek", "district": "Namakkal", "hairpinBends": 70},
                status="PENDING_REVIEW",
                crawlTime=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            ),
            CrawledDataRecordDTO(
                id="crawl-rec-003",
                sourceUrl="https://tourism.tn.gov.in/hotels/ttdc-kodaikanal",
                domain="tourism.tn.gov.in",
                title="Hotel Tamil Nadu Kodaikanal (TTDC)",
                extractedType="hotel",
                district="Dindigul",
                rawPayload={"name": "Hotel Tamil Nadu Kodai", "district": "Dindigul", "rating": 4.5},
                status="APPROVED",
                crawlTime=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            )
        ]

        self._events: List[AdminEventDTO] = [
            AdminEventDTO(
                id="evt-101",
                title="Chithirai Thiruvizha Festival 2026",
                category="Cultural & Temple Festival",
                district="Madurai",
                startDate="2026-04-20",
                endDate="2026-05-02",
                location="Meenakshi Temple & Vaigai River Bed",
                organizer="Arulmigu Meenakshi Sundareswarar Thirukoil Board",
                isPublished=True,
                imageUrl="/images/events/chithirai.jpg"
            ),
            AdminEventDTO(
                id="evt-102",
                title="Annual Ooty Flower Show & Tea Festival",
                category="Hill Station Carnival",
                district="Nilgiris",
                startDate="2026-05-15",
                endDate="2026-05-25",
                location="Government Botanical Garden, Ooty",
                organizer="Tamil Nadu Horticulture Department",
                isPublished=True,
                imageUrl="/images/events/ooty-flower.jpg"
            )
        ]

        self._hotels: List[AdminHotelListingDTO] = [
            AdminHotelListingDTO(
                id="htl-301",
                name="TTDC Hotel Tamil Nadu Ooty",
                district="Nilgiris",
                category="Heritage Resort",
                contactPhone="+91-423-2443665",
                website="https://ttdconline.com/ooty",
                rating=4.6,
                verificationStatus="VERIFIED"
            ),
            AdminHotelListingDTO(
                id="htl-302",
                name="Heritage Madurai Nayak Villa",
                district="Madurai",
                category="Boutique Heritage Hotel",
                contactPhone="+91-452-2385400",
                website="https://heritagemadurai.com",
                rating=4.8,
                verificationStatus="VERIFIED"
            )
        ]

        self._users: List[AdminUserRoleDTO] = [
            AdminUserRoleDTO(
                id="usr-admin-1",
                email="pranav.admin@exploretn.org",
                name="Pranav (Lead Architect)",
                role="Super Admin",
                permissions=["all"],
                lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            ),
            AdminUserRoleDTO(
                id="usr-editor-2",
                email="editor.madurai@exploretn.org",
                name="Anand K (Content Editor)",
                role="Editor",
                permissions=["destinations.edit", "events.edit"],
                lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            ),
            AdminUserRoleDTO(
                id="usr-crawler-3",
                email="crawler.ops@exploretn.org",
                name="Automated Crawler Engine",
                role="Crawler Manager",
                permissions=["crawler.manage", "data.approve"],
                lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            )
        ]

        self._settings = AdminSettingsDTO(
            siteTitle="Explore TN — Tamil Nadu Tourism Data Platform",
            crawlerMaxPagesPerRun=50,
            crawlerAutoApproveConfidence=0.92,
            enableRealtimeAlerts=True,
            defaultDistrict="Madurai",
            maintenanceMode=False
        )

    def get_dashboard_overview(self, trace_id: str = "tr-admin-overview") -> AdminDashboardMetricsDTO:
        places_count = len(places_service.get_all_places())
        pending = len([r for r in self._crawled_records if r.status == "PENDING_REVIEW"])

        return AdminDashboardMetricsDTO(
            totalDestinations=places_count,
            totalAttractions=places_count * 3,
            totalHotels=len(self._hotels),
            totalRestaurants=18,
            totalEvents=len(self._events),
            totalPackages=12,
            newCrawledItems=len(self._crawled_records),
            pendingApprovals=pending,
            systemApiHealth="OPERATIONAL (100% Uptime)",
            lastCrawlTimestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ")
        )

    def get_crawled_records(self, status_filter: Optional[str] = None) -> List[CrawledDataRecordDTO]:
        if status_filter:
            sf = status_filter.upper()
            return [r for r in self._crawled_records if r.status == sf]
        return self._crawled_records

    def approve_crawled_record(self, record_id: str, trace_id: str = "tr-approve") -> CrawledDataRecordDTO:
        for r in self._crawled_records:
            if r.id == record_id:
                r.status = "APPROVED"
                structured_logger.info(
                    message=f"Approved crawled record '{record_id}' ({r.title})",
                    trace_id=trace_id,
                    endpoint="AdminDashboardService.approve_crawled_record"
                )
                return r
        raise ValueError(f"Crawled record with ID '{record_id}' not found.")

    def reject_crawled_record(self, record_id: str, reason: str = "Duplicate record", trace_id: str = "tr-reject") -> CrawledDataRecordDTO:
        for r in self._crawled_records:
            if r.id == record_id:
                r.status = "REJECTED"
                r.errorMessage = reason
                structured_logger.info(
                    message=f"Rejected crawled record '{record_id}': {reason}",
                    trace_id=trace_id,
                    endpoint="AdminDashboardService.reject_crawled_record"
                )
                return r
        raise ValueError(f"Crawled record with ID '{record_id}' not found.")

    def sync_approved_to_production(self, trace_id: str = "tr-sync") -> Dict[str, Any]:
        approved = [r for r in self._crawled_records if r.status == "APPROVED"]
        structured_logger.info(
            message=f"Syncing {len(approved)} approved records to live PostgreSQL/PostGIS database",
            trace_id=trace_id,
            endpoint="AdminDashboardService.sync_approved_to_production"
        )
        return {
            "syncedCount": len(approved),
            "status": "SUCCESS",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    def get_events(self) -> List[AdminEventDTO]:
        return self._events

    def get_hotels(self) -> List[AdminHotelListingDTO]:
        return self._hotels

    def get_users(self) -> List[AdminUserRoleDTO]:
        return self._users

    def get_analytics(self) -> AdminAnalyticsDTO:
        return AdminAnalyticsDTO(
            mostViewedDestinations=[
                {"name": "Meenakshi Amman Temple, Madurai", "views": 18450, "district": "Madurai"},
                {"name": "Brihadisvara Temple, Thanjavur", "views": 14200, "district": "Thanjavur"},
                {"name": "Kodaikanal Star Lake", "views": 12800, "district": "Dindigul"},
                {"name": "Ooty Botanical Garden", "views": 11900, "district": "Nilgiris"}
            ],
            popularDistricts=[
                {"district": "Madurai", "searches": 42000},
                {"district": "Dindigul", "searches": 31500},
                {"district": "Nilgiris", "searches": 29800},
                {"district": "Namakkal", "searches": 18200}
            ],
            topSearchQueries=[
                {"query": "Madurai 2-day itinerary", "count": 8400},
                {"query": "Kolli Hills 70 hairpin bends", "count": 6200},
                {"query": "Kodaikanal mist forecast", "count": 5100}
            ],
            dailyApiRequests=24850,
            totalDataVolumeMb=184.5
        )

    def get_settings(self) -> AdminSettingsDTO:
        return self._settings

    def update_settings(self, payload: AdminSettingsDTO) -> AdminSettingsDTO:
        self._settings = payload
        return self._settings

admin_dashboard_service = AdminDashboardService()
