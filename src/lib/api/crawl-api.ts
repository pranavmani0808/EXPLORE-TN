export interface CrawlJobResponse {
  jobId: string;
  status: string;
  targetUrl: string;
  domain: string;
  urlsCrawled?: number;
  createdAt: string;
}

export interface CrawledUrl {
  url: string;
  title: string;
  statusCode: number;
  metaDescription?: string;
  crawledAt: string;
}

import { getApiBaseUrl } from "@/lib/api-client/config";

export class CrawlApiRepository {
  private static get baseUrl(): string {
    return `${getApiBaseUrl()}/api/v1/crawl`;
  }

  static async getHealth(): Promise<{ status: string; provider: string; apiBaseUrl: string; connected: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) throw new Error('Crawl API health check failed');
      const envelope = await res.json();
      return envelope.data;
    } catch (err) {
      return {
        status: 'Degraded',
        provider: 'WEB_CRAWL-main Engine',
        apiBaseUrl: 'http://localhost:8000/api',
        connected: false
      };
    }
  }

  static async triggerCrawl(url: string, maxPages: number = 50): Promise<CrawlJobResponse> {
    const res = await fetch(`${this.baseUrl}/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, maxPages })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to trigger web crawl job');
    }
    const envelope = await res.json();
    return envelope.data;
  }

  static async getJobStatus(jobId: string): Promise<CrawlJobResponse> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    if (!res.ok) throw new Error(`Failed to fetch crawl job status for ${jobId}`);
    const envelope = await res.json();
    return envelope.data;
  }

  static async getCrawledUrls(jobId: string): Promise<CrawledUrl[]> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}/urls`);
    if (!res.ok) throw new Error(`Failed to fetch crawled URLs for ${jobId}`);
    const envelope = await res.json();
    return envelope.data;
  }
}
