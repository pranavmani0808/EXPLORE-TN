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
    systemApiHealth: str
    lastCrawlTimestamp: str

class CrawledDataRecordDTO(BaseModel):
    id: str
    sourceUrl: str
    domain: str
    title: str
    extractedType: str  # destination, attraction, hotel, restaurant, event
    district: str
    rawPayload: Dict[str, Any]
    status: str  # PENDING_REVIEW, APPROVED, REJECTED, FAILED
    crawlTime: str
    errorMessage: Optional[str] = None

class AdminEventDTO(BaseModel):
    id: str
    title: str
    category: str
    district: str
    startDate: str
    endDate: str
    location: str
    organizer: str
    isPublished: bool
    imageUrl: Optional[str] = None

class AdminHotelListingDTO(BaseModel):
    id: str
    name: str
    district: str
    category: str
    contactPhone: str
    website: str
    rating: float
    verificationStatus: str  # VERIFIED, PENDING, UNVERIFIED

class AdminUserRoleDTO(BaseModel):
    id: str
    email: str
    name: str
    role: str  # Super Admin, Editor, Crawler Manager
    permissions: List[str]
    lastActive: str

class AdminAnalyticsDTO(BaseModel):
    mostViewedDestinations: List[Dict[str, Any]]
    popularDistricts: List[Dict[str, Any]]
    topSearchQueries: List[Dict[str, Any]]
    dailyApiRequests: int
    totalDataVolumeMb: float

class AdminSettingsDTO(BaseModel):
    siteTitle: str
    crawlerMaxPagesPerRun: int
    crawlerAutoApproveConfidence: float
    enableRealtimeAlerts: bool
    defaultDistrict: str
    maintenanceMode: bool
