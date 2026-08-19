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
    departureTime: str = Field(default="06:00", description="Departure time in HH:MM 24h format")
    overnightTravel: bool = Field(default=False, description="True if departure is at night / overnight ride")
    interests: List[str] = Field(default_factory=list, description="Extracted interest tags")

class IntentExtractor:
    @staticmethod
    def normalize_query(text: str) -> str:
        s = text.lower().strip()
        # Clean phrases like "a trip to chennai to madurai" -> "from chennai to madurai"
        s = re.sub(r"^a\s+trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        s = re.sub(r"^trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        s = re.sub(r"^plan\s+a?\s*trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        return s

    @classmethod
    def extract_intent(cls, text: str, current_state: Optional[dict] = None) -> StructuredTripIntent:
        current = current_state or {}
        lower = cls.normalize_query(text)

        origin = current.get("origin")
        destination = current.get("destination")
        waypoints = list(current.get("waypoints", []))
        transport_mode = current.get("transport", "motorcycle")
        duration = current.get("durationDays", 1)
        budget = current.get("budget")
        departure_time = current.get("departureTime", "06:00")
        overnight_travel = current.get("overnightTravel", False)
        interests = set(current.get("interests", []))

        # 1. Departure Time & Overnight Parsing
        time_match = re.search(r"(?:at|departing at|starting at)?\s*(\d{1,2})(?::(\d{2}))?\s*(pm|am|night|evening)", lower)
        if time_match:
            hr = int(time_match.group(1))
            mn = int(time_match.group(2)) if time_match.group(2) else 0
            meridiem = time_match.group(3)
            if meridiem in ["pm", "night", "evening"] and hr < 12:
                hr += 12
            elif meridiem == "am" and hr == 12:
                hr = 0
            departure_time = f"{hr:02d}:{mn:02d}"
            if hr >= 20 or hr < 5 or "night" in lower or "overnight" in lower:
                overnight_travel = True
        elif "overnight" in lower or "night ride" in lower:
            departure_time = "23:00"
            overnight_travel = True

        # 2. Waypoint Extraction (e.g., "through madurai", "via salem")
        waypoint_matches = re.findall(
            r"(?:through|via|by way of|stopping at|passing)\s+([a-zA-Z0-9\s]+?)(?=\s+to|\s+from|\s+a|\s+one|\s+under|\s+budget|$)",
            lower
        )
        for wp in waypoint_matches:
            cleaned_wp = wp.strip().capitalize()
            if len(cleaned_wp) > 2 and cleaned_wp not in waypoints:
                waypoints.append(cleaned_wp)

        # 3. Origin & Destination Extraction Patterns
        # Pattern A: "from <origin> to <dest>"
        pattern_a = re.search(r"(?:from|starting at|departing)\s+([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(?=\s+through|\s+via|\s+for|\s+at|\s+with|\s+a|\s+one|\s+under|\s+budget|$)", lower)
        if pattern_a:
            raw_orig = pattern_a.group(1).strip().capitalize()
            raw_dest = pattern_a.group(2).strip().capitalize()
            if len(raw_orig) > 2 and raw_orig.lower() not in ["a", "the"]:
                origin = raw_orig
            if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "hills", "waterfalls"]:
                destination = raw_dest
        else:
            # Pattern B: "to <dest> from <origin>"
            pattern_b = re.search(r"to\s+([a-zA-Z0-9\s]+?)\s+from\s+([a-zA-Z0-9\s]+?)(?=\s+through|\s+via|\s+for|\s+at|\s+a|\s+one|\s+under|\s+budget|$)", lower)
            if pattern_b:
                raw_dest = pattern_b.group(1).strip().capitalize()
                raw_orig = pattern_b.group(2).strip().capitalize()
                if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "hills", "waterfalls"]:
                    destination = raw_dest
                if len(raw_orig) > 2 and raw_orig.lower() not in ["a", "the"]:
                    origin = raw_orig
            else:
                # Pattern C: "<origin> to <dest>" (e.g., "chennai to madurai")
                pattern_c = re.search(r"^([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(?=\s+through|\s+via|\s+for|\s+at|\s+under|\s+budget|$)", lower)
                if pattern_c:
                    raw_orig = pattern_c.group(1).strip().capitalize()
                    raw_dest = pattern_c.group(2).strip().capitalize()
                    if len(raw_orig) > 2 and raw_orig.lower() not in ["a", "the", "trip", "plan"]:
                        origin = raw_orig
                    if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere"]:
                        destination = raw_dest

        # Clean overlapping waypoints
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
        if any(w in lower for w in ["food", "cuisine", "jigarthanda", "dosa", "breakfast"]):
            interests.add("food")

        return StructuredTripIntent(
            origin=origin or "Chennai",
            destination=destination,
            waypoints=waypoints,
            transport=transport_mode,
            tripType="round_trip",
            durationDays=duration,
            budget=budget,
            departureTime=departure_time,
            overnightTravel=overnight_travel,
            interests=list(interests)
        )

intent_extractor = IntentExtractor()
