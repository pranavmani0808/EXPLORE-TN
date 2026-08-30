export interface AdminDashboardMetrics {
  totalDestinations: number;
  totalAttractions: number;
  totalHotels: number;
  totalRestaurants: number;
  totalEvents: number;
  totalPackages: number;
  newCrawledItems: number;
  pendingApprovals: number;
  systemApiHealth: string;
  lastCrawlTimestamp: string;
}

export interface CrawledDataRecord {
  id: string;
  sourceUrl: string;
  domain: string;
  title: string;
  extractedType: string;
  district: string;
  rawPayload: Record<string, any>;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED';
  crawlTime: string;
  errorMessage?: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  category: string;
  district: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  isPublished: boolean;
  imageUrl?: string;
}

export interface AdminHotelListing {
  id: string;
  name: string;
  district: string;
  category: string;
  contactPhone: string;
  website: string;
  rating: number;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
}

export interface AdminUserRole {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Editor' | 'Crawler Manager';
  permissions: string[];
  lastActive: string;
}

export interface AdminAnalytics {
  mostViewedDestinations: Array<{ name: string; views: number; district: string }>;
  popularDistricts: Array<{ district: string; searches: number }>;
  topSearchQueries: Array<{ query: string; count: number }>;
  dailyApiRequests: number;
  totalDataVolumeMb: number;
}

export interface AdminSettings {
  siteTitle: string;
  crawlerMaxPagesPerRun: number;
  crawlerAutoApproveConfidence: number;
  enableRealtimeAlerts: boolean;
  defaultDistrict: string;
  maintenanceMode: boolean;
}

export class AdminDashboardApiRepository {
  private static baseUrl = '/api/v1/admin';

  static async getOverview(): Promise<AdminDashboardMetrics> {
    const res = await fetch(`${this.baseUrl}/dashboard/overview`);
    if (!res.ok) throw new Error('Failed to fetch admin dashboard overview');
    const env = await res.json();
    return env.data;
  }

  static async getCrawledRecords(status?: string): Promise<CrawledDataRecord[]> {
    const url = status ? `${this.baseUrl}/crawler/records?status=${encodeURIComponent(status)}` : `${this.baseUrl}/crawler/records`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch crawler records');
    const env = await res.json();
    return env.data;
  }

  static async approveCrawledRecord(id: string): Promise<CrawledDataRecord> {
    const res = await fetch(`${this.baseUrl}/crawler/approve/${id}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to approve record ${id}`);
    const env = await res.json();
    return env.data;
  }

  static async rejectCrawledRecord(id: string, reason?: string): Promise<CrawledDataRecord> {
    const url = reason ? `${this.baseUrl}/crawler/reject/${id}?reason=${encodeURIComponent(reason)}` : `${this.baseUrl}/crawler/reject/${id}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to reject record ${id}`);
    const env = await res.json();
    return env.data;
  }

  static async syncCrawlerProduction(): Promise<{ syncedCount: number; status: string; timestamp: string }> {
    const res = await fetch(`${this.baseUrl}/crawler/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync crawler records to production');
    const env = await res.json();
    return env.data;
  }

  static async getEvents(): Promise<AdminEvent[]> {
    const res = await fetch(`${this.baseUrl}/events`);
    if (!res.ok) throw new Error('Failed to fetch admin events');
    const env = await res.json();
    return env.data;
  }

  static async getHotels(): Promise<AdminHotelListing[]> {
    const res = await fetch(`${this.baseUrl}/hotels`);
    if (!res.ok) throw new Error('Failed to fetch admin hotels');
    const env = await res.json();
    return env.data;
  }

  static async getUsers(): Promise<AdminUserRole[]> {
    const res = await fetch(`${this.baseUrl}/users`);
    if (!res.ok) throw new Error('Failed to fetch admin users');
    const env = await res.json();
    return env.data;
  }

  static async getAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${this.baseUrl}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch admin analytics');
    const env = await res.json();
    return env.data;
  }

  static async getSettings(): Promise<AdminSettings> {
    const res = await fetch(`${this.baseUrl}/settings`);
    if (!res.ok) throw new Error('Failed to fetch admin settings');
    const env = await res.json();
    return env.data;
  }
}
