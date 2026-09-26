export interface TNGeoNode {
  id: str;
  nameEn: str;
  nameTa: str;
  level: 'DISTRICT' | 'CORPORATION' | 'MUNICIPALITY' | 'TOWN_PANCHAYAT' | 'BLOCK' | 'VILLAGE_PANCHAYAT' | 'HABITATION';
  adminType: 'STATE' | 'DISTRICT' | 'URBAN' | 'RURAL';
  parentId?: string;
  districtId: string;
  districtName: string;
  latitude: number;
  longitude: number;
  lgdCode: string;
  placesCount: number;
  attractionsCount: number;
  hotelsCount: number;
  restaurantsCount: number;
  eventsCount: number;
}

export interface TNGeoSearchResult {
  query: string;
  totalMatches: number;
  nodes: TNGeoNode[];
}

export interface TNGeoAreaDetail {
  node: TNGeoNode;
  parentHierarchy: Array<{ id: string; name: string; level: string }>;
  tourismStats: {
    destinations: number;
    attractions: number;
    hotels: number;
    restaurants: number;
    events: number;
    dataAvailability: string;
  };
}

import { getApiBaseUrl } from "@/lib/api-client/config";

export class TNGeoApiRepository {
  private static get baseUrl(): string {
    return `${getApiBaseUrl()}/api/v1/geo`;
  }

  static async getDistricts(): Promise<TNGeoNode[]> {
    try {
      const res = await fetch(`${this.baseUrl}/districts`);
      if (!res.ok) return [];
      const env = await res.json();
      return env.data || [];
    } catch {
      return [];
    }
  }

  static async getChildren(nodeId: string): Promise<TNGeoNode[]> {
    try {
      const res = await fetch(`${this.baseUrl}/nodes/${encodeURIComponent(nodeId)}/children`);
      if (!res.ok) return [];
      const env = await res.json();
      return env.data || [];
    } catch {
      return [];
    }
  }

  static async searchGeo(query: string): Promise<TNGeoSearchResult> {
    try {
      const res = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { query, totalMatches: 0, nodes: [] };
      const env = await res.json();
      return env.data || { query, totalMatches: 0, nodes: [] };
    } catch {
      return { query, totalMatches: 0, nodes: [] };
    }
  }

  static async getAreaDetail(areaId: string): Promise<TNGeoAreaDetail | null> {
    try {
      const res = await fetch(`${this.baseUrl}/area/${encodeURIComponent(areaId)}`);
      if (!res.ok) return null;
      const env = await res.json();
      return env.data || null;
    } catch {
      return null;
    }
  }
}
