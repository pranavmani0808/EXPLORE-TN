#!/usr/bin/env python3
"""
APPLY MASTER POI DATABASE TO PLACES_SERVICE.PY
"""
import re
from backend.scripts.generate_master_database import DISTRICT_POIS

with open("backend/app/services/places_service.py", "r", encoding="utf-8") as f:
    content = f.read()

# Generate python code dicts for DISTRICT_POIS
poi_entries = []
for p in DISTRICT_POIS:
    slug = p["slug"]
    entry_str = f'            "{slug}": ' + repr(p)
    poi_entries.append(entry_str)

formatted_pois = ",\n".join(poi_entries)

# Insert after self._places_db: Dict[str, dict] = {
target_str = "        self._places_db: Dict[str, dict] = {"
if target_str in content:
    new_content = content.replace(
        target_str,
        target_str + "\n" + formatted_pois + ",\n"
    )
    with open("backend/app/services/places_service.py", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✓ Successfully merged district POIs into places_service.py")
else:
    print("❌ target string not found")
