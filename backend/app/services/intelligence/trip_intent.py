import re
from typing import List, Optional
from pydantic import BaseModel, Field

class StructuredTripIntent(BaseModel):
    origin: Optional[str] = Field(default=None, description="Trip starting location")
    destination: Optional[str] = Field(default=None, description="Requested target destination")
    waypoints: List[str] = Field(default_factory=list, description="Intermediate stops requested via/through")
    transport: str = Field(default="motorcycle", description="Transport mode: motorcycle, car, bus")
    tripType: str = Field(default="round_trip", description="round_trip or one_way")
    durationDays: int = Field(default=1, description="Requested duration in days")
    budget: Optional[float] = Field(default=None, description="Budget in INR")
    interests: List[str] = Field(default_factory=list, description="Extracted interest tags")

class IntentExtractor:
    @staticmethod
    def extract_intent(text: str, current_state: Optional[dict] = None) -> StructuredTripIntent:
        current = current_state or {}
        lower = text.lower().strip()

        origin = current.get("origin")
        destination = current.get("destination")
        waypoints = list(current.get("waypoints", []))
        transport_mode = current.get("transport", "motorcycle")
        duration = current.get("durationDays", 1)
        budget = current.get("budget")
        interests = set(current.get("interests", []))

        # 1. Waypoint Extraction (e.g., "through madurai", "via salem", "stopping at trichy")
        waypoint_matches = re.findall(
            r"(?:through|via|by way of|stopping at|passing)\s+([a-zA-Z0-9\s]+?)(?=\s+to|\s+from|\s+a|\s+one|\s+under|\s+budget|$)",
            lower
        )
        for wp in waypoint_matches:
            cleaned_wp = wp.strip().capitalize()
            if len(cleaned_wp) > 2 and cleaned_wp not in waypoints:
                waypoints.append(cleaned_wp)

        # 2. Destination Extraction
        dest_match = re.search(
            r"(?:to|towards)\s+([a-zA-Z0-9\s]+?)(?=\s+from|\s+through|\s+via|\s+for|\s+a|\s+one|\s+under|\s+budget|$)",
            lower
        )
        if dest_match:
            raw_dest = dest_match.group(1).strip().capitalize()
            if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "hills", "waterfalls"]:
                destination = raw_dest

        # 3. Origin Extraction
        origin_match = re.search(
            r"(?:from|starting at|departing)\s+([a-zA-Z0-9\s]+?)(?=\s+to|\s+through|\s+via|\s+a|\s+one|\s+under|\s+budget|$)",
            lower
        )
        if origin_match:
            raw_origin = origin_match.group(1).strip().capitalize()
            if len(raw_origin) > 2 and raw_origin.lower() not in ["a", "the"]:
                origin = raw_origin

        if waypoints and destination in waypoints:
            waypoints.remove(destination)

        # 4. Duration Days Extraction
        if "one day" in lower or "1 day" in lower or "1-day" in lower:
            duration = 1
        elif "two day" in lower or "2 day" in lower or "2-day" in lower or "two days" in lower or "2 days" in lower:
            duration = 2
        elif "three day" in lower or "3 day" in lower or "3-day" in lower or "three days" in lower or "3 days" in lower:
            duration = 3

        # 5. Transport Mode Extraction
        if any(w in lower for w in ["bike", "motorcycle", "rider", "bullet", "riding"]):
            transport_mode = "motorcycle"
        elif any(w in lower for w in ["car", "drive", "taxi", "cab"]):
            transport_mode = "car"

        # 6. Budget Extraction
        budget_match = re.search(r"(?:under|budget|₹|\brs\.?)\s*(\d+)", lower)
        if budget_match:
            budget = float(budget_match.group(1))

        # 7. Interests Extraction
        if any(w in lower for w in ["hill", "mountain", "ghat", "peak"]):
            interests.add("hills")
        if any(w in lower for w in ["waterfall", "falls", "cascade"]):
            interests.add("waterfalls")
        if any(w in lower for w in ["temple", "heritage", "shrine"]):
            interests.add("temple")

        return StructuredTripIntent(
            origin=origin or "Chennai",
            destination=destination,
            waypoints=waypoints,
            transport=transport_mode,
            tripType="round_trip",
            durationDays=duration,
            budget=budget,
            interests=list(interests)
        )

intent_extractor = IntentExtractor()
