from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AdminDashboardMetricsDTO(BaseModel):
    totalDestinations: int
    totalAttractions: int
    totalHotels: int
    totalRestaurants: int
    totalEvents: int
    totalPackages: int
    newCrawledItems: int
    pendingApprovals: int
    publishedContent: int
    systemApiHealth: str
    lastCrawlTimestamp: str
    recentActivities: List[Dict[str, str]]
    crawlerStatus: Dict[str, Any]

class DestinationDetailDTO(BaseModel):
    id: str
    name: str
    district: str
    category: str
    description: str
    latitude: float
    longitude: float
    bestTimeToVisit: str
    openingInfo: str
    imageUrl: str
    highlights: List[str]
    activities: List[str]
    nearbyAttractions: List[str]
    metaTitle: str
    metaDescription: str
    slug: str
    status: str  # Draft, Published, Archived

class AttractionDetailDTO(BaseModel):
    id: str
    name: str
    destinationId: str
    destinationName: str
    category: str  # Temples, Beaches, Waterfalls, Forts, Museums, Wildlife, Hill Stations, Adventure, Heritage
    description: str
    latitude: float
    longitude: float
    openingHours: str
    entryFee: str
    contact: str
    website: str
    facilities: List[str]  # Parking, Restrooms, Food, Guide, Wheelchair Access
    imageUrl: str
    status: str  # Draft, Published

class HotelDetailDTO(BaseModel):
    id: str
    name: str
    destinationName: str
    address: str
    latitude: float
    longitude: float
    phone: str
    email: str
    website: str
    priceRange: str
    amenities: List[str]
    roomTypes: List[str]
    imageUrl: str
    rating: float
    verificationStatus: str  # VERIFIED, PENDING, UNVERIFIED
    isFeatured: bool
    isPublished: bool

class RestaurantDetailDTO(BaseModel):
    id: str
    name: str
    destinationName: str
    cuisine: str
    isVegetarian: bool
    priceRange: str
    address: str
    latitude: float
    longitude: float
    openingHours: str
    phone: str
    website: str
    menuUrl: str
    imageUrl: str
    amenities: List[str]
    isFeatured: bool
    verificationStatus: str
    isPublished: bool

class EventDetailDTO(BaseModel):
    id: str
    title: str
    description: str
    startDate: str
    endDate: str
    startTime: str
    endTime: str
    venue: str
    district: str
    location: str
    organizer: str
    contact: str
    ticketPrice: str
    bookingUrl: str
    imageUrl: str
    category: str  # Festival, Cultural, Adventure, Food, Music, Exhibition, Government
    isRecurring: bool
    status: str  # Upcoming, Ongoing, Completed, Draft
    isPublished: bool

class CrawlerSourceDTO(BaseModel):
    id: str
    name: str
    url: str
    category: str
    isActive: bool
    lastCrawl: str

class CrawlerJobDTO(BaseModel):
    id: str
    sourceName: str
    urlsScanned: int
    newItems: int
    updatedItems: int
    duplicates: int
    failed: int
    status: str  # Completed, Running, Failed
    timestamp: str

class CrawledDataDiffDTO(BaseModel):
    id: str
    crawledItem: Dict[str, Any]
    existingItem: Optional[Dict[str, Any]] = None
    diffStatus: str  # NEW, UPDATED, DUPLICATE, FAILED

class AdminUserRoleDTO(BaseModel):
    id: str
    email: str
    name: str
    role: str  # Super Admin, Admin, Content Editor, Crawler Manager, Moderator, Analytics Viewer
    permissions: List[str]
    status: str  # Active, Suspended, Pending
    lastActive: str

class UserRoleUpdateDTO(BaseModel):
    userId: str
    newRole: str

class EntityPerformanceDTO(BaseModel):
    entityId: str
    entityName: str
    category: str
    district: str
    latitude: float
    longitude: float
    totalViews: int
    uniqueVisitors: int
    savesCount: int
    reviewsCount: int
    rating: float
    hasBookingIntegration: bool
    bookingNotice: str
    bookingRequests: Optional[int] = None
    confirmedBookings: Optional[int] = None
    cancelledBookings: Optional[int] = None
    completedBookings: Optional[int] = None
    conversionRatePct: Optional[float] = None
    status: str
    lastUpdated: str


class AuditLogEntryDTO(BaseModel):
    id: str
    userEmail: str
    action: str  # e.g., "DESTINATION_CREATED", "CRAWLER_APPROVED", "USER_ROLE_CHANGED"
    resource: str  # e.g., "Madurai Destination", "Diff #diff-001"
    details: str
    timestamp: str
    ipAddress: Optional[str] = "127.0.0.1"

class AdminAnalyticsDTO(BaseModel):
    mostViewedDestinations: List[Dict[str, Any]]
    popularDistractions: List[Dict[str, Any]]
    popularDistricts: List[Dict[str, Any]]
    topSearchQueries: List[Dict[str, Any]]
    dailyApiRequests: int
    totalDataVolumeMb: float
    crawlerStats: Dict[str, int]

class ContentCmsSectionDTO(BaseModel):
    id: str
    sectionName: str
    title: str
    subtitle: str
    isPublished: bool
    items: List[Dict[str, Any]]

class AdminSettingsDTO(BaseModel):
    siteTitle: str
    crawlerMaxPagesPerRun: int
    crawlerAutoApproveConfidence: float
    enableRealtimeAlerts: bool
    defaultDistrict: str
    maintenanceMode: bool
    categories: List[str]
    districts: List[str]
