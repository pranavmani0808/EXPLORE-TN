import time
from typing import List, Dict, Any, Optional
from backend.app.schemas.admin_dashboard import (
    AdminDashboardMetricsDTO,
    DestinationDetailDTO,
    AttractionDetailDTO,
    HotelDetailDTO,
    RestaurantDetailDTO,
    EventDetailDTO,
    CrawlerSourceDTO,
    CrawlerJobDTO,
    CrawledDataDiffDTO,
    AdminUserRoleDTO,
    AdminAnalyticsDTO,
    ContentCmsSectionDTO,
    AdminSettingsDTO
)
from backend.app.services.places_service import places_service
from backend.app.core.logger import structured_logger

class AdminDashboardService:
    def __init__(self):
        # 1. Destinations Store
        self._destinations: List[DestinationDetailDTO] = [
            DestinationDetailDTO(
                id="madurai",
                name="Madurai",
                district="Madurai",
                category="heritage",
                description="2,000-year-old cultural capital of Tamil Nadu on the banks of Vaigai river.",
                latitude=9.9252,
                longitude=78.1198,
                bestTimeToVisit="October to March",
                openingInfo="Open 24/7 City Access",
                imageUrl="https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
                highlights=["Meenakshi Amman Temple", "Thirumalai Nayakkar Mahal", "Jigarthanda Street Food"],
                activities=["Temple Darshan", "Heritage Walking Tour", "Night Food Safari"],
                nearbyAttractions=["Thirupparankundram", "Alagar Kovil", "Samanar Hills"],
                metaTitle="Explore Madurai — Heritage Temples & Street Food",
                metaDescription="Complete travel guide to Madurai temples,Nayakar palace, and authentic street food.",
                slug="madurai",
                status="Published"
            ),
            DestinationDetailDTO(
                id="ooty",
                name="Ooty (Udhagamandalam)",
                district="Nilgiris",
                category="mountain",
                description="Queen of Hill Stations located in Nilgiri Hills at 2,240m elevation.",
                latitude=11.4102,
                longitude=76.6950,
                bestTimeToVisit="September to May",
                openingInfo="06:00 AM - 07:00 PM for Botanical Gardens",
                imageUrl="https://images.unsplash.com/photo-1544735716-392fe2489ffa",
                highlights=["Doddabetta Peak", "Ooty Lake Boating", "Nilgiri Mountain Railway"],
                activities=["Tea Estate Safari", "Trekking", "Heritage Train Ride"],
                nearbyAttractions=["Coonoor", "Pykara Falls", "Mudumalai Sanctuary"],
                metaTitle="Ooty Travel Guide — Nilgiri Hill Station & Tea Gardens",
                metaDescription="Plan your mountain getaway to Ooty with interactive road maps and weather forecasts.",
                slug="ooty",
                status="Published"
            )
        ]

        # 2. Attractions Store
        self._attractions: List[AttractionDetailDTO] = [
            AttractionDetailDTO(
                id="att-101",
                name="Meenakshi Amman Temple",
                destinationId="madurai",
                destinationName="Madurai",
                category="Temples",
                description="Historic Dravidian temple complex featuring 14 tower gopurams and 1,000-pillar hall.",
                latitude=9.9195,
                longitude=78.1193,
                openingHours="05:00 AM - 12:30 PM, 04:00 PM - 10:00 PM",
                entryFee="Free (Rs. 50 for Camera / Museum)",
                contact="+91-452-2344360",
                website="https://maduraimeenakshi.org",
                facilities=["Parking", "Restrooms", "Food", "Guide", "Wheelchair Access"],
                imageUrl="https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
                status="Published"
            ),
            AttractionDetailDTO(
                id="att-102",
                name="Suruli Waterfalls",
                destinationId="theni",
                destinationName="Theni",
                category="Waterfalls",
                description="150ft cascading waterfall surrounded by dense Megamalai forest reserves.",
                latitude=9.6644,
                longitude=77.2711,
                openingHours="07:00 AM - 05:00 PM",
                entryFee="Rs. 30 per person",
                contact="+91-4546-252100",
                website="https://theni.tn.gov.in/tourism",
                facilities=["Parking", "Restrooms", "Food"],
                imageUrl="https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
                status="Published"
            )
        ]

        # 3. Hotels Store
        self._hotels: List[HotelDetailDTO] = [
            HotelDetailDTO(
                id="htl-301",
                name="TTDC Hotel Tamil Nadu Ooty",
                destinationName="Ooty",
                address="Charring Cross, Ooty, Nilgiris - 643001",
                latitude=11.4110,
                longitude=76.7020,
                phone="+91-423-2443665",
                email="hotelooty@ttdconline.com",
                website="https://ttdconline.com/ooty",
                priceRange="Rs. 2,500 - Rs. 5,000 / night",
                amenities=["Free WiFi", "Restaurant", "Parking", "24/7 Front Desk", "Heater"],
                roomTypes=["Deluxe Double", "Family Suite", "Heritage Villa"],
                imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945",
                rating=4.6,
                verificationStatus="VERIFIED",
                isFeatured=True,
                isPublished=True
            )
        ]

        # 4. Restaurants Store
        self._restaurants: List[RestaurantDetailDTO] = [
            RestaurantDetailDTO(
                id="rst-401",
                name="Murugan Idli Shop (Madurai Central)",
                destinationName="Madurai",
                cuisine="Authentic Chettinad & South Indian Tiffin",
                isVegetarian=True,
                priceRange="Rs. 150 - Rs. 400 per person",
                address="West Tower Street, Town Hall Rd, Madurai",
                latitude=9.9180,
                longitude=78.1170,
                openingHours="07:00 AM - 11:00 PM",
                phone="+91-452-2341234",
                website="https://muruganidlishop.com",
                menuUrl="https://muruganidlishop.com/menu",
                imageUrl="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4",
                amenities=["AC Dining", "Takeaway", "Family Seating"],
                isFeatured=True,
                verificationStatus="VERIFIED",
                isPublished=True
            )
        ]

        # 5. Events Store
        self._events: List[EventDetailDTO] = [
            EventDetailDTO(
                id="evt-501",
                title="Chithirai Thiruvizha Festival 2026",
                description="Annual 12-day celestial wedding of Goddess Meenakshi and Kallazhagar entry into Vaigai river.",
                startDate="2026-04-20",
                endDate="2026-05-02",
                startTime="06:00 AM",
                endTime="10:00 PM",
                venue="Meenakshi Amman Temple & Vaigai River Bed",
                district="Madurai",
                location="Madurai Central",
                organizer="Arulmigu Meenakshi Sundareswarar Board",
                contact="+91-452-2344360",
                ticketPrice="Free Public Access (Special Darshan Rs. 100)",
                bookingUrl="https://maduraimeenakshi.org/festival",
                imageUrl="https://images.unsplash.com/photo-1609137144813-7d9921338f24",
                category="Festival",
                isRecurring=True,
                status="Upcoming",
                isPublished=True
            )
        ]

        # 6. Crawler Control Pipeline Store
        self._crawler_sources: List[CrawlerSourceDTO] = [
            CrawlerSourceDTO(id="src-1", name="Tamil Nadu Tourism (TTDC)", url="https://ttdc.tn.gov.in", category="Official Portal", isActive=True, lastCrawl="Today 6:42 PM"),
            CrawlerSourceDTO(id="src-2", name="TN Forest Eco-Tourism", url="https://forests.tn.gov.in", category="Government Reserve", isActive=True, lastCrawl="Today 5:15 PM"),
            CrawlerSourceDTO(id="src-3", name="District Tourism Portals", url="https://tn.gov.in/districts", category="District Data", isActive=True, lastCrawl="Yesterday"),
            CrawlerSourceDTO(id="src-4", name="Custom Travel Feeds", url="https://explorertn.org/feed", category="Community Feed", isActive=True, lastCrawl="Today 6:00 PM")
        ]

        self._crawler_jobs: List[CrawlerJobDTO] = [
            CrawlerJobDTO(id="CR-001", sourceName="Tamil Nadu Tourism", urlsScanned=195, newItems=8, updatedItems=13, duplicates=4, failed=2, status="Completed", timestamp="Today 6:42 PM"),
            CrawlerJobDTO(id="CR-002", sourceName="District Tourism Portals", urlsScanned=84, newItems=3, updatedItems=5, duplicates=1, failed=0, status="Running", timestamp="Today 7:00 PM")
        ]

        self._crawler_diffs: List[CrawledDataDiffDTO] = [
            CrawledDataDiffDTO(
                id="diff-001",
                crawledItem={"name": "Ooty Botanical Garden Glasshouse", "district": "Nilgiris", "category": "attraction", "openingInfo": "07:00 AM - 06:30 PM"},
                existingItem={"name": "Ooty Botanical Garden", "district": "Nilgiris", "category": "attraction", "openingInfo": "08:00 AM - 06:00 PM"},
                diffStatus="UPDATED"
            ),
            CrawledDataDiffDTO(
                id="diff-002",
                crawledItem={"name": "Kumbakkarai Foothill Rock Pools", "district": "Theni", "category": "attraction", "entryFee": "Rs. 20"},
                existingItem=None,
                diffStatus="NEW"
            )
        ]

        # 7. Users & Roles RBAC Store
        self._users: List[AdminUserRoleDTO] = [
            AdminUserRoleDTO(id="usr-1", email="popzdesigngroup@gmail.com", name="Popz Admin", role="Super Admin", permissions=["View", "Add", "Edit", "Delete"], status="Active", lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ")),
            AdminUserRoleDTO(id="usr-2", email="editor.madurai@exploretn.org", name="Anand K", role="Content Editor", permissions=["View", "Add", "Edit"], status="Active", lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ")),
            AdminUserRoleDTO(id="usr-3", email="crawler.manager@exploretn.org", name="Crawler Bot Ops", role="Crawler Manager", permissions=["View", "Add", "Edit"], status="Active", lastActive=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        ]

        # 8. CMS Sections Store
        self._cms_sections: List[ContentCmsSectionDTO] = [
            ContentCmsSectionDTO(id="cms-hero", sectionName="Homepage Hero Banner", title="Discover Tamil Nadu Beyond the Highways", subtitle="Real road routes, misty ghat passes, ancient temples, and local flavors.", isPublished=True, items=[{"bannerImage": "/images/hero-tn.jpg"}]),
            ContentCmsSectionDTO(id="cms-featured", sectionName="Featured Destinations", title="Top Recommended Tamil Nadu Trails", subtitle="Hand-picked multi-stop road itineraries across 38 districts.", isPublished=True, items=[{"placeId": "madurai"}, {"placeId": "ooty"}])
        ]

        # 9. Settings Store
        self._settings = AdminSettingsDTO(
            siteTitle="Explore TN — Tamil Nadu Tourism Data Platform",
            crawlerMaxPagesPerRun=50,
            crawlerAutoApproveConfidence=0.92,
            enableRealtimeAlerts=True,
            defaultDistrict="Madurai",
            maintenanceMode=False,
            categories=["Hill Station", "Beach", "Heritage", "Temple", "Wildlife", "Adventure", "Waterfalls", "Culinary"],
            districts=["Madurai", "Nilgiris", "Dindigul", "Theni", "Thanjavur", "Namakkal", "Kanyakumari", "Chennai"]
        )

    def get_dashboard_overview(self, trace_id: str = "tr-overview") -> AdminDashboardMetricsDTO:
        return AdminDashboardMetricsDTO(
            totalDestinations=len(self._destinations),
            totalAttractions=len(self._attractions),
            totalHotels=len(self._hotels),
            totalRestaurants=len(self._restaurants),
            totalEvents=len(self._events),
            totalPackages=12,
            newCrawledItems=8,
            pendingApprovals=len(self._crawler_diffs),
            publishedContent=161,
            systemApiHealth="100% (OPERATIONAL)",
            lastCrawlTimestamp="Today 6:42 PM",
            recentActivities=[
                {"action": "✓ Madurai destination updated", "time": "10 mins ago"},
                {"action": "✓ 12 attractions imported", "time": "1 hour ago"},
                {"action": "⚠ 2 crawler records waiting for approval", "time": "2 hours ago"},
                {"action": "✓ Chennai data synchronized", "time": "3 hours ago"}
            ],
            crawlerStatus={
                "lastCrawl": "Today 6:42 PM",
                "urlsScanned": 195,
                "new": 8,
                "updated": 13,
                "duplicates": 4,
                "failed": 2
            }
        )

    # Destinations CRUD
    def get_destinations(self) -> List[DestinationDetailDTO]:
        return self._destinations

    def create_destination(self, payload: DestinationDetailDTO) -> DestinationDetailDTO:
        self._destinations.append(payload)
        return payload

    # Attractions CRUD
    def get_attractions(self, category: Optional[str] = None) -> List[AttractionDetailDTO]:
        if category and category.lower() != "all":
            return [a for a in self._attractions if a.category.lower() == category.lower()]
        return self._attractions

    # Hotels & Restaurants CRUD
    def get_hotels(self) -> List[HotelDetailDTO]:
        return self._hotels

    def get_restaurants(self) -> List[RestaurantDetailDTO]:
        return self._restaurants

    # Events CRUD
    def get_events(self, status: Optional[str] = None) -> List[EventDetailDTO]:
        if status and status.lower() != "all":
            return [e for e in self._events if e.status.lower() == status.lower()]
        return self._events

    # Crawler Pipeline Control
    def get_crawler_sources(self) -> List[CrawlerSourceDTO]:
        return self._crawler_sources

    def get_crawler_jobs(self) -> List[CrawlerJobDTO]:
        return self._crawler_jobs

    def get_crawler_diffs(self) -> List[CrawledDataDiffDTO]:
        return self._crawler_diffs

    def approve_diff(self, diff_id: str) -> Dict[str, Any]:
        self._crawler_diffs = [d for d in self._crawler_diffs if d.id != diff_id]
        return {"status": "APPROVED", "diffId": diff_id, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}

    def reject_diff(self, diff_id: str) -> Dict[str, Any]:
        self._crawler_diffs = [d for d in self._crawler_diffs if d.id != diff_id]
        return {"status": "REJECTED", "diffId": diff_id, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}

    # Users & Roles RBAC
    def get_users(self) -> List[AdminUserRoleDTO]:
        return self._users

    # Analytics
    def get_analytics(self) -> AdminAnalyticsDTO:
        return AdminAnalyticsDTO(
            mostViewedDestinations=[
                {"name": "Meenakshi Amman Temple, Madurai", "views": 18450, "district": "Madurai"},
                {"name": "Brihadisvara Temple, Thanjavur", "views": 14200, "district": "Thanjavur"},
                {"name": "Kodaikanal Star Lake", "views": 12800, "district": "Dindigul"},
                {"name": "Ooty Botanical Garden", "views": 11900, "district": "Nilgiris"}
            ],
            popularDistractions=[
                {"name": "Suruli Waterfalls", "views": 9400, "category": "Waterfalls"},
                {"name": "Gingee Fort Citadel", "views": 8200, "category": "Forts"}
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
            totalDataVolumeMb=184.5,
            crawlerStats={"scanned": 195, "successful": 189, "failed": 2, "new": 8, "updated": 13, "duplicates": 4}
        )

    # Content CMS
    def get_cms_sections(self) -> List[ContentCmsSectionDTO]:
        return self._cms_sections

    # Settings
    def get_settings(self) -> AdminSettingsDTO:
        return self._settings

    def add_category(self, category_name: str) -> AdminSettingsDTO:
        if category_name not in self._settings.categories:
            self._settings.categories.append(category_name)
        return self._settings

admin_dashboard_service = AdminDashboardService()
