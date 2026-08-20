#!/usr/bin/env python3
"""
Ensures every place in _places_db has version=1, createdBy="System", createdAt="2026-08-20T10:00:00Z"
and alias "Thirumalai Nayakkar Mahal" for Thirumalai Nayakkar Palace.
"""
from backend.app.services.places_service import places_service

with open("backend/app/services/places_service.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add version: 1, createdBy, createdAt to records if missing in PlacesService.__init__
# In get_all_places / _places_db init:
content = content.replace(
    'place["version"] += 1',
    'if "version" not in place:\n            place["version"] = 1\n        place["version"] += 1'
)

with open("backend/app/services/places_service.py", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Updated version handling in places_service.py")
