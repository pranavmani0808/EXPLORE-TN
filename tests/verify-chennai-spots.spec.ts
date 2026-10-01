import { test, expect } from '@playwright/test';
import { KNOWN_DESTINATIONS } from '../src/lib/data/canonical-places';
import { resolveDestination } from '../src/lib/planner-engine/destination-resolver';

test.describe('Chennai New Spots Database & Resolution Verification', () => {
  const newlyAddedSlugs = [
    'knk-road',
    'phoenix-marketcity-velachery',
    'breakthru-college-road',
    'madras-international-karting-arena',
    'sriperumbudur',
    'vgp-snow-kingdom',
    'glow-garden-mahabalipuram',
    'the-beach-terrace-ecr',
    'go-xtreme-adventures',
    'eco-park-chetpet'
  ];

  test('All 10 newly requested Chennai spots exist in KNOWN_DESTINATIONS with valid data', () => {
    for (const slug of newlyAddedSlugs) {
      const place = KNOWN_DESTINATIONS[slug];
      expect(place).toBeDefined();
      expect(place.name).toBeTruthy();
      expect(place.canonicalName).toBeTruthy();
      expect(place.description.length).toBeGreaterThan(30);
      expect(place.latitude).toBeGreaterThan(12.0);
      expect(place.latitude).toBeLessThan(14.0);
      expect(place.longitude).toBeGreaterThan(79.5);
      expect(place.longitude).toBeLessThan(81.0);
      expect(place.verified).toBe(true);

      // Verify operating hours / timing are present for mall/activity/entertainment spots
      if (['phoenix-marketcity-velachery', 'breakthru-college-road', 'madras-international-karting-arena', 'vgp-snow-kingdom', 'glow-garden-mahabalipuram', 'the-beach-terrace-ecr', 'go-xtreme-adventures', 'eco-park-chetpet'].includes(slug)) {
        expect(place.metadata.bestTime).toBeTruthy();
        expect(place.metadata.duration).toBeTruthy();
      }
    }
  });

  test('Destination resolver correctly maps user queries to canonical places', () => {
    const testQueries = [
      { query: 'knk road', expectedName: 'Khader Nawaz Khan Road (KNK Road)' },
      { query: 'phoenix marketcity velachery', expectedName: 'Phoenix Marketcity Velachery' },
      { query: 'breakthru college road', expectedName: 'Breakthru - The Real Escape Room (College Road)' },
      { query: 'madras international karting arena', expectedName: 'Madras International Karting Arena (MIKA)' },
      { query: 'sriperumbudur', expectedName: 'Sriperumbudur (Heritage, Temples & Industrial Hub)' },
      { query: 'vgp snowkingdom. ecr', expectedName: 'VGP Snow Kingdom (East Coast Road)' },
      { query: 'glow garden mahabalipuram', expectedName: 'Mahab\'s Glow Garden (Mahabalipuram)' },
      { query: 'the beach terrace ecr', expectedName: 'The Beach Terrace (ECR Oceanfront Santorini Resto-Bar)' },
      { query: 'go xtreme adventures sholinganallur', expectedName: 'Go Xtreme Paintball & Adventure Zone (Sholinganallur / Uthandi ECR)' },
      { query: 'eco-park chetpet', expectedName: 'Chetpet Eco-Park & Sport Fishing Lake' }
    ];

    for (const item of testQueries) {
      const result = resolveDestination(item.query);
      expect(result.success).toBe(true);
      expect(result.destination?.displayName).toBe(item.expectedName);
    }
  });
});
