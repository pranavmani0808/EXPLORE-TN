export interface TNGeofenceResult {
  isValid: boolean;
  reason?: string;
}

export interface PlaceProvenance {
  source: "Official Tourism Board" | "Forest Department" | "Verified Local Field Guide" | "Community Submission";
  coordinatesVerified: boolean;
  imageVerified: boolean;
  accessVerified: boolean;
  seasonalNotesVerified: boolean;
  lastVerifiedAt: string;
  verifiedBy: string;
}

// TAMIL NADU WGS84 BOUNDING BOX
// Latitude: 8.0° N to 13.6° N
// Longitude: 76.0° E to 80.5° E
export const TN_WGS84_BOUNDS = {
  MIN_LAT: 8.0,
  MAX_LAT: 13.6,
  MIN_LNG: 76.0,
  MAX_LNG: 80.5,
};

export function validateTNCoordinates(lat: number, lng: number): TNGeofenceResult {
  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, reason: "Latitude and Longitude must be valid numerical WGS84 values." };
  }

  if (lat < TN_WGS84_BOUNDS.MIN_LAT || lat > TN_WGS84_BOUNDS.MAX_LAT) {
    return {
      isValid: false,
      reason: `Latitude ${lat}°N falls outside Tamil Nadu WGS84 bounds (${TN_WGS84_BOUNDS.MIN_LAT}°N - ${TN_WGS84_BOUNDS.MAX_LAT}°N).`,
    };
  }

  if (lng < TN_WGS84_BOUNDS.MIN_LNG || lng > TN_WGS84_BOUNDS.MAX_LNG) {
    return {
      isValid: false,
      reason: `Longitude ${lng}°E falls outside Tamil Nadu WGS84 bounds (${TN_WGS84_BOUNDS.MIN_LNG}°E - ${TN_WGS84_BOUNDS.MAX_LNG}°E).`,
    };
  }

  return { isValid: true };
}

// HAVERSINE DISTANCE CALCULATION (in kilometers)
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// SPATIAL DUPLICATE DETECTOR
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedName?: string;
  distanceKm?: number;
  reason?: string;
}

export function detectDuplicatePlace(
  newPlace: { name: string; lat: number; lng: number },
  existingPlaces: { name: string; coordinates?: [number, number]; lat?: number; lng?: number }[]
): DuplicateCheckResult {
  const normNewName = newPlace.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  for (const p of existingPlaces) {
    const pLat = p.coordinates ? p.coordinates[0] : p.lat || 0;
    const pLng = p.coordinates ? p.coordinates[1] : p.lng || 0;

    const dist = calculateHaversineDistance(newPlace.lat, newPlace.lng, pLat, pLng);
    const normExistingName = p.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

    // Check 1: Exact or near-identical name match within 5km radius
    if (normNewName === normExistingName && dist < 5.0) {
      return {
        isDuplicate: true,
        matchedName: p.name,
        distanceKm: dist,
        reason: `Identical place name "${p.name}" found ${dist} km away.`,
      };
    }

    // Check 2: Very close proximity (< 0.5km) regardless of slight name variations
    if (dist < 0.5) {
      return {
        isDuplicate: true,
        matchedName: p.name,
        distanceKm: dist,
        reason: `Extremely close existing place "${p.name}" found within ${dist} km.`,
      };
    }
  }

  return { isDuplicate: false };
}

// SELF-VERIFICATION RESTRICTION CHECKER
export function canUserVerifyEntity(
  userRole: "super_admin" | "place_manager" | "route_manager" | "community_manager" | "explorer",
  createdByUser: string,
  currentUser: string
): { allowed: boolean; reason?: string } {
  if (userRole === "super_admin") {
    return { allowed: true };
  }

  if (userRole === "place_manager" || userRole === "route_manager") {
    if (createdByUser.toLowerCase() === currentUser.toLowerCase()) {
      return {
        allowed: false,
        reason: "Self-verification disabled: Submissions require Super Admin or independent Verifier QA review.",
      };
    }
    return {
      allowed: false,
      reason: "Final verification and publication requires Super Admin privileges.",
    };
  }

  return { allowed: false, reason: "Insufficient platform role permissions." };
}

// DATA QUALITY SUITE TESTS (Internal Verification)
export function runDataQualityTestSuite(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  // Test 1: TN Bounds Valid
  const test1 = validateTNCoordinates(10.2381, 77.4892);
  if (test1.isValid) {
    passed++;
    results.push("PASS: Kodaikanal coordinates (10.2381°N, 77.4892°E) correctly validated within TN bounds.");
  } else {
    failed++;
    results.push(`FAIL: ${test1.reason}`);
  }

  // Test 2: Invalid Bounds Rejected
  const test2 = validateTNCoordinates(19.076, 72.8777); // Mumbai
  if (!test2.isValid) {
    passed++;
    results.push("PASS: Non-TN coordinates (Mumbai 19.076°N, 72.8777°E) correctly rejected.");
  } else {
    failed++;
    results.push("FAIL: Mumbai coordinates were incorrectly allowed inside TN bounds.");
  }

  // Test 3: Duplicate Detector
  const existing = [{ name: "Kolli Hills Viewpoint", coordinates: [11.2333, 78.3333] as [number, number] }];
  const dupCheck = detectDuplicatePlace({ name: "Kolli Hills Viewpoint", lat: 11.234, lng: 78.334 }, existing);
  if (dupCheck.isDuplicate) {
    passed++;
    results.push(`PASS: Duplicate place "${dupCheck.matchedName}" correctly detected (${dupCheck.distanceKm} km away).`);
  } else {
    failed++;
    results.push("FAIL: Duplicate place was not detected.");
  }

  // Test 4: Self-Verification Restriction
  const selfVerifyCheck = canUserVerifyEntity("place_manager", "Arun", "Arun");
  if (!selfVerifyCheck.allowed) {
    passed++;
    results.push("PASS: Self-verification restriction correctly enforced for Place Managers.");
  } else {
    failed++;
    results.push("FAIL: Self-verification was incorrectly allowed.");
  }

  return { passed, failed, results };
}
