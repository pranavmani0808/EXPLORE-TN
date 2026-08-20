import math
from typing import List, Dict, Any, Tuple, Optional
from backend.app.services.places_service import calculate_haversine

CATEGORY_VISIT_DURATIONS: Dict[str, int] = {
    "temple": 90,
    "heritage": 100,
    "waterfall": 75,
    "mountain": 60,
    "viewpoint": 45,
    "food": 45,
    "beach": 90,
    "wildlife": 120,
    "dam": 45,
    "coastal": 60,
}

def parse_time_to_minutes(time_str: str) -> int:
    """Parses '06:00 AM' or '18:30' into minutes from midnight."""
    t_clean = time_str.strip().upper()
    is_pm = "PM" in t_clean
    is_am = "AM" in t_clean
    t_clean = t_clean.replace("AM", "").replace("PM", "").strip()
    
    parts = t_clean.split(":")
    hours = int(parts[0]) if len(parts) > 0 and parts[0] else 6
    mins = int(parts[1]) if len(parts) > 1 and parts[1] else 0

    if is_pm and hours < 12:
        hours += 12
    elif is_am and hours == 12:
        hours = 0

    return hours * 60 + mins

def format_minutes_to_time(total_mins: int) -> str:
    """Formats minutes from midnight to '08:30 AM'."""
    mins_in_day = total_mins % 1440
    hours = mins_in_day // 60
    mins = mins_in_day % 60
    period = "AM" if hours < 12 else "PM"
    display_hours = hours if 1 <= hours <= 12 else (hours - 12 if hours > 12 else 12)
    return f"{display_hours:02d}:{mins:02d} {period}"

class ItineraryOptimizer:
    def __init__(self):
        pass

    def optimize_itinerary(
        self,
        origin_lat: float,
        origin_lng: float,
        places: List[dict],
        departure_time_str: str = "06:00 AM",
        speed_kmh: float = 40.0
    ) -> Tuple[List[dict], List[dict], List[str]]:
        """
        Optimizes place sequence to minimize travel time & detour distance.
        Formats exact time slots and generates feasibility warnings for night visits.
        """
        if not places:
            return [], [], []

        # Nearest-neighbor TSP ordering starting from origin
        remaining = list(places)
        ordered_places: List[dict] = []
        curr_lat = origin_lat
        curr_lng = origin_lng

        while remaining:
            best_idx = 0
            best_dist = float("inf")
            for idx, p in enumerate(remaining):
                dist = calculate_haversine(curr_lat, curr_lng, p["latitude"], p["longitude"])
                if dist < best_dist:
                    best_dist = dist
                    best_idx = idx
            
            chosen = remaining.pop(best_idx)
            ordered_places.append(chosen)
            curr_lat = chosen["latitude"]
            curr_lng = chosen["longitude"]

        # Build time-aware timeline schedule
        timeline: List[dict] = []
        warnings: List[str] = []
        current_mins = parse_time_to_minutes(departure_time_str)

        # Origin start node
        timeline.append({
            "time": format_minutes_to_time(current_mins),
            "name": "Departure from Origin",
            "description": f"Departing towards first destination stop.",
            "type": "START"
        })

        curr_lat = origin_lat
        curr_lng = origin_lng

        for idx, p in enumerate(ordered_places):
            dist_km = calculate_haversine(curr_lat, curr_lng, p["latitude"], p["longitude"])
            travel_mins = int(round((dist_km / speed_kmh) * 60))
            current_mins += travel_mins

            arrival_time_str = format_minutes_to_time(current_mins)
            category = p.get("category", "sightseeing")
            duration_mins = CATEGORY_VISIT_DURATIONS.get(category, 60)

            # Check night/closure advisories
            arrival_hour = (current_mins // 60) % 24
            if category in ["temple", "heritage"] and (arrival_hour >= 21 or arrival_hour < 5):
                warnings.append(f"Notice: {p['name']} arrives at {arrival_time_str}. Temple sanctum/sanctuary doors may be closed at night.")
            elif category == "waterfall" and (arrival_hour >= 18 or arrival_hour < 6):
                warnings.append(f"Safety Warning: {p['name']} arrives at {arrival_time_str} after dusk. Forest department entry prohibited.")

            timeline.append({
                "time": arrival_time_str,
                "name": p["name"],
                "description": f"{p.get('tagline', p.get('description', ''))} ({dist_km} km drive from previous stop, ~{duration_mins} mins visit).",
                "type": "PLACE",
                "placeId": p.get("id"),
                "slug": p.get("slug"),
                "latitude": p["latitude"],
                "longitude": p["longitude"]
            })

            current_mins += duration_mins
            curr_lat = p["latitude"]
            curr_lng = p["longitude"]

        return ordered_places, timeline, warnings

itinerary_optimizer = ItineraryOptimizer()
