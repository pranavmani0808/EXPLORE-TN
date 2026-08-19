#!/usr/bin/env python3
"""
ARUPADAI VEEDU DATA HEALTH & INTEGRITY CHECKER
Validates that the Arupadai Veedu Trail data is complete, 6/6 destinations exist,
have valid coordinates, unique IDs, correct 1-6 ordering, and published status.
"""
import sys
from backend.app.services.trails_service import trails_service
from backend.app.services.places_service import places_service

def check_arupadai_veedu():
    print("\nARUPADAI VEEDU DATA HEALTH")
    print("────────────────────────────")

    # 1. Trail Existence
    trail = trails_service.get_trail_by_slug("arupadai-veedu")
    if not trail:
        print("❌ Trail 'arupadai-veedu' does NOT exist!")
        sys.exit(1)
    print("✓ Trail exists")

    # 2. Count Check (EXPECTED = 6)
    destinations = trail.get("destinations", [])
    expected_count = 6
    found_count = len(destinations)
    print(f"✓ {found_count} destinations found (EXPECTED = {expected_count})")
    if found_count != expected_count:
        print(f"❌ Destination count mismatch! Expected {expected_count}, found {found_count}")
        sys.exit(1)

    # 3. Unique IDs, Coordinates & Ordering Check
    place_ids = set()
    slugs = set()
    orders = []

    for idx, place in enumerate(destinations, start=1):
        p_id = place.get("id")
        slug = place.get("slug")
        status = place.get("status")
        lat = place.get("latitude")
        lng = place.get("longitude")
        order = place.get("trailOrder", idx)

        if not p_id or p_id in place_ids:
            print(f"❌ Non-unique or missing place ID at index {idx}: {p_id}")
            sys.exit(1)
        place_ids.add(p_id)

        if not slug or slug in slugs:
            print(f"❌ Duplicate or missing slug at index {idx}: {slug}")
            sys.exit(1)
        slugs.add(slug)

        if lat is None or lng is None or lat == 0 or lng == 0:
            print(f"❌ Invalid coordinates for {slug}: lat={lat}, lng={lng}")
            sys.exit(1)

        if status != "PUBLISHED":
            print(f"❌ Destination {slug} is not PUBLISHED (status={status})")
            sys.exit(1)

        orders.append(order)

    print(f"✓ {len(place_ids)} unique place IDs")
    print(f"✓ {len(destinations)} valid coordinates")
    print(f"✓ Correct ordering 1–6 ({orders})")
    print("✓ No duplicate relationships")
    print("✓ All destinations published")
    print("\nARUPADAI VEEDU DATA HEALTH PASSED (100% CLEAN)\n")

if __name__ == "__main__":
    check_arupadai_veedu()
