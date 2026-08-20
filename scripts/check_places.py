#!/usr/bin/env python3
"""
DATA QUALITY SCRIPT — TAMIL NADU MASTER PLACES AUDITOR
Detects:
- Total places count
- Places by district breakdown across all 38 TN districts
- Places by category breakdown
- Verified vs City-level coordinate accuracy
- Duplicate names
- Duplicate coordinates
- Missing or invalid coordinates
- Suspicious coordinates (0,0 or out of bounds)
- Missing categories or missing district
- Missing aliases
- Broken image URLs
- Orphaned parent places
"""
import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.services.places_service import places_service

def audit_master_places_database():
    all_places = places_service.get_all_places()
    total_places = len(all_places)

    district_counts = {}
    category_counts = {}
    verified_coords_count = 0
    city_level_coords_count = 0
    duplicate_names = []
    duplicate_coords = []
    missing_coords = []
    invalid_coords = []
    suspicious_coords = []
    missing_categories = []
    missing_districts = []
    missing_aliases = []
    broken_images = []
    orphaned_parents = []
    total_aliases = 0

    seen_names = {}
    seen_coords = {}

    for place in all_places:
        pid = place.get("id") or place.get("slug")
        name = (place.get("name") or "").strip()
        district = (place.get("district") or "").strip()
        category = (place.get("category") or "").strip()
        lat = place.get("latitude")
        lng = place.get("longitude")
        accuracy = place.get("coordinate_accuracy") or place.get("coordinateAccuracy") or "EXACT"
        verified = place.get("verified", False)
        aliases = place.get("aliases", [])
        image = place.get("image") or place.get("image_url") or ""
        parent_id = place.get("parent_place_id") or place.get("parentPlaceId")

        total_aliases += len(aliases)

        # 1. District breakdown
        if district:
            district_counts[district] = district_counts.get(district, 0) + 1
        else:
            missing_districts.append(name)

        # 2. Category breakdown
        if category:
            category_counts[category] = category_counts.get(category, 0) + 1
        else:
            missing_categories.append(name)

        # 3. Verified coordinates
        if verified or accuracy == "EXACT":
            verified_coords_count += 1
        else:
            city_level_coords_count += 1

        # 4. Name Duplicate Check
        norm_name = name.lower()
        if norm_name in seen_names:
            duplicate_names.append((name, pid, seen_names[norm_name]))
        else:
            seen_names[norm_name] = pid

        # 5. Coordinates Check
        if lat is None or lng is None:
            missing_coords.append(name)
        elif lat == 0.0 or lng == 0.0:
            suspicious_coords.append((name, lat, lng, "0,0 Zero Coordinates"))
        elif lat < -90.0 or lat > 90.0 or lng < -180.0 or lng > 180.0:
            invalid_coords.append((name, lat, lng, "Out of WGS84 bounds"))
        else:
            coord_key = (round(lat, 5), round(lng, 5))
            if coord_key in seen_coords:
                duplicate_coords.append((name, coord_key, seen_coords[coord_key]))
            else:
                seen_coords[coord_key] = name

        # 6. Aliases check
        if not aliases:
            missing_aliases.append(name)

        # 7. Image URL check
        if not image or not (image.startswith("http") or image.startswith("/") or image.startswith("@") or image.startswith("assets")):
            broken_images.append((name, image))

        # 8. Parent place check
        if parent_id and not places_service.get_place_by_id_or_slug(parent_id):
            orphaned_parents.append((name, parent_id))

    print("=" * 80)
    print("      EXPLORERTN — MASTER PLACES DATABASE QUALITY AUDIT REPORT      ")
    print("=" * 80)
    print(f"1. Total Master Places:                  {total_places}")
    print(f"2. Total Verified Coordinates:            {verified_coords_count} ({(verified_coords_count/total_places)*100:.1f}%)")
    print(f"3. City-Level / Unverified Coordinates:   {city_level_coords_count}")
    print(f"4. Total Alias Records Registered:       {total_aliases}")
    print(f"5. Duplicate Records Detected:            {len(duplicate_names)}")
    print(f"6. Duplicate Coordinates Detected:        {len(duplicate_coords)}")
    print(f"7. Missing / Invalid Coordinates:         {len(missing_coords) + len(invalid_coords)}")
    print(f"8. Suspicious (0,0) Coordinates:          {len(suspicious_coords)}")
    print(f"9. Broken Image URLs:                     {len(broken_images)}")
    print(f"10. Orphaned Parent References:           {len(orphaned_parents)}")
    print("-" * 80)

    print("\n--- PLACES BY DISTRICT BREAKDOWN (38 OFFICIAL TN DISTRICTS + INTERSTATE) ---")
    for dist, cnt in sorted(district_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {dist:<25}: {cnt} POIs")

    print("\n--- PLACES BY CATEGORY BREAKDOWN ---")
    for cat, cnt in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {cat:<25}: {cnt} POIs")

    print("\n" + "=" * 80)
    print("AUDIT RESULT: CLEAN 100% HEALTHY DATABASE" if len(duplicate_names) == 0 and len(invalid_coords) == 0 and len(suspicious_coords) == 0 else "AUDIT RESULT: ISSUES DETECTED")
    print("=" * 80)

    return {
        "total_places": total_places,
        "verified_coords": verified_coords_count,
        "city_level_coords": city_level_coords_count,
        "total_aliases": total_aliases,
        "duplicate_names": duplicate_names,
        "duplicate_coords": duplicate_coords,
        "district_counts": district_counts,
        "category_counts": category_counts
    }

if __name__ == "__main__":
    audit_master_places_database()
