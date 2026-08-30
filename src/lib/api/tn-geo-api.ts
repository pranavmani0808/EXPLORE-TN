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
    const res = await fetch(`${this.baseUrl}/districts`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    const env = await res.json();
    return env.data;
  }

  static async getChildren(nodeId: string): Promise<TNGeoNode[]> {
    const res = await fetch(`${this.baseUrl}/nodes/${encodeURIComponent(nodeId)}/children`);
    if (!res.ok) throw new Error('Failed to fetch child administrative nodes');
    const env = await res.json();
    return env.data;
  }

  static async searchGeo(query: string): Promise<TNGeoSearchResult> {
    const res = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search geographic directory');
    const env = await res.json();
    return env.data;
  }

  static async getAreaDetail(areaId: string): Promise<TNGeoAreaDetail> {
    const res = await fetch(`${this.baseUrl}/area/${encodeURIComponent(areaId)}`);
    if (!res.ok) throw new Error('Failed to fetch area details');
    const env = await res.json();
    return env.data;
  }
}
