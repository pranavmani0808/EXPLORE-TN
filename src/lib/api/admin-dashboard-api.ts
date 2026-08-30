export interface AdminDashboardMetrics {
  totalDestinations: number;
  totalAttractions: number;
  totalHotels: number;
  totalRestaurants: number;
  totalEvents: number;
  totalPackages: number;
  newCrawledItems: number;
  pendingApprovals: number;
  publishedContent: number;
  systemApiHealth: string;
  lastCrawlTimestamp: string;
  recentActivities: Array<{ action: string; time: string }>;
  crawlerStatus: {
    lastCrawl: string;
    urlsScanned: number;
    new: number;
    updated: number;
    duplicates: number;
    failed: number;
  };
}

export interface DestinationDetail {
  id: string;
  name: string;
  district: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  bestTimeToVisit: string;
  openingInfo: string;
  imageUrl: string;
  highlights: string[];
  activities: string[];
  nearbyAttractions: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface AttractionDetail {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  entryFee: string;
  contact: string;
  website: string;
  facilities: string[];
  imageUrl: string;
  status: 'Draft' | 'Published';
}

export interface HotelDetail {
  id: string;
  name: string;
  destinationName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  priceRange: string;
  amenities: string[];
  roomTypes: string[];
  imageUrl: string;
  rating: number;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  isFeatured: boolean;
  isPublished: boolean;
}

export interface RestaurantDetail {
  id: string;
  name: string;
  destinationName: string;
  cuisine: string;
  isVegetarian: boolean;
  priceRange: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  phone: string;
  website: string;
  menuUrl: string;
  imageUrl: string;
  amenities: string[];
  isFeatured: boolean;
  verificationStatus: string;
  isPublished: boolean;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  district: string;
  location: string;
  organizer: string;
  contact: string;
  ticketPrice: string;
  bookingUrl: string;
  imageUrl: string;
  category: string;
  isRecurring: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Draft';
  isPublished: boolean;
}

export interface CrawlerSource {
  id: string;
  name: string;
  url: string;
  category: string;
  isActive: boolean;
  lastCrawl: string;
}

export interface CrawlerJob {
  id: string;
  sourceName: string;
  urlsScanned: number;
  newItems: number;
  updatedItems: number;
  duplicates: number;
  failed: number;
  status: string;
  timestamp: string;
}

export interface CrawledDataDiff {
  id: string;
  crawledItem: Record<string, any>;
  existingItem?: Record<string, any>;
  diffStatus: 'NEW' | 'UPDATED' | 'DUPLICATE' | 'FAILED';
}

export interface AdminUserRole {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Content Editor' | 'Crawler Manager' | 'Moderator' | 'Analytics Viewer';
  permissions: string[];
  status: string;
  lastActive: string;
}

export interface AdminAnalytics {
  mostViewedDestinations: Array<{ name: string; views: number; district: string }>;
  popularDistractions: Array<{ name: string; views: number; category: string }>;
  popularDistricts: Array<{ district: string; searches: number }>;
  topSearchQueries: Array<{ query: string; count: number }>;
  dailyApiRequests: number;
  totalDataVolumeMb: number;
  crawlerStats: Record<string, number>;
}

export interface ContentCmsSection {
  id: string;
  sectionName: string;
  title: string;
  subtitle: string;
  isPublished: boolean;
  items: Array<Record<string, any>>;
}

export interface AdminSettings {
  siteTitle: string;
  crawlerMaxPagesPerRun: number;
  crawlerAutoApproveConfidence: number;
  enableRealtimeAlerts: boolean;
  defaultDistrict: string;
  maintenanceMode: boolean;
  categories: string[];
  districts: string[];
}

export class AdminDashboardApiRepository {
  private static baseUrl = '/api/v1/admin';

  static async getOverview(): Promise<AdminDashboardMetrics> {
    const res = await fetch(`${this.baseUrl}/dashboard/overview`);
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    const env = await res.json();
    return env.data;
  }

  static async getDestinations(): Promise<DestinationDetail[]> {
    const res = await fetch(`${this.baseUrl}/destinations`);
    if (!res.ok) throw new Error('Failed to fetch destinations');
    const env = await res.json();
    return env.data;
  }

  static async createDestination(payload: DestinationDetail): Promise<DestinationDetail> {
    const res = await fetch(`${this.baseUrl}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create destination');
    const env = await res.json();
    return env.data;
  }

  static async getAttractions(category?: string): Promise<AttractionDetail[]> {
    const url = category ? `${this.baseUrl}/attractions?category=${encodeURIComponent(category)}` : `${this.baseUrl}/attractions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch attractions');
    const env = await res.json();
    return env.data;
  }

  static async getHotels(): Promise<HotelDetail[]> {
    const res = await fetch(`${this.baseUrl}/hotels`);
    if (!res.ok) throw new Error('Failed to fetch hotels');
    const env = await res.json();
    return env.data;
  }

  static async getRestaurants(): Promise<RestaurantDetail[]> {
    const res = await fetch(`${this.baseUrl}/restaurants`);
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    const env = await res.json();
    return env.data;
  }

  static async getEvents(status?: string): Promise<EventDetail[]> {
    const url = status ? `${this.baseUrl}/events?status=${encodeURIComponent(status)}` : `${this.baseUrl}/events`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch events');
    const env = await res.json();
    return env.data;
  }

  static async getCrawlerSources(): Promise<CrawlerSource[]> {
    const res = await fetch(`${this.baseUrl}/crawler/sources`);
    if (!res.ok) throw new Error('Failed to fetch crawler sources');
    const env = await res.json();
    return env.data;
  }

  static async getCrawlerJobs(): Promise<CrawlerJob[]> {
    const res = await fetch(`${this.baseUrl}/crawler/jobs`);
    if (!res.ok) throw new Error('Failed to fetch crawler jobs');
    const env = await res.json();
    return env.data;
  }

  static async getCrawlerDiffs(): Promise<CrawledDataDiff[]> {
    const res = await fetch(`${this.baseUrl}/crawler/diffs`);
    if (!res.ok) throw new Error('Failed to fetch crawler diffs');
    const env = await res.json();
    return env.data;
  }

  static async approveDiff(diffId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/crawler/diffs/${diffId}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to approve diff');
    const env = await res.json();
    return env.data;
  }

  static async rejectDiff(diffId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/crawler/diffs/${diffId}/reject`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reject diff');
    const env = await res.json();
    return env.data;
  }

  static async getUsers(): Promise<AdminUserRole[]> {
    const res = await fetch(`${this.baseUrl}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const env = await res.json();
    return env.data;
  }

  static async getAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${this.baseUrl}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const env = await res.json();
    return env.data;
  }

  static async getCmsSections(): Promise<ContentCmsSection[]> {
    const res = await fetch(`${this.baseUrl}/cms/sections`);
    if (!res.ok) throw new Error('Failed to fetch CMS sections');
    const env = await res.json();
    return env.data;
  }

  static async getSettings(): Promise<AdminSettings> {
    const res = await fetch(`${this.baseUrl}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const env = await res.json();
    return env.data;
  }

  static async addCategory(categoryName: string): Promise<AdminSettings> {
    const res = await fetch(`${this.baseUrl}/settings/categories?category_name=${encodeURIComponent(categoryName)}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to add category');
    const env = await res.json();
    return env.data;
  }
}
