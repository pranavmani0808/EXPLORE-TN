import { describe, it, expect } from "bun:test";
import { getPlacesWithinRadius, getPlacesInBand, haversineKm } from "@/lib/geo-radius";
import { CANONICAL_PLACES } from "@/lib/data/canonical-places";

describe("Geospatial Radius Queries (geo-radius)", () => {
  const chennaiCoords = { lat: 13.0827, lng: 80.2707 };

  it("calculates haversine distance correctly between known points", () => {
    // Chennai (13.0827, 80.2707) to Madurai (9.9252, 78.1198) is ~420km
    const distance = haversineKm(13.0827, 80.2707, 9.9252, 78.1198);
    expect(distance).toBeGreaterThan(410);
    expect(distance).toBeLessThan(430);
  });

  describe("getPlacesWithinRadius", () => {
    it("returns places within radius sorted by distance ascending", () => {
      const radiusKm = 50;
      const results = getPlacesWithinRadius(chennaiCoords.lat, chennaiCoords.lng, radiusKm);

      expect(results.length).toBeGreaterThan(0);
      for (let i = 0; i < results.length; i++) {
        expect(results[i].distanceKm).toBeGreaterThan(0.5);
        expect(results[i].distanceKm).toBeLessThanOrEqual(radiusKm);
        if (i > 0) {
          expect(results[i].distanceKm).toBeGreaterThanOrEqual(results[i - 1].distanceKm);
        }
      }
    });

    it("excludes origin location and explicit excludeIds with array and Set", () => {
      const allNearChennai = getPlacesWithinRadius(chennaiCoords.lat, chennaiCoords.lng, 50);
      const targetId = allNearChennai[0].id;

      // With array
      const excludedWithArray = getPlacesWithinRadius(
        chennaiCoords.lat,
        chennaiCoords.lng,
        50,
        undefined,
        [targetId],
      );
      expect(excludedWithArray.find((p) => p.id === targetId)).toBeUndefined();
      expect(excludedWithArray.length).toBe(allNearChennai.length - 1);

      // With Set
      const excludedWithSet = getPlacesWithinRadius(
        chennaiCoords.lat,
        chennaiCoords.lng,
        50,
        undefined,
        new Set([targetId]),
      );
      expect(excludedWithSet.find((p) => p.id === targetId)).toBeUndefined();
      expect(excludedWithSet.length).toBe(allNearChennai.length - 1);
    });

    it("filters accurately by category or secondary categories", () => {
      const coastalPlaces = getPlacesWithinRadius(
        chennaiCoords.lat,
        chennaiCoords.lng,
        50,
        "coastal",
      );
      expect(coastalPlaces.length).toBeGreaterThan(0);
      for (const place of coastalPlaces) {
        const matchesPrimary = place.primaryCategory === "coastal";
        const matchesSecondary = place.categories?.includes("coastal");
        expect(matchesPrimary || matchesSecondary).toBe(true);
      }
    });
  });

  describe("getPlacesInBand", () => {
    it("returns places strictly within the minKm and maxKm band", () => {
      const minKm = 50;
      const maxKm = 100;
      const results = getPlacesInBand(chennaiCoords.lat, chennaiCoords.lng, minKm, maxKm);

      expect(results.length).toBeGreaterThan(0);
      for (const place of results) {
        expect(place.distanceKm).toBeGreaterThan(minKm);
        expect(place.distanceKm).toBeLessThanOrEqual(maxKm);
      }
    });

    it("matches exact results of full-scan reference computation", () => {
      // Golden / reference calculation without bbox pruning to verify 100% mathematical parity
      const minKm = 20;
      const maxKm = 80;
      const exclude = ["p-marina-beach"];

      const expected = CANONICAL_PLACES.filter((p) => {
        if (exclude.includes(p.id)) return false;
        const d = haversineKm(chennaiCoords.lat, chennaiCoords.lng, p.latitude, p.longitude);
        return d > minKm && d <= maxKm;
      })
        .map((p) => {
          const distanceKm =
            Math.round(
              haversineKm(chennaiCoords.lat, chennaiCoords.lng, p.latitude, p.longitude) * 10,
            ) / 10;
          return { id: p.id, distanceKm };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);

      const actual = getPlacesInBand(
        chennaiCoords.lat,
        chennaiCoords.lng,
        minKm,
        maxKm,
        undefined,
        exclude,
      );

      expect(actual.length).toBe(expected.length);
      for (let i = 0; i < actual.length; i++) {
        expect(actual[i].id).toBe(expected[i].id);
        expect(actual[i].distanceKm).toBe(expected[i].distanceKm);
      }
    });
  });
});
